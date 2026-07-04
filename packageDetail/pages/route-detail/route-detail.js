const { request } = require('../../../utils/request')
const { validateImageUrl } = require('../../../utils/common')

const MOCK_ITINERARY = [
  {
    day: 1, title: '抵达毕节，初探织金洞',
    spots: [{
      name: '织金洞', image: '/images/a4.jpg', duration: '3-4小时',
      description: '世界地质公园，中国最美六大旅游洞穴之首，洞内钟乳石千姿百态',
      travelFrom: ''
    }],
    meals: '含晚餐', hotel: '毕节洪山国际酒店'
  },
  {
    day: 2, title: '百里杜鹃花海漫游',
    spots: [{
      name: '百里杜鹃', image: '/images/a2.jpg', duration: '全天',
      description: '世界最大天然杜鹃花园，绵延百里，春季花开成海',
      travelFrom: '从毕节市区出发，车程约1小时'
    }],
    meals: '含早中晚餐', hotel: '大方慕俄格酒店'
  },
  {
    day: 3, title: '慕俄格古城·彝族文化',
    spots: [{
      name: '慕俄格古城', image: '/images/a7.jpg', duration: '半天',
      description: '明代贵州宣慰府遗址，彝族历史文化名镇',
      travelFrom: '从百里杜鹃出发，车程约40分钟'
    }, {
      name: '奢香博物馆', image: '/images/a6.jpg', duration: '1-2小时',
      description: '纪念明代彝族女政治家奢香夫人，了解彝族历史文化',
      travelFrom: '步行5分钟'
    }],
    meals: '含早中晚餐', hotel: '大方慕俄格酒店'
  },
  {
    day: 4, title: '韭菜坪·天上花海',
    spots: [{
      name: '韭菜坪', image: '/images/a5.jpg', duration: '全天',
      description: '贵州最高峰，夏秋之际紫色韭菜花海铺满山巅，云海日出壮观',
      travelFrom: '从大方出发，车程约1.5小时'
    }],
    meals: '含早中晚餐', hotel: '赫章夜郎酒店'
  },
  {
    day: 5, title: '威宁草海·高原明珠',
    spots: [{
      name: '威宁草海', image: '/images/a8.jpg', duration: '半天',
      description: '中国三大高原淡水湖之一，黑颈鹤越冬栖息地',
      travelFrom: '从赫章出发，车程约2小时'
    }, {
      name: '西凉山观景台', image: '/images/a3.jpg', duration: '1-2小时',
      description: '俯瞰草海全景的最佳位置，摄影爱好者必打卡',
      travelFrom: '车程约30分钟'
    }],
    meals: '含早中晚餐', hotel: '威宁草海度假酒店'
  },
  {
    day: 6, title: '九洞天·喀斯特奇观',
    spots: [{
      name: '九洞天', image: '/images/a1.jpg', duration: '4-5小时',
      description: '集伏流、峡谷、溶洞、天桥、天坑等多种喀斯特景观于一体',
      travelFrom: '从威宁出发，车程约2.5小时'
    }],
    meals: '含早中晚餐', hotel: '毕节洪山国际酒店'
  },
  {
    day: 7, title: '毕节市区·满载而归',
    spots: [{
      name: '毕节博物馆', image: '/images/a9.jpg', duration: '1-2小时',
      description: '了解毕节历史文化和民族风情',
      travelFrom: '从酒店出发，车程约15分钟'
    }, {
      name: '同心城市公园', image: '/images/a6.jpg', duration: '1小时',
      description: '毕节城市新地标，休闲漫步好去处',
      travelFrom: '步行10分钟'
    }],
    meals: '含早餐', hotel: ''
  }
]

