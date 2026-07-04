const utils = require('../../../utils/request')

Page({
  data: {
    hotelId: '',
    hotelName: '',
    hotelImage: '',
    roomName: '',
    amount: 0,
    qrCode: '',
    checkInDate: '',
    checkOutDate: '',
    nights: 1,
    orderNo: '',
    orderId: null,
    step: 'confirm',
    name: '',
    phone: '',
    payResult: null
  },

  onLoad: function (options) {
    if (!options.hotelId) {
      wx.showToast({ title: '参数错误', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 1500)
      return
    }
    this.setData({
      hotelId: options.hotelId,
      hotelName: decodeURIComponent(options.hotelName || ''),
      hotelImage: decodeURIComponent(options.hotelImage || ''),
      roomName: decodeURIComponent(options.roomName || ''),
      amount: parseFloat(options.amount) || 0,
      qrCode: decodeURIComponent(options.qrCode || ''),
      checkInDate: options.checkInDate || this.getDefaultCheckIn(),
      checkOutDate: options.checkOutDate || this.getDefaultCheckOut(),
      nights: parseInt(options.nights) || 1
    })
  },

  getDefaultCheckIn: function () {
    return this.formatDate(new Date())
  },

  getDefaultCheckOut: function () {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return this.formatDate(tomorrow)
  },

  formatDate: function (date) {
    const y = date.getFullYear()
    const m = (date.getMonth() + 1).toString().padStart(2, '0')
    const d = date.getDate().toString().padStart(2, '0')
    return `${y}-${m}-${d}`
  },

  onNameInput: function (e) {
    this.setData({ name: e.detail.value })
  },

  onPhoneInput: function (e) {
    this.setData({ phone: e.detail.value })
  },

  onConfirmOrder: function () {
    const { name, phone } = this.data
    if (!name.trim()) {
      wx.showToast({ title: '请输入入住人姓名', icon: 'none' })
      return
    }
    if (!phone.trim() || !/^1\d{10}$/.test(phone.trim())) {
      wx.showToast({ title: '请输入正确的手机号', icon: 'none' })
      return
    }
    this.createOrderAndShowPayment()
  },

  createOrderAndShowPayment: function () {
    const d = this.data
    wx.showLoading({ title: '创建订单中...', mask: true })

    const orderData = this.buildOrderData(d)
    utils.request({
      url: '/admin/orders/public/create',
      method: 'POST',
      data: orderData
    }).then((res) => {
      wx.hideLoading()
      this.setData({
        orderNo: res.data.orderNo,
        orderId: res.data.orderId,
        step: 'pay'
      })
    }).catch((err) => {
      wx.hideLoading()
      wx.showModal({
        title: '创建失败',
        content: err.message || '订单创建失败，请稍后重试',
        showCancel: false
      })
    })
  },

  buildOrderData: function (d) {
    const app = getApp()
    return {
      hotelId: parseInt(d.hotelId),
      hotelName: d.hotelName,
      hotelImage: d.hotelImage,
      roomName: d.roomName,
      amount: d.amount,
      name: d.name.trim(),
      phone: d.phone.trim(),
      checkInDate: d.checkInDate + ' 14:00:00',
      checkOutDate: d.checkOutDate + ' 12:00:00',
      nights: d.nights,
      userOpenid: app.getOpenid()
    }
  },

  onPreviewQrCode: function () {
    if (!this.data.qrCode) {
      wx.showToast({ title: '暂无收款码', icon: 'none' })
      return
    }
    wx.previewImage({
      current: this.data.qrCode,
      urls: [this.data.qrCode]
    })
  },

  onSaveQrCode: function () {
    if (!this.data.qrCode) return

    wx.showLoading({ title: '保存中...' })
    wx.downloadFile({
      url: this.data.qrCode,
      success: (res) => {
        this.saveQrToAlbum(res.tempFilePath)
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({ title: '下载失败，请长按图片保存', icon: 'none' })
      }
    })
  },

  saveQrToAlbum: function (filePath) {
    wx.saveImageToPhotosAlbum({
      filePath: filePath,
      success: () => {
        wx.hideLoading()
        wx.showModal({
          title: '保存成功',
          content: '收款码已保存到相册。请打开微信扫一扫，从相册选择该二维码完成支付。',
          showCancel: false,
          confirmText: '知道了'
        })
      },
      fail: () => {
        wx.hideLoading()
        this.requestSavePermission(filePath)
      }
    })
  },

  requestSavePermission: function (filePath) {
    wx.showModal({
      title: '需要相册权限',
      content: '保存收款码需要访问您的相册，请在设置中开启相册权限',
      confirmText: '去设置',
      success: (res) => {
        if (res.confirm) wx.openSetting()
      }
    })
  },

  onConfirmPaid: function () {
    const content = this.buildPayConfirmContent()
    wx.showModal({
      title: '确认支付完成',
      content: content,
      confirmText: '我已支付',
      cancelText: '还未支付',
      success: (res) => {
        if (res.confirm) {
          this.syncPaymentToBackend()
        }
      }
    })
  },

  buildPayConfirmContent: function () {
    return `请确认已通过微信扫码支付 ¥${this.data.amount.toFixed(2)}\n\n支付完成后将自动同步到商家后台`
  },

  syncPaymentToBackend: function () {
    wx.showLoading({ title: '同步订单...', mask: true })

    utils.request({
      url: '/admin/orders/public/pay/' + this.data.orderNo,
      method: 'POST',
      data: { transactionId: 'QR_' + Date.now() }
    }).then(() => {
      this.onBackendSyncSuccess()
    }).catch((err) => {
      this.onBackendSyncFail(err)
    })
  },

  onBackendSyncSuccess: function () {
    wx.hideLoading()
    this.saveOrderToLocal()
    this.setData({
      payResult: { success: true, syncedToBackend: true, orderNo: this.data.orderNo },
      step: 'result'
    })
  },

  onBackendSyncFail: function (err) {
    wx.hideLoading()
    this.saveOrderToLocal()
    this.setData({
      payResult: { success: true, syncedToBackend: false, orderNo: this.data.orderNo },
      step: 'result'
    })
    wx.showToast({
      title: '订单已保存本地，请稍后重试同步',
      icon: 'none',
      duration: 2500
    })
  },

  retrySyncToBackend: function () {
    wx.showLoading({ title: '重新同步...', mask: true })
    utils.request({
      url: '/admin/orders/public/pay/' + this.data.orderNo,
      method: 'POST',
      data: { transactionId: 'QR_RETRY_' + Date.now() }
    }).then(() => {
      wx.hideLoading()
      this.setData({
        'payResult.syncedToBackend': true
      })
      this.updateLocalOrderSyncStatus(true)
      wx.showToast({ title: '已同步到商家后台', icon: 'success' })
    }).catch(() => {
      wx.hideLoading()
      wx.showToast({ title: '同步失败，请检查网络后重试', icon: 'none', duration: 2000 })
    })
  },

  updateLocalOrderSyncStatus: function (synced) {
    try {
      let orders = wx.getStorageSync('myOrders') || []
      const index = orders.findIndex(o => o.orderNo === this.data.orderNo)
      if (index >= 0) {
        orders[index].syncedToBackend = synced
        wx.setStorageSync('myOrders', orders)
      }
    } catch (e) {
      console.error('更新同步状态失败:', e)
    }
  },

  saveOrderToLocal: function () {
    const order = this.buildLocalOrderRecord()
    try {
      let orders = wx.getStorageSync('myOrders') || []
      const index = orders.findIndex(o => o.orderNo === order.orderNo)
      if (index >= 0) {
        orders[index] = order
      } else {
        orders.push(order)
      }
      wx.setStorageSync('myOrders', orders)
    } catch (e) {
      console.error('保存订单失败:', e)
    }
  },

  buildLocalOrderRecord: function () {
    const d = this.data
    return {
      orderNo: d.orderNo,
      hotelId: d.hotelId,
      hotelName: d.hotelName,
      hotelImage: d.hotelImage,
      roomName: d.roomName,
      amount: d.amount,
      checkInDate: d.checkInDate,
      checkOutDate: d.checkOutDate,
      nights: d.nights,
      qrCode: d.qrCode,
      status: 'paid',
      syncedToBackend: d.payResult ? d.payResult.syncedToBackend : false,
      createTime: Date.now(),
      createTimeStr: this.formatDateTime(new Date())
    }
  },

  formatDateTime: function (date) {
    const y = date.getFullYear()
    const m = (date.getMonth() + 1).toString().padStart(2, '0')
    const d = date.getDate().toString().padStart(2, '0')
    const h = date.getHours().toString().padStart(2, '0')
    const min = date.getMinutes().toString().padStart(2, '0')
    return `${y}-${m}-${d} ${h}:${min}`
  },

  onBackToList: function () {
    wx.reLaunch({ url: '/pages/index/index' })
  },

  onViewOrder: function () {
    wx.navigateBack()
  },

  onBack: function () {
    wx.navigateBack()
  },

  onShareAppMessage: function () {
    const { hotelName, roomName, amount } = this.data
    return {
      title: `我在黔游预订了${hotelName}的${roomName}，¥${amount}/晚`,
      path: '/pages/index/index'
    }
  }
})
