const { request } = require('../../utils/request')
const { validateImageUrl } = require('../../utils/common')
const { getSafeArea } = require('../../utils/safe-area')

Page({
  data: {
    title: '景点大全',
    currentType: 'scenic',
    currentRegion: '全部',
    regions: ['全部', '贵阳', '黔东南', '安顺', '遵义', '毕节', '铜仁', '黔南'],
    scenicList: [],
    loading: false
  },

  onLoad: function (options) {
    if (options.title) {
      this.setData({ title: options.title })
    }
    if (options.type) {
      this.setData({ currentType: options.type })
    }
    this.loadScenicList()
  },

  onShow: function () {
    this.loadScenicList()
  },

  loadScenicList: function () {
    const { currentType, currentRegion } = this.data

    // 如果是景点类型，从后端API获取数据
    if (currentType === 'scenic') {
      this.setData({ loading: true })
      const params = { pageSize: 100 } //【改】增加pageSize参数，确保获取所有景点
      if (currentRegion && currentRegion !== '全部') {
        params.region = currentRegion
      }
      request({
        url: '/admin/scenics/public/list',
        method: 'GET',
        data: params
      }).then(res => {
        const data = res.data
        if (data && data.list) {
          const scenicList = data.list.map(item => ({
            id: item.id,
            name: item.name,
            location: item.region || '',
            rating: item.rating ? item.rating.toString() : '0',
            image: validateImageUrl(item.coverImage),
            region: item.region || ''
          }))
          this.setData({ scenicList })
        }
        this.setData({ loading: false })
      }).catch(error => {
        console.error('加载景点列表失败:', error)
        this.setData({ loading: false })
        // 如果API请求失败，使用mock数据
        this.loadMockData()
      })
    } else if (currentType === 'culture') {
      // 如果是文化体验类型，从后端API获取数据
      this.setData({ loading: true })
      const params = {}
      if (currentRegion && currentRegion !== '全部') {
        params.region = currentRegion
      }
      request({
        url: '/admin/cultures/public/list',
        method: 'GET',
        data: params
      }).then(res => {
        const data = res.data
        if (data && data.list) {
          const scenicList = data.list.map(item => ({
            id: item.id,
            name: item.name,
            location: item.region || '',
            rating: item.rating ? item.rating.toString() : '0',
            image: validateImageUrl(item.coverImage),
            region: item.region || '',
            description: item.description || '',
            duration: item.duration || ''
          }))
          this.setData({ scenicList })
        }
        this.setData({ loading: false })
      }).catch(error => {
        console.error('加载文化体验列表失败:', error)
        this.setData({ loading: false })
        // 如果API请求失败，使用mock数据
        this.loadMockData()
      })
    } else if (currentType === 'red') {
      // 如果是红色旅游类型，从后端API获取数据
      this.setData({ loading: true })
      const params = {}
      if (currentRegion && currentRegion !== '全部') {
        params.region = currentRegion
      }
      request({
        url: '/admin/red-tourisms/public/list',
        method: 'GET',
        data: params
      }).then(res => {
        const data = res.data
        if (data && data.list) {
          const scenicList = data.list.map(item => ({
            id: item.id,
            name: item.name,
            location: item.region || '',
            rating: item.rating ? item.rating.toString() : '0',
            image: validateImageUrl(item.coverImage),
            region: item.region || '',
            type: item.type || '革命历史'
          }))
          this.setData({ scenicList })
        }
        this.setData({ loading: false })
      }).catch(error => {
        console.error('加载红色旅游列表失败:', error)
        this.setData({ loading: false })
        // 如果API请求失败，使用mock数据
        this.loadMockData()
      })
    } else if (currentType === 'route') {
      // 如果是旅游路线类型，从后端API获取数据
      this.setData({ loading: true })
      const params = {}
      if (currentRegion && currentRegion !== '全部') {
        params.region = currentRegion
      }
      request({
        url: '/admin/routes/public/list',
        method: 'GET',
        data: params
      }).then(res => {
        const data = res.data
        if (data && data.list) {
          const scenicList = data.list.map(item => ({
            id: item.id,
            name: item.name,
            location: item.region || '',
            rating: item.rating ? item.rating.toString() : '0',
            image: validateImageUrl(item.coverImage),
            region: item.region || '',
            days: item.days ? `${item.days}天${item.nights}晚` : '',
            price: item.price ? item.price.toString() : '0'
          }))
          this.setData({ scenicList })
        }
        this.setData({ loading: false })
      }).catch(error => {
        console.error('加载旅游路线列表失败:', error)
        this.setData({ loading: false })
        // 如果API请求失败，使用mock数据
        this.loadMockData()
      })
    } else {
      this.loadMockData()
    }
  },

  loadMockData: function () {
    const { currentType } = this.data

    const dataMap = {
      scenic: [
        { id: 1, name: '黄果树瀑布', location: '安顺市', rating: '4.8', image: '/images/a1.jpg', region: '安顺' },
        { id: 2, name: '百里杜鹃', location: '毕节市', rating: '4.7', image: '/images/a2.jpg', region: '毕节' },
        { id: 3, name: '梵净山', location: '铜仁市', rating: '4.9', image: '/images/a3.jpg', region: '铜仁' },
        { id: 4, name: '织金洞', location: '毕节市', rating: '4.6', image: '/images/a4.jpg', region: '毕节' },
        { id: 5, name: '韭菜坪', location: '毕节市', rating: '4.5', image: '/images/a5.jpg', region: '毕节' },
        { id: 6, name: '青岩古镇', location: '贵阳市', rating: '4.6', image: '/images/a6.jpg', region: '贵阳' },
        { id: 7, name: '西江千户苗寨', location: '黔东南州', rating: '4.7', image: '/images/a7.jpg', region: '黔东南' },
        { id: 8, name: '镇远古镇', location: '黔东南州', rating: '4.5', image: '/images/a8.jpg', region: '黔东南' },
        { id: 9, name: '龙宫', location: '安顺市', rating: '4.6', image: '/images/a9.jpg', region: '安顺' },
        { id: 10, name: '赤水丹霞', location: '遵义市', rating: '4.8', image: '/images/a1.jpg', region: '遵义' },
        { id: 11, name: '荔波小七孔', location: '黔南州', rating: '4.9', image: '/images/a2.jpg', region: '黔南' },
        { id: 12, name: '甲秀楼', location: '贵阳市', rating: '4.4', image: '/images/a3.jpg', region: '贵阳' }
      ],
      route: [
        { id: 101, name: '黔东南环线5日游', location: '黔东南', rating: '4.9', image: '/images/a7.jpg', region: '黔东南', days: '5天4晚', price: '1280' },
        { id: 102, name: '黄果树+梵净山3日游', location: '安顺/铜仁', rating: '4.8', image: '/images/a1.jpg', region: '安顺', days: '3天2晚', price: '880' },
        { id: 103, name: '毕节花海2日游', location: '毕节', rating: '4.7', image: '/images/a2.jpg', region: '毕节', days: '2天1晚', price: '580' },
        { id: 104, name: '红色文化之旅4日游', location: '遵义', rating: '4.6', image: '/images/a9.jpg', region: '遵义', days: '4天3晚', price: '980' }
      ],
      red: [
        { id: 201, name: '遵义会议会址', location: '遵义市', rating: '4.8', image: '/images/a9.jpg', region: '遵义', type: '革命历史' },
        { id: 202, name: '四渡赤水纪念馆', location: '遵义市', rating: '4.7', image: '/images/a1.jpg', region: '遵义', type: '革命历史' },
        { id: 203, name: '息烽集中营', location: '贵阳市', rating: '4.5', image: '/images/a6.jpg', region: '贵阳', type: '革命历史' },
        { id: 204, name: '娄山关战斗遗址', location: '遵义市', rating: '4.6', image: '/images/a3.jpg', region: '遵义', type: '革命历史' }
      ],
      culture: [
        { id: 301, name: '苗族蜡染体验', location: '黔东南', rating: '4.8', image: '/images/a7.jpg', region: '黔东南', description: '体验苗族传统蜡染技艺，亲手制作独特纹样', duration: '2小时' },
        { id: 302, name: '侗族大歌表演', location: '黔东南', rating: '4.9', image: '/images/a2.jpg', region: '黔东南', description: '聆听世界非物质文化遗产侗族大歌的天籁之音', duration: '1.5小时' },
        { id: 303, name: '苗绣工艺坊', location: '黔东南', rating: '4.7', image: '/images/a5.jpg', region: '黔东南', description: '跟随苗族绣娘学习精美苗绣技法', duration: '3小时' },
        { id: 304, name: '彝族火把节', location: '毕节', rating: '4.8', image: '/images/a4.jpg', region: '毕节', description: '参与盛大的彝族火把节庆典活动', duration: '全天' },
        { id: 305, name: '布依族八音坐唱', location: '安顺', rating: '4.6', image: '/images/a1.jpg', region: '安顺', description: '欣赏布依族传统音乐表演', duration: '1小时' },
        { id: 306, name: '苗族银饰制作', location: '黔东南', rating: '4.7', image: '/images/a3.jpg', region: '黔东南', description: '体验苗族银饰锻造工艺', duration: '2.5小时' },
        { id: 307, name: '侗族鼓楼建造技艺', location: '黔东南', rating: '4.9', image: '/images/a7.jpg', region: '黔东南', description: '了解侗族鼓楼的榫卯结构和建造艺术', duration: '1.5小时' },
        { id: 308, name: '贵州花灯戏', location: '遵义', rating: '4.5', image: '/images/a6.jpg', region: '遵义', description: '观看传统贵州花灯戏表演', duration: '2小时' }
      ]
    }

    this.setData({ scenicList: dataMap[currentType] || dataMap.scenic })
  },

  onRegionChange: function (e) {
    const region = e.currentTarget.dataset.region
    this.setData({ currentRegion: region })
    this.loadScenicList()
  },

  filterScenicList: function (region) {
    const { currentType, scenicList } = this.data

    if (region === '全部') {
      // 如果已经从API获取了数据，直接使用
      if (scenicList.length > 0) {
        this.setData({ scenicList: scenicList })
        return
      }
    }

    const dataMap = {
      scenic: [
        { id: 1, name: '黄果树瀑布', location: '安顺市', rating: '4.8', image: '/images/a1.jpg', region: '安顺' },
        { id: 2, name: '百里杜鹃', location: '毕节市', rating: '4.7', image: '/images/a2.jpg', region: '毕节' },
        { id: 3, name: '梵净山', location: '铜仁市', rating: '4.9', image: '/images/a3.jpg', region: '铜仁' },
        { id: 4, name: '织金洞', location: '毕节市', rating: '4.6', image: '/images/a4.jpg', region: '毕节' },
        { id: 5, name: '韭菜坪', location: '毕节市', rating: '4.5', image: '/images/a5.jpg', region: '毕节' },
        { id: 6, name: '青岩古镇', location: '贵阳市', rating: '4.6', image: '/images/a6.jpg', region: '贵阳' },
        { id: 7, name: '西江千户苗寨', location: '黔东南州', rating: '4.7', image: '/images/a7.jpg', region: '黔东南' },
        { id: 8, name: '镇远古镇', location: '黔东南州', rating: '4.5', image: '/images/a8.jpg', region: '黔东南' },
        { id: 9, name: '龙宫', location: '安顺市', rating: '4.6', image: '/images/a9.jpg', region: '安顺' },
        { id: 10, name: '赤水丹霞', location: '遵义市', rating: '4.8', image: '/images/a1.jpg', region: '遵义' },
        { id: 11, name: '荔波小七孔', location: '黔南州', rating: '4.9', image: '/images/a2.jpg', region: '黔南' },
        { id: 12, name: '甲秀楼', location: '贵阳市', rating: '4.4', image: '/images/a3.jpg', region: '贵阳' }
      ],
      route: [
        { id: 101, name: '黔东南环线5日游', location: '黔东南', rating: '4.9', image: '/images/a7.jpg', region: '黔东南' },
        { id: 102, name: '黄果树+梵净山3日游', location: '安顺/铜仁', rating: '4.8', image: '/images/a1.jpg', region: '安顺' },
        { id: 103, name: '毕节花海2日游', location: '毕节', rating: '4.7', image: '/images/a2.jpg', region: '毕节' },
        { id: 104, name: '红色文化之旅4日游', location: '遵义', rating: '4.6', image: '/images/a9.jpg', region: '遵义' }
      ],
      red: [
        { id: 201, name: '遵义会议会址', location: '遵义市', rating: '4.8', image: '/images/a9.jpg', region: '遵义' },
        { id: 202, name: '四渡赤水纪念馆', location: '遵义市', rating: '4.7', image: '/images/a1.jpg', region: '遵义' },
        { id: 203, name: '息烽集中营', location: '贵阳市', rating: '4.5', image: '/images/a6.jpg', region: '贵阳' },
        { id: 204, name: '娄山关战斗遗址', location: '遵义市', rating: '4.6', image: '/images/a3.jpg', region: '遵义' }
      ],
      culture: [
        { id: 301, name: '苗族蜡染体验', location: '黔东南', rating: '4.8', image: '/images/a7.jpg', region: '黔东南' },
        { id: 302, name: '侗族大歌表演', location: '黔东南', rating: '4.9', image: '/images/a2.jpg', region: '黔东南' },
        { id: 303, name: '苗绣工艺坊', location: '黔东南', rating: '4.7', image: '/images/a5.jpg', region: '黔东南' },
        { id: 304, name: '彝族火把节', location: '毕节', rating: '4.8', image: '/images/a4.jpg', region: '毕节' },
        { id: 305, name: '布依族八音坐唱', location: '安顺', rating: '4.6', image: '/images/a1.jpg', region: '安顺' },
        { id: 306, name: '苗族银饰制作', location: '黔东南', rating: '4.7', image: '/images/a3.jpg', region: '黔东南' },
        { id: 307, name: '侗族鼓楼建造技艺', location: '黔东南', rating: '4.9', image: '/images/a7.jpg', region: '黔东南' },
        { id: 308, name: '贵州花灯戏', location: '遵义', rating: '4.5', image: '/images/a6.jpg', region: '遵义' }
      ]
    }

    let allScenic = dataMap[currentType] || dataMap.scenic

    if (region === '全部') {
      this.setData({ scenicList: allScenic })
    } else {
      const filteredList = allScenic.filter(item => item.region === region)
      this.setData({ scenicList: filteredList })
    }
  },

  goToDetail: function (e) {
    const id = e.currentTarget.dataset.id
    const { currentType } = this.data

    if (currentType === 'culture') {
      wx.navigateTo({
        url: '/packageDetail/pages/culture-detail/culture-detail?id=' + id
      })
    } else if (currentType === 'route') {
      wx.navigateTo({
        url: '/packageDetail/pages/route-detail/route-detail?id=' + id
      })
    } else if (currentType === 'red') {
      wx.navigateTo({
        url: '/packageDetail/pages/red-detail/red-detail?id=' + id
      })
    } else {
      wx.navigateTo({
        url: '/pages/scenic-detail/scenic-detail?id=' + id + '&type=scenic'
      })
    }
  },

  onBack: function () {
    wx.navigateBack()
  }
})