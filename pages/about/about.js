const { getSafeArea } = require('../../utils/safe-area')

Page({
  data: {
    safeAreaTop: 0,
    navBarHeight: 88,
    contentTop: 88
  },

  onLoad: function (options) {
    this.setData(getSafeArea())
  },

  onBack: function () {
    const pages = getCurrentPages()
    if (pages.length > 1) {
      wx.navigateBack()
    } else {
      wx.reLaunch({
        url: '/pages/index/index'
      })
    }
  },

  onCall: function () {
    wx.makePhoneCall({
      phoneNumber: '4008888888',
      fail: () => {
        wx.showToast({
          title: '无法拨打电话',
          icon: 'none'
        })
      }
    })
  },

  onEmail: function () {
    wx.setClipboardData({
      data: 'service@dainiqianyou.com',
      success: () => {
        wx.showToast({
          title: '邮箱已复制',
          icon: 'success'
        })
      }
    })
  },

  onPrivacy: function () {
    wx.showModal({
      title: '隐私政策',
      content: '我们承诺保护您的个人隐私。\n\n1. 信息收集：我们会收集您主动提供的信息，用于改善服务质量。\n2. 信息使用：您的信息仅用于提供更好的服务体验。\n3. 信息保护：我们采取合理的安全措施保护您的个人信息。\n\n如有任何疑问，请联系我们的客服。',
      showCancel: false,
      confirmText: '我知道了'
    })
  },

  onAgreement: function () {
    wx.showModal({
      title: '用户协议',
      content: '欢迎使用带你黔游小程序！\n\n在使用本服务前，请仔细阅读以下条款：\n\n1. 使用条款：您同意仅将本小程序用于合法目的。\n2. 内容准确性：我们尽力确保内容的准确性，但不对此提供保证。\n3. 免责声明：本小程序对因使用本服务而产生的任何损失不承担责任。\n\n继续使用即表示您同意上述条款。',
      showCancel: false,
      confirmText: '我知道了'
    })
  }

})