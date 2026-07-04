console.log('=== FOOD-DETAIL.JS v20250603-LOADED ===') // 版本标记，确认文件被加载
const app = getApp()
const { request } = require('../../../utils/request')

/**
 * 美食详情页面
 */
Page({
  data: {
    loading: true,
    food: {},          // 初始化为空对象，避免 WXML 访问 null 属性
    isCollected: false
  },

  /**
   * 页面加载
   */
  onLoad: function (options) {
    if (options.id) {
      this.loadFoodDetail(options.id)
    } else {
      wx.showToast({
        title: '参数错误',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }
  },

  /**
   * 页面显示
   */
  onShow: function () {
    // 检查收藏状态
    this.checkCollectionStatus()
  },

  /**
   * 加载美食详情
   */
  loadFoodDetail: function (id) {
    this.setData({ loading: true })

    request({ url: '/foods/' + id, method: 'GET' }).then(res => {
      console.log('API Response:', res) //【改】添加调试日志
      console.log('res.data type:', typeof res.data) //【改】诊断日志
      console.log('res.data keys:', Object.keys(res.data)) //【改】诊断日志
      console.log('highlights from API:', JSON.stringify(res.data.highlights)) //【改】强制序列化打印
      console.log('craft from API:', JSON.stringify(res.data.craft)) //【改】强制序列化打印
      const data = res.data

      if (!data) {
        this.setData({ loading: false })
        wx.showToast({
          title: '美食不存在',
          icon: 'none'
        })
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
        return
      }

      // 转换数据格式，适配前端显示
      const food = {
        id: data.id,
        name: data.name,
        category: data.category,
        tag: data.tags,
        image: this.validateImageUrl(data.coverImage),
        images: [],
        description: data.description,
        region: data.region,
        address: data.address || '',
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        price: data.priceRange,
        flavor: data.taste,
        history: data.description,
        highlights: data.highlights || '', //【改】从后端获取亮点特色
        craft: data.craft || '', //【改】从后端获取制作工艺
        shops: []
      }

      // 解析图片集
      if (data.images && typeof data.images === 'string') {
        try {
          const imagesArray = JSON.parse(data.images)
          food.images = imagesArray.map(img => this.validateImageUrl(img))
        } catch (e) {
          food.images = []
        }
      } else if (Array.isArray(data.images)) {
        food.images = data.images.map(img => this.validateImageUrl(img))
      }

      // 解析推荐店铺
      if (data.recommendedDishes && typeof data.recommendedDishes === 'string') {
        try {
          food.shops = JSON.parse(data.recommendedDishes)
        } catch (e) {
          food.shops = []
        }
      } else if (Array.isArray(data.recommendedDishes)) {
        food.shops = data.recommendedDishes
      }

      this.setData({
        food: food,
        loading: false
      })

      console.log('【改】setData后 food.highlights =', JSON.stringify(food.highlights)) //【改】最终验证
      console.log('【改】setData后 food.craft =', JSON.stringify(food.craft)) //【改】最终验证
      console.log('【改】setData后 this.data.food.highlights =', JSON.stringify(this.data.food.highlights)) //【改】确认页面数据

      // 检查收藏状态
      this.checkCollectionStatus()

      wx.setNavigationBarTitle({
        title: food.name
      })

      this.addToHistory(food)
    }).catch(error => {
      console.error('加载美食详情失败:', error)
      this.setData({ loading: false })
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'none'
      })
    })
  },

  /**
   * 添加到浏览历史
   */
  addToHistory: function (food) {
    if (!food) return

    const historyItem = {
      id: food.id,
      type: 'food',
      title: food.name,
      coverImage: food.image,
      description: food.description || '',
      viewTime: Date.now()
    }

    const history = wx.getStorageSync('browseHistory') || []
    const filtered = history.filter(item => !(item.id === food.id && item.type === 'food'))
    const newHistory = [historyItem, ...filtered].slice(0, 100)
    wx.setStorageSync('browseHistory', newHistory)
  },

  /**
   * 检查收藏状态
   */
  checkCollectionStatus: function () {
    const food = this.data.food
    if (!food) return

    const collections = wx.getStorageSync('foodCollections') || []
    const isCollected = collections.some(item => item.id === food.id)
    this.setData({ isCollected })
  },

  /**
   * 验证图片URL是否有效
   * @param {string} url 图片URL
   * @returns {string} 有效的图片URL
   */
  validateImageUrl: function (url) {
    // 如果URL是Blob URL、data URL或者无效，返回一个简单的食物emoji作为占位
    if (!url || url.startsWith('blob:') || url.startsWith('data:')) {
      return ''
    }
    return url
  },

  /**
   * 主图点击预览
   */
  onImageTap: function () {
    const food = this.data.food
    if (food) {
      // 合并封面图和图片集进行预览
      const allImages = [food.image, ...food.images].filter(img => img)
      wx.previewImage({
        current: food.image,
        urls: allImages
      })
    }
  },

  /**
   * 图片集图片点击预览
   */
  onGalleryImageTap: function (e) {
    const food = this.data.food
    const index = e.currentTarget.dataset.index
    if (food && food.images && food.images.length > 0) {
      // 合并封面图和图片集进行预览
      const allImages = [food.image, ...food.images].filter(img => img)
      wx.previewImage({
        current: food.images[index],
        urls: allImages
      })
    }
  },

  /**
   * 收藏功能
   */
  onCollect: function () {
    const food = this.data.food
    if (!food) return

    let collections = wx.getStorageSync('foodCollections') || []
    const isCollected = collections.some(item => item.id === food.id)

    if (isCollected) {
      // 取消收藏
      collections = collections.filter(item => item.id !== food.id)
      wx.showToast({
        title: '已取消收藏',
        icon: 'none'
      })
    } else {
      // 添加收藏
      collections.push({
        id: food.id,
        name: food.name,
        image: food.image,
        region: food.region,
        price: food.price,
        category: food.category,
        collectTime: Date.now()
      })
      wx.showToast({
        title: '收藏成功',
        icon: 'success'
      })
    }

    // 保存到本地存储
    wx.setStorageSync('foodCollections', collections)

    // 更新状态
    this.setData({ isCollected: !isCollected })
  },

  /**
   * 分享
   */
  onShare: function () {
    const food = this.data.food
    if (food) {
      wx.showShareMenu({
        withShareTicket: true,
        menus: ['shareAppMessage', 'shareTimeline']
      })
    }
  },

  /**
   * 店铺点击
   */
  onShopTap: function (e) {
    const { address, name, phone, latitude, longitude } = e.currentTarget.dataset

    wx.showActionSheet({
      itemList: ['导航到店', '复制地址', '拨打电话'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.navigateToShop(name, address, latitude, longitude)
        } else if (res.tapIndex === 1) {
          this.copyAddressToClipboard(address)
        } else if (res.tapIndex === 2) {
          this.callPhone(phone)
        }
      }
    })
  },

  navigateToShop(name, address, latitude, longitude) {
    const lat = latitude || this.data.food.latitude || 26.5833
    const lng = longitude || this.data.food.longitude || 106.7167
    const addr = address || this.data.food.address || ''
    wx.navigateTo({
      url: `/pages/navigation/navigation?name=${encodeURIComponent(name)}&address=${encodeURIComponent(addr)}&latitude=${lat}&longitude=${lng}`
    })
  },

  copyAddressToClipboard(address) {
    wx.setClipboardData({
      data: address,
      success: () => wx.showToast({ title: '地址已复制', icon: 'success' })
    })
  },

  callPhone(phone) {
    if (!phone) return
    wx.makePhoneCall({
      phoneNumber: phone,
      fail: () => wx.showToast({ title: '无法拨打电话', icon: 'none' })
    })
  },

  /**
   * 返回
   */
  onBack: function () {
    wx.navigateBack({
      delta: 1
    })
  },

  /**
   * 分享按钮点击
   */
  onShare: function () {
    const food = this.data.food
    if (!food) {
      wx.showToast({
        title: '数据加载中',
        icon: 'loading'
      })
      return
    }

    wx.showActionSheet({
      itemList: ['分享给朋友'],
      success: (res) => {
        if (res.tapIndex === 0) {
          // 分享给朋友
          wx.showToast({
            title: '请点击右上角分享',
            icon: 'none',
            duration: 2000
          })
        }
      },
      fail: () => {
        console.log('用户取消分享')
      }
    })
  },

  /**
   * 分享给朋友配置
   */
  onShareAppMessage: function () {
    const food = this.data.food
    if (food) {
      return {
        title: `贵州美食推荐 - ${food.name}`,
        path: `/packageFood/pages/food-detail/food-detail?id=${food.id}`,
        imageUrl: food.image
      }
    }
    return {}
  },

  /**
   * 分享到朋友圈配置
   */
  onShareTimeline: function () {
    const food = this.data.food
    if (food) {
      return {
        title: `贵州美食推荐 - ${food.name}`,
        imageUrl: food.image,
        query: `id=${food.id}`
      }
    }
    return {}
  }
})