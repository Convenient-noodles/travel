const app = getApp()
const { foodApi } = require('../../utils/api.js')

/**
 * 美食推荐页面
 * 功能：展示贵州特色美食，支持分类筛选、下拉刷新、上拉加载更多
 */
Page({
  data: {
    // 分类列表
    categories: [
      { type: 'street', name: '路边摊' },
      { type: 'course', name: '特色菜肴' },
      { type: 'snack', name: '休闲零食' },
      { type: 'drink', name: '特色饮品' }
    ],
    // 当前选中分类
    currentCategory: 'street',
    // 美食列表
    foodList: [],
    // 分页参数
    page: 1,
    pageSize: 6,
    // 加载状态
    loading: false,
    loadingMore: false,
    hasMore: true,
    // 数据缓存
    cache: {},
    // 上次请求时间
    lastRequestTime: 0,
    // 防抖定时器
    debounceTimer: null
  },

  /**
   * 页面加载完成
   */
  onLoad: function (options) {
    // 读取上次选中的分类状态
    const savedCategory = wx.getStorageSync('foodCategory') || 'street'

    // 设置加载状态，避免初始时显示"暂无数据"
    this.setData({
      currentCategory: savedCategory,
      loading: true
    })

    // 加载数据
    this.loadFoodData()
  },

  /**
   * 页面显示
   */
  onShow: function () {
    // 可在此处刷新数据或更新状态
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh: function () {
    this.refreshData()
  },

  /**
   * 触底加载更多
   */
  onReachBottom: function () {
    this.loadMore()
  },

  /**
   * 滚动事件处理
   */
  onScroll: function (e) {
    // 可在此处添加滚动相关逻辑
  },

  /**
   * 加载美食数据
   * @param {boolean} isRefresh 是否为刷新操作
   */
  loadFoodData: function (isRefresh = false) {
    const { currentCategory, page, pageSize } = this.data

    this.setData({ loading: true })

    // 调用后端API获取数据
    foodApi.getFoodList({
      category: currentCategory,
      page: page,
      pageSize: pageSize,
      status: 1
    }).then(res => {
      const result = res.data
      const list = result.list || []

      // 转换数据格式，适配前端显示
      const formattedList = list.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        tag: item.tags,
        image: this.validateImageUrl(item.coverImage),
        description: item.description,
        region: item.region,
        price: item.priceRange
      }))

      this.setData({
        foodList: isRefresh ? formattedList : [...this.data.foodList, ...formattedList],
        loading: false,
        loadingMore: false,
        hasMore: result.total > page * pageSize
      })

      if (isRefresh) {
        wx.stopPullDownRefresh()
      }
    }).catch(error => {
      console.error('加载美食数据失败:', error)
      this.setData({ loading: false, loadingMore: false })
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'none'
      })
    })
  },

  /**
   * 分类切换
   * @param {Object} e 事件对象
   */
  onCategoryChange: function (e) {
    const type = e.currentTarget.dataset.type
    if (type === this.data.currentCategory) return

    // 保存分类状态
    wx.setStorageSync('foodCategory', type)

    // 重置分页和数据，同时设置加载状态
    this.setData({
      currentCategory: type,
      page: 1,
      foodList: [],
      hasMore: true,
      loading: true
    })

    // 滚动到顶部
    const query = wx.createSelectorQuery()
    query.select('.content-scroll').boundingClientRect((rect) => {
      if (rect) {
        wx.pageScrollTo({
          scrollTop: 0,
          duration: 300
        })
      }
    }).exec()

    // 加载数据
    this.loadFoodData()
  },

  /**
   * 刷新数据
   */
  refreshData: function () {
    this.setData({
      page: 1,
      foodList: [],
      hasMore: true
    })
    this.loadFoodData(true)
  },

  /**
   * 加载更多
   */
  loadMore: function () {
    const { loading, loadingMore, hasMore } = this.data

    if (loading || loadingMore || !hasMore) {
      return
    }

    this.setData({
      page: this.data.page + 1,
      loadingMore: true
    })

    this.loadFoodData()
  },

  /**
   * 美食卡片点击
   * @param {Object} e 事件对象
   */
  onFoodTap: function (e) {
    const id = e.currentTarget.dataset.id
    const food = this.data.foodList.find(item => item.id === parseInt(id))

    if (!food) return

    // 跳转到详情页
    wx.navigateTo({
      url: `/packageFood/pages/food-detail/food-detail?id=${id}`
    })
  },

  /**
   * 美食卡片长按
   * @param {Object} e 事件对象
   */
  onFoodLongPress: function (e) {
    const id = e.currentTarget.dataset.id
    const food = this.data.foodList.find(item => item.id === parseInt(id))

    if (food) {
      wx.showActionSheet({
        itemList: ['查看详情', '分享给朋友'],
        success: (res) => {
          if (res.tapIndex === 0) {
            wx.navigateTo({
              url: `/packageFood/pages/food-detail/food-detail?id=${id}`
            })
          } else if (res.tapIndex === 1) {
            this.shareFood(food)
          }
        }
      })
    }
  },

  /**
   * 分享美食
   * @param {Object} food 美食数据
   */
  shareFood: function (food) {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })

    wx.showToast({
      title: '请点击右上角分享',
      icon: 'none',
      duration: 2000
    })
  },

  /**
   * 验证图片URL是否有效
   * @param {string} url 图片URL
   * @returns {string} 有效的图片URL
   */
  validateImageUrl: function (url) {
    // 如果URL是Blob URL、data URL或者无效，返回默认图片
    if (!url || url.startsWith('blob:') || url.startsWith('data:')) {
      return 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=delicious%20chinese%20food%20dish%20on%20plate%20food%20photography&image_size=square'
    }
    return url
  },

  /**
   * 图片加载错误处理
   * @param {Object} e 事件对象
   */
  onImageError: function (e) {
    const index = e.currentTarget.dataset.index
    console.error(`图片加载失败，索引: ${index}`, e.detail.errMsg)

    // 设置默认占位图
    const currentTarget = e.currentTarget
    if (currentTarget) {
      currentTarget.src = 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=delicious%20chinese%20food%20dish%20on%20plate%20food%20photography&image_size=square'
    }
  },

  /**
   * 返回上一页
   */
  onBack: function () {
    wx.navigateBack({
      delta: 1,
      fail: () => {
        wx.reLaunch({
          url: '/pages/index/index'
        })
      }
    })
  },

  /**
   * 分享配置
   */
  onShareAppMessage: function () {
    return {
      title: '贵州美食推荐 - 带你品味地道黔味',
      path: '/pages/food/food',
      imageUrl: '/images/a8.jpg'
    }
  }
})