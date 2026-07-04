const app = getApp()
const { request } = require('../../utils/request')

Page({
  data: {
    bannerList: [],
    quickEntry: [],
    hotScenic: [],
    strategyList: []
  },

  onLoad: function (options) {
    this.loadBannerData()
    this.loadQuickEntry()
    this.loadHotScenic()
    this.loadStrategyList()
  },

  loadBannerData: function () {
    request({ url: '/admin/banners/enabled', method: 'GET' }).then((res) => {
      const bannerList = res.data.map(item => ({
        id: item.id, title: item.title, image: item.image || item.imageUrl,
        type: item.type, targetId: item.targetId
      }))
      this.setData({ bannerList })
    }).catch((error) => {
      console.error('加载轮播图数据失败', error)
      this.setData({
        bannerList: [
          { id: 1, title: '黄果树瀑布', image: '/images/a1.jpg' },
          { id: 2, title: '百里杜鹃', image: '/images/a2.jpg' },
          { id: 3, title: '梵净山', image: '/images/a3.jpg' },
          { id: 4, title: '织金洞', image: '/images/a4.jpg' },
          { id: 5, title: '韭菜坪', image: '/images/a5.jpg' }
        ]
      })
    })
  },

  loadQuickEntry: function () {
    this.setData({
      quickEntry: [
        { id: 1, name: '必去景点', icon: '🏞️', type: 'scenic', bgColor: '#2ECC71' },
        { id: 2, name: '精品路线', icon: '🗺️', type: 'route', bgColor: '#3498DB' },
        { id: 3, name: '特色美食', icon: '🍜', type: 'food', bgColor: '#E74C3C' },
        { id: 4, name: '酒店住宿', icon: '🏨', type: 'hotel', bgColor: '#9B59B6' },
        { id: 5, name: '红色旅游', icon: '🏛️', type: 'red', bgColor: '#E67E22' },
        { id: 6, name: '民俗体验', icon: '🎭', type: 'culture', bgColor: '#1ABC9C' }
      ]
    })
  },

  loadHotScenic: function () {
    request({ url: '/admin/scenics/public/hot', method: 'GET' }).then((res) => {
      const hotScenic = res.data.map(item => ({
        id: item.id, name: item.name, location: item.region,
        rating: item.rating || item.score || '0', image: item.coverImage
      }))
      this.setData({ hotScenic })
    }).catch((error) => {
      console.error('加载热门景点数据失败', error)
      this.setData({
        hotScenic: [
          { id: 1, name: '黄果树瀑布', location: '安顺市', rating: '4.8', image: '/images/a1.jpg' },
          { id: 2, name: '百里杜鹃', location: '毕节市', rating: '4.7', image: '/images/a2.jpg' },
          { id: 3, name: '梵净山', location: '铜仁市', rating: '4.9', image: '/images/a3.jpg' },
          { id: 4, name: '织金洞', location: '毕节市', rating: '4.6', image: '/images/a4.jpg' },
          { id: 5, name: '韭菜坪', location: '毕节市', rating: '4.5', image: '/images/a5.jpg' }
        ]
      })
    })
  },

  loadStrategyList: function () {
    request({ url: '/admin/strategies/enabled', method: 'GET' }).then((res) => {
      const strategyList = res.data.map(item => ({
        id: item.id, title: item.title, author: item.author,
        date: item.createTime ? item.createTime.split(' ')[0] : '',
        image: item.coverImage
      }))
      this.setData({ strategyList })
    }).catch((error) => {
      console.error('加载攻略数据失败', error)
      this.setData({
        strategyList: [
          { id: 1, title: '贵州3日深度游攻略，带你玩转黔东南', author: '旅行达人给我包泡面', date: '2026-05-30', image: '/images/a1.jpg' },
          { id: 6, title: '贵州美食地图：地道黔味全收录', author: '美食博主给我包泡面', date: '2026-05-25', image: '/images/a6.jpg' }
        ]
      })
    })
  },

  goToSearch: function () {
    wx.navigateTo({
      url: '/pages/search/search'
    })
  },

  goToDetail: function (e) {
    const id = e.currentTarget.dataset.id
    const bannerList = this.data.bannerList
    const banner = bannerList.find(item => item.id === id)
    if (!banner || !banner.targetId) {
      wx.navigateTo({
        url: '/pages/scenic-detail/scenic-detail?id=' + id
      })
      return
    }
    //【改】根据类型跳转到对应页面
    const type = banner.type
    const targetId = banner.targetId
    if (type === 'food') {
      wx.navigateTo({
        url: '/packageFood/pages/food-detail/food-detail?id=' + targetId
      })
    } else if (type === 'hotel') {
      wx.navigateTo({
        url: '/packageHotel/pages/hotel-detail/hotel-detail?id=' + targetId
      })
    } else if (type === 'route') {
      wx.navigateTo({
        url: '/pages/list/list?type=route&title=旅游路线'
      })
    } else if (type === 'external' && banner.targetUrl) {
      wx.navigateTo({
        url: banner.targetUrl
      })
    } else {
      wx.navigateTo({
        url: '/pages/scenic-detail/scenic-detail?id=' + targetId
      })
    }
  },

  goToList: function (e) {
    const type = e.currentTarget.dataset.type

    if (type === 'food') {
      wx.navigateTo({
        url: '/packageFood/pages/food/food'
      })
      return
    }

    if (type === 'hotel') {
      wx.navigateTo({
        url: '/packageHotel/pages/hotel/hotel'
      })
      return
    }

    const typeNames = {
      'scenic': '必去景点',
      'route': '精品路线',
      'red': '红色旅游',
      'culture': '民俗体验'
    }
    wx.navigateTo({
      url: '/pages/list/list?type=' + type + '&title=' + typeNames[type]
    })
  },

  goToScenicList: function () {
    wx.navigateTo({
      url: '/pages/list/list?type=scenic&title=热门景点'
    })
  },

  goToScenicDetail: function (e) { //【改】新增热门景点跳转函数
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/scenic-detail/scenic-detail?id=' + id
    })
  },

  goToStrategyList: function () {
    wx.navigateTo({
      url: '/pages/discover/discover'
    })
  },

  goToStrategyDetail: function (e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/packageDetail/pages/strategy-detail/strategy-detail?id=' + id
    })
  },

  goToDiscover: function () {
    wx.reLaunch({
      url: '/pages/discover/discover'
    })
  },

  goToMy: function () {
    wx.reLaunch({
      url: '/pages/my/my'
    })
  }
})
