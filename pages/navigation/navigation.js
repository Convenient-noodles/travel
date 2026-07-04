const app = getApp()

Page({
  data: {
    name: '',
    address: '',
    latitude: 0,
    longitude: 0,
    navMode: 'driving',
    distanceInfo: '',
    userLocation: null,
    locationInfo: null,
    markers: [],
    isNavigating: false,
    polyline: [],
    includePoints: [] //【改】用于让地图视野同时包含用户位置和目的地
  },

  locationTimer: null,

  onLoad: function (options) {
    if (options.name && options.latitude && options.longitude) {
      this.setData({
        name: decodeURIComponent(options.name),
        address: decodeURIComponent(options.address || ''),
        latitude: parseFloat(options.latitude),
        longitude: parseFloat(options.longitude)
      })

      this.setData({
        locationInfo: {
          name: this.data.name,
          address: this.data.address
        }
      })

      this.initMap()
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

  onReady: function () {
    //【改】页面就绪后确保地图能正确初始化
    if (this.data.latitude && this.data.longitude) {
      this.initMap()
    }
  },

  onMapLoad: function () {
    //【改】地图加载完成后再次设置标记点，确保能正确显示
    if (this.data.latitude && this.data.longitude && this.data.markers.length === 0) {
      const markers = [
        {
          id: 1,
          latitude: this.data.latitude,
          longitude: this.data.longitude,
          title: this.data.name,
          width: 50,
          height: 50,
          callout: {
            content: this.data.name,
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
    }
  },

  onUnload: function () {
    this.clearLocationTimer()
  },

  clearLocationTimer: function () {
    if (this.locationTimer) {
      clearInterval(this.locationTimer)
      this.locationTimer = null
    }
  },

  initMap: function () {
    //【改】先设置标记点，确保地图能显示目标位置
    const markers = [
      {
        id: 1,
        latitude: this.data.latitude,
        longitude: this.data.longitude,
        title: this.data.name,
        width: 50, //【改】增大标记点尺寸
        height: 50,
        callout: {
          content: this.data.name,
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

    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        const userLocation = {
          latitude: res.latitude,
          longitude: res.longitude
        }
        this.setData({ userLocation: userLocation })

        this.calculateDistance(userLocation)
      },
      fail: (err) => {
        console.error('获取位置失败:', err)
        this.setData({
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
    if (!userLocation || !this.data.latitude || !this.data.longitude) return

    const hotelLocation = {
      latitude: this.data.latitude,
      longitude: this.data.longitude
    }

    const distanceText = this.calculateDistanceLocally(userLocation, hotelLocation)
    this.setData({ distanceInfo: distanceText })
  },

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
    if (mode === 'driving') {
      const estimatedTime = Math.max(Math.ceil(distance / 0.5), 5)
      distanceText += `，驾车约 ${estimatedTime} 分钟`
    } else if (mode === 'walking') {
      const estimatedTime = Math.max(Math.ceil(distance / 0.06), 1)
      distanceText += `，步行约 ${estimatedTime} 分钟`
    } else if (mode === 'transit') {
      const estimatedTime = Math.max(Math.ceil(distance / 0.25), 5)
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
    this.setData({ isNavigating: true })
    this.startLocationUpdate()

    //【改】立即获取用户位置，构建双标记点和路线
    if (this.data.userLocation) {
      this.updateAllMapElements(this.data.userLocation)
    } else {
      wx.getLocation({
        type: 'gcj02',
        success: (res) => {
          const userLocation = { latitude: res.latitude, longitude: res.longitude }
          this.setData({ userLocation })
          this.calculateDistance(userLocation)
          this.updateAllMapElements(userLocation)
        },
        fail: () => {
          // 无用户位置时仍显示目的地标记
          this.updatePolyline(null)
        }
      })
    }
  },

  startLocationUpdate: function () {
    this.clearLocationTimer()

    //【改】立即更新一次：标记点 + 路线 + 视野
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        const userLocation = { latitude: res.latitude, longitude: res.longitude }
        this.setData({ userLocation })
        this.calculateDistance(userLocation)
        this.updateAllMapElements(userLocation)
      }
    })

    // 每10秒更新一次位置和路线
    this.locationTimer = setInterval(() => {
      wx.getLocation({
        type: 'gcj02',
        success: (res) => {
          const userLocation = { latitude: res.latitude, longitude: res.longitude }
          this.setData({ userLocation })
          this.calculateDistance(userLocation)
          this.updateAllMapElements(userLocation)
        }
      })
    }, 10000)
  },

  //【改】更新地图上所有元素：双标记点 + 路线 + 视野适配
  updateAllMapElements: function (userLocation) {
    const destLat = this.data.latitude
    const destLng = this.data.longitude
    const userLat = userLocation.latitude
    const userLng = userLocation.longitude

    //【改】构建双标记点：用户位置 + 目的地，均显示callout标注
    const markers = [
      {
        id: 1,
        latitude: userLat,
        longitude: userLng,
        width: 32,
        height: 32,
        anchor: { x: 0.5, y: 1 }, //【改】锚点设在图标底部，避免漂移
        callout: { content: '📍 我的位置', color: '#27AE60', fontSize: 12, borderRadius: 8, bgColor: '#fff', padding: 8, display: 'ALWAYS' }
      },
      {
        id: 2,
        latitude: destLat,
        longitude: destLng,
        width: 44,
        height: 44,
        anchor: { x: 0.5, y: 1 }, //【改】锚点设在图标底部，避免漂移
        callout: { content: this.data.name, color: '#333', fontSize: 14, borderRadius: 10, bgColor: '#fff', padding: 10, display: 'ALWAYS' }
      }
    ]

    // 构建路线
    const polyline = [{
      points: [
        { latitude: userLat, longitude: userLng },
        { latitude: destLat, longitude: destLng }
      ],
      color: '#27AE60',
      width: 6,
      arrowLine: true,
      dottedLine: false
    }]

    // 视野适配：让地图同时显示两个标记点
    const includePoints = [
      { latitude: userLat, longitude: userLng },
      { latitude: destLat, longitude: destLng }
    ]

    this.setData({
      markers: markers,
      polyline: polyline,
      includePoints: includePoints
    })
  },

  updatePolyline: function (userLocation) {
    if (!userLocation) return
    //【改】保留此方法作为兼容，实际逻辑已迁移到 updateAllMapElements
    this.updateAllMapElements(userLocation)
  },

  onExitNavigation: function () {
    this.clearLocationTimer()
    wx.navigateBack()
  },

  onBack: function () {
    this.clearLocationTimer()
    wx.navigateBack()
  },

  onClose: function () {
    this.clearLocationTimer()
    wx.navigateBack()
  },

  onShareAppMessage: function () {
    return {
      title: `导航到 ${this.data.name}`,
      path: `/pages/navigation/navigation?name=${encodeURIComponent(this.data.name)}&address=${encodeURIComponent(this.data.address)}&latitude=${this.data.latitude}&longitude=${this.data.longitude}`
    }
  }
})
