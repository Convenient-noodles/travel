App({
  globalData: {
    userInfo: null,
    isLogin: false,
    openid: ''
  },

  onLaunch: function () {
    this.checkLoginStatus()
    this.initOpenid()
  },

  checkLoginStatus: function () {
    try {
      const userInfo = wx.getStorageSync('userInfo')
      const isLogin = wx.getStorageSync('isLogin')
      
      if (userInfo && isLogin) {
        this.globalData.userInfo = userInfo
        this.globalData.isLogin = true
      }
    } catch (e) {
      console.error('检查登录状态失败:', e)
    }
  },

  // 🔒 通过 wx.login 获取 code，发送到后端换取真实 openid
  initOpenid: function () {
    var cached = wx.getStorageSync('openid')
    if (cached) {
      this.globalData.openid = cached
      return
    }
    var that = this
    wx.login({
      timeout: 10000,
      success: function (res) {
        if (res.code) {
          // 将临时 code 发送到后端换取真实 openid
          wx.request({
            url: 'http://localhost:8080/api/public/wx/login',
            method: 'POST',
            data: { code: res.code },
            timeout: 10000,
            success: function (response) {
              if (response.statusCode === 200 && response.data && response.data.data && response.data.data.openid) {
                var openid = response.data.data.openid
                that.globalData.openid = openid
                wx.setStorageSync('openid', openid)
                console.log('[登录] 已获取用户 openid')
              } else {
                that.fallbackOpenid(res.code)
              }
            },
            fail: function () {
              that.fallbackOpenid(res.code)
            }
          })
        }
      },
      fail: function (err) {
        console.warn('[登录] wx.login 失败，生成本地标识:', err)
        that.fallbackOpenid('local_' + Date.now())
      }
    })
  },

  // 后端不可用时的降级方案：基于 code 或时间戳生成本地标识
  fallbackOpenid: function (seed) {
    var openid = 'wx_' + seed
    this.globalData.openid = openid
    wx.setStorageSync('openid', openid)
    console.warn('[登录] 后端 openid 兑换失败，使用本地标识（部分功能受限）')
  },

  getOpenid: function () {
    return this.globalData.openid || wx.getStorageSync('openid') || ''
  },

  setUserInfo: function (userInfo) {
    this.globalData.userInfo = userInfo
    this.globalData.isLogin = true
    wx.setStorageSync('userInfo', userInfo)
    wx.setStorageSync('isLogin', true)
  }
})
