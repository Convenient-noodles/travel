const BASE_URL = 'http://localhost:8080/api'

const request = (options) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json'
      },
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 200) {
            resolve(res.data)
          } else {
            reject(new Error(res.data.message || '请求失败'))
          }
        } else {
          reject(new Error('网络请求失败'))
        }
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

const foodApi = {
  getFoodList: (params) => {
    return request({
      url: '/foods',
      method: 'GET',
      data: params
    })
  },
  getFoodById: (id) => {
    return request({
      url: `/foods/${id}`,
      method: 'GET'
    })
  }
}

module.exports = {
  request,
  foodApi
}
