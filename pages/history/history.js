const app = getApp()
const { getSafeArea } = require('../../utils/safe-area')
const { formatDateTime } = require('../../utils/datetime')

Page({
  data: {
    filters: ['全部', '景点', '攻略', '美食'],
    currentFilter: 0,
    historyList: [],
    filteredList: [],
    page: 1,
    pageSize: 10,
    loading: false,
    noMore: false,
    safeAreaTop: 0,
    navBarHeight: 88,
    contentTop: 176
  },

  onLoad: function (options) {
    this.setData(getSafeArea())

    if (options.filter !== undefined) {
      this.setData({ currentFilter: parseInt(options.filter) })
    }
  },

  onShow: function () {
    this.loadHistory()
  },

  onReady: function () {
    this.applyFilter()
  },

  loadHistory: function () {
    let rawList = wx.getStorageSync('browseHistory') || []

    if (rawList.length === 0) {
      rawList = [
        {
          id: 1,
          type: 'scenic',
          title: '黄果树瀑布',
          coverImage: '/images/a1.jpg',
          description: '亚洲第一大瀑布，壮观的自然奇观',
          viewTime: Date.now() - 1000 * 60 * 30
        },
        {
          id: 2,
          type: 'strategy',
          title: '贵州3日深度游攻略，带你玩转黔东南',
          coverImage: '/images/a2.jpg',
          description: '贵州黔东南地区拥有丰富的民族文化和壮丽的自然风光',
          viewTime: Date.now() - 1000 * 60 * 60
        },
        {
          id: 3,
          type: 'food',
          title: '肠旺面',
          coverImage: '/images/a6.jpg',
          description: '贵阳传统名小吃，以猪大肠、血旺为主要原料',
          viewTime: Date.now() - 1000 * 60 * 90
        },
        {
          id: 4,
          type: 'scenic',
          title: '西江千户苗寨',
          coverImage: '/images/a7.jpg',
          description: '世界上最大的苗族聚居村寨',
          viewTime: Date.now() - 1000 * 60 * 120
        },
        {
          id: 5,
          type: 'strategy',
          title: '黄果树瀑布最佳游览路线推荐',
          coverImage: '/images/a1.jpg',
          description: '为了让您有最佳的游览体验，这里推荐一条经典的游览路线',
          viewTime: Date.now() - 1000 * 60 * 150
        },
        {
          id: 6,
          type: 'food',
          title: '酸汤鱼',
          coverImage: '/images/a5.jpg',
          description: '贵州苗族特色美食，以酸汤为底，配以鲜鱼',
          viewTime: Date.now() - 1000 * 60 * 180
        },
        {
          id: 7,
          type: 'scenic',
          title: '梵净山',
          coverImage: '/images/a3.jpg',
          description: '中国第五大佛教名山，世界自然遗产地',
          viewTime: Date.now() - 1000 * 60 * 240
        },
        {
          id: 8,
          type: 'strategy',
          title: '贵州避暑胜地Top10，夏季必去',
          coverImage: '/images/a4.jpg',
          description: '贵州夏季凉爽，是绝佳的避暑胜地',
          viewTime: Date.now() - 1000 * 60 * 300
        }
      ]
      wx.setStorageSync('browseHistory', rawList)
    }

    const processedList = rawList.map((item, index) => {
      const typeMap = {
        'scenic': { name: '景点', class: 'scenic' },
        'strategy': { name: '攻略', class: 'strategy' },
        'food': { name: '美食', class: 'food' }
      }
      const typeInfo = typeMap[item.type] || { name: '未知', class: 'scenic' }

      return {
        ...item,
        typeName: typeInfo.name,
        typeClass: typeInfo.class,
        viewTime: formatDateTime(item.viewTime || Date.now()),
        viewTimeStamp: item.viewTime || Date.now()
      }
    })

    processedList.sort((a, b) => (b.viewTimeStamp || 0) - (a.viewTimeStamp || 0))

    this.setData({
      historyList: processedList,
      page: 1,
      noMore: false
    })

    this.applyFilter()
  },

  applyFilter: function () {
    const currentFilter = this.data.currentFilter
    const historyList = this.data.historyList

    let filtered = historyList
    if (currentFilter === 1) {
      filtered = historyList.filter(item => item.type === 'scenic')
    } else if (currentFilter === 2) {
      filtered = historyList.filter(item => item.type === 'strategy')
    } else if (currentFilter === 3) {
      filtered = historyList.filter(item => item.type === 'food')
    }

    this.setData({
      filteredList: filtered.slice(0, this.data.page * this.data.pageSize),
      noMore: filtered.length <= this.data.page * this.data.pageSize
    })
  },

  onFilterChange: function (e) {
    const index = e.currentTarget.dataset.index
    if (index === this.data.currentFilter) return

    this.setData({
      currentFilter: index,
      page: 1,
      noMore: false
    })

    this.applyFilter()
  },

  onLoadMore: function () {
    if (this.data.loading || this.data.noMore) return

    this.setData({ loading: true })

    setTimeout(() => {
      const currentFilter = this.data.currentFilter
      const historyList = this.data.historyList

      let filtered = historyList
      if (currentFilter === 1) {
        filtered = historyList.filter(item => item.type === 'scenic')
      } else if (currentFilter === 2) {
        filtered = historyList.filter(item => item.type === 'strategy')
      } else if (currentFilter === 3) {
        filtered = historyList.filter(item => item.type === 'food')
      }

      const nextPage = this.data.page + 1
      const newList = filtered.slice(0, nextPage * this.data.pageSize)

      this.setData({
        filteredList: newList,
        page: nextPage,
        noMore: newList.length >= filtered.length,
        loading: false
      })
    }, 500)
  },

  onCardTap: function (e) {
    const item = e.currentTarget.dataset.item
    if (!item) return

    let url = ''
    switch (item.type) {
      case 'scenic':
        url = `/pages/scenic-detail/scenic-detail?id=${item.id}`
        break
      case 'strategy':
        url = `/pages/strategy-detail/strategy-detail?id=${item.id}&tab=0`
        break
      case 'food':
        url = `/pages/food-detail/food-detail?id=${item.id}`
        break
      default:
        url = `/pages/index/index`
    }

    wx.navigateTo({ url })
  },

  onDeleteItem: function (e) {
    const itemId = e.currentTarget.dataset.id
    if (!itemId) return

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条浏览记录吗？',
      success: (res) => {
        if (res.confirm) {
          const rawList = wx.getStorageSync('browseHistory') || []
          const newList = rawList.filter(item => item.id !== itemId)
          wx.setStorageSync('browseHistory', newList)
          this.loadHistory()
          wx.showToast({
            title: '已删除',
            icon: 'success',
            duration: 1500
          })
        }
      }
    })
  },

  onClearAll: function () {
    if (this.data.filteredList.length === 0) return

    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有浏览历史吗？此操作不可恢复',
      confirmText: '清空',
      confirmColor: '#ff6b35',
      success: (res) => {
        if (res.confirm) {
          const currentFilter = this.data.currentFilter

          if (currentFilter === 0) {
            wx.setStorageSync('browseHistory', [])
          } else {
            const typeMap = { 1: 'scenic', 2: 'strategy', 3: 'food' }
            const targetType = typeMap[currentFilter]
            const rawList = wx.getStorageSync('browseHistory') || []
            const newList = rawList.filter(item => item.type !== targetType)
            wx.setStorageSync('browseHistory', newList)
          }

          //【改】清空后直接设置空数据，不调用loadHistory避免mock数据重新加载
          this.setData({
            historyList: [],
            filteredList: [],
            page: 1,
            noMore: true
          })
          wx.showToast({
            title: '已清空',
            icon: 'success',
            duration: 1500
          })
        }
      }
    })
  },

  onGoDiscover: function () {
    wx.reLaunch({
      url: '/pages/discover/discover'
    })
  },

  onBack: function () {
    const pages = getCurrentPages()
    if (pages.length > 1) {
      wx.navigateBack()
    } else {
      wx.reLaunch({
        url: '/pages/index/index'
      })
    }
  },

  onShareAppMessage: function () {
    return {
      title: '浏览历史 - 带你黔游',
      path: '/pages/history/history'
    }
  }
})