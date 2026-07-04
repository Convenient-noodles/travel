const app = getApp()
const { getSafeArea } = require('../../../utils/safe-area')

Page({
  data: {
    isLoading: true,
    articleId: null,
    tab: 0,
    tabNames: ['最新攻略', '出行贴士', '景区公告', '民族文化'],
    article: null,
    isCollected: false,
    safeAreaTop: 0,
    navBarHeight: 88
  },

  onLoad: function (options) {
    this.setData({
      ...getSafeArea(),
      articleId: options.id || 1,
      tab: parseInt(options.tab) || 0
    })
    this.loadArticleData()
  },

  onShow: function () {
    this.checkCollected()
  },

  loadArticleData: function () {
    this.setData({ isLoading: true })

    var that = this
    wx.request({
      url: 'http://localhost:8080/api/admin/strategies/' + this.data.articleId, //【改】调用后端接口
      method: 'GET',
      success: function (res) {
        if (res.data.code === 200) {
          const data = res.data.data
          const articleData = {
            id: data.id,
            title: data.title,
            category: data.category || '攻略',
            coverImage: data.coverImage,
            publishDate: data.createTime ? data.createTime.split(' ')[0] : '',
            views: data.viewCount || 0,
            content: [{ type: 'text', text: data.content }],
            tips: data.tips
          }
          that.setData({
            article: articleData,
            isLoading: false
          })
          wx.setNavigationBarTitle({
            title: that.data.tabNames[that.data.tab]
          })
          that.checkCollected()
          that.addToHistory(articleData)
        } else {
          that.loadMockArticleData()
        }
      },
      fail: function () {
        that.loadMockArticleData()
      }
    })
  },

  loadMockArticleData: function () { //【新增】加载Mock数据函数
    const articleData = this.getArticleByTabAndId(this.data.tab, this.data.articleId)

    this.setData({
      article: articleData,
      isLoading: false
    })

    wx.setNavigationBarTitle({
      title: this.data.tabNames[this.data.tab]
    })

    this.checkCollected()
    this.addToHistory(articleData)
  },

  addToHistory: function (article) {
    if (!article) return

    const historyItem = {
      id: article.id,
      type: 'strategy',
      title: article.title,
      coverImage: article.coverImage,
      description: article.content?.[0]?.text || '',
      viewTime: Date.now(),
      tab: this.data.tab
    }

    const history = wx.getStorageSync('browseHistory') || []
    const filtered = history.filter(item => !(item.id === article.id && item.type === 'strategy'))
    const newHistory = [historyItem, ...filtered].slice(0, 100)
    wx.setStorageSync('browseHistory', newHistory)
  },

  getArticleByTabAndId: function (tab, id) {
    const tabIndex = parseInt(tab)
    const articleId = parseInt(id)

    const articles = {
      0: this.getStrategyArticles(),
      1: this.getTipArticles(),
      2: this.getNoticeArticles(),
      3: this.getCultureArticles()
    }

    const tabArticles = articles[tabIndex] || articles[0]
    const article = tabArticles.find(item => item.id === articleId) || tabArticles[0]

    return article
  },

  getStrategyArticles: function () {
    return [
      {
        id: 1,
        title: '贵州3日深度游攻略，带你玩转黔东南',
        category: '攻略',
        coverImage: '/images/a1.jpg',
        publishDate: '2026-05-30',
        views: 12580,
        content: [
          { type: 'text', text: '贵州黔东南地区拥有丰富的民族文化和壮丽的自然风光，是旅游爱好者的天堂。以下是精心策划的3日深度游攻略。' },
          { type: 'image', src: '/images/a1.jpg', caption: '壮观的黄果树瀑布' },
          { type: 'title', title: 'Day 1: 贵阳出发 - 西江千户苗寨' },
          { type: 'text', text: '上午8:00从贵阳出发，乘坐旅游大巴约3小时到达西江千户苗寨。午餐品尝正宗苗家长桌宴，感受高山流水的热情。' },
          { type: 'title', title: 'Day 2: 苗寨深度体验 - 镇远古镇' },
          { type: 'text', text: '早起看苗寨晨雾，参观苗族博物馆。下午前往镇远古镇，漫步舞阳河畔，感受千年古镇的魅力。' },
          { type: 'title', title: 'Day 3: 镇远 - 贵阳' },
          { type: 'text', text: '上午游览青龙洞古建筑群，午餐品尝镇远特色菜，下午返回贵阳，结束愉快的旅程。' }
        ],
        tips: '建议提前预订苗寨住宿，早晚温差大，带好外套。'
      },
      {
        id: 2,
        title: '黄果树瀑布最佳游览路线推荐',
        category: '攻略',
        coverImage: '/images/a2.jpg',
        publishDate: '2026-05-29',
        views: 8960,
        content: [
          { type: 'text', text: '黄果树瀑布是亚洲第一大瀑布，为了让您有最佳的游览体验，这里推荐一条经典的游览路线。' },
          { type: 'image', src: '/images/a2.jpg', caption: '黄果树大瀑布' },
          { type: 'title', title: '游览路线' },
          { type: 'text', text: '陡坡塘瀑布 → 天星桥景区 → 大瀑布景区' },
          { type: 'title', title: '注意事项' },
          { type: 'text', text: '建议穿防滑鞋，带好雨衣，雨季水量大时特别壮观。' }
        ],
        tips: '最佳观赏时间为6-8月雨季。'
      },
      {
        id: 3,
        title: '黔西南七日自驾游完整指南',
        category: '攻略',
        coverImage: '/images/a3.jpg',
        publishDate: '2026-05-28',
        views: 15320,
        content: [
          { type: 'text', text: '黔西南有着绝美的自然风光，自驾游是最佳方式。这份七日自驾游指南将带您畅游贵州西南。' },
          { type: 'image', src: '/images/a3.jpg', caption: '万峰林美景' },
          { type: 'title', title: '行程概览' },
          { type: 'text', text: '贵阳 → 安顺 → 兴义 → 六盘水 → 毕节 → 贵阳' },
          { type: 'title', title: '必打卡景点' },
          { type: 'text', text: '黄果树瀑布、万峰林、马岭河大峡谷、乌蒙大草原、百里杜鹃等。' }
        ],
        tips: '提前规划路线，山区驾驶注意安全。'
      },
      {
        id: 4,
        title: '贵州避暑胜地Top10，夏季必去',
        category: '攻略',
        coverImage: '/images/a4.jpg',
        publishDate: '2026-05-27',
        views: 7680,
        content: [
          { type: 'text', text: '贵州夏季凉爽，是绝佳的避暑胜地。为您盘点贵州十大避暑圣地。' },
          { type: 'image', src: '/images/a4.jpg', caption: '乌蒙大草原' },
          { type: 'title', title: '推荐榜单' },
          { type: 'text', text: '1. 贵阳花溪公园\n2. 六盘水乌蒙大草原\n3. 六盘水野玉海\n4. 毕节百里杜鹃\n5. 安顺龙宫\n6. 荔波小七孔\n7. 梵净山\n8. 西江千户苗寨\n9. 镇远古镇\n10. 肇兴侗寨' }
        ],
        tips: '夏季早晚温差大，建议带薄外套。'
      },
      {
        id: 5,
        title: '苗寨深度体验：走进真实的苗族生活',
        category: '攻略',
        coverImage: '/images/a5.jpg',
        publishDate: '2026-05-26',
        views: 11230,
        content: [
          { type: 'text', text: '西江千户苗寨是全世界最大的苗族聚居村寨，这里有着独特的苗族文化。' },
          { type: 'image', src: '/images/a5.jpg', caption: '苗寨夜景' },
          { type: 'title', title: '必体验项目' },
          { type: 'text', text: '1. 苗家长桌宴\n2. 苗族银饰制作体验\n3. 蜡染工艺学习\n4. 苗族歌舞表演\n5. 苗寨晨拍' }
        ],
        tips: '建议住一晚苗寨吊脚楼客栈。'
      },
      {
        id: 6,
        title: '贵州美食地图：地道黔味全收录',
        category: '攻略',
        coverImage: '/images/a6.jpg',
        publishDate: '2026-05-25',
        views: 18920,
        content: [
          { type: 'text', text: '贵州美食酸辣鲜香，让人欲罢不能。这份贵州美食地图带您品尝地道黔味。' },
          { type: 'image', src: '/images/a6.jpg', caption: '贵州酸汤鱼' },
          { type: 'title', title: '必吃美食' },
          { type: 'text', text: '酸汤鱼、肠旺面、花溪牛肉粉、羊肉粉、豆干火锅、丝娃娃、恋爱豆腐果、米豆腐等。' }
        ],
        tips: '推荐贵阳二七路小吃街和青云路夜市。'
      }
    ]
  },

  getTipArticles: function () {
    return [
      {
        id: 1,
        title: '贵州旅游必备物品清单，建议收藏',
        category: '贴士',
        coverImage: '/images/a1.jpg',
        publishDate: '2026-05-31',
        views: 8560,
        content: [
          { type: 'text', text: '贵州旅游有其特殊性，这份必备物品清单请收好，让您的旅程更安心。' },
          { type: 'image', src: '/images/a1.jpg', caption: '准备出发' },
          { type: 'title', title: '必备物品清单' },
          { type: 'text', text: '1. 身份证（必带）\n2. 薄外套（早晚温差大）\n3. 防蚊水（夏季必备）\n4. 防晒用品（紫外线强）\n5. 舒适的运动鞋（多山路）\n6. 雨伞（天气多变）\n7. 充电宝（拍照耗电快）\n8. 常用药品（感冒药、肠胃药等）' },
          { type: 'title', title: '其他建议' },
          { type: 'text', text: '可以提前下载离线地图，部分山区信号不好。' }
        ],
        tips: '建议带一个小背包，方便出门时携带必需品。'
      },
      {
        id: 2,
        title: '雨季出游贵州，这些注意事项要记牢',
        category: '贴士',
        coverImage: '/images/a2.jpg',
        publishDate: '2026-05-30',
        views: 6540,
        content: [
          { type: 'text', text: '贵州雨季为6-8月，此时虽多雨但也是瀑布最美的时候。雨季出游请注意以下事项。' },
          { type: 'image', src: '/images/a2.jpg', caption: '雨中黄果树' },
          { type: 'title', title: '注意事项' },
          { type: 'text', text: '1. 带好雨伞和雨衣\n2. 穿防滑鞋\n3. 注意查看天气预报\n4. 避开山区暴雨天气\n5. 注意防滑摔倒\n6. 保护好电子设备防潮' }
        ],
        tips: '雨天瀑布水量大，更壮观！'
      },
      {
        id: 3,
        title: '贵州各景区门票优惠政策汇总',
        category: '贴士',
        coverImage: '/images/a3.jpg',
        publishDate: '2026-05-29',
        views: 12350,
        content: [
          { type: 'text', text: '了解门票优惠政策，帮您省不少钱！以下是贵州主要景区的优惠政策汇总。' },
          { type: 'image', src: '/images/a3.jpg', caption: '景区入口' },
          { type: 'title', title: '优惠政策' },
          { type: 'text', text: '1. 60岁以上老人免票\n2. 14岁以下儿童免票\n3. 学生凭学生证半价\n4. 军人、残疾人免票\n5. 部分节假日有特殊优惠' }
        ],
        tips: '记得带好相关证件哦！'
      },
      {
        id: 4,
        title: '自驾贵州山路驾驶技巧与安全须知',
        category: '贴士',
        coverImage: '/images/a4.jpg',
        publishDate: '2026-05-28',
        views: 9870,
        content: [
          { type: 'text', text: '贵州多山路，自驾需要一定的技术和经验。这份驾驶技巧请收好。' },
          { type: 'image', src: '/images/a4.jpg', caption: '盘山公路' },
          { type: 'title', title: '驾驶技巧' },
          { type: 'text', text: '1. 减速慢行，保持车距\n2. 弯道鸣笛示意\n3. 注意避让牲畜\n4. 夜间尽量不开山路\n5. 出发前检查车况\n6. 提前规划路线' }
        ],
        tips: '建议两位司机轮流驾驶，避免疲劳驾驶。'
      },
      {
        id: 5,
        title: '贵州高海拔地区防高原反应指南',
        category: '贴士',
        coverImage: '/images/a5.jpg',
        publishDate: '2026-05-27',
        views: 5430,
        content: [
          { type: 'text', text: '贵州部分地区海拔较高，如韭菜坪、乌蒙大草原等，需要注意预防高原反应。' },
          { type: 'image', src: '/images/a5.jpg', caption: '乌蒙大草原' },
          { type: 'title', title: '防高反指南' },
          { type: 'text', text: '1. 不要剧烈运动\n2. 多喝水，不要喝酒\n3. 注意保暖，避免感冒\n4. 可以提前服用红景天等抗高反药物\n5. 如果有严重不适，及时就医' }
        ],
        tips: '放松心态，高原反应更多是心理因素。'
      },
      {
        id: 6,
        title: '贵州旅游季节选择，最佳出行时间推荐',
        category: '贴士',
        coverImage: '/images/a6.jpg',
        publishDate: '2026-05-26',
        views: 7890,
        content: [
          { type: 'text', text: '贵州气候宜人，四季皆宜旅游，但不同季节有不同的美。看看什么时候最适合您？' },
          { type: 'image', src: '/images/a6.jpg', caption: '四季贵州' },
          { type: 'title', title: '四季看点' },
          { type: 'text', text: '春季（3-5月）：看花海，百里杜鹃不容错过\n夏季（6-8月）：避暑胜地，瀑布水量大\n秋季（9-11月）：丰收季节，气候宜人\n冬季（12-2月）：可以去草海看候鸟' }
        ],
        tips: '建议避开国庆等法定节假日，游客较多。'
      }
    ]
  },

  getNoticeArticles: function () {
    return [
      {
        id: 1,
        title: '黄果树瀑布景区限流通知',
        category: '公告',
        coverImage: '/images/a1.jpg',
        publishDate: '2026-05-31',
        views: 15680,
        content: [
          { type: 'text', text: '为保障游客安全和游览体验，黄果树瀑布景区自2026年6月1日起实行限流措施。' },
          { type: 'image', src: '/images/a1.jpg', caption: '黄果树景区' },
          { type: 'title', title: '限流规定' },
          { type: 'text', text: '1. 每日限流40000人\n2. 大瀑布景区限流10000人/时段\n3. 请提前预约门票\n4. 未预约游客请勿前往' },
          { type: 'title', title: '预约方式' },
          { type: 'text', text: '通过"黄果树景区"官方微信公众号或合作OTA平台预约。' }
        ],
        tips: '建议提前3天预约。'
      },
      {
        id: 2,
        title: '梵净山门票预约系统升级维护公告',
        category: '公告',
        coverImage: '/images/a2.jpg',
        publishDate: '2026-05-30',
        views: 12340,
        content: [
          { type: 'text', text: '为提升服务质量，梵净山门票预约系统将于2026年6月5日至6月7日进行升级维护。' },
          { type: 'image', src: '/images/a2.jpg', caption: '梵净山金顶' },
          { type: 'title', title: '维护安排' },
          { type: 'text', text: '维护期间暂停网上预约服务，请游客提前规划好行程。' }
        ],
        tips: '维护期间可通过现场购票。'
      },
      {
        id: 3,
        title: '西江千户苗寨表演时间调整通知',
        category: '公告',
        coverImage: '/images/a3.jpg',
        publishDate: '2026-05-29',
        views: 8970,
        content: [
          { type: 'text', text: '为更好地服务游客，西江千户苗寨表演时间自2026年6月1日起进行调整。' },
          { type: 'image', src: '/images/a3.jpg', caption: '苗族歌舞表演' },
          { type: 'title', title: '新表演时间' },
          { type: 'text', text: '上午场：11:00-11:40\n下午场：15:00-15:40\n晚间场：20:00-20:40' }
        ],
        tips: '请合理安排游览时间。'
      },
      {
        id: 4,
        title: '荔波小七孔暑期客流高峰提示',
        category: '公告',
        coverImage: '/images/a4.jpg',
        publishDate: '2026-05-28',
        views: 6540,
        content: [
          { type: 'text', text: '暑期将至，荔波小七孔景区将迎来客流高峰，请游客朋友提前做好准备。' },
          { type: 'image', src: '/images/a4.jpg', caption: '小七孔风光' },
          { type: 'title', title: '高峰时段' },
          { type: 'text', text: '每日9:00-11:00为入园高峰，建议错峰出行。' }
        ],
        tips: '可以选择早一点或晚一点入园。'
      },
      {
        id: 5,
        title: '镇远古镇道路施工交通引导',
        category: '公告',
        coverImage: '/images/a5.jpg',
        publishDate: '2026-05-27',
        views: 4320,
        content: [
          { type: 'text', text: '镇远古镇部分路段将进行道路改造施工，请过往车辆和行人注意安全。' },
          { type: 'image', src: '/images/a5.jpg', caption: '镇远古镇' },
          { type: 'title', title: '施工信息' },
          { type: 'text', text: '施工时间：2026年6月-8月\n施工路段：新大桥至和平街段\n请绕行环城路。' }
        ],
        tips: '建议将车辆停放在景区外停车场。'
      },
      {
        id: 6,
        title: '梵净山索道检修暂停运营通知',
        category: '公告',
        coverImage: '/images/a6.jpg',
        publishDate: '2026-05-26',
        views: 11230,
        content: [
          { type: 'text', text: '为确保运营安全，梵净山索道将于2026年6月10日至6月12日进行例行检修。' },
          { type: 'image', src: '/images/a6.jpg', caption: '梵净山索道' },
          { type: 'title', title: '检修安排' },
          { type: 'text', text: '检修期间索道停运，游客可选择步行登山或调整行程。' }
        ],
        tips: '步行登山约需3-4小时，请量力而行。'
      }
    ]
  },

  getCultureArticles: function () {
    return [
      {
        id: 1,
        title: '苗族银饰：穿在身上的史书',
        category: '文化',
        coverImage: '/images/a1.jpg',
        publishDate: '2026-05-31',
        views: 9870,
        content: [
          { type: 'text', text: '苗族银饰是苗族文化的重要载体，被誉为"穿在身上的史书"。' },
          { type: 'image', src: '/images/a1.jpg', caption: '精美银饰' },
          { type: 'title', title: '银饰历史' },
          { type: 'text', text: '苗族银饰历史悠久，可追溯到春秋战国时期。苗族没有文字，银饰便成为记录历史的载体。' },
          { type: 'title', title: '银饰种类' },
          { type: 'text', text: '银帽、银项圈、银手镯、银耳环、银衣饰等，种类繁多，工艺精湛。' }
        ],
        tips: '苗族银饰含银量高，值得购买收藏。'
      },
      {
        id: 2,
        title: '布依族蜡染：古老的民间艺术',
        category: '文化',
        coverImage: '/images/a2.jpg',
        publishDate: '2026-05-30',
        views: 7650,
        content: [
          { type: 'text', text: '布依族蜡染是国家级非物质文化遗产，是布依族先民智慧的结晶。' },
          { type: 'image', src: '/images/a2.jpg', caption: '蜡染作品' },
          { type: 'title', title: '蜡染工艺' },
          { type: 'text', text: '用蜡刀蘸蜡在白布上画出图案，然后染色，最后煮蜡，露出白色花纹。' }
        ],
        tips: '可以在布依族村寨体验蜡染制作。'
      },
      {
        id: 3,
        title: '侗族大歌：清泉般的歌声',
        category: '文化',
        coverImage: '/images/a3.jpg',
        publishDate: '2026-05-29',
        views: 11230,
        content: [
          { type: 'text', text: '侗族大歌是侗族多声部无伴奏合唱，被誉为"清泉般闪光的音乐"。' },
          { type: 'image', src: '/images/a3.jpg', caption: '侗族大歌表演' },
          { type: 'title', title: '艺术特点' },
          { type: 'text', text: '多声部、无伴奏、无指挥，曲调优美，内容丰富。' }
        ],
        tips: '在肇兴侗寨和小黄侗寨可以听到正宗侗族大歌。'
      },
      {
        id: 4,
        title: '贵州少数民族节日大全，快来看看吧',
        category: '文化',
        coverImage: '/images/a4.jpg',
        publishDate: '2026-05-28',
        views: 18960,
        content: [
          { type: 'text', text: '贵州少数民族众多，节日丰富多样，来了解一下吧！' },
          { type: 'image', src: '/images/a4.jpg', caption: '苗族姊妹节' },
          { type: 'title', title: '主要节日' },
          { type: 'text', text: '苗族姊妹节、苗年、侗族萨玛节、布依族三月三、彝族火把节等。' }
        ],
        tips: '如果赶上节庆，会非常热闹！'
      },
      {
        id: 5,
        title: '苗族拦路酒：最热情的迎客礼',
        category: '文化',
        coverImage: '/images/a5.jpg',
        publishDate: '2026-05-27',
        views: 8430,
        content: [
          { type: 'text', text: '苗族拦路酒是苗族最热情的迎客方式，客人进寨前要喝拦路酒。' },
          { type: 'image', src: '/images/a5.jpg', caption: '拦路酒' },
          { type: 'title', title: '饮酒礼仪' },
          { type: 'text', text: '客人不能用手去接牛角杯，要用嘴喝，喝多少都可以，但态度要恭敬。' }
        ],
        tips: '酒量不好也没关系，意思意思就行。'
      },
      {
        id: 6,
        title: '屯堡地戏：六百年的文化传承',
        category: '文化',
        coverImage: '/images/a6.jpg',
        publishDate: '2026-05-26',
        views: 5670,
        content: [
          { type: 'text', text: '屯堡地戏是安顺屯堡人的传统戏剧，被誉为"中国戏剧活化石"。' },
          { type: 'image', src: '/images/a6.jpg', caption: '地戏表演' },
          { type: 'title', title: '地戏特点' },
          { type: 'text', text: '演员戴面具，唱历史故事，保留了明代中原地区的戏剧形态。' }
        ],
        tips: '在安顺天龙屯堡和云峰屯堡可以看到地戏表演。'
      }
    ]
  },

  checkCollected: function () {
    const collectionKey = `article_collect_${this.data.tab}_${this.data.articleId}`
    const isCollected = wx.getStorageSync(collectionKey) || false
    this.setData({ isCollected: isCollected })
  },

  onCollect: function () {
    const collectionKey = `article_collect_${this.data.tab}_${this.data.articleId}`

    if (this.data.isCollected) {
      wx.removeStorageSync(collectionKey)
      this.setData({ isCollected: false })
      wx.showToast({
        title: '已取消收藏',
        icon: 'success',
        duration: 1500
      })
    } else {
      wx.setStorageSync(collectionKey, {
        id: this.data.articleId,
        title: this.data.article?.title,
        tab: this.data.tab,
        collectTime: Date.now()
      })
      this.setData({ isCollected: true })
      wx.showToast({
        title: '收藏成功',
        icon: 'success',
        duration: 1500
      })
    }
  },

  onImageTap: function (e) {
    const src = e.currentTarget.dataset.src
    wx.previewImage({
      current: src,
      urls: [src]
    })
  },

  onBack: function () {
    wx.navigateBack({
      delta: 1,
      fail: () => {
        wx.reLaunch({
          url: '/pages/index/index'
        })
      }
    })
  }
})
