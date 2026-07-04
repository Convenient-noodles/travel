const app = getApp()

const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Page({
  data: {
    isLoading: false,
    avatarUrl: '',
    defaultAvatarUrl: defaultAvatarUrl,
    nickName: '',
    isChoosingAvatar: false
  },

  onLoad: function (options) {
    this.checkAutoLogin()
  },

  checkAutoLogin: function () {
    try {
      const userInfo = wx.getStorageSync('userInfo')
      const isLogin = wx.getStorageSync('isLogin')

      if (userInfo && isLogin) {
        app.globalData.userInfo = userInfo
        app.globalData.isLogin = true

        setTimeout(() => {
          wx.redirectTo({
            url: '/pages/index/index'
          })
        }, 100)
      }
    } catch (e) {
      console.error('自动登录检查失败:', e)
    }
  },

  onChooseAvatar: function (e) {
    if (this.data.isChoosingAvatar) {
      return
    }

    this.setData({ isChoosingAvatar: true })

    try {
      const { avatarUrl } = e.detail
      console.log('选择头像:', avatarUrl)

      if (avatarUrl) {
        this.setData({ avatarUrl })
      }
    } catch (err) {
      console.error('选择头像失败:', err)
    } finally {
      setTimeout(() => {
        this.setData({ isChoosingAvatar: false })
      }, 500)
    }
  },

  onNicknameInput: function (e) {
    this.setData({ nickName: e.detail.value })
  },

  onNicknameBlur: function (e) {
    this.setData({ nickName: e.detail.value })
  },

  handleLogin: function () {
    if (this.data.isLoading) return

    const { avatarUrl, nickName } = this.data

    if (!avatarUrl) {
      wx.showToast({ title: '请先选择头像', icon: 'none' })
      return
    }

    if (!nickName || !nickName.trim()) {
      wx.showToast({ title: '请输入昵称', icon: 'none' })
      return
    }

    this.setData({ isLoading: true })
    wx.showLoading({ title: '登录中...', mask: true })

    wx.login({
      timeout: 8000,
      success: (loginRes) => {
        this.saveUserInfo(avatarUrl, nickName.trim(), loginRes.code)
      },
      fail: (err) => {
        console.error('wx.login 失败:', err)
        this.saveUserInfo(avatarUrl, nickName.trim(), '')
      }
    })
  },

  saveUserInfo: function (avatarUrl, nickName, code) {
    try {
      const userData = {
        nickName: nickName,
        avatarUrl: avatarUrl,
        gender: 0,
        city: '',
        province: '',
        country: '',
        code: code,
        loginTime: Date.now()
      }

      app.globalData.userInfo = userData
      app.globalData.isLogin = true
      wx.setStorageSync('userInfo', userData)
      wx.setStorageSync('isLogin', true)

      this.setData({ isLoading: false })
      wx.hideLoading()

      wx.showToast({ title: '登录成功', icon: 'success', duration: 1200 })

      setTimeout(() => {
        wx.reLaunch({ url: '/pages/index/index' })
      }, 100)
    } catch (e) {
      console.error('保存用户信息失败:', e)
      this.setData({ isLoading: false })
      wx.hideLoading()
      wx.showToast({ title: '登录失败，请重试', icon: 'none', duration: 2000 })
    }
  }
})