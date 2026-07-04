/**
 * 公共请求工具模块
 * 消除各页面中 BASE_URL + wx.request Promise 封装的重复代码
 */
const BASE_URL = 'http://localhost:8080/api'

const request = (options) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      timeout: options.timeout || 15000,
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
        const msg = `请求 ${options.method || 'GET'} ${options.url} 失败: ${err.errMsg || '未知错误'}`
        console.error(msg)
        reject(new Error(msg))
      }
    })
  })
}

module.exports = { request, BASE_URL }
