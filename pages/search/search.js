//【改】引入公共请求模块和工具函数，消除跨页面重复代码
const { request } = require('../../utils/request')
const { fixImageUrl, getFirstTag } = require('../../utils/common')

Page({
  data: {
    searchKeyword: '',
    searchFocus: true,
    hasSearched: false,
    loading: false,
    currentCategory: 'all',
    popularList: ['黄果树瀑布', '西江千户苗寨', '梵净山', '荔波小七孔'],
    historyList: [],
    categories: [
      { type: 'all', name: '全部' },
      { type: 'scenic', name: '景点' },
      { type: 'strategy', name: '攻略' },
      { type: 'food', name: '美食' },
      { type: 'hotel', name: '住宿' }
    ],
    resultList: [],
    allResults: []
  },

  onLoad: function () {
    this.loadHistory()
  },

  onShow: function () {
    this.loadHistory()
  },

  loadHistory: function () {
    const historyList = wx.getStorageSync('searchHistory') || []
    this.setData({ historyList })
  },

  onSearchInput: function (e) {
    this.setData({
      searchKeyword: e.detail.value
    })
  },

  onSearchConfirm: function (e) {
    const keyword = e.detail.value.trim()
    if (keyword) {
      this.doSearch(keyword)
    }
  },

  onClearKeyword: function () {
    this.setData({
      searchKeyword: '',
      searchFocus: true
    })
  },

  onPopularTap: function (e) {
    const keyword = e.currentTarget.dataset.keyword
    this.setData({ searchKeyword: keyword })
    this.doSearch(keyword)
  },

  onHistoryTap: function (e) {
    const keyword = e.currentTarget.dataset.keyword
    this.setData({ searchKeyword: keyword })
    this.doSearch(keyword)
  },

  onClearHistory: function () {
    wx.showModal({
      title: '提示',
      content: '确定要清除搜索历史吗？',
      confirmColor: '#E74C3C',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('searchHistory')
          this.setData({ historyList: [] })
          wx.showToast({
            title: '已清除',
            icon: 'success',
            duration: 1500
          })
        }
      }
    })
  },

  onCategoryChange: function (e) {
    const type = e.currentTarget.dataset.type
    this.setData({ currentCategory: type })
    this.filterResults(type)
  },

  doSearch: function (keyword) {
    if (!keyword) {
      wx.showToast({
        title: '请输入搜索关键词',
        icon: 'none',
        duration: 2000
      })
      return
    }

    this.setData({
      hasSearched: true,
      loading: true,
      currentCategory: 'all'
    })

    this.saveToHistory(keyword)

    //【改】配置驱动的多源搜索，消除4个重复Promise块
    const SEARCH_SOURCES = [
      {
        type: 'scenic',
        url: '/admin/scenics/public/list',
        buildTag: (item) => getFirstTag(item.tags) || (item.rating ? item.rating + '分' : '')
      },
      {
        type: 'route',
        url: '/admin/routes/public/list',
        buildTag: (item) => item.tag || (item.days ? item.days + '天' : '')
      },
      {
        type: 'food',
        url: '/foods',
        buildTag: (item) => getFirstTag(item.tags) || item.category || ''
      },
      {
        type: 'hotel',
        url: '/admin/hotels/public/list',
        buildTag: (item) => (item.starLevel ? item.starLevel + '星级' : '') || getFirstTag(item.tags)
      }
    ]

    const searchPromises = SEARCH_SOURCES.map(source =>
      request({
        url: source.url,
        data: { keyword: keyword, page: 1, pageSize: 10 }
      }).then(res => {
        const list = (res.data && (res.data.list || res.data.records)) || []
        return list.map(item => ({
          id: item.id,
          type: source.type,
          title: item.name || '',
          description: (item.description || '').substring(0, 50),
          image: fixImageUrl(item.coverImage),
          location: item.region || item.address || '',
          tag: source.buildTag(item)
        }))
      }).catch(() => [])
    )

    Promise.all(searchPromises).then(allResults => {
      const merged = [].concat(...allResults)
      if (merged.length === 0) {
        //【改】API无结果时降级使用本地mock数据
        this.applyMockFallback(keyword)
      } else {
        this.setData({
          allResults: merged,
          resultList: merged,
          loading: false
        })
      }
    }).catch(() => {
      //【改】API失败时降级使用本地mock数据
      this.applyMockFallback(keyword)
    })
  },

  saveToHistory: function (keyword) {
    let historyList = wx.getStorageSync('searchHistory') || []
    historyList = historyList.filter(item => item !== keyword)
    historyList.unshift(keyword)
    if (historyList.length > 10) {
      historyList = historyList.slice(0, 10)
    }
    wx.setStorageSync('searchHistory', historyList)
    this.setData({ historyList })
  },

  getSearchResults: function (keyword) {
    const allData = [
      {
        id: 1,
        type: 'scenic',
        title: '黄果树瀑布',
        description: '亚洲第一大瀑布，位于贵州省安顺市镇宁布依族苗族自治县，以其壮观的景色和独特的喀斯特地貌闻名于世。',
        image: '/images/a1.jpg',
        location: '安顺市',
        tag: '5A景区'
      },
      {
        id: 2,
        type: 'scenic',
        title: '西江千户苗寨',
        description: '世界上最大的苗族聚居村寨，位于贵州省黔东南州雷山县，千余户吊脚楼依山而建，气势恢宏。',
        image: '/images/a7.jpg',
        location: '黔东南州',
        tag: '4A景区'
      },
      {
        id: 3,
        type: 'scenic',
        title: '梵净山',
        description: '中国第五大佛教名山，位于贵州省铜仁市江口县，是武陵山脉的主峰，海拔2336米。',
        image: '/images/a3.jpg',
        location: '铜仁市',
        tag: '世界自然遗产'
      },
      {
        id: 4,
        type: 'scenic',
        title: '荔波小七孔',
        description: '世界自然遗产地，位于贵州省黔南州荔波县，以其秀丽的山水风光和独特的喀斯特地貌闻名。',
        image: '/images/a2.jpg',
        location: '黔南州',
        tag: '世界自然遗产'
      },
      {
        id: 5,
        type: 'scenic',
        title: '百里杜鹃',
        description: '世界上最大的天然杜鹃花园，位于贵州省毕节市大方县和黔西县交界处，每年3-4月花海盛开。',
        image: '/images/a2.jpg',
        location: '毕节市',
        tag: '5A景区'
      },
      {
        id: 6,
        type: 'scenic',
        title: '织金洞',
        description: '中国最美的溶洞之一，位于贵州省毕节市织金县，被誉为"地下艺术宝库"和"岩溶博物馆"。',
        image: '/images/a4.jpg',
        location: '毕节市',
        tag: '4A景区'
      },
      {
        id: 7,
        type: 'scenic',
        title: '青岩古镇',
        description: '贵州四大古镇之一，位于贵州省贵阳市花溪区，始建于明洪武年间，至今已有600多年历史。',
        image: '/images/a6.jpg',
        location: '贵阳市',
        tag: '4A景区'
      },
      {
        id: 8,
        type: 'scenic',
        title: '镇远古镇',
        description: '一座历史悠久的文化名城，位于贵州省黔东南州镇远县，古镇沿舞阳河而建，山水相依。',
        image: '/images/a8.jpg',
        location: '黔东南州',
        tag: '4A景区'
      },
      {
        id: 9,
        type: 'strategy',
        title: '贵州5日深度游攻略',
        description: '带你玩转贵州精华景点，包含黄果树瀑布、西江千户苗寨、梵净山等知名景点的详细攻略。',
        image: '/images/a9.jpg',
        location: '旅游攻略',
        tag: '精华推荐'
      },
      {
        id: 10,
        type: 'strategy',
        title: '贵州美食地图',
        description: '本地人推荐的地道贵州小吃，从酸汤鱼到丝娃娃，带你品尝最正宗的贵州味道。',
        image: '/images/a8.jpg',
        location: '美食攻略',
        tag: '美食推荐'
      },
      {
        id: 11,
        type: 'food',
        title: '酸汤鱼',
        description: '贵州苗族特色美食，以酸汤为底，肉质鲜嫩，酸辣可口，是贵州菜的代表之一。',
        image: '/images/a5.jpg',
        location: '黔东南州',
        tag: '特色美食'
      },
      {
        id: 12,
        type: 'food',
        title: '肠旺面',
        description: '贵阳特色小吃，以猪大肠、血旺为主要原料，配以脆哨、红油等调料，口感丰富。',
        image: '/images/a6.jpg',
        location: '贵阳市',
        tag: '特色小吃'
      },
      {
        id: 13,
        type: 'hotel',
        title: '贵州饭店',
        description: '贵阳市中心五星级酒店，位于南明区，交通便利，设施齐全，服务优质。',
        image: '/images/a1.jpg',
        location: '贵阳市',
        tag: '五星级'
      },
      {
        id: 14,
        type: 'hotel',
        title: '西江苗寨客栈',
        description: '位于西江千户苗寨景区内，推窗即可欣赏苗寨夜景，体验浓郁的苗族风情。',
        image: '/images/a7.jpg',
        location: '黔东南州',
        tag: '特色客栈'
      }
    ]

    const lowerKeyword = keyword.toLowerCase()
    //【改】仅在title中匹配，避免description/location中包含关键词导致无关结果出现
    return allData.filter(item =>
      item.title.toLowerCase().includes(lowerKeyword)
    )
  },

  //【改】API搜索降级：回退到本地mock数据，消除重复setData
  applyMockFallback: function (keyword) {
    const results = this.getSearchResults(keyword)
    this.setData({
      allResults: results,
      resultList: results,
      loading: false
    })
  },

  filterResults: function (type) {
    if (type === 'all') {
      this.setData({ resultList: this.data.allResults })
    } else {
      const filtered = this.data.allResults.filter(item => item.type === type)
      this.setData({ resultList: filtered })
    }
  },

  onResultTap: function (e) {
    const id = e.currentTarget.dataset.id
    const type = e.currentTarget.dataset.type

    if (type === 'scenic') {
      wx.navigateTo({
        url: '/pages/scenic-detail/scenic-detail?id=' + id
      })
    } else if (type === 'route') {
      wx.navigateTo({
        url: '/packageDetail/pages/route-detail/route-detail?id=' + id
      })
    } else if (type === 'strategy') {
      wx.navigateTo({
        url: '/packageDetail/pages/strategy-detail/strategy-detail?id=' + id
      })
    } else if (type === 'food') {
      wx.navigateTo({
        url: '/pages/food-detail/food-detail?id=' + id
      })
    } else if (type === 'hotel') {
      wx.showToast({
        title: '酒店详情页开发中',
        icon: 'none'
      })
    }
  },

  onBack: function () {
    wx.navigateBack({
      delta: 1
    })
  }
})
