const app = getApp()
const { request } = require('../../utils/request')
const { getSafeArea } = require('../../utils/safe-area')
const { formatDate } = require('../../utils/datetime')

Page({
  data: {
    tabs: ['最新攻略', '出行贴士', '景区公告', '民族文化'],
    currentTab: 0,
    articleList: [],
    page: 1,
    pageSize: 10,
    loading: false,
    noMore: false,
    refreshing: false
  },

  onLoad: function (options) {
    this.setData(getSafeArea())

    if (options.tab !== undefined) {
      this.setData({ currentTab: parseInt(options.tab) })
    }
    this.loadArticleList()
  },

  onShow: function () {
    // 页面显示时不重新加载数据，避免卡顿
  },

  loadArticleList: function (isRefresh = false) {
    if (this.data.loading) return

    this.setData({ loading: true })

    const currentTab = this.data.currentTab
    const page = isRefresh ? 1 : this.data.page
    const category = this.getCategoryByTab(currentTab)

    if (category === '民族文化') {
      request({ url: '/admin/cultures/public/list', method: 'GET' }).then((res) => {
        let data = res.data
        if (data && data.list) data = data.list
        data.sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
        const startIndex = (page - 1) * this.data.pageSize
        const pageData = data.slice(startIndex, startIndex + this.data.pageSize)
        const result = pageData.map(item => ({
          id: item.id, title: item.name, category: '文化',
          coverImage: item.coverImage,
          publishDate: item.createTime ? item.createTime.split(' ')[0] : '',
          views: item.viewCount || 0
        }))
        this.setLoadResult(result, isRefresh, page)
      }).catch(() => {
        this.loadMockData(category, page, isRefresh)
      })
    } else if (category === '景区公告') {
      request({ url: '/admin/scenics/public/list', method: 'GET' }).then((res) => {
        let data = res.data
        if (data && data.list) data = data.list
        data = data.filter(item => item.notice && item.notice.trim())
        if (data.length === 0) { this.loadMockData(category, page, isRefresh); return }
        data.sort((a, b) => new Date(b.noticeTime || b.createTime) - new Date(a.noticeTime || a.createTime))
        const startIndex = (page - 1) * this.data.pageSize
        const pageData = data.slice(startIndex, startIndex + this.data.pageSize)
        const result = pageData.map(item => ({
          id: item.id, title: item.notice, category: '公告',
          coverImage: item.coverImage,
          publishDate: item.noticeTime ? item.noticeTime.split(' ')[0] : (item.createTime ? item.createTime.split(' ')[0] : ''),
          views: item.viewCount || 0
        }))
        this.setLoadResult(result, isRefresh, page)
      }).catch(() => {
        this.loadMockData(category, page, isRefresh)
      })
    } else {
      request({ url: '/admin/strategies/enabled', method: 'GET' }).then((res) => {
        let data = res.data
        if (category === '出行贴士') data = data.filter(item => item.category === '贴士')
        else data = data.filter(item => item.category === '攻略')
        if (data.length === 0) { this.loadMockData(category, page, isRefresh); return }
        data.sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
        const startIndex = (page - 1) * this.data.pageSize
        const pageData = data.slice(startIndex, startIndex + this.data.pageSize)
        const result = pageData.map(item => ({
          id: item.id, title: item.title, category: item.category,
          coverImage: item.coverImage,
          publishDate: item.createTime ? item.createTime.split(' ')[0] : '',
          views: item.viewCount || 0
        }))
        this.setLoadResult(result, isRefresh, page)
      }).catch(() => {
        this.loadMockData(category, page, isRefresh)
      })
    }
  },

  setLoadResult: function (data, isRefresh, page) { //【改】新增设置加载结果函数
    if (isRefresh) {
      this.setData({
        articleList: data,
        page: 2,
        noMore: data.length < this.data.pageSize,
        loading: false,
        refreshing: false
      })
    } else {
      this.setData({
        articleList: page === 1 ? data : [...this.data.articleList, ...data],
        page: page + 1,
        noMore: data.length < this.data.pageSize,
        loading: false
      })
    }
  },

  loadMockData: function (category, page, isRefresh) { //【改】新增加载Mock数据函数
    const mockData = this.generateMockData(category, page, this.data.pageSize)
    setTimeout(() => {
      this.setLoadResult(mockData, isRefresh, page)
    }, 300)
  },

  generateMockData: function (category, page, pageSize) {
    const baseData = {
      '最新攻略': [
        { id: 1, title: '贵州3日深度游攻略，带你玩转黔东南', category: '攻略', views: 12580 },
        { id: 2, title: '黄果树瀑布最佳游览路线推荐', category: '攻略', views: 8960 },
        { id: 3, title: '黔西南七日自驾游完整指南', category: '攻略', views: 15320 },
        { id: 4, title: '贵州避暑胜地Top10，夏季必去', category: '攻略', views: 7680 },
        { id: 5, title: '苗寨深度体验：走进真实的苗族生活', category: '攻略', views: 11230 },
        { id: 6, title: '贵州美食地图：地道黔味全收录', category: '攻略', views: 18920 }
      ],
      '出行贴士': [
        { id: 1, title: '贵州旅游必备物品清单，建议收藏', category: '贴士', views: 8560 },
        { id: 2, title: '雨季出游贵州，这些注意事项要记牢', category: '贴士', views: 6540 },
        { id: 3, title: '贵州各景区门票优惠政策汇总', category: '贴士', views: 12350 },
        { id: 4, title: '自驾贵州山路驾驶技巧与安全须知', category: '贴士', views: 9870 },
        { id: 5, title: '贵州高海拔地区防高原反应指南', category: '贴士', views: 5430 },
        { id: 6, title: '贵州旅游季节选择，最佳出行时间推荐', category: '贴士', views: 7890 }
      ],
      '景区公告': [
        { id: 1, title: '黄果树瀑布景区限流通知', category: '公告', views: 15680 },
        { id: 2, title: '梵净山门票预约系统升级维护公告', category: '公告', views: 12340 },
        { id: 3, title: '西江千户苗寨表演时间调整通知', category: '公告', views: 8970 },
        { id: 4, title: '荔波小七孔暑期客流高峰提示', category: '公告', views: 6540 },
        { id: 5, title: '镇远古镇道路施工交通引导', category: '公告', views: 4320 },
        { id: 6, title: '梵净山索道检修暂停运营通知', category: '公告', views: 11230 }
      ],
      '民族文化': [
        { id: 1, title: '苗族银饰：穿在身上的史书', category: '文化', views: 9870 },
        { id: 2, title: '布依族蜡染：古老的民间艺术', category: '文化', views: 7650 },
        { id: 3, title: '侗族大歌：清泉般的歌声', category: '文化', views: 11230 },
        { id: 4, title: '贵州少数民族节日大全，快来看看吧', category: '文化', views: 18960 },
        { id: 5, title: '苗族拦路酒：最热情的迎客礼', category: '文化', views: 8430 },
        { id: 6, title: '屯堡地戏：六百年的文化传承', category: '文化', views: 5670 }
      ]
    }

    const baseList = baseData[category] || baseData['最新攻略']
    const startIndex = (page - 1) * pageSize

    if (startIndex >= baseList.length) {
      return []
    }

    const result = []
    for (let i = 0; i < pageSize; i++) {
      const index = startIndex + i
      if (index >= baseList.length) break

      const item = baseList[index]
      const publishDate = formatDate(new Date(Date.now() - index * 24 * 60 * 60 * 1000))
      const imageIndex = (index % 6) + 1

      result.push({
        id: item.id,
        title: item.title,
        category: item.category,
        coverImage: `/images/a${imageIndex}.jpg`,
        publishDate: publishDate,
        views: item.views + Math.floor(Math.random() * 1000)
      })
    }

    return result
  },

  getCategoryByTab: function (tabIndex) {
    const categories = ['最新攻略', '出行贴士', '景区公告', '民族文化']
    return categories[tabIndex] || '最新攻略'
  },

  onTabChange: function (e) {
    const index = e.currentTarget.dataset.index
    if (index === this.data.currentTab) return

    this.setData({
      currentTab: index,
      articleList: [],
      page: 1,
      noMore: false
    })

    this.loadArticleList()
  },

  onArticleTap: function (e) {
    const articleId = e.currentTarget.dataset.id
    const category = this.getCategoryByTab(this.data.currentTab)
    if (category === '民族文化') { //【改】民族文化跳转到文化详情页
      wx.navigateTo({
        url: '/packageDetail/pages/culture-detail/culture-detail?id=' + articleId
      })
    } else if (category === '景区公告') { //【改】景区公告跳转到景点详情页查看公告
      wx.navigateTo({
        url: `/pages/scenic-detail/scenic-detail?id=${articleId}`
      })
    } else {
      wx.navigateTo({
        url: `/packageDetail/pages/strategy-detail/strategy-detail?id=${articleId}&tab=${this.data.currentTab}`
      })
    }
  },

  onSearch: function () {
    wx.navigateTo({
      url: '/pages/search/search'
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

  onPullRefresh: function () {
    if (this.data.refreshing) return

    this.setData({ refreshing: true })
    this.loadArticleList(true)
  },

  onLoadMore: function () {
    if (this.data.loading || this.data.noMore) return
    this.loadArticleList()
  },

  onShareAppMessage: function () {
    return {
      title: '发现精彩内容 - 带你黔游',
      path: '/pages/discover/discover'
    }
  }
})