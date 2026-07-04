const app = getApp()

Page({
  data: {
    loading: true,
    hotel: null,
    isCollected: false,
    currentSwiper: 0,
    mapLoading: true,
    mapLatitude: 26.599999,
    mapLongitude: 106.719997,
    markers: [],
    navMode: 'driving',
    distanceInfo: '',
    userLocation: null
  },

  onLoad: function (options) {
    if (options.id) {
      this.loadHotelDetail(options.id)
    } else {
      wx.showToast({
        title: '参数错误',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }
  },

  onShow: function () {
    this.initMap()
  },

  loadHotelDetail: function (id) {
    this.setData({ loading: true })

    wx.request({
      url: 'http://localhost:8080/api/admin/hotels/public/' + id,
      method: 'GET',
      success: (res) => {
        const data = res.data
        if (data && data.code === 200 && data.data) {
          const hotelData = data.data
          const hotel = {
            id: hotelData.id,
            name: hotelData.name || '',
            type: this.mapHotelType(hotelData.hotelType),
            images: this.parseImages(hotelData.images),
            price: this.getMinPrice(hotelData.roomTypes),
            rating: hotelData.starLevel ? hotelData.starLevel.toString() : '0',
            reviews: 0,
            distance: hotelData.address || '',
            address: hotelData.address || '',
            latitude: hotelData.latitude ? parseFloat(hotelData.latitude) : null,
            longitude: hotelData.longitude ? parseFloat(hotelData.longitude) : null,
            phone: hotelData.phone || '',
            tags: this.parseTags(hotelData.tags),
            facilities: this.parseFacilities(hotelData.facilities),
            roomTypes: this.parseRoomTypes(hotelData.roomTypes),
            description: hotelData.description || '',
            highlights: '',
            paymentQrCode: hotelData.paymentQrCode || '',
            policy: this.buildPolicy(hotelData.checkInTime, hotelData.checkOutTime)
          }

          this.setData({
            hotel: hotel,
            loading: false,
            mapLatitude: hotel.latitude || 26.599999,
            mapLongitude: hotel.longitude || 106.719997
          })

          wx.setNavigationBarTitle({
            title: hotel.name
          })

          this.initMap()
        } else {
          this.loadMockHotelDetail(id)
        }
      },
      fail: (error) => {
        console.error('加载酒店详情失败:', error)
        this.loadMockHotelDetail(id)
      }
    })
  },

  loadMockHotelDetail: function (id) {
    const hotel = this.getHotelById(parseInt(id))

    if (!hotel) {
      this.setData({ loading: false })
      wx.showToast({
        title: '住宿不存在',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
      return
    }

    this.setData({
      hotel: hotel,
      loading: false,
      mapLatitude: hotel.latitude || 26.599999,
      mapLongitude: hotel.longitude || 106.719997
    })

    wx.setNavigationBarTitle({
      title: hotel.name
    })

    this.initMap()
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

  parseImages: function (images) {
    try {
      if (typeof images === 'string') {
        const parsed = JSON.parse(images)
        return parsed.map(img => this.validateImageUrl(img))
      }
    } catch (e) {
      console.error('解析图片失败:', e)
    }
    return []
  },

  parseRoomTypes: function (roomTypes) {
    try {
      if (typeof roomTypes === 'string') {
        return JSON.parse(roomTypes).map(room => ({
          name: room.name || '',
          area: '',
          bed: room.bed || '',
          price: parseInt(room.price) || 0,
          features: []
        }))
      }
    } catch (e) {
      console.error('解析房型失败:', e)
    }
    return []
  },

  parseTags: function (tags) {
    if (!tags) return []
    return tags.split(/[,，、]/).filter(t => t.trim())
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

  validateImageUrl: function (url) {
    if (!url || url.startsWith('blob:') || url.startsWith('data:')) {
      return '/images/a1.jpg'
    }
    return url
  },

  buildPolicy: function (checkInTime, checkOutTime) {
    let policy = ''
    if (checkInTime) {
      policy += `入住时间：${checkInTime}:00后\n`
    }
    if (checkOutTime) {
      policy += `退房时间：${checkOutTime}:00前\n`
    }
    policy += '取消政策：提前1天免费取消'
    return policy
  },

  initMap: function () {
    const hotel = this.data.hotel
    if (!hotel) return

    this.setData({ mapLoading: true })

    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        const userLocation = {
          latitude: res.latitude,
          longitude: res.longitude
        }
        this.setData({ userLocation: userLocation })

        const markers = [
          {
            id: 1,
            latitude: this.data.mapLatitude,
            longitude: this.data.mapLongitude,
            title: hotel.name,
            width: 30,
            height: 30,
            callout: {
              content: hotel.name,
              color: '#333',
              fontSize: 14,
              borderRadius: 10,
              bgColor: '#fff',
              padding: 10,
              display: 'ALWAYS'
            }
          }
        ]
        this.setData({ markers: markers })

        this.calculateDistance(userLocation)
        this.setData({ mapLoading: false })
      },
      fail: (err) => {
        console.error('获取位置失败:', err)
        this.setData({
          mapLoading: false,
          distanceInfo: '无法获取您的位置，请开启位置权限'
        })
        wx.showToast({
          title: '请开启位置权限',
          icon: 'none'
        })
      }
    })
  },

  calculateDistance: function (userLocation) {
    const hotel = this.data.hotel
    if (!hotel || !userLocation) return

    const hotelLocation = {
      latitude: this.data.mapLatitude,
      longitude: this.data.mapLongitude
    }

    // 使用本地计算距离（Haversine公式）
    const distanceText = this.calculateDistanceLocally(userLocation, hotelLocation)
    this.setData({ distanceInfo: distanceText })
  },

  // 本地计算距离的方法（使用Haversine公式）
  calculateDistanceLocally: function (from, to) {
    const R = 6371
    const dLat = this.toRad(to.latitude - from.latitude)
    const dLon = this.toRad(to.longitude - from.longitude)
    const lat1 = this.toRad(from.latitude)
    const lat2 = this.toRad(to.latitude)

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) *
      Math.cos(lat1) * Math.cos(lat2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c

    let distanceText = ''
    if (distance < 1) {
      distanceText = `距离您约 ${Math.round(distance * 1000)} 米`
    } else {
      distanceText = `距离您约 ${distance.toFixed(1)} 公里`
    }

    const mode = this.data.navMode
    let estimatedTime = ''
    if (mode === 'driving') {
      estimatedTime = Math.max(Math.ceil(distance / 0.5), 5)
      distanceText += `，驾车约 ${estimatedTime} 分钟`
    } else if (mode === 'walking') {
      estimatedTime = Math.max(Math.ceil(distance / 0.06), 1)
      distanceText += `，步行约 ${estimatedTime} 分钟`
    } else if (mode === 'transit') {
      estimatedTime = Math.max(Math.ceil(distance / 0.25), 5)
      distanceText += `，公交约 ${estimatedTime} 分钟`
    }

    return distanceText
  },

  toRad: function (deg) {
    return deg * (Math.PI / 180)
  },

  onNavModeChange: function (e) {
    const mode = e.currentTarget.dataset.mode
    this.setData({ navMode: mode })

    if (this.data.userLocation) {
      this.calculateDistance(this.data.userLocation)
    }
  },

  onStartNavigation: function () {
    const hotel = this.data.hotel
    if (!hotel) return

    if (!this.data.userLocation) {
      wx.showModal({
        title: '提示',
        content: '无法获取您的位置信息，请开启位置权限后重试',
        showCancel: false,
        confirmText: '知道了'
      })
      return
    }

    wx.navigateTo({
      url: `/pages/navigation/navigation?name=${encodeURIComponent(hotel.name)}&address=${encodeURIComponent(hotel.address)}&latitude=${hotel.latitude || 26.5833}&longitude=${hotel.longitude || 106.7167}`
    })
  },

  onMapTap: function () {
    this.onStartNavigation()
  },

  getHotelById: function (id) {
    const allHotels = [
      {
        id: 1,
        name: '贵阳凯宾斯基酒店',
        type: 'hotel',
        images: ['/images/a1.jpg', '/images/a2.jpg', '/images/a3.jpg', '/images/a4.jpg'],
        price: 888,
        rating: 4.8,
        reviews: 1256,
        distance: '距甲秀楼1.2公里',
        address: '贵州省贵阳市南明区中华南路128号',
        latitude: 26.599999,
        longitude: 106.719997,
        phone: '0851-85888888',
        tags: ['五星级', '商务出行', '亲子游'],
        facilities: ['免费WiFi', '健身房', '游泳池', '停车场', '商务中心', '会议室', '餐厅', '酒吧', 'SPA'],
        roomTypes: [
          { name: '高级房', area: '35㎡', bed: '1.8米大床/双床', price: 888, features: ['含早', '免费停车'] },
          { name: '豪华房', area: '45㎡', bed: '1.8米大床', price: 1088, features: ['含早', '欢迎水果', '免费停车'] },
          { name: '行政套房', area: '65㎡', bed: '1.8米大床', price: 1688, features: ['含早', '行政礼遇', '延迟退房'] },
          { name: '总统套房', area: '150㎡', bed: '2米大床', price: 5888, features: ['含早', '管家服务', '专车接送'] }
        ],
        description: '贵阳凯宾斯基酒店位于市中心，交通便利，设施完善，是商务出行和旅游度假的理想选择。酒店拥有各类豪华客房，为宾客提供优质的服务和舒适的住宿体验。',
        highlights: '1. 国际五星级品牌，服务品质有保障；2. 地理位置优越，步行可达甲秀楼、黔灵山公园；3. 顶层餐厅可俯瞰贵阳全景；4. 配备完善的商务设施。',
        policy: '入住时间：14:00后\n退房时间：12:00前\n取消政策：提前1天免费取消'
      },
      {
        id: 2,
        name: '西江千户苗寨吊脚楼民宿',
        type: 'diaojiaolou',
        images: ['/images/a2.jpg', '/images/a3.jpg', '/images/a4.jpg', '/images/a5.jpg'],
        price: 388,
        rating: 4.6,
        reviews: 892,
        distance: '距观景台0.3公里',
        address: '贵州省黔东南州雷山县西江镇苗寨景区内',
        latitude: 26.501234,
        longitude: 108.654321,
        phone: '0855-3336666',
        tags: ['特色住宿', '苗寨风情', '观景房'],
        facilities: ['免费WiFi', '观景台', '民族表演', '餐厅', '行李寄存', '旅游咨询'],
        roomTypes: [
          { name: '景观标准间', area: '25㎡', bed: '1.5米大床', price: 288, features: ['不含早', '景观阳台'] },
          { name: '观景大床房', area: '30㎡', bed: '1.8米大床', price: 388, features: ['含早', '观景阳台', '苗族服饰体验'] },
          { name: '家庭套房', area: '45㎡', bed: '1.8米大床+单人床', price: 588, features: ['含早', '独立阳台', '民族表演票'] },
          { name: '贵宾楼', area: '60㎡', bed: '2米大床', price: 888, features: ['含早晚餐', '专属管家', 'VIP演出票'] }
        ],
        description: '传统苗族吊脚楼改造，体验原汁原味的苗族生活，夜晚可欣赏苗寨万家灯火。民宿位于西江千户苗寨景区内，观景位置极佳。',
        highlights: '1. 原汁原味的苗族吊脚楼建筑；2. 推窗即见苗寨全景；3. 可观看苗族歌舞表演；4. 品尝地道苗族美食。',
        policy: '入住时间：14:00后\n退房时间：12:00前\n取消政策：提前3天免费取消'
      },
      {
        id: 3,
        name: '黄果树瀑布景区酒店',
        type: 'hotel',
        images: ['/images/a3.jpg', '/images/a4.jpg', '/images/a5.jpg', '/images/a6.jpg'],
        price: 568,
        rating: 4.5,
        reviews: 756,
        distance: '距黄果树瀑布0.5公里',
        address: '贵州省安顺市镇宁县黄果树镇迎宾大道88号',
        latitude: 25.991234,
        longitude: 105.654321,
        phone: '0853-6778888',
        tags: ['景区酒店', '自然风光', '家庭游'],
        facilities: ['免费WiFi', '餐厅', '停车场', '旅游咨询', '行李寄存', '会议室'],
        roomTypes: [
          { name: '园景标准间', area: '28㎡', bed: '1.2米双床', price: 398, features: ['含早', '景区门票优惠'] },
          { name: '瀑景大床房', area: '35㎡', bed: '1.8米大床', price: 568, features: ['含早', '瀑布景观', '欢迎水果'] },
          { name: '家庭亲子房', area: '40㎡', bed: '1.8米大床+儿童床', price: 768, features: ['含早', '儿童用品', '亲子活动'] },
          { name: '豪华套房', area: '55㎡', bed: '2米大床', price: 988, features: ['含早晚餐', '行政礼遇', '景区VIP通道'] }
        ],
        description: '紧邻黄果树瀑布景区，步行即可到达，是游览瀑布的理想住宿选择。酒店设施齐全，为游客提供便捷的服务。',
        highlights: '1. 距景区入口仅500米；2. 提供景区门票预订服务；3. 酒店餐厅可品尝当地特色菜；4. 适合家庭出游。',
        policy: '入住时间：14:00后\n退房时间：12:00前\n取消政策：提前1天免费取消'
      }
    ]

    const hotel = allHotels.find(item => item.id === id) || null

    if (hotel) {
      this.setData({
        mapLatitude: hotel.latitude || 26.599999,
        mapLongitude: hotel.longitude || 106.719997
      })
    }

    return hotel
  },

  onSwiperChange: function (e) {
    this.setData({
      currentSwiper: e.detail.current
    })
  },

  onImageTap: function (e) {
    const hotel = this.data.hotel
    if (hotel && hotel.images) {
      wx.previewImage({
        current: hotel.images[this.data.currentSwiper],
        urls: hotel.images
      })
    }
  },

  onCloseMap: function () {
    wx.navigateBack()
  },

  onCollect: function () {
    const hotel = this.data.hotel
    if (!hotel) return

    let collections = wx.getStorageSync('hotelCollections') || []
    const isCollected = collections.some(item => item.id === hotel.id)

    if (isCollected) {
      collections = collections.filter(item => item.id !== hotel.id)
      wx.showToast({
        title: '已取消收藏',
        icon: 'none'
      })
    } else {
      collections.push({
        id: hotel.id,
        name: hotel.name,
        image: hotel.images[0],
        price: hotel.price,
        rating: hotel.rating,
        address: hotel.address,
        type: hotel.type,
        collectTime: Date.now()
      })
      wx.showToast({
        title: '收藏成功',
        icon: 'success'
      })
    }

    wx.setStorageSync('hotelCollections', collections)
    this.setData({ isCollected: !isCollected })
  },

  onCall: function () {
    const hotel = this.data.hotel
    if (!hotel || !hotel.phone) {
      wx.showToast({ title: '暂无联系电话', icon: 'none' })
      return
    }
    this.showCallOptions(hotel.phone)
  },

  showCallOptions(phone) {
    wx.showActionSheet({
      itemList: ['拨打 ' + phone, '复制号码到剪贴板'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.dialPhone(phone)
        } else if (res.tapIndex === 1) {
          this.copyPhoneToClipboard(phone)
        }
      }
    })
  },

  dialPhone(phone) {
    wx.makePhoneCall({
      phoneNumber: phone,
      fail: () => {
        wx.showModal({
          title: '提示',
          content: '当前环境不支持直接拨号（模拟器限制），要复制号码吗？',
          confirmText: '复制号码',
          success: (res) => {
            if (res.confirm) this.copyPhoneToClipboard(phone)
          }
        })
      }
    })
  },

  copyPhoneToClipboard(phone) {
    wx.setClipboardData({
      data: phone,
      success: () => wx.showToast({ title: '号码已复制，可到拨号盘粘贴拨打', icon: 'success', duration: 2500 })
    })
  },

  onNavigate: function () {
    this.onStartNavigation()
  },

  onBookRoom: function (e) {
    const roomIndex = e.currentTarget.dataset.index
    const hotel = this.data.hotel
    if (!hotel || !hotel.roomTypes || !hotel.roomTypes[roomIndex]) return
    const room = hotel.roomTypes[roomIndex]
    this.navigateToPayment(hotel, room)
  },

  navigateToPayment: function (hotel, room) {
    const coverImage = hotel.images && hotel.images.length > 0 ? hotel.images[0] : ''
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const checkIn = this.formatDate(today)
    const checkOut = this.formatDate(tomorrow)

    const params = {
      hotelId: hotel.id,
      hotelName: encodeURIComponent(hotel.name),
      hotelImage: encodeURIComponent(coverImage),
      roomName: encodeURIComponent(room.name),
      amount: room.price,
      qrCode: encodeURIComponent(hotel.paymentQrCode || ''),
      checkInDate: checkIn,
      checkOutDate: checkOut,
      nights: 1
    }

    const query = Object.entries(params).map(([k, v]) => `${k}=${v}`).join('&')
    wx.navigateTo({
      url: `/packageHotel/pages/hotel-payment/hotel-payment?${query}`
    })
  },

  formatDate: function (date) {
    const y = date.getFullYear()
    const m = (date.getMonth() + 1).toString().padStart(2, '0')
    const d = date.getDate().toString().padStart(2, '0')
    return `${y}-${m}-${d}`
  },

  onBack: function () {
    wx.navigateBack()
  },

  onShareAppMessage: function () {
    const hotel = this.data.hotel
    if (hotel) {
      return {
        title: `住宿推荐 - ${hotel.name}`,
        path: `/pages/hotel-detail/hotel-detail?id=${hotel.id}`,
        imageUrl: hotel.images[0]
      }
    }
    return {}
  }
})