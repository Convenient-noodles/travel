const utils = require('../../utils/request')

// ============================================================
// 常量定义 —— 消除魔法字符串和重复映射
// ============================================================
const STATUS_LABEL = {
  pending: '待支付',
  paid: '已支付',
  refunding: '退款中',
  refunded: '已退款'
}

const TABS = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待支付' },
  { key: 'paid', label: '已支付' },
  { key: 'refunding', label: '退款中' },
  { key: 'refunded', label: '已退款' }
]

const API = {
  orderStatus: (orderNo) => `/admin/orders/public/status/${orderNo}`,
  orderRefund: (orderNo) => `/admin/orders/public/refund/${orderNo}`,
  orderPayCallback: (orderNo) => `/admin/orders/public/pay/${orderNo}`
}

// ============================================================
// 公共数据层 —— 所有订单变更的唯一入口
// ============================================================
function patchOrder(orders, orderNo, patch) {
  return orders.map(o => (o.orderNo === orderNo ? { ...o, ...patch } : o))
}

function filterByStatus(orders, tabKey) {
  return tabKey === 'all' ? orders : orders.filter(o => o.status === tabKey)
}

function sortByCreateTime(orders) {
  return orders.sort((a, b) => b.createTime - a.createTime)
}

// ============================================================
// 远程 API 层 —— 数据请求与 UI 分离
// ============================================================
function fetchOrderStatusFromBackend(orderNo) {
  return utils.request({ url: API.orderStatus(orderNo), method: 'GET' })
}

function submitRefundRequest(orderNo) {
  const app = getApp()
  return utils.request({
    url: API.orderRefund(orderNo),
    method: 'PUT',
    data: {
      reason: '用户主动申请退款',
      openid: app.getOpenid()
    }
  })
}

function resyncPaymentToBackend(orderNo) {
  return utils.request({
    url: API.orderPayCallback(orderNo),
    method: 'POST',
    data: { transactionId: 'QR_RETRY_' + Date.now() }
  })
}

