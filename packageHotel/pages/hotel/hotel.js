const app = getApp()

Page({
  data: {
    loading: true,
    hotelList: [],
    currentType: 'all',
    currentPrice: 'all',
    page: 1,
    pageSize: 10,
    hasMore: true,
    loadingMore: false,
    types: [
      { value: 'all', name: '全部' },
      { value: 'hotel', name: '酒店' },
      { value: 'homestay', name: '民宿' },
      { value: 'diaojiaolou', name: '吊脚楼' }
    ],
    priceRanges: [
      { value: 'all', name: '不限' },
      { value: '0-200', name: '200元以下' },
      { value: '200-500', name: '200-500元' },
      { value: '500-1000', name: '500-1000元' },
      { value: '1000+', name: '1000元以上' }
    ]
  },

  onLoad: function (options) {
    this.loadHotelData()
  },

  onPullDownRefresh: function () {
    this.setData({
      page: 1,
      hasMore: true,
      hotelList: []
    })
    this.loadHotelData(true)
  },

  onReachBottom: function () {
    if (this.data.hasMore && !this.data.loadingMore) {
      this.loadMoreData()
    }
  },

  loadHotelData: function (isRefresh = false) {
    this.setData({ loading: true })

    const params = {}
    if (this.data.currentType !== 'all') {
      params.type = this.data.currentType
    }

    wx.request({
      url: 'http://localhost:8080/api/admin/hotels/public/list',
      method: 'GET',
      data: params,
      success: (res) => {
        const data = res.data
        if (data && data.data && data.data.list) {
          const hotelList = data.data.list.map(item => ({
            id: item.id,
            name: item.name || '',
            type: this.mapHotelType(item.hotelType),
            image: this.validateImageUrl(item.coverImage),
            price: this.getMinPrice(item.roomTypes),
            rating: item.starLevel ? item.starLevel.toString() : '0',
            reviews: 0,
            distance: item.address || '',
            address: item.address || '',
            tags: this.parseTags(item.tags),
            facilities: this.parseFacilities(item.facilities),
            description: item.description || ''
          }))
          this.setData({
            hotelList: hotelList,
            loading: false,
            hasMore: false
          })
        } else {
          this.loadMockData()
        }
        if (isRefresh) {
          wx.stopPullDownRefresh()
        }
      },
      fail: (error) => {
        console.error('加载酒店列表失败:', error)
        this.loadMockData()
        if (isRefresh) {
          wx.stopPullDownRefresh()
        }
      }
    })
  },

  loadMockData: function () {
    const allHotels = this.getAllHotels()
    let filteredHotels = this.filterHotels(allHotels)

    const displayData = filteredHotels.slice(0, this.data.pageSize)

    this.setData({
      hotelList: displayData,
      loading: false,
      hasMore: filteredHotels.length > this.data.pageSize
    })
  },

  validateImageUrl: function (url) {
    if (!url || url.startsWith('blob:') || url.startsWith('data:')) {
      return '/images/a1.jpg'
    }
    return url
  },

  mapHotelType: function (type) {
    const typeMap = {
      'luxury': 'hotel',
      'comfort': 'hotel',
      'economy': 'hotel',
      'boutique': 'homestay'
    }
    return typeMap[type] || 'hotel'
  },

  getMinPrice: function (roomTypes) {
    try {
      if (typeof roomTypes === 'string') {
        roomTypes = JSON.parse(roomTypes)
      }
      if (Array.isArray(roomTypes) && roomTypes.length > 0) {
        return Math.min(...roomTypes.map(r => parseFloat(r.price) || 0))
      }
    } catch (e) {
      console.error('解析房型价格失败:', e)
    }
    return 0
  },

  parseTags: function (tag) {
    if (!tag) return []
    return tag.split(/[,，、]/).filter(t => t.trim())
  },

  parseFacilities: function (facilities) {
    try {
      if (typeof facilities === 'string') {
        return JSON.parse(facilities)
      }
    } catch (e) {
      console.error('解析设施失败:', e)
    }
    return []
  },

  loadMoreData: function () {
    if (!this.data.hasMore || this.data.loadingMore) return

    this.setData({ loadingMore: true })

    setTimeout(() => {
      const allHotels = this.getAllHotels()
      let filteredHotels = this.filterHotels(allHotels)

      const page = this.data.page + 1
      const displayData = filteredHotels.slice(0, page * this.data.pageSize)

      this.setData({
        hotelList: displayData,
        page: page,
        loadingMore: false,
        hasMore: filteredHotels.length > displayData.length
      })
    }, 300)
  },

  filterHotels: function (hotels) {
    let result = hotels

    if (this.data.currentType !== 'all') {
      result = result.filter(hotel => hotel.type === this.data.currentType)
    }

    if (this.data.currentPrice !== 'all') {
      result = result.filter(hotel => {
        const price = parseInt(hotel.price)
        switch (this.data.currentPrice) {
          case '0-200':
            return price < 200
          case '200-500':
            return price >= 200 && price < 500
          case '500-1000':
            return price >= 500 && price < 1000
          case '1000+':
            return price >= 1000
          default:
            return true
        }
      })
    }

    return result
  },

  onTypeChange: function (e) {
    const type = e.currentTarget.dataset.type
    if (type === this.data.currentType) return

    this.setData({
      currentType: type,
      page: 1,
      hotelList: [],
      hasMore: true,
      loading: true
    })

    this.loadHotelData()
  },

  onPriceChange: function (e) {
    const price = e.currentTarget.dataset.price
    if (price === this.data.currentPrice) return

    this.setData({
      currentPrice: price,
      page: 1,
      hotelList: [],
      hasMore: true,
      loading: true
    })

    this.loadHotelData()
  },

  onHotelTap: function (e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/packageHotel/pages/hotel-detail/hotel-detail?id=${id}`
    })
  },

  onImageError: function (e) {
    const index = e.currentTarget.dataset.index
    const hotelList = this.data.hotelList
    if (hotelList[index]) {
      hotelList[index].image = '/images/default-hotel.jpg'
      this.setData({ hotelList })
    }
  },

  getAllHotels: function () {
    return [
      {
        id: 1,
        name: '贵阳凯宾斯基酒店',
        type: 'hotel',
        image: '/images/a1.jpg',
        price: 888,
        rating: 4.8,
        reviews: 1256,
        distance: '距甲秀楼1.2公里',
        address: '南明区中华南路',
        tags: ['五星级', '商务出行', '亲子游'],
        facilities: ['免费WiFi', '健身房', '游泳池', '停车场'],
        description: '贵阳凯宾斯基酒店位于市中心，交通便利，设施完善，是商务出行和旅游度假的理想选择。'
      },
      {
        id: 2,
        name: '西江千户苗寨吊脚楼民宿',
        type: 'diaojiaolou',
        image: '/images/a2.jpg',
        price: 388,
        rating: 4.6,
        reviews: 892,
        distance: '距观景台0.3公里',
        address: '雷山县西江镇',
        tags: ['特色住宿', '苗寨风情', '观景房'],
        facilities: ['免费WiFi', '观景台', '民族表演'],
        description: '传统苗族吊脚楼改造，体验原汁原味的苗族生活，夜晚可欣赏苗寨万家灯火。'
      },
      {
        id: 3,
        name: '黄果树瀑布景区酒店',
        type: 'hotel',
        image: '/images/a3.jpg',
        price: 568,
        rating: 4.5,
        reviews: 756,
        distance: '距黄果树瀑布0.5公里',
        address: '镇宁县黄果树镇',
        tags: ['景区酒店', '自然风光', '家庭游'],
        facilities: ['免费WiFi', '餐厅', '停车场', '旅游咨询'],
        description: '紧邻黄果树瀑布景区，步行即可到达，是游览瀑布的理想住宿选择。'
      },
      {
        id: 4,
        name: '青岩古镇特色民宿',
        type: 'homestay',
        image: '/images/a4.jpg',
        price: 268,
        rating: 4.7,
        reviews: 534,
        distance: '距青岩古镇0.1公里',
        address: '花溪区青岩镇',
        tags: ['古镇风情', '文艺清新', '美食街'],
        facilities: ['免费WiFi', '厨房', '花园'],
        description: '位于青岩古镇内，古色古香的四合院改造，体验古镇慢生活。'
      },
      {
        id: 5,
        name: '梵净山生态度假酒店',
        type: 'hotel',
        image: '/images/a5.jpg',
        price: 688,
        rating: 4.6,
        reviews: 423,
        distance: '距梵净山景区2公里',
        address: '江口县太平镇',
        tags: ['生态度假', '山景房', '避暑胜地'],
        facilities: ['免费WiFi', '餐厅', 'SPA', '徒步路线'],
        description: '坐落于梵净山脚下，环境清幽，是避暑和生态旅游的理想选择。'
      },
      {
        id: 6,
        name: '荔波小七孔水景民宿',
        type: 'homestay',
        image: '/images/a6.jpg',
        price: 328,
        rating: 4.8,
        reviews: 678,
        distance: '距小七孔景区0.8公里',
        address: '荔波县瑶山乡',
        tags: ['水景房', '亲水体验', '布依风情'],
        facilities: ['免费WiFi', '餐厅', '自行车租赁'],
        description: '临水而建，推窗即见碧绿河水，体验布依族水乡生活。'
      },
      {
        id: 7,
        name: '镇远古镇河畔客栈',
        type: 'homestay',
        image: '/images/a7.jpg',
        price: 198,
        rating: 4.5,
        reviews: 445,
        distance: '距舞阳河0.2公里',
        address: '镇远县舞阳镇',
        tags: ['古镇客栈', '河景房', '夜景'],
        facilities: ['免费WiFi', '茶室', '观景露台'],
        description: '位于镇远古镇河畔，夜晚可欣赏古镇灯火倒影，感受千年古镇韵味。'
      },
      {
        id: 8,
        name: '肇兴侗寨鼓楼民宿',
        type: 'diaojiaolou',
        image: '/images/a8.jpg',
        price: 258,
        rating: 4.7,
        reviews: 367,
        distance: '距鼓楼广场0.1公里',
        address: '黎平县肇兴镇',
        tags: ['侗寨风情', '鼓楼景观', '民族表演'],
        facilities: ['免费WiFi', '餐厅', '民族歌舞表演'],
        description: '传统侗族吊脚楼，可近距离欣赏鼓楼和侗族大歌表演。'
      },
      {
        id: 9,
        name: '赤水丹霞温泉酒店',
        type: 'hotel',
        image: '/images/a9.jpg',
        price: 798,
        rating: 4.6,
        reviews: 512,
        distance: '距赤水丹霞景区3公里',
        address: '赤水市两河口镇',
        tags: ['温泉度假', '丹霞地貌', '养生'],
        facilities: ['免费WiFi', '温泉', 'SPA', '餐厅'],
        description: '集温泉、养生、度假于一体，游览丹霞地貌后享受温泉放松。'
      },
      {
        id: 10,
        name: '百里杜鹃花海民宿',
        type: 'homestay',
        image: '/images/a1.jpg',
        price: 358,
        rating: 4.5,
        reviews: 289,
        distance: '距百里杜鹃景区1公里',
        address: '黔西县金坡乡',
        tags: ['花海景观', '赏花季', '摄影'],
        facilities: ['免费WiFi', '观景台', '摄影指导'],
        description: '春季赏杜鹃花海的绝佳住宿，推窗即见漫山花海。'
      },
      {
        id: 11,
        name: '加榜梯田云海客栈',
        type: 'diaojiaolou',
        image: '/images/a2.jpg',
        price: 228,
        rating: 4.8,
        reviews: 234,
        distance: '距加榜梯田0.5公里',
        address: '从江县加榜乡',
        tags: ['梯田景观', '云海日出', '摄影'],
        facilities: ['免费WiFi', '观景台', '向导服务'],
        description: '位于加榜梯田核心区，清晨可观云海日出，是摄影爱好者的天堂。'
      },
      {
        id: 12,
        name: '贵阳喜来登酒店',
        type: 'hotel',
        image: '/images/a3.jpg',
        price: 1088,
        rating: 4.7,
        reviews: 1567,
        distance: '距贵阳北站3公里',
        address: '观山湖区林城东路',
        tags: ['五星级', '商务出行', '会议'],
        facilities: ['免费WiFi', '健身房', '游泳池', '商务中心', '会议室'],
        description: '国际五星级酒店，设施完善，适合商务出行和高端旅游。'
      },
      {
        id: 13,
        name: '从江岜沙苗寨枪手部落民宿',
        type: 'diaojiaolou',
        image: '/images/a4.jpg',
        price: 188,
        rating: 4.6,
        reviews: 178,
        distance: '距岜沙苗寨0.2公里',
        address: '从江县丙妹镇',
        tags: ['苗族风情', '火枪表演', '原始部落'],
        facilities: ['免费WiFi', '民族表演', '向导服务'],
        description: '体验中国最后一个枪手部落，感受原生态苗族文化。'
      },
      {
        id: 14,
        name: '遵义会议会址附近酒店',
        type: 'hotel',
        image: '/images/a5.jpg',
        price: 398,
        rating: 4.4,
        reviews: 678,
        distance: '距遵义会议会址0.5公里',
        address: '红花岗区子尹路',
        tags: ['红色旅游', '历史景点', '市中心'],
        facilities: ['免费WiFi', '餐厅', '停车场'],
        description: '紧邻遵义会议会址，方便参观红色旅游景点。'
      },
      {
        id: 15,
        name: '织金洞景区农家乐',
        type: 'homestay',
        image: '/images/a6.jpg',
        price: 128,
        rating: 4.3,
        reviews: 234,
        distance: '距织金洞景区1公里',
        address: '织金县官寨乡',
        tags: ['农家体验', '地道美食', '性价比高'],
        facilities: ['免费WiFi', '农家餐', '停车场'],
        description: '地道农家乐，品尝织金特色美食，体验乡村生活。'
      }
    ]
  },

  onBack: function () {
    wx.navigateBack()
  }
})