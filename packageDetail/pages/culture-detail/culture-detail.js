const { request } = require('../../../utils/request')
const { getSafeArea } = require('../../../utils/safe-area')

Page({
  data: {
    safeAreaTop: 0,
    navBarHeight: 88,
    contentTop: 88,
    cultureData: null,
    showBookForm: false,
    bookName: '',
    bookPhone: '',
    bookDate: '',
    bookCount: 1
  },

  onLoad: function (options) {
    this.setData(getSafeArea())

    if (options.id) {
      this.loadCultureData(options.id)
    }
  },

  loadCultureData: function (id) {
    request({
      url: '/admin/cultures/public/' + id,
      method: 'GET'
    }).then(res => {
      const item = res.data
      if (item) {
        const cultureData = {
          id: item.id,
          name: item.name || '',
          location: item.region || '',
          rating: item.rating ? item.rating.toString() : '0',
          image: this.validateImageUrl(item.coverImage),
          duration: item.duration || '',
          description: item.description || '',
          background: item.highlights || '',
          features: this.parseTags(item.tags),
          tips: []
        }
        this.setData({ cultureData })
      }
    }).catch(error => {
      console.error('加载文化体验详情失败:', error)
      // 如果API请求失败，使用mock数据
      this.loadMockData(id)
    })
  },

  loadMockData: function (id) {
    const cultureList = [
      {
        id: 301,
        name: '苗族蜡染体验',
        location: '黔东南苗族侗族自治州',
        rating: '4.8',
        image: '/images/a7.jpg',
        duration: '2小时',
        description: '体验苗族传统蜡染技艺，在专业老师指导下亲手制作独特纹样。蜡染是苗族人民在长期生产生活中创造的一种传统手工技艺，被誉为"东方第一染"。',
        background: '苗族蜡染历史悠久，早在秦汉时期就已经出现。它以蜂蜡为防染剂，用特制的蜡刀蘸蜡在白布上绘制图案，然后浸入靛蓝染料中染色。由于蜡的阻隔，绘有蜡的部分保持白色，其余部分则染成蓝色，形成蓝白相间的精美图案。',
        features: [
          '专业苗族蜡染传承人指导',
          '提供全套蜡染工具和材料',
          '亲手制作可带走的蜡染作品',
          '了解蜡染背后的文化故事'
        ],
        tips: [
          '建议穿着舒适的衣物',
          '染料可能会沾染衣物，请注意防护',
          '制作过程需要耐心，建议提前安排时间',
          '完成的作品需晾干后再带走'
        ]
      },
      {
        id: 302,
        name: '侗族大歌表演',
        location: '黔东南苗族侗族自治州',
        rating: '4.9',
        image: '/images/a2.jpg',
        duration: '1.5小时',
        description: '聆听世界非物质文化遗产侗族大歌的天籁之音。侗族大歌是一种无伴奏、无指挥的多声部合唱，被誉为"清泉般闪光的音乐"。',
        background: '侗族大歌起源于春秋战国时期，至今已有2500多年的历史。2009年被联合国教科文组织列入人类非物质文化遗产代表作名录。它以其独特的多声部和声、优美的旋律和丰富的内容，展现了侗族人民的智慧和创造力。',
        features: [
          '由当地侗族歌队现场演唱',
          '包含多首经典侗族大歌曲目',
          '配有传统侗族舞蹈表演',
          '提供侗族特色油茶品尝'
        ],
        tips: [
          '演出场地可能较为简陋，请做好心理准备',
          '建议提前到达，选择较好的观看位置',
          '尊重当地文化习俗，保持安静观看',
          '演出结束后可与演员合影留念'
        ]
      },
      {
        id: 303,
        name: '苗绣工艺坊',
        location: '黔东南苗族侗族自治州',
        rating: '4.7',
        image: '/images/a5.jpg',
        duration: '3小时',
        description: '跟随苗族绣娘学习精美苗绣技法，体验针尖上的艺术。苗绣是苗族文化的重要组成部分，以其精美繁复的图案和鲜艳的色彩著称。',
        background: '苗绣历史悠久，技法独特，主要包括平绣、辫绣、结绣、缠绣等多种针法。苗绣图案题材广泛，包括花鸟鱼虫、神话传说、生活场景等，每一幅作品都蕴含着苗族人民对生活的热爱和对美的追求。',
        features: [
          '资深苗族绣娘一对一指导',
          '提供全套刺绣材料和工具',
          '学习苗绣基本针法和图案设计',
          '完成一件可带走的苗绣作品'
        ],
        tips: [
          '刺绣需要一定的耐心和细心',
          '建议穿浅色衣物，避免染料沾染',
          '初学者可能需要更多时间适应',
          '作品完成后可请绣娘帮忙装裱'
        ]
      },
      {
        id: 304,
        name: '彝族火把节',
        location: '毕节市',
        rating: '4.8',
        image: '/images/a4.jpg',
        duration: '全天',
        description: '参与盛大的彝族火把节庆典活动，体验彝族人民的热情与豪放。火把节是彝族最重要的传统节日，被誉为"东方狂欢节"。',
        background: '火把节起源于彝族先民对火的崇拜和感恩。每年农历六月二十四日，彝族人民都会举行盛大的庆祝活动，包括斗牛、斗羊、赛马、摔跤等传统竞技项目，以及彻夜不息的篝火晚会。',
        features: [
          '观看盛大的火把游行',
          '参与传统斗牛、斗羊比赛',
          '体验彝族传统美食',
          '加入篝火晚会尽情狂欢'
        ],
        tips: [
          '火把节期间游客较多，建议提前预订住宿',
          '夜晚温度较低，请携带保暖衣物',
          '注意用火安全，遵守现场秩序',
          '尊重彝族传统习俗，听从工作人员指引'
        ]
      },
      {
        id: 305,
        name: '布依族八音坐唱',
        location: '安顺市',
        rating: '4.6',
        image: '/images/a1.jpg',
        duration: '1小时',
        description: '欣赏布依族传统音乐表演，感受"声音活化石"的独特魅力。八音坐唱是布依族世代相传的民间说唱艺术。',
        background: '布依族八音坐唱起源于清代，至今已有200多年的历史。它以牛骨胡、葫芦琴、月琴等八种乐器伴奏，演唱内容多为布依族的历史故事、民间传说和生产生活场景。',
        features: [
          '由布依族民间艺人现场表演',
          '展示传统八音乐器',
          '演唱经典布依族古歌',
          '提供布依族特色小吃'
        ],
        tips: [
          '演出语言主要为布依语，配有汉语解说',
          '建议提前了解相关背景知识',
          '演出结束后可向艺人请教乐器知识',
          '注意保持安静，尊重演出'
        ]
      },
      {
        id: 306,
        name: '苗族银饰制作',
        location: '黔东南苗族侗族自治州',
        rating: '4.7',
        image: '/images/a3.jpg',
        duration: '2.5小时',
        description: '体验苗族银饰锻造工艺，亲手打造属于自己的银饰作品。苗族银饰以其精湛的工艺和独特的造型闻名于世。',
        background: '苗族银饰制作历史悠久，工艺复杂，包括熔银、锻打、錾刻、镶嵌等多道工序。苗族人民认为银具有驱邪避凶的作用，因此银饰在苗族文化中占有重要地位。',
        features: [
          '银饰匠人亲自指导',
          '提供银料和制作工具',
          '学习银饰基本锻造技法',
          '完成一件专属银饰作品'
        ],
        tips: [
          '锻造过程需要一定体力',
          '注意安全，避免烫伤',
          '作品完成后可进行抛光处理',
          '建议提前想好要制作的款式'
        ]
      },
      {
        id: 307,
        name: '侗族鼓楼建造技艺',
        location: '黔东南苗族侗族自治州',
        rating: '4.9',
        image: '/images/a7.jpg',
        duration: '1.5小时',
        description: '了解侗族鼓楼的榫卯结构和建造艺术，感受中国传统建筑的智慧。侗族鼓楼是侗族人民的标志性建筑，被誉为"世界建筑艺术的瑰宝"。',
        background: '侗族鼓楼是侗族村寨的标志和灵魂，始建于明末清初。它以独特的榫卯结构建造，不用一颗铁钉，却能屹立数百年不倒。鼓楼不仅是侗族人民集会、议事的场所，也是他们文化传承的重要载体。',
        features: [
          '参观著名侗族鼓楼',
          '听取工匠讲解建造技艺',
          '亲手体验榫卯结构',
          '了解鼓楼背后的文化意义'
        ],
        tips: [
          '鼓楼内部空间有限，参观时请注意安全',
          '尊重当地习俗，遵守参观规定',
          '建议拍照留念时关闭闪光灯',
          '可购买相关书籍深入了解'
        ]
      },
      {
        id: 308,
        name: '贵州花灯戏',
        location: '遵义市',
        rating: '4.5',
        image: '/images/a6.jpg',
        duration: '2小时',
        description: '观看传统贵州花灯戏表演，感受地方戏曲的独特魅力。花灯戏是贵州最具代表性的地方戏曲之一。',
        background: '贵州花灯戏起源于明代，流行于贵州各地。它以明快的节奏、诙谐的表演和贴近生活的剧情著称，内容多取材于民间故事和日常生活。',
        features: [
          '专业花灯戏剧团表演',
          '经典剧目演出',
          '传统服饰展示',
          '互动环节参与'
        ],
        tips: [
          '演出语言为贵州方言，可能配有字幕',
          '建议提前了解剧情背景',
          '剧场内禁止吸烟和大声喧哗',
          '演出结束后可与演员交流'
        ]
      }
    ]

    const data = cultureList.find(item => item.id === parseInt(id))
    this.setData({ cultureData: data || cultureList[0] })
  },

  validateImageUrl: function (url) {
    if (!url || url.startsWith('blob:') || url.startsWith('data:')) {
      return '/images/a1.jpg'
    }
    return url
  },

  parseTags: function (tags) {
    if (!tags) return []
    try {
      return JSON.parse(tags)
    } catch (e) {
      return tags.split(',').map(t => t.trim()).filter(t => t)
    }
  },

  onBack: function () {
    wx.navigateBack()
  },

  onBook: function () {
    this.setData({ showBookForm: true })
  },

  // ——— 弹窗控制 ———
  closeBookingModal: function () {
    this.resetBookingForm()
    this.setData({ showBookForm: false })
  },

  handleMaskTap: function () {
    this.closeBookingModal()
  },

  // ——— 表单输入绑定 ———
  handleNameInput: function (e) {
    this.setData({ bookName: e.detail.value })
  },

  handlePhoneInput: function (e) {
    this.setData({ bookPhone: e.detail.value })
  },

  handleDateChange: function (e) {
    this.setData({ bookDate: e.detail.value })
  },

  // ——— 人数计数器 ———
  decreaseCounter: function () {
    const next = this.data.bookCount - 1
    if (next >= 1) {
      this.setData({ bookCount: next })
    }
  },

  increaseCounter: function () {
    const next = this.data.bookCount + 1
    if (next <= 99) {
      this.setData({ bookCount: next })
    }
  },

  // ——— 提交校验 ———
  submitBookingForm: function () {
    if (!this.validateBookingFields()) {
      return
    }
    this.syncBookingToBackend()
  },

  validateBookingFields: function () {
    const { bookName, bookPhone } = this.data
    if (!bookName || !bookName.trim()) {
      wx.showToast({ title: '请输入姓名', icon: 'none' })
      return false
    }
    if (!bookPhone || !/^1\d{10}$/.test(bookPhone)) {
      wx.showToast({ title: '请输入正确手机号', icon: 'none' })
      return false
    }
    return true
  },

  // ——— 同步到后台 ———
  syncBookingToBackend: function () {
    wx.showLoading({ title: '提交预约...', mask: true })
    const payload = this.buildBackendPayload()
    request({
      url: '/admin/bookings/public/create',
      method: 'POST',
      data: payload
    }).then((res) => {
      wx.hideLoading()
      this.onBookingSyncSuccess(res.data)
    }).catch(() => {
      wx.hideLoading()
      this.onBookingSyncFail()
    })
  },

  buildBackendPayload: function () {
    const d = this.data
    return {
      cultureId: d.cultureData.id,
      cultureName: d.cultureData.name,
      cultureImage: d.cultureData.image,
      location: d.cultureData.location,
      duration: d.cultureData.duration,
      name: d.bookName.trim(),
      phone: d.bookPhone.trim(),
      bookDate: d.bookDate || this.getDefaultDate(),
      count: parseInt(d.bookCount) || 1
    }
  },

  onBookingSyncSuccess: function (serverRecord) {
    const record = this.buildLocalBookingRecord(true, serverRecord ? serverRecord.id : null)
    this.saveRecordToLocalStorage(record)
    this.resetBookingForm()
    this.setData({ showBookForm: false })
    wx.showToast({ title: '已预约并同步到商家', icon: 'success' })
  },

  onBookingSyncFail: function () {
    const record = this.buildLocalBookingRecord(false, null)
    this.saveRecordToLocalStorage(record)
    this.resetBookingForm()
    this.setData({ showBookForm: false })
    wx.showToast({ title: '已预约（离线模式）', icon: 'success' })
  },

  // ——— 构建本地记录 ———
  buildLocalBookingRecord: function (syncedToBackend, backendId) {
    const d = this.data
    return {
      id: backendId || Date.now(),
      cultureId: d.cultureData.id,
      cultureName: d.cultureData.name,
      image: d.cultureData.image,
      location: d.cultureData.location,
      duration: d.cultureData.duration,
      name: d.bookName.trim(),
      phone: d.bookPhone.trim(),
      date: d.bookDate || this.getDefaultDate(),
      count: parseInt(d.bookCount) || 1,
      status: 'confirmed',
      syncedToBackend: syncedToBackend,
      backendId: backendId,
      createTime: Date.now(),
      createTimeStr: this.formatBookingTime(new Date())
    }
  },

  saveRecordToLocalStorage: function (record) {
    try {
      let bookings = wx.getStorageSync('myBookings') || []
      bookings.unshift(record)
      wx.setStorageSync('myBookings', bookings)
    } catch (e) {
      console.error('保存预约失败:', e)
    }
  },

  resetBookingForm: function () {
    this.setData({
      bookName: '',
      bookPhone: '',
      bookDate: '',
      bookCount: 1
    })
  },

  getDefaultDate: function () {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return this.formatBookingDate(d)
  },

  formatBookingDate: function (date) {
    const y = date.getFullYear()
    const m = (date.getMonth() + 1).toString().padStart(2, '0')
    const d = date.getDate().toString().padStart(2, '0')
    return `${y}-${m}-${d}`
  },

  formatBookingTime: function (date) {
    const h = date.getHours().toString().padStart(2, '0')
    const min = date.getMinutes().toString().padStart(2, '0')
    return `${this.formatBookingDate(date)} ${h}:${min}`
  },

  onShareAppMessage: function () {
    return {
      title: this.data.cultureData?.name || '民俗体验',
      path: '/pages/culture-detail/culture-detail?id=' + (this.data.cultureData?.id || 301)
    }
  }
})