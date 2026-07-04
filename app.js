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

  // 🔒 获取并缓存 openid，用于订单归属校验
  initOpenid: function () {
    const cached = wx.getStorageSync('openid')
    if (cached) {
      this.globalData.openid = cached
      return
    }
    wx.login({
      success: (res) => {
        if (res.code) {
          // 使用 code 作为临时 openid（正式环境应调用后端接口换取真实 openid）
          const openid = 'wx_' + res.code
          this.globalData.openid = openid
          wx.setStorageSync('openid', openid)
          console.log('[登录] 已获取用户标识')
        }
      }
    })
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