// ============================================================
// Page 定义
// ============================================================
Page({
  data: {
    orders: [],
    loading: true,
    tabs: TABS,
    activeTab: 'all',
    filteredOrders: []
  },

  // ========== 数据持久化（唯一入口） ==========
  persistOrders: function (updatedOrders) {
    this.setData({ orders: updatedOrders })
    this.filterByTab(this.data.activeTab)
    wx.setStorageSync('myOrders', updatedOrders)
  },

  // ========== 生命周期 ==========
  onShow: function () {
    this.loadOrders()
    this.refreshRefundingStatus()
  },

  onPullDownRefresh: function () {
    this.syncAllFromBackend()
  },

  // ========== 数据加载 ==========
  loadOrders: function () {
    this.setData({ loading: true })
    try {
      const stored = wx.getStorageSync('myOrders') || []
      const enriched = stored.map(o => ({
        ...o,
        statusText: STATUS_LABEL[o.status] || o.status
      }))
      this.persistOrders(sortByCreateTime(enriched))
    } catch (e) {
      this.setData({ orders: [], loading: false })
    }
    this.setData({ loading: false })
  },

  filterByTab: function (tabKey) {
    this.setData({ filteredOrders: filterByStatus(this.data.orders, tabKey) })
  },

  // ========== 状态同步 ==========
  refreshRefundingStatus: function () {
    const refundOrders = this.data.orders.filter(
      o => o.syncedToBackend && o.status === 'refunding'
    )
    refundOrders.forEach(o => this.quietSyncOrderStatus(o.orderNo))
  },

  quietSyncOrderStatus: function (orderNo) {
    fetchOrderStatusFromBackend(orderNo).then(res => {
      const backendStatus = res.data && res.data.status
      if (backendStatus && backendStatus !== 'refunding') {
        this.syncStatusFromBackend(orderNo, backendStatus)
      }
    }).catch(() => {})
  },

  syncStatusFromBackend: function (orderNo, newStatus) {
    const updated = patchOrder(this.data.orders, orderNo, {
      status: newStatus,
      statusText: STATUS_LABEL[newStatus] || newStatus
    })
    this.persistOrders(updated)
  },

  syncAllFromBackend: function () {
    const toSync = this.data.orders.filter(o => o.syncedToBackend && o.orderNo)
    if (toSync.length === 0) {
      wx.stopPullDownRefresh()
      return
    }
    let completed = 0
    const total = toSync.length
    toSync.forEach(order => {
      fetchOrderStatusFromBackend(order.orderNo).then(res => {
        const backendStatus = res.data && res.data.status
        if (backendStatus && backendStatus !== order.status) {
          this.syncStatusFromBackend(order.orderNo, backendStatus)
        }
      }).catch(() => {}).finally(() => {
        completed++
        if (completed >= total) {
          wx.stopPullDownRefresh()
          wx.showToast({ title: '状态已刷新', icon: 'success', duration: 1500 })
        }
      })
    })
  },

  onQueryOrderStatus: function (e) {
    const orderNo = e.currentTarget.dataset.orderno
    wx.showLoading({ title: '查询中...', mask: true })
    fetchOrderStatusFromBackend(orderNo).then(res => {
      wx.hideLoading()
      const backendStatus = res.data && res.data.status
      if (backendStatus) {
        this.syncStatusFromBackend(orderNo, backendStatus)
        const msg = backendStatus === 'refunded'
          ? '商家已完成退款'
          : '商家尚未处理，请耐心等待'
        const icon = backendStatus === 'refunded' ? 'success' : 'none'
        wx.showToast({ title: msg, icon })
      }
    }).catch(() => {
      wx.hideLoading()
      wx.showToast({ title: '查询失败，请检查网络', icon: 'none' })
    })
  },

  // ========== 支付同步 ==========
  retrySyncPayment: function (e) {
    const orderNo = e.currentTarget.dataset.orderno
    wx.showLoading({ title: '同步中...', mask: true })
    resyncPaymentToBackend(orderNo).then(() => {
      wx.hideLoading()
      const updated = patchOrder(this.data.orders, orderNo, { syncedToBackend: true })
      this.persistOrders(updated)
      wx.showToast({ title: '已同步到商家后台', icon: 'success' })
    }).catch(() => {
      wx.hideLoading()
      wx.showToast({ title: '同步失败，请检查网络', icon: 'none', duration: 2000 })
    })
  },

  // ========== 退款 ==========
  onRefundOrder: function (e) {
    const orderNo = e.currentTarget.dataset.orderno
    const order = this.data.orders.find(o => o.orderNo === orderNo)
    if (!order) {
      wx.showToast({ title: '订单不存在', icon: 'none' })
      return
    }
    this.confirmRefund(order)
  },

  confirmRefund: function (order) {
    wx.showModal({
      title: '申请退款',
      content: `确定申请退款 ¥${order.amount.toFixed(2)} 吗？\n酒店：${order.hotelName}\n房型：${order.roomName}`,
      success: (res) => {
        if (res.confirm) this.executeRefund(order.orderNo)
      }
    })
  },

  executeRefund: function (orderNo) {
    wx.showLoading({ title: '提交中...', mask: true })
    submitRefundRequest(orderNo).then(() => {
      wx.hideLoading()
      const updated = patchOrder(this.data.orders, orderNo, {
        status: 'refunding',
        statusText: STATUS_LABEL.refunding,
        refundReason: '用户主动申请退款',
        syncedToBackend: true
      })
      this.persistOrders(updated)
      wx.showToast({ title: '退款申请已提交，等待商家审核', icon: 'success', duration: 2500 })
    }).catch(() => {
      wx.hideLoading()
      wx.showToast({ title: '退款申请失败，请重试', icon: 'none', duration: 2000 })
    })
  },

  // ========== 删除 ==========
  onDeleteOrder: function (e) {
    const orderNo = e.currentTarget.dataset.orderno
    wx.showModal({
      title: '删除订单',
      content: '确定要删除此订单记录吗？',
      success: (res) => {
        if (res.confirm) this.removeOrder(orderNo)
      }
    })
  },

  removeOrder: function (orderNo) {
    const orders = this.data.orders.filter(o => o.orderNo !== orderNo)
    this.persistOrders(orders)
    wx.showToast({ title: '已删除', icon: 'success' })
  },

  // ========== 订单详情 ==========
  onOrderTap: function (e) {
    this.showOrderDetail(e.currentTarget.dataset.order)
  },

  showOrderDetail: function (order) {
    const isPending = order.status === 'pending'
    wx.showModal({
      title: '订单详情',
      content: this.buildDetailContent(order),
      showCancel: isPending,
      confirmText: isPending ? '去支付' : '关闭',
      cancelText: '关闭',
      success: (res) => {
        if (res.confirm && isPending) this.goPay(order)
      }
    })
  },

  buildDetailContent: function (order) {
    return [
      `订单编号：${order.orderNo}`,
      `酒店：${order.hotelName}`,
      `房型：${order.roomName}`,
      `入住：${order.checkInDate}`,
      `退房：${order.checkOutDate}`,
      `${order.nights || 1}晚`,
      `金额：¥${order.amount.toFixed(2)}`,
      `状态：${STATUS_LABEL[order.status] || order.status}`,
      `创建时间：${order.createTimeStr || ''}`
    ].join('\n')
  },

  goPay: function (order) {
    const encode = encodeURIComponent
    const params = {
      hotelId: order.hotelId,
      hotelName: encode(order.hotelName),
      hotelImage: encode(order.hotelImage || ''),
      roomName: encode(order.roomName),
      amount: order.amount,
      qrCode: encode(order.qrCode || ''),
      checkInDate: order.checkInDate,
      checkOutDate: order.checkOutDate,
      nights: order.nights || 1
    }
    const query = Object.entries(params).map(([k, v]) => `${k}=${v}`).join('&')
    wx.navigateTo({ url: `/packageHotel/pages/hotel-payment/hotel-payment?${query}` })
  },

  // ========== 标签切换 ==========
  onTabChange: function (e) {
    const key = e.currentTarget.dataset.key
    this.setData({ activeTab: key })
    this.filterByTab(key)
  }
})
