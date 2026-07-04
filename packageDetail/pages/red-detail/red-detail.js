const { request } = require('../../../utils/request')
const { validateImageUrl, parseTags } = require('../../../utils/common')
const { getSafeArea } = require('../../../utils/safe-area')

Page({
  data: {
    safeAreaTop: 0,
    navBarHeight: 88,
    contentTop: 88,
    redData: null
  },

  onLoad: function (options) {
    this.setData(getSafeArea())

    if (options.id) {
      this.loadRedData(options.id)
    }
  },

  loadRedData: function (id) {
    const that = this

    request({
      url: '/admin/red-tourisms/public/' + id,
      method: 'GET'
    }).then(res => {
      const item = res.data
      if (item) {
        const redData = {
          id: item.id,
          name: item.name || '',
          location: item.region || item.address || '',
          rating: item.rating ? item.rating.toString() : '0',
          image: that.validateImageUrl(item.coverImage),
          type: item.type || '革命历史',
          latitude: item.latitude,
          longitude: item.longitude,
          description: item.description || '',
          background: item.history || '',
          features: that.parseTags(item.tags),
          tips: item.tips ? item.tips.split('\n').filter(t => t.trim()) : []
        }
        that.setData({ redData })
      }
    }).catch(error => {
      console.error('加载红色旅游详情失败:', error)
      // 如果API请求失败，使用mock数据
      that.loadMockData(id)
    })
  },

  loadMockData: function (id) {
    const redList = [
      {
        id: 201,
        name: '遵义会议会址',
        location: '贵州省遵义市红花岗区',
        rating: '4.8',
        image: '/images/a9.jpg',
        type: '革命历史',
        latitude: 27.7234,
        longitude: 106.9244,
        description: '遵义会议会址位于贵州省遵义市红花岗区老城子尹路96号，是中国革命历史上具有伟大转折意义的重要会议召开地。1935年1月，中共中央在这里召开了著名的遵义会议，确立了毛泽东同志在党中央和红军中的领导地位。',
        background: '1935年1月15日至17日，中共中央政治局在遵义召开扩大会议（即遵义会议）。会议集中解决了当时具有决定意义的军事问题和组织问题，确立了毛泽东同志在党和红军中的领导地位，是中国共产党历史上一个生死攸关的转折点。',
        features: [
          '遵义会议会议室旧址',
          '毛泽东同志旧居',
          '遵义会议纪念馆',
          '红军总政治部旧址'
        ],
        tips: [
          '建议提前预约参观，避免排队',
          '馆内有专业讲解员提供讲解服务',
          '参观时间约需1-2小时',
          '周边有丰富的红色旅游资源可一并参观'
        ]
      },
      {
        id: 202,
        name: '四渡赤水纪念馆',
        location: '贵州省遵义市习水县',
        rating: '4.7',
        image: '/images/a1.jpg',
        type: '革命历史',
        latitude: 28.3556,
        longitude: 106.2034,
        description: '四渡赤水纪念馆位于贵州省遵义市习水县土城镇，是为纪念中国工农红军四渡赤水战役而建立的专题纪念馆。四渡赤水是遵义会议后，毛泽东同志亲自指挥的一次具有决定性意义的运动战战役。',
        background: '四渡赤水战役发生于1935年1月至3月，是中央红军长征中最惊心动魄、最精彩的军事行动。红军在毛泽东同志的指挥下，巧妙地穿插于敌人重兵集团之间，四渡赤水河，彻底摆脱了国民党军队的围追堵截，取得了战略转移中具有决定意义的胜利。',
        features: [
          '四渡赤水战役陈列馆',
          '土城古镇',
          '青杠坡战斗遗址',
          '女红军纪念馆'
        ],
        tips: [
          '建议请讲解员详细了解战役历史',
          '土城古镇值得一游',
          '夏季参观注意防暑',
          '可体验红军餐'
        ]
      },
      {
        id: 203,
        name: '息烽集中营',
        location: '贵州省贵阳市息烽县',
        rating: '4.5',
        image: '/images/a6.jpg',
        type: '革命历史',
        latitude: 27.1245,
        longitude: 106.7689,
        description: '息烽集中营旧址位于贵州省贵阳市息烽县永靖镇，是抗日战争时期国民党军统局设立的一所秘密监狱，被誉为"人间地狱"。这里曾关押过许多共产党人和爱国进步人士。',
        background: '息烽集中营建立于1938年，是国民党军统局在全国设立的规模最大、管理最严的秘密监狱。著名的革命烈士杨虎城、叶挺、罗世文、车耀先等都曾被关押在这里。1946年，息烽集中营被撤销，部分关押人员转移到重庆渣滓洞和白公馆。',
        features: [
          '集中营旧址',
          '猫洞',
          '玄天洞',
          '革命历史陈列馆'
        ],
        tips: [
          '参观需要一定的心理准备',
          '建议请讲解员了解历史',
          '参观时间约需1小时',
          '尊重历史，缅怀先烈'
        ]
      },
      {
        id: 204,
        name: '娄山关战斗遗址',
        location: '贵州省遵义市汇川区',
        rating: '4.6',
        image: '/images/a3.jpg',
        type: '革命历史',
        latitude: 27.9087,
        longitude: 106.8123,
        description: '娄山关战斗遗址位于贵州省遵义市汇川区板桥镇，是遵义会议后的一次重要战斗遗址。娄山关是大娄山脉的主峰，地势险要，是川黔交通要道上的重要关口。',
        background: '1935年2月，红军在娄山关进行了一场激烈的战斗，取得了长征以来的第一次重大胜利，揭开了遵义战役的序幕。毛泽东同志在战斗胜利后写下了著名的《忆秦娥·娄山关》词，描绘了娄山关的壮丽景色和战斗的激烈场面。',
        features: [
          '娄山关关口',
          '毛泽东词碑',
          '娄山关战斗陈列馆',
          '西风台'
        ],
        tips: [
          '山上气温较低，建议携带外套',
          '可徒步登山，风景优美',
          '拍照留念注意安全',
          '山顶有观景台可俯瞰群山'
        ]
      }
    ]

    const data = redList.find(item => item.id === parseInt(id))
    this.setData({ redData: data || redList[0] })
  },

  validateImageUrl: function (url) {
    if (!url) return '/images/a1.jpg'
    if (url.startsWith('http')) return url
    return 'http://localhost:8080/uploads/' + url.split('/').pop()
  },

  parseTags: function (tags) {
    if (!tags) return []
    return tags.split(',').map(tag => tag.trim()).filter(tag => tag)
  },

  onBack: function () {
    wx.navigateBack()
  },

  onNav: function () {
    const redData = this.data.redData
    if (!redData) return

    //【改】验证纬度和经度值是否在有效范围内
    let latitude = redData.latitude
    let longitude = redData.longitude

    // 验证纬度范围 [-90, 90]
    if (!latitude || typeof latitude !== 'number' || latitude < -90 || latitude > 90) {
      latitude = 27.7234
    }
    // 验证经度范围 [-180, 180]
    if (!longitude || typeof longitude !== 'number' || longitude < -180 || longitude > 180) {
      longitude = 106.9244
    }

    wx.navigateTo({
      url: `/pages/navigation/navigation?name=${encodeURIComponent(redData.name)}&address=${encodeURIComponent(redData.location)}&latitude=${latitude}&longitude=${longitude}`
    })
  },

  onShareAppMessage: function () {
    return {
      title: this.data.redData?.name || '红色旅游',
      path: '/pages/red-detail/red-detail?id=' + (this.data.redData?.id || 201)
    }
  }
})