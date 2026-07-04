const utils = require('../../utils/request')

Page({
  data: {
    bookings: [],
    loading: true
  },

  onShow: function () {
    this.loadBookings()
  },

  loadBookings: function () {
    this.setData({ loading: true })
    try {
      const stored = wx.getStorageSync('myBookings') || []
      const sorted = stored.sort((a, b) => b.createTime - a.createTime)
      this.setData({ bookings: sorted, loading: false })
    } catch (e) {
      this.setData({ bookings: [], loading: false })
    }
  },

  onBookingTap: function (e) {
    const booking = e.currentTarget.dataset.booking
    this.showDetail(booking)
  },

  showDetail: function (booking) {
    const content = [
      `项目：${booking.cultureName}`,
      `地点：${booking.location}`,
      `时长：${booking.duration}`,
      `预约人：${booking.name}`,
      `电话：${booking.phone}`,
      `日期：${booking.date}`,
      `${booking.count}人`,
      `状态：已确认`
    ].join('\n')

    wx.showModal({
      title: '预约详情',
      content: content,
      showCancel: false,
      confirmText: '关闭'
    })
  },

  onCancelBooking: function (e) {
    const rawId = e.currentTarget.dataset.id
    const booking = this.findBookingByAnyId(rawId)
    if (!booking) return
    this.confirmCancel(booking)
  },

  findBookingByAnyId: function (id) {
    return this.data.bookings.find(b => String(b.id) === String(id))
  },

  confirmCancel: function (booking) {
    wx.showModal({
      title: '取消预约',
      content: '确定要取消此预约吗？取消后将同步通知商家',
      success: (res) => {
        if (res.confirm) this.executeCancel(booking)
      }
    })
  },

  executeCancel: function (booking) {
    if (booking.syncedToBackend && booking.backendId) {
      this.cancelBackendAndLocal(booking)
    } else {
      this.updateLocalStatus(booking.id, 'cancelled')
      wx.showToast({ title: '已取消', icon: 'success' })
    }
  },

  cancelBackendAndLocal: function (booking) {
    wx.showLoading({ title: '处理中...', mask: true })
    utils.request({
      url: '/admin/bookings/public/cancel/' + booking.backendId,
      method: 'PUT'
    }).then(() => {
      wx.hideLoading()
      this.updateLocalStatus(booking.id, 'cancelled')
      wx.showToast({ title: '已取消，已通知商家', icon: 'success' })
    }).catch(() => {
      wx.hideLoading()
      this.updateLocalStatus(booking.id, 'cancelled')
      wx.showToast({ title: '已取消（离线，稍后同步）', icon: 'none', duration: 2500 })
    })
  },

  updateLocalStatus: function (localId, newStatus) {
    const bookings = this.data.bookings.map(b => {
      if (b.id === localId) return { ...b, status: newStatus }
      return b
    })
    this.setData({ bookings })
    wx.setStorageSync('myBookings', bookings)
  },

  // ——— 删除已取消预约 ———
  onDeleteBooking: function (e) {
    const rawId = e.currentTarget.dataset.id
    const booking = this.findBookingByAnyId(rawId)
    if (!booking) return
    this.confirmDelete(booking)
  },

  confirmDelete: function (booking) {
    wx.showModal({
      title: '删除记录',
      content: '确定要删除此预约记录吗？删除后无法恢复',
      confirmColor: '#e74c3c',
      success: (res) => {
        if (res.confirm) this.removeFromStorage(booking.id)
      }
    })
  },

  removeFromStorage: function (localId) {
    const bookings = this.data.bookings.filter(b => b.id !== localId)
    this.setData({ bookings })
    wx.setStorageSync('myBookings', bookings)
    wx.showToast({ title: '已删除', icon: 'success' })
  },

  retrySync: function (e) {
    const rawId = e.currentTarget.dataset.id
    const booking = this.findBookingByAnyId(rawId)
    if (!booking) return
    const payload = this.buildRetryPayload(booking)
    wx.showLoading({ title: '同步中...', mask: true })

    utils.request({
      url: '/admin/bookings/public/create',
      method: 'POST',
      data: payload
    }).then((res) => {
      wx.hideLoading()
      const backendId = res.data ? res.data.id : null
      this.markSynced(booking.id, backendId)
      wx.showToast({ title: '已同步到商家后台', icon: 'success' })
    }).catch(() => {
      wx.hideLoading()
      wx.showToast({ title: '同步失败，请检查网络', icon: 'none', duration: 2000 })
    })
  },

  buildRetryPayload: function (booking) {
    return {
      cultureId: booking.cultureId,
      cultureName: booking.cultureName,
      cultureImage: booking.image,
      location: booking.location,
      duration: booking.duration,
      name: booking.name,
      phone: booking.phone,
      bookDate: booking.date,
      count: booking.count
    }
  },

  markSynced: function (localId, backendId) {
    const bookings = this.data.bookings.map(b => {
      if (b.id === localId) {
        return { ...b, syncedToBackend: true, backendId: backendId }
      }
      return b
    })
    this.setData({ bookings })
    wx.setStorageSync('myBookings', bookings)
  },

  onBack: function () {
    wx.navigateBack()
  }
})
