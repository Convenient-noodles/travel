class QQMapWX {
  constructor(key) {
    this.key = key
    this.serviceHost = 'https://apis.map.qq.com'
  }

  calculateDistance(options) {
    const { from, to, mode = 'straight', success, fail, complete } = options

    return new Promise((resolve, reject) => {
      wx.request({
        url: `${this.serviceHost}/ws/distance/v1/`,
        data: {
          key: this.key,
          from: from.latitude + ',' + from.longitude,
          to: to.latitude + ',' + to.longitude,
          mode: mode
        },
        success: (res) => {
          if (res.data.status === 0) {
            const result = res.data.result
            resolve(result)
            success && success(result)
          } else {
            const error = { errMsg: res.data.message || '计算距离失败' }
            reject(error)
            fail && fail(error)
          }
        },
        fail: (err) => {
          reject(err)
          fail && fail(err)
        },
        complete: () => {
          complete && complete()
        }
      })
    })
  }

  getAddress(options) {
    const { location, success, fail, complete } = options

    return new Promise((resolve, reject) => {
      wx.request({
        url: `${this.serviceHost}/ws/geocoder/v1/`,
        data: {
          key: this.key,
          location: location.latitude + ',' + location.longitude
        },
        success: (res) => {
          if (res.data.status === 0) {
            const result = res.data.result
            resolve(result)
            success && success(result)
          } else {
            const error = { errMsg: res.data.message || '获取地址失败' }
            reject(error)
            fail && fail(error)
          }
        },
        fail: (err) => {
          reject(err)
          fail && fail(err)
        },
        complete: () => {
          complete && complete()
        }
      })
    })
  }

  getCityList(options) {
    const { success, fail, complete } = options

    return new Promise((resolve, reject) => {
      wx.request({
        url: `${this.serviceHost}/ws/district/v1/`,
        data: {
          key: this.key,
          get_polygon: 0,
          max_offset: 0
        },
        success: (res) => {
          if (res.data.status === 0) {
            const result = res.data.result
            resolve(result)
            success && success(result)
          } else {
            const error = { errMsg: res.data.message || '获取城市列表失败' }
            reject(error)
            fail && fail(error)
          }
        },
        fail: (err) => {
          reject(err)
          fail && fail(err)
        },
        complete: () => {
          complete && complete()
        }
      })
    })
  }
}

module.exports = QQMapWX