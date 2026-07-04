Page({
  data: {
    tabs: [
      { type: 'scenic', name: '景点' },
      { type: 'strategy', name: '攻略' }
    ],
    currentTab: 'scenic',
    scenicList: [],
    strategyList: [],
    currentList: [],
    loading: true,
    hasMore: false,
    touchStartX: 0,
    touchStartY: 0,
    swipingId: null
  },

  onLoad: function () {
    this.loadCollection()
  },

  onShow: function () {
    this.loadCollection()
  },

  onPullDownRefresh: function () {
    this.loadCollection(() => {
      wx.stopPullDownRefresh()
    })
  },

  loadCollection: function (callback) {
    this.setData({ loading: true })

    setTimeout(() => {
      const scenicList = wx.getStorageSync('collectionList') || []
      const strategyList = wx.getStorageSync('strategyCollection') || []

      this.setData({
        scenicList,
        strategyList,
        currentList: this.data.currentTab === 'scenic' ? scenicList : strategyList,
        loading: false,
        hasMore: false
      })

      if (callback) {
        callback()
      }
    }, 500)
  },

  onTabChange: function (e) {
    const type = e.currentTarget.dataset.type
    const currentList = type === 'scenic' ? this.data.scenicList : this.data.strategyList

    this.setData({
      currentTab: type,
      currentList,
      swipingId: null
    })
  },

  onItemTap: function (e) {
    if (this.data.swipingId) {
      this.setData({ swipingId: null })
      return
    }

    const id = e.currentTarget.dataset.id
    const type = e.currentTarget.dataset.type

    if (type === 'scenic') {
      wx.navigateTo({
        url: '/pages/scenic-detail/scenic-detail?id=' + id
      })
    } else if (type === 'strategy') {
      wx.navigateTo({
        url: '/pages/strategy-detail/strategy-detail?id=' + id
      })
    }
  },

  onTouchStart: function (e) {
    this.setData({
      touchStartX: e.touches[0].clientX,
      touchStartY: e.touches[0].clientY
    })
  },

  onTouchMove: function (e) {
    const touchX = e.touches[0].clientX
    const touchY = e.touches[0].clientY
    const deltaX = touchX - this.data.touchStartX
    const deltaY = touchY - this.data.touchStartY

    if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX < -50) {
      const id = e.currentTarget.dataset.id
      if (this.data.swipingId !== id) {
        this.setData({ swipingId: id })
      }
    } else if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX > 50) {
      if (this.data.swipingId) {
        this.setData({ swipingId: null })
      }
    }
  },

  onTouchEnd: function () {
  },

  onDeleteTap: function (e) {
    const id = e.currentTarget.dataset.id
    const type = this.data.currentTab

    wx.showModal({
      title: '提示',
      content: '确定要取消收藏吗？',
      confirmColor: '#E74C3C',
      success: (res) => {
        if (res.confirm) {
          this.deleteCollection(id, type)
        }
      }
    })
  },

  deleteCollection: function (id, type) {
    let list = type === 'scenic' ? [...this.data.scenicList] : [...this.data.strategyList]
    list = list.filter(item => item.id !== id)

    if (type === 'scenic') {
      wx.setStorageSync('collectionList', list)
    } else {
      wx.setStorageSync('strategyCollection', list)
    }

    this.setData({
      [type === 'scenic' ? 'scenicList' : 'strategyList']: list,
      currentList: list,
      swipingId: null
    })

    wx.showToast({
      title: '取消收藏成功',
      icon: 'success',
      duration: 1500
    })
  },

  onReachBottom: function () {
    if (this.data.loading || !this.data.hasMore) {
      return
    }
    console.log('加载更多')
  },

  formatTime: function (timestamp) {
    if (!timestamp) return ''

    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date
    const oneDay = 86400000
    const oneWeek = oneDay * 7
    const oneMonth = oneDay * 30

    if (diff < oneDay) {
      const hours = Math.floor(diff / 3600000)
      return hours > 0 ? hours + '小时前' : '刚刚'
    } else if (diff < oneWeek) {
      const days = Math.floor(diff / oneDay)
      return days + '天前'
    } else if (diff < oneMonth) {
      const weeks = Math.floor(diff / oneWeek)
      return weeks + '周前'
    } else {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return year + '-' + month + '-' + day
    }
  },

  onBack: function () {
    wx.navigateBack({
      delta: 1
    })
  }
})
