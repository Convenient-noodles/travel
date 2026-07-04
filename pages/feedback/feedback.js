Page({
  data: {
    feedbackContent: '',
    contactInfo: '',
    submitting: false,
    inputFocus: false
  },

  onInputContent: function (e) {
    this.setData({ 
      feedbackContent: e.detail.value 
    })
  },

  onInputContact: function (e) {
    this.setData({ 
      contactInfo: e.detail.value 
    })
  },

  submitFeedback: function () {
    const { feedbackContent, contactInfo, submitting } = this.data

    if (submitting) return

    if (!feedbackContent.trim()) {
      wx.showToast({
        title: '请输入反馈内容',
        icon: 'none',
        duration: 2000
      })
      return
    }

    this.setData({ submitting: true })

    setTimeout(() => {
      let feedbackList = wx.getStorageSync('feedbackList') || []
      feedbackList.unshift({
        id: Date.now(),
        content: feedbackContent,
        contact: contactInfo,
        time: new Date().toLocaleString(),
        status: '待处理'
      })
      wx.setStorageSync('feedbackList', feedbackList)

      this.setData({ 
        submitting: false,
        feedbackContent: '', 
        contactInfo: '' 
      })

      wx.showToast({
        title: '提交成功',
        icon: 'success',
        duration: 2000
      })

      setTimeout(() => {
        wx.navigateBack({
          delta: 1
        })
      }, 2000)
    }, 1500)
  },

  onBack: function () {
    wx.navigateBack({
      delta: 1
    })
  }
})
