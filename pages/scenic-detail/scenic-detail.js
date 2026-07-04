const app = getApp()
const { request } = require('../../utils/request')
const { validateImageUrl } = require('../../utils/common')
const { getSafeArea } = require('../../utils/safe-area')

Page({
  data: {
    scenic: null,
    isLoading: true,
    isCollected: false,
    currentImageIndex: 0,
    autoplayTimer: null,
    safeAreaTop: 0
  },

  onLoad: function (options) {
    this.setData(getSafeArea())

    if (options.id) {
      this.loadScenicDetail(options.id, options.type)
    }
  },

  onShow: function () {
    if (this.data.scenic) {
      this.checkCollected(this.data.scenic.id)
    }
    this.startAutoplay()
  },

  onHide: function () {
    this.stopAutoplay()
  },

  onUnload: function () {
    this.stopAutoplay()
  },

  loadScenicDetail: function (id, type) {
    // 确保id是有效数字
    const idNum = parseInt(id)

    // 如果id无效（NaN或小于等于0），直接使用mock数据
    if (isNaN(idNum) || idNum <= 0) {
      console.warn('无效的ID，使用mock数据:', id)
      this.loadMockScenicDetail(id)
      return
    }

    // 根据类型调用不同的API
    const apiUrl = type === 'route' ? '/admin/routes/public/' : '/admin/scenics/public/'

    request({
      url: apiUrl + id,
      method: 'GET'
    }).then(res => {
      const data = res.data
      const scenic = {
        id: data.id,
        name: data.name || '',
        location: data.address || data.region || '',
        rating: data.rating ? data.rating.toString() : '0',
        image: this.validateImageUrl(data.coverImage),
        images: this.parseImages(data.images),
        description: data.description || '',
        features: this.parseTags(data.tags),
        tips: data.tips || '',
        transport: data.trafficInfo || '',
        latitude: data.latitude || null,
        longitude: data.longitude || null
      }

      this.setData({
        scenic: scenic,
        isLoading: false,
        currentImageIndex: 0
      })

      this.checkCollected(scenic.id)

      wx.setNavigationBarTitle({
        title: scenic.name
      })

      this.addToHistory(scenic)
    }).catch(error => {
      console.error('加载详情失败:', error)
      // 如果API请求失败，使用mock数据
      this.loadMockScenicDetail(id)
    })
  },

  loadMockScenicDetail: function (id) {
    const scenicData = {
      // 路线数据
      '101': {
        id: 101,
        name: '黔东南环线5日游',
        location: '黔东南',
        rating: '4.9',
        image: '/images/a7.jpg',
        images: ['/images/a7.jpg', '/images/a8.jpg', '/images/a2.jpg'],
        description: '这条精心设计的黔东南环线5日游线路，带你深入体验贵州最具民族特色的地区。从繁华的凯里出发，一路探访世界最大的苗族村寨——西江千户苗寨，感受浓郁的苗族文化；漫步青石板铺就的镇远古镇，领略千年古城的韵味；最后在荔波小七孔，沉醉于如诗如画的山水之间。',
        features: ['千户苗寨夜景', '镇远古城风情', '荔波山水奇观', '民族文化体验'],
        tips: '建议游玩时间：5天4晚；最佳季节：春季和秋季；建议提前预订苗寨住宿；可体验苗家长桌宴；山路较多，建议穿舒适的鞋子。',
        transport: '全程包车或自驾，路况良好；景区之间距离较远，建议合理安排时间；部分路段弯道较多，注意行车安全。',
        latitude: 26.4867,
        longitude: 108.0562
      },
      '102': {
        id: 102,
        name: '黄果树+梵净山3日游',
        location: '安顺/铜仁',
        rating: '4.8',
        image: '/images/a1.jpg',
        images: ['/images/a1.jpg', '/images/a3.jpg', '/images/a4.jpg'],
        description: '这条经典的3日游线路，将贵州最具代表性的两个世界级景点完美串联。首先来到亚洲第一大瀑布——黄果树瀑布，感受大自然的磅礴气势；然后前往佛教名山梵净山，攀登红云金顶，俯瞰云海奇观，感受心灵的洗礼。',
        features: ['黄果树大瀑布', '梵净山云海', '天星桥景区', '佛教文化'],
        tips: '建议游玩时间：3天2晚；梵净山需提前预约门票和索道；黄果树景区较大，建议乘坐观光车；山上气温较低，建议携带外套；注意防晒。',
        transport: '两地之间约300公里，建议自驾或乘坐高铁；安顺和铜仁均有高铁站，交通便利。',
        latitude: 26.0426,
        longitude: 105.5986
      },
      '103': {
        id: 103,
        name: '毕节花海2日游',
        location: '毕节',
        rating: '4.7',
        image: '/images/a2.jpg',
        images: ['/images/a2.jpg', '/images/a5.jpg', '/images/a6.jpg'],
        description: '每年3-4月，百里杜鹃花开成海，形成壮观的花海奇观。这条2日游线路带你走进花的世界，在漫山遍野的杜鹃花丛中漫步，感受大自然的绚烂色彩。还可以探访织金洞，领略地下艺术宝库的神奇魅力。',
        features: ['百里杜鹃花海', '织金洞奇观', '彝族风情', '高原风光'],
        tips: '建议游玩时间：2天1晚；最佳观赏季节：3-4月；花期期间人流量较大，建议提前预约；景区较大，建议乘坐观光车；早晚温差较大，请注意保暖。',
        transport: '从贵阳出发约2.5小时车程；毕节市区有直达景区的班车；自驾较为方便。',
        latitude: 27.1866,
        longitude: 105.7152
      },
      '104': {
        id: 104,
        name: '红色文化之旅4日游',
        location: '遵义',
        rating: '4.6',
        image: '/images/a9.jpg',
        images: ['/images/a9.jpg', '/images/a1.jpg', '/images/a3.jpg'],
        description: '这条红色文化之旅带你重温中国革命历史。从遵义会议会址开始，了解中国革命史上具有伟大转折意义的重要会议；参观四渡赤水纪念馆，感受红军长征的艰辛与智慧；最后登上娄山关，重温毛泽东笔下的壮丽诗篇。',
        features: ['遵义会议会址', '四渡赤水纪念馆', '娄山关战斗遗址', '红色教育'],
        tips: '建议游玩时间：4天3晚；建议请讲解员详细了解历史；参观需要一定的步行，建议穿舒适的鞋子；尊重历史，缅怀先烈；可品尝遵义特色美食。',
        transport: '景点之间距离较近，适合自驾或乘坐公共交通；遵义市区交通便利，可乘坐公交车或出租车前往各景点。',
        latitude: 27.7234,
        longitude: 106.9244
      },
      // 景点数据
      '1': {
        id: 1,
        name: '黄果树瀑布',
        location: '贵州省安顺市镇宁布依族苗族自治县',
        rating: '4.8',
        image: '/images/a1.jpg',
        images: ['/images/a1.jpg'], //【改】统一使用黄果树相关图片，避免轮播图内容不一致
        description: '黄果树瀑布位于贵州省安顺市镇宁布依族苗族自治县，是中国最大的瀑布群之一，以其壮观的景色和独特的喀斯特地貌闻名于世。瀑布高77.8米，宽101米，是世界著名的大瀑布之一。\n\n景区内共有18个瀑布，形成世界上规模最大、景观最优的瀑布群。丰水季节时，瀑布声音如雷鸣般响彻数公里，十分壮观。景区四季景色各异，春季满山苍翠，夏季水量充沛，秋季云雾缭绕，冬季则有冰瀑奇观。',
        features: ['亚洲第一大瀑布', '喀斯特地貌奇观', '四季景色各异', '天然氧吧'],
        tips: '建议游玩时间：3-4小时；最佳观赏季节：夏季；建议提前购买门票避免排队；景区内需要步行较多，建议穿舒适的鞋子；丰水季节（6-10月）景色最为壮观。',
        transport: '公共交通：从贵阳金阳客车站乘坐直达黄果树景区的大巴，车程约2小时；从安顺市区乘坐旅游专线车也可到达。自驾：从贵阳出发，沿沪昆高速G60行驶约130公里，约1.5小时车程。',
        latitude: 26.0426,
        longitude: 105.5986
      },
      '2': {
        id: 2,
        name: '百里杜鹃',
        location: '贵州省毕节市大方县和黔西县交界处',
        rating: '4.7',
        image: '/images/a2.jpg',
        images: ['/images/a2.jpg', '/images/a3.jpg', '/images/a1.jpg'],
        description: '百里杜鹃位于贵州省毕节市大方县和黔西县交界处，是世界上最大的天然杜鹃花园。每年3-4月，绵延百里的杜鹃花海盛开，美不胜收，被誉为"地球彩带、世界花园"。\n\n景区内有23个品种的杜鹃花，占世界杜鹃花品种的5个亚属中的全部。花开时节，红、白、紫、粉等各种颜色的杜鹃花竞相绽放，漫山遍野，蔚为壮观。',
        features: ['世界最大杜鹃花园', '百里花海奇观', '四季花海', '彝族风情'],
        tips: '建议游玩时间：2-3小时；最佳观赏季节：3-4月；花期期间人流量较大，建议提前预约门票；景区较大，建议乘坐观光车游览；早晚温差较大，请注意保暖。',
        transport: '公共交通：从贵阳乘坐高铁到黔西站，再转乘旅游专线车到景区；毕节市区有直达景区的班车。自驾：从贵阳出发，沿黔大高速行驶约180公里，约2.5小时车程。',
        latitude: 27.1866,
        longitude: 105.7152
      },
      '3': {
        id: 3,
        name: '梵净山',
        location: '贵州省铜仁市江口县',
        rating: '4.9',
        image: '/images/a3.jpg',
        images: ['/images/a3.jpg', '/images/a1.jpg', '/images/a4.jpg'],
        description: '梵净山是中国第五大佛教名山，位于贵州省铜仁市江口县。它是武陵山脉的主峰，海拔2336米，以其独特的自然景观和深厚的佛教文化底蕴吸引着众多游客。\n\n梵净山是世界自然遗产地，拥有世界唯一的黔金丝猴栖息地。山顶的蘑菇石是标志性景观，红云金顶耸入云霄，景色十分壮观。山上还有承恩寺、护国寺等古建筑群。',
        features: ['世界自然遗产', '佛教名山', '云海奇观', '珍稀动植物'],
        tips: '建议游玩时间：1天；最佳观赏季节：春秋两季；山顶天气多变，建议携带雨具和外套；登山体力消耗较大，可乘坐缆车上山；需提前预约门票和索道票。',
        transport: '公共交通：从铜仁市区乘坐旅游专线车到梵净山景区，车程约1.5小时；从贵阳北站有直达江口县的高铁。自驾：从贵阳出发，沿杭瑞高速G56行驶约300公里，约4小时车程。',
        latitude: 27.9161,
        longitude: 108.7026
      },
      '4': {
        id: 4,
        name: '织金洞',
        location: '贵州省毕节市织金县',
        rating: '4.6',
        image: '/images/a4.jpg',
        images: ['/images/a4.jpg', '/images/a5.jpg', '/images/a2.jpg'],
        description: '织金洞位于贵州省毕节市织金县，是中国最美的溶洞之一。洞内景观奇特，石笋、石柱、石钟乳千姿百态，被誉为"地下艺术宝库"和"岩溶博物馆"。\n\n洞内总长约12公里，分上、中、下三层，洞内有各种奇特的碳酸钙沉积景观。景区内有"霸王盔"、"银雨树"、"倒挂琵琶"等经典景观，令人叹为观止。',
        features: ['中国最美溶洞', '地下艺术宝库', '岩溶奇观', '清凉避暑'],
        tips: '建议游玩时间：2-3小时；洞内温度较低（约16℃），建议带外套；地面湿滑，请注意安全；全程约3公里，需要一定的体力；禁止使用闪光灯拍照。',
        transport: '公共交通：从贵阳乘坐火车或汽车到织金县，再转乘当地公交或出租车到景区。自驾：从贵阳出发，沿沪昆高速G60和黔织高速S55行驶约120公里，约2小时车程。',
        latitude: 26.7412,
        longitude: 105.8143
      },
      '5': {
        id: 5,
        name: '韭菜坪',
        location: '贵州省毕节市赫章县',
        rating: '4.5',
        image: '/images/a5.jpg',
        images: ['/images/a5.jpg', '/images/a6.jpg', '/images/a3.jpg'],
        description: '韭菜坪位于贵州省毕节市赫章县，是世界上最大的野生韭菜花带。每年8-9月，漫山遍野的紫色韭菜花盛开，形成壮观的花海景观，被誉为"天上花海"。\n\n景区海拔在2300米以上，是贵州最高点之一。这里不仅可以欣赏到壮观的韭菜花海，还可以远眺乌蒙山脉的壮丽景色，是摄影爱好者的天堂。',
        features: ['世界最大野生韭菜花带', '天上花海', '高原风光', '彝族风情'],
        tips: '建议游玩时间：2-3小时；最佳观赏季节：8-9月；海拔较高，注意防晒和防寒；建议乘坐观光车上山，山路较陡；山顶风力较大，注意安全。',
        transport: '公共交通：从贵阳乘坐火车到赫章站，再转乘客运车到景区；毕节市区有直达赫章县的班车。自驾：从贵阳出发，沿都香高速G7611和毕威高速S20行驶约260公里，约3.5小时车程。',
        latitude: 26.8547,
        longitude: 104.6582
      },
      '6': {
        id: 6,
        name: '青岩古镇',
        location: '贵州省贵阳市花溪区',
        rating: '4.6',
        image: '/images/a6.jpg',
        images: ['/images/a6.jpg', '/images/a7.jpg', '/images/a1.jpg'],
        description: '青岩古镇位于贵州省贵阳市花溪区，是贵州四大古镇之一。古镇保存完好，建筑风格独特，融合了汉、苗、布依等民族的建筑特色，是感受贵州历史文化的好去处。\n\n古镇始建于明洪武年间，至今已有600多年历史。镇内古建筑星罗棋布，有九寺、八庙、五阁、二祠等景点。青岩古镇也是贵州著名的美食小镇，青岩卤猪脚、糕粑稀饭、玫瑰糖等美食闻名遐迩。',
        features: ['贵州四大古镇', '历史文化名镇', '特色美食', '古建筑群'],
        tips: '建议游玩时间：3-4小时；特色美食：青岩卤猪脚、糕粑稀饭、玫瑰糖等；建议清晨或傍晚游玩，避开中午人流高峰；古镇内石板路较多，建议穿平底鞋。',
        transport: '公共交通：从贵阳乘坐203路、204路公交车直达青岩古镇，车程约1小时；从贵阳河滨公园乘坐旅游专线车。自驾：从贵阳出发，沿甲秀南路和花溪大道行驶约30公里，约40分钟车程。',
        latitude: 26.3712,
        longitude: 106.6935
      },
      '7': {
        id: 7,
        name: '西江千户苗寨',
        location: '贵州省黔东南州雷山县',
        rating: '4.7',
        image: '/images/a7.jpg',
        images: ['/images/a7.jpg', '/images/a8.jpg', '/images/a2.jpg'],
        description: '西江千户苗寨位于贵州省黔东南州雷山县，是世界上最大的苗族聚居村寨。千余户吊脚楼依山而建，气势恢宏，夜晚灯火辉煌，美不胜收。\n\n苗寨至今已有1700多年历史，保存了浓郁的苗族文化。游客可以在这里欣赏到苗族银饰、苗族刺绣、苗族歌舞等传统文化表演，还可以参与苗家长桌宴等民俗活动。',
        features: ['世界最大苗族村寨', '吊脚楼建筑群', '苗族文化', '夜景迷人'],
        tips: '建议游玩时间：1天；最佳观赏点：观景台，可俯瞰整个苗寨；晚上观赏夜景最为壮观；可参与苗族歌舞表演和长桌宴；建议在寨内住一晚，体验苗家生活。',
        transport: '公共交通：从贵阳乘坐高铁到凯里南站，再转乘客运车到西江千户苗寨，车程约40分钟；从凯里市区有直达景区的班车。自驾：从贵阳出发，沿沪昆高速G60行驶约200公里，约2.5小时车程。',
        latitude: 26.4867,
        longitude: 108.0562
      },
      '8': {
        id: 8,
        name: '镇远古镇',
        location: '贵州省黔东南州镇远县',
        rating: '4.5',
        image: '/images/a8.jpg',
        images: ['/images/a8.jpg', '/images/a9.jpg', '/images/a3.jpg'],
        description: '镇远古镇位于贵州省黔东南州镇远县，是一座历史悠久的文化名城。古镇沿舞阳河而建，山水相依，风景秀丽，素有"滇楚锁钥、黔东门户"之称。\n\n古镇历史可追溯到秦代，是贵州著名的历史文化名城。镇内古建筑保存完好，有青龙洞、祝圣桥、古巷道等景点。建议夜游舞阳河，欣赏两岸灯火辉煌的美景。',
        features: ['历史文化名城', '山水风光', '古建筑群', '宁静闲适'],
        tips: '建议游玩时间：1天；推荐夜游舞阳河，乘船游览两岸夜景；古镇内可步行游览，建议穿平底鞋；可品尝镇远特色美食，如酸汤鱼等；最佳游览季节为春秋两季。',
        transport: '公共交通：从贵阳乘坐火车或汽车到镇远站，车程约4小时；从凯里市有直达镇远的班车。自驾：从贵阳出发，沿沪昆高速G60行驶约280公里，约3.5小时车程。',
        latitude: 27.0502,
        longitude: 108.4275
      },
      '9': {
        id: 9,
        name: '龙宫',
        location: '贵州省安顺市西秀区',
        rating: '4.6',
        image: '/images/a9.jpg',
        images: ['/images/a9.jpg', '/images/a1.jpg', '/images/a4.jpg'],
        description: '龙宫位于贵州省安顺市西秀区，是一个集溶洞、峡谷、瀑布、峰林等多种喀斯特地貌景观于一体的景区。景区内有中国最长最美的水溶洞，被誉为"大自然的大奇迹"。\n\n龙宫溶洞全长约15公里，分为多个洞厅，洞内有地下暗河、瀑布、奇石等景观。游客可以乘船游览水溶洞，体验神秘的地下世界。景区内的龙字田也是一大奇观。',
        features: ['中国最长水溶洞', '喀斯特地貌', '地下暗河', '瀑布景观'],
        tips: '建议游玩时间：3-4小时；夏季水量充沛，景色更佳；建议先游龙宫溶洞，再游览其他景点；需要乘船游览，请注意安全；景区内有多处瀑布景观，丰水期最为壮观。',
        transport: '公共交通：从贵阳乘坐火车或汽车到安顺市，车程约1.5小时；安顺市区有直达龙宫景区的旅游专线车。自驾：从贵阳出发，沿沪昆高速G60行驶约80公里，约1小时车程。',
        latitude: 26.1534,
        longitude: 105.6043
      },
      '10': {
        id: 10,
        name: '赤水丹霞',
        location: '贵州省遵义市赤水市',
        rating: '4.8',
        image: '/images/a1.jpg',
        images: ['/images/a1.jpg', '/images/a5.jpg', '/images/a7.jpg'],
        description: '赤水丹霞位于贵州省遵义市赤水市，是世界自然遗产"中国丹霞"的重要组成部分。景区以其独特的丹霞地貌和丰富的生态资源著称，是摄影爱好者的天堂。\n\n赤水丹霞以其艳丽的红色岩石、险峻的峡谷、壮观的瀑布群而闻名。景区内有佛光岩、四洞沟、十丈洞等多个景点，是感受大自然鬼斧神工的绝佳去处。',
        features: ['世界自然遗产', '丹霞地貌', '瀑布群', '桫椤王国'],
        tips: '建议游玩时间：2天；最佳季节：秋季；景区较大，建议乘坐观光车；建议穿舒适的登山鞋；夏季注意防蚊虫；可品尝赤水特色美食，如筒筒笋等。',
        transport: '公共交通：从贵阳乘坐火车或汽车到赤水市，车程约4小时；赤水市区有直达各景点的班车。自驾：从贵阳出发，沿蓉遵高速G4215行驶约300公里，约4小时车程。',
        latitude: 28.3957,
        longitude: 105.9987
      },
      '11': {
        id: 11,
        name: '荔波小七孔',
        location: '贵州省黔南州荔波县',
        rating: '4.9',
        image: '/images/a2.jpg',
        images: ['/images/a2.jpg', '/images/a6.jpg', '/images/a8.jpg'],
        description: '荔波小七孔位于贵州省黔南州荔波县，是世界自然遗产地。景区以其秀丽的山水风光和独特的喀斯特地貌闻名，小七孔古桥更是景区的标志性景观。\n\n小七孔景区集山、水、林、洞、湖、瀑于一体，有"超级盆景"之称。景区内有小七孔古桥、拉雅瀑布、68级跌水瀑布、水上森林等多个景点，景色如画，令人流连忘返。',
        features: ['世界自然遗产', '山水奇观', '古桥风韵', '避暑胜地'],
        tips: '建议游玩时间：1天；建议穿舒适的步行鞋，景区内步行较多；夏季是最佳游览季节，瀑布水量充沛；建议早起入园，避开人流高峰；水上森林段需要涉水，建议穿凉鞋或拖鞋。',
        transport: '公共交通：从贵阳乘坐高铁到独山东站或都匀东站，再转乘客运车到荔波县，车程约2-3小时；从贵阳客运站有直达荔波的班车。自驾：从贵阳出发，沿兰海高速G75和麻驾高速S88行驶约250公里，约3小时车程。',
        latitude: 25.4112,
        longitude: 107.7067
      },
      '12': {
        id: 12,
        name: '甲秀楼',
        location: '贵州省贵阳市南明区',
        rating: '4.4',
        image: '/images/a3.jpg',
        images: ['/images/a3.jpg', '/images/a6.jpg', '/images/a9.jpg'],
        description: '甲秀楼位于贵州省贵阳市南明区，是贵阳的标志性建筑。始建于明代，历经多次重建，是一座三层三檐四角攒尖顶阁楼，被誉为"黔南第一楼"。\n\n甲秀楼建在南明河中的一块巨石上，历经400多年的风雨沧桑。楼内保存有众多名家题写的匾额和对联，是了解贵州历史文化的重要场所。夜晚的甲秀楼在灯光映衬下更加美丽动人。',
        features: ['贵阳地标', '历史建筑', '文化象征', '夜景迷人'],
        tips: '建议游玩时间：1-2小时；建议晚上观赏夜景，灯光效果很美；可沿南明河畔散步，欣赏两岸风光；周边有小吃街，可品尝贵阳特色美食；最佳拍摄角度为河对岸。',
        transport: '公共交通：贵阳市内可乘坐15路、25路、46路、48路、52路等公交车到达；乘坐地铁1号线到河滨公园站步行约10分钟。自驾：周边有地下停车场，建议公共交通出行。',
        latitude: 26.5833,
        longitude: 106.7167
      }
    }

    const scenic = scenicData[id] || scenicData['1']

    this.setData({
      scenic: scenic,
      isLoading: false,
      currentImageIndex: 0
    })

    this.checkCollected(scenic.id)

    wx.setNavigationBarTitle({
      title: scenic.name
    })

    this.addToHistory(scenic)
  },

  validateImageUrl: function (url) { //【改】委托到公共模块，保持Page方法签名不变
    return validateImageUrl(url)
  },

  parseImages: function (images) {
    if (!images) return ['/images/a1.jpg']
    if (typeof images === 'string') {
      try {
        const imagesArray = JSON.parse(images)
        return imagesArray.map(img => this.validateImageUrl(img))
      } catch (e) {
        return ['/images/a1.jpg']
      }
    }
    if (Array.isArray(images)) {
      return images.map(img => this.validateImageUrl(img))
    }
    return ['/images/a1.jpg']
  },

  parseTags: function (tags) {
    if (!tags) return []
    if (typeof tags === 'string') {
      try {
        return JSON.parse(tags)
      } catch (e) {
        return []
      }
    }
    if (Array.isArray(tags)) {
      return tags
    }
    return []
  },

  addToHistory: function (scenic) {
    if (!scenic) return

    const historyItem = {
      id: scenic.id,
      type: 'scenic',
      title: scenic.name,
      coverImage: scenic.image,
      description: scenic.description?.substring(0, 50) || '',
      viewTime: Date.now()
    }

    const history = wx.getStorageSync('browseHistory') || []
    const filtered = history.filter(item => !(item.id === scenic.id && item.type === 'scenic'))
    const newHistory = [historyItem, ...filtered].slice(0, 100)
    wx.setStorageSync('browseHistory', newHistory)
  },

  checkCollected: function (id) {
    const collectionList = wx.getStorageSync('collectionList') || []
    const isCollected = collectionList.some(item => item.id === parseInt(id))
    this.setData({ isCollected: isCollected })
  },

  startAutoplay: function () {
    const scenic = this.data.scenic
    if (!scenic || !scenic.images || scenic.images.length <= 1) {
      return
    }

    this.stopAutoplay()

    this.data.autoplayTimer = setInterval(() => {
      this.setData({
        currentImageIndex: (this.data.currentImageIndex + 1) % scenic.images.length
      })
    }, 4000)
  },

  stopAutoplay: function () {
    if (this.data.autoplayTimer) {
      clearInterval(this.data.autoplayTimer)
      this.data.autoplayTimer = null
    }
  },

  onPrevImage: function () {
    const scenic = this.data.scenic
    if (!scenic || !scenic.images || scenic.images.length <= 1) {
      return
    }

    this.stopAutoplay()

    let newIndex = this.data.currentImageIndex - 1
    if (newIndex < 0) {
      newIndex = scenic.images.length - 1
    }
    this.setData({ currentImageIndex: newIndex })

    setTimeout(() => {
      this.startAutoplay()
    }, 1000)
  },

  onNextImage: function () {
    const scenic = this.data.scenic
    if (!scenic || !scenic.images || scenic.images.length <= 1) {
      return
    }

    this.stopAutoplay()

    this.setData({
      currentImageIndex: (this.data.currentImageIndex + 1) % scenic.images.length
    })

    setTimeout(() => {
      this.startAutoplay()
    }, 1000)
  },

  onImageTap: function (e) {
    const scenic = this.data.scenic
    const current = e.currentTarget.dataset.src

    wx.previewImage({
      current: current,
      urls: scenic.images || [current]
    })
  },

  onDotTap: function (e) {
    const scenic = this.data.scenic
    if (!scenic || !scenic.images || scenic.images.length <= 1) {
      return
    }

    const index = parseInt(e.currentTarget.dataset.index)
    if (index === this.data.currentImageIndex) {
      return
    }

    this.stopAutoplay()
    this.setData({ currentImageIndex: index })

    setTimeout(() => {
      this.startAutoplay()
    }, 1000)
  },

  onBack: function () {
    wx.navigateBack({
      delta: 1
    })
  },

  onCollect: function () {
    if (!app.globalData.isLogin) {
      wx.showModal({
        title: '提示',
        content: '请先登录后再收藏景点',
        showCancel: true,
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login?redirect=/pages/scenic-detail/scenic-detail?id=' + this.data.scenic.id
            })
          }
        }
      })
      return
    }

    const scenic = this.data.scenic
    let collectionList = wx.getStorageSync('collectionList') || []

    if (this.data.isCollected) {
      collectionList = collectionList.filter(item => item.id !== scenic.id)
      wx.showToast({
        title: '已取消收藏',
        icon: 'success',
        duration: 1500
      })
    } else {
      const collectItem = {
        id: scenic.id,
        name: scenic.name,
        location: scenic.location,
        rating: scenic.rating,
        image: scenic.image,
        collectTime: Date.now()
      }
      collectionList.unshift(collectItem)
      wx.showToast({
        title: '收藏成功',
        icon: 'success',
        duration: 1500
      })
    }

    wx.setStorageSync('collectionList', collectionList)
    this.setData({ isCollected: !this.data.isCollected })
  },

  onNavigate: function () {
    const scenic = this.data.scenic
    if (!scenic) return

    wx.navigateTo({
      url: `/pages/navigation/navigation?name=${encodeURIComponent(scenic.name)}&address=${encodeURIComponent(scenic.location)}&latitude=${scenic.latitude || 26.5833}&longitude=${scenic.longitude || 106.7167}`
    })
  },

  onShareAppMessage: function () {
    const scenic = this.data.scenic
    return {
      title: scenic.name + ' - 带你黔游',
      path: '/pages/scenic-detail/scenic-detail?id=' + scenic.id,
      imageUrl: scenic.image
    }
  }
})