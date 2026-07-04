const app = getApp()

Page({
  data: {
    userInfo: null,
    isLogin: false,
    avatarUrl: '',
    nickName: ''
  },

  onLoad: function () {
    this.loadUserInfo()
  },

  onShow: function () {
    this.loadUserInfo()
  },

  onAvatarError: function (e) {
    console.error('头像加载失败:', e.detail.errMsg)
    if (this.data.userInfo) {
      this.setData({
        'userInfo.avatarUrl': '/images/a6.jpg'
      })
    }
  },

  loadUserInfo: function () {
    try {
      const localUserInfo = wx.getStorageSync('userInfo')
      const localIsLogin = wx.getStorageSync('isLogin')

      if (localUserInfo && localIsLogin) {
        app.globalData.userInfo = localUserInfo
        app.globalData.isLogin = localIsLogin

        this.setData({
          userInfo: localUserInfo,
          isLogin: true,
          avatarUrl: localUserInfo.avatarUrl,
          nickName: localUserInfo.nickName
        })
      } else {
        this.setData({
          userInfo: null,
          isLogin: false,
          avatarUrl: '',
          nickName: ''
        })
      }
    } catch (e) {
      console.error('加载用户信息失败:', e)
      this.setData({
        userInfo: null,
        isLogin: false,
        avatarUrl: '',
        nickName: ''
      })
    }
  },

  onChooseAvatar: function (e) {
    const { avatarUrl } = e.detail
    console.log('选择头像:', avatarUrl)

    if (this.data.isLogin) {
      this.updateUserInfo(avatarUrl, this.data.userInfo.nickName)
    } else {
      this.setData({ avatarUrl })
      this.tryAutoLogin(avatarUrl, this.data.nickName)
    }
  },

  onNicknameInput: function (e) {
    this.setData({ nickName: e.detail.value })
  },

  onNicknameBlur: function (e) {
    const nickName = e.detail.value
    this.setData({ nickName })
    if (!this.data.isLogin) {
      this.tryAutoLogin(this.data.avatarUrl, nickName)
    }
  },

  onEditNicknameBlur: function (e) {
    const nickName = e.detail.value
    if (!nickName || !nickName.trim()) return

    const currentNickName = this.data.userInfo.nickName
    if (nickName !== currentNickName) {
      this.updateUserInfo(this.data.userInfo.avatarUrl, nickName.trim())
    }
  },

  tryAutoLogin: function (avatarUrl, nickName) {
    if (avatarUrl && nickName && nickName.trim()) {
      this.doLogin(avatarUrl, nickName.trim())
    }
  },

  doLogin: function (avatarUrl, nickName) {
    const userData = {
      nickName: nickName,
      avatarUrl: avatarUrl,
      gender: 0,
      city: '',
      province: '',
      country: '',
      loginTime: Date.now()
    }

    app.globalData.userInfo = userData
    app.globalData.isLogin = true
    wx.setStorageSync('userInfo', userData)
    wx.setStorageSync('isLogin', true)

    this.setData({
      userInfo: userData,
      isLogin: true
    })

    wx.showToast({ title: '登录成功', icon: 'success', duration: 1500 })
  },

  updateUserInfo: function (avatarUrl, nickName) {
    const userData = {
      ...this.data.userInfo,
      nickName: nickName || this.data.userInfo.nickName,
      avatarUrl: avatarUrl || this.data.userInfo.avatarUrl,
      updateTime: Date.now()
    }

    app.globalData.userInfo = userData
    wx.setStorageSync('userInfo', userData)

    this.setData({ userInfo: userData })

    wx.showToast({ title: '更新成功', icon: 'success', duration: 1500 })
  },

  goToOrders: function () {
    if (!this.checkLogin()) return
    wx.navigateTo({ url: '/pages/my-orders/my-orders' })
  },

  goToBookings: function () {
    if (!this.checkLogin()) return
    wx.navigateTo({ url: '/pages/my-bookings/my-bookings' })
  },

  goToCollection: function () {
    if (!this.checkLogin()) return
    wx.navigateTo({ url: '/pages/collection/collection' })
  },

  goToHistory: function () {
    if (!this.checkLogin()) return
    wx.navigateTo({ url: '/pages/history/history' })
  },

  goToFeedback: function () {
    wx.navigateTo({ url: '/pages/feedback/feedback' })
  },

  goToAbout: function () {
    wx.navigateTo({ url: '/pages/about/about' })
  },

  goToHome: function () {
    wx.reLaunch({ url: '/pages/index/index' })
  },

  goToDiscover: function () {
    wx.reLaunch({ url: '/pages/discover/discover' })
  },

  checkLogin: function () {
    if (!this.data.isLogin) {
      wx.showToast({ title: '请先选择头像并输入昵称', icon: 'none', duration: 2000 })
      return false
    }
    return true
  },

  handleLogout: function () {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          app.globalData.userInfo = null
          app.globalData.isLogin = false
          wx.removeStorageSync('userInfo')
          wx.removeStorageSync('isLogin')

          this.setData({
            userInfo: null,
            isLogin: false,
            avatarUrl: '',
            nickName: ''
          })

          wx.showToast({ title: '退出成功', icon: 'success', duration: 1500 })
        }
      }
    })
  }
})