Page({
  data: {
    route: null,
    itineraryDays: [],
    activeDay: 1,
    safeAreaTop: 0,
    isLoading: true
  },

  onLoad(options) {
    this.initSafeArea()
    if (options.id) {
      this.loadRouteDetail(options.id)
    }
  },

  initSafeArea() {
    const safeAreaTop = this.getSafeAreaTop()
    this.setData({ safeAreaTop })
  },

  getSafeAreaTop() {
    try {
      const info = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync()
      return Math.round((info.safeArea?.top || info.statusBarHeight || 0) * 2)
    } catch (e) {
      return 40
    }
  },

  loadRouteDetail(id) {
    const idNum = parseInt(id)
    if (isNaN(idNum) || idNum <= 0) {
      this.loadMockData(id)
      return
    }

    request({
      url: `/admin/routes/public/${id}`,
      method: 'GET'
    }).then(res => {
      this.buildRouteData(res.data)
    }).catch(() => {
      this.loadMockData(id)
    })
  },

  buildRouteData(data) {
    const route = {
      id: data.id,
      name: data.name,
      coverImage: validateImageUrl(data.coverImage),
      region: data.region || '贵州',
      days: data.days || 0,
      nights: data.nights || 0,
      price: data.price || 0,
      highlights: this.parseHighlights(data.highlights),
      includes: this.parseLines(data.includes),
      notes: this.parseLines(data.notes),
      bestSeason: data.bestSeason || '',
      suitableFor: data.suitableFor || ''
    }
    const itineraryDays = this.parseItinerary(data.itinerary)
    this.setData({
      route,
      itineraryDays,
      isLoading: false,
      activeDay: itineraryDays.length > 0 ? itineraryDays[0].day : 1
    })
    wx.setNavigationBarTitle({ title: route.name })
  },

  loadMockData(id) {
    const mockRoute = {
      id: id || 103,
      name: '毕节一周游',
      coverImage: '/images/a2.jpg',
      region: '毕节',
      days: 7,
      nights: 6,
      price: 2680,
      highlights: ['织金洞喀斯特奇观', '百里杜鹃花海', '韭菜坪天上花海', '威宁草海观鸟', '九洞天地质探秘', '奢香故里文化行', '彝族风情深度体验'],
      includes: ['全程空调旅游车', '6晚精品酒店住宿', '行程所列景点门票', '6早11正餐', '优秀导游服务', '旅游意外保险'],
      notes: ['毕节早晚温差大，请携带外套', '织金洞内温度约16℃，建议带薄外套', '韭菜坪海拔较高，注意防晒防寒', '草海观鸟最佳季节为11月至次年3月'],
      bestSeason: '3-10月',
      suitableFor: '家庭游、摄影爱好者、自然风光爱好者'
    }
    const itineraryDays = this.parseItinerary(JSON.stringify(MOCK_ITINERARY))
    this.setData({
      route: mockRoute,
      itineraryDays,
      isLoading: false,
      activeDay: 1
    })
    wx.setNavigationBarTitle({ title: mockRoute.name })
  },

  parseItinerary(itineraryRaw) {
    if (!itineraryRaw) return MOCK_ITINERARY
    try {
      const parsed = typeof itineraryRaw === 'string' ? JSON.parse(itineraryRaw) : itineraryRaw
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    } catch (e) {
      console.warn('行程数据解析失败，使用mock数据')
    }
    return MOCK_ITINERARY
  },

  parseHighlights(raw) {
    if (!raw) return []
    if (Array.isArray(raw)) return raw
    return raw.split('\n').filter(line => line.trim())
  },

  parseLines(raw) {
    if (!raw) return []
    if (Array.isArray(raw)) return raw
    return raw.split('\n').filter(line => line.trim())
  },

  onDayTap(e) {
    const day = parseInt(e.currentTarget.dataset.day)
    if (day !== this.data.activeDay) {
      this.setData({ activeDay: day })
    }
  },

  onSpotImageTap(e) {
    const src = e.currentTarget.dataset.src
    if (src) {
      wx.previewImage({ urls: [src], current: src })
    }
  },

  onBack() {
    wx.navigateBack({ delta: 1 })
  },

  onShareAppMessage() {
    const route = this.data.route
    return {
      title: route ? `${route.name} - 带你黔游` : '旅游路线详情',
      path: `/packageDetail/pages/route-detail/route-detail?id=${route?.id || ''}`
    }
  }
})
