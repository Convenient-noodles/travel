/**
 * pages/index/index.js — 单元测试
 * 覆盖函数：goToDetail
 */

// ========== Mock 微信 API ==========
global.wx = {
  navigateTo: jest.fn(),
  reLaunch: jest.fn(),
}
global.getApp = jest.fn(() => ({}))

// ========== Mock request 模块 ==========
jest.mock('../../../utils/request', () => ({
  request: jest.fn(),
}))

// ========== 捕获 Page 配置 ==========
let pageConfig
global.Page = jest.fn((config) => {
  pageConfig = config
})

// ========== 加载页面模块 ==========
require('../index')

// ========== 获取 mocked request 引用 ==========
const { request } = require('../../../utils/request')

// ========== 提取待测方法 ==========
const goToDetail   = pageConfig.goToDetail
const goToList     = pageConfig.goToList
const loadBannerData    = pageConfig.loadBannerData
const loadHotScenic     = pageConfig.loadHotScenic
const loadStrategyList  = pageConfig.loadStrategyList
const loadQuickEntry    = pageConfig.loadQuickEntry
const goToSearch        = pageConfig.goToSearch
const goToScenicList    = pageConfig.goToScenicList
const goToScenicDetail  = pageConfig.goToScenicDetail
const goToStrategyList  = pageConfig.goToStrategyList
const goToStrategyDetail = pageConfig.goToStrategyDetail
const goToDiscover      = pageConfig.goToDiscover
const goToMy            = pageConfig.goToMy

// ========== 构造模拟数据 ==========
function makeEvent(value, key = 'id') {
  return { currentTarget: { dataset: { [key]: value } } }
}

function makeContext(bannerList) {
  return { data: { bannerList } }
}

function makePageCtx(overrides = {}) {
  return {
    setData: jest.fn(),
    data: {},
    ...overrides,
  }
}

describe('goToDetail — banner 点击跳转逻辑', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ──────────────────────────────────────
  // 分支一：banner 未找到或无 targetId
  // ──────────────────────────────────────
  describe('banner 未找到或无 targetId → 兜底跳转景点详情', () => {
    test('bannerList 中无匹配 id：跳转 scenic-detail?id=原始id', () => {
      const ctx = makeContext([
        { id: 1, type: 'scenic', targetId: 100 },
      ])

      goToDetail.call(ctx, makeEvent(999))

      expect(wx.navigateTo).toHaveBeenCalledWith({
        url: '/pages/scenic-detail/scenic-detail?id=999',
      })
    })

    test('bannerList 为空数组：跳转 scenic-detail?id=原始id', () => {
      const ctx = makeContext([])

      goToDetail.call(ctx, makeEvent(1))

      expect(wx.navigateTo).toHaveBeenCalledWith({
        url: '/pages/scenic-detail/scenic-detail?id=1',
      })
    })

    test('匹配到 banner 但 targetId 为 undefined：走兜底', () => {
      const ctx = makeContext([
        { id: 1, type: 'scenic' }, // 没有 targetId
      ])

      goToDetail.call(ctx, makeEvent(1))

      expect(wx.navigateTo).toHaveBeenCalledWith({
        url: '/pages/scenic-detail/scenic-detail?id=1',
      })
    })

    test('匹配到 banner 但 targetId 为 null：走兜底', () => {
      const ctx = makeContext([
        { id: 1, type: 'scenic', targetId: null },
      ])

      goToDetail.call(ctx, makeEvent(1))

      expect(wx.navigateTo).toHaveBeenCalledWith({
        url: '/pages/scenic-detail/scenic-detail?id=1',
      })
    })

    test('匹配到 banner 但 targetId 为 0：走兜底（0 是 falsy）', () => {
      const ctx = makeContext([
        { id: 1, type: 'scenic', targetId: 0 },
      ])

      goToDetail.call(ctx, makeEvent(1))

      expect(wx.navigateTo).toHaveBeenCalledWith({
        url: '/pages/scenic-detail/scenic-detail?id=1',
      })
    })

    test('匹配到 banner 但 targetId 为空字符串：走兜底', () => {
      const ctx = makeContext([
        { id: 1, type: 'scenic', targetId: '' },
      ])

      goToDetail.call(ctx, makeEvent(1))

      expect(wx.navigateTo).toHaveBeenCalledWith({
        url: '/pages/scenic-detail/scenic-detail?id=1',
      })
    })
  })

  // ──────────────────────────────────────
  // 分支二：type === 'food'
  // ──────────────────────────────────────
  describe('type === "food" → 跳转美食详情', () => {
    test('有 targetId：跳转 food-detail?id=targetId', () => {
      const ctx = makeContext([
        { id: 1, type: 'food', targetId: 200 },
      ])

      goToDetail.call(ctx, makeEvent(1))

      expect(wx.navigateTo).toHaveBeenCalledWith({
        url: '/packageFood/pages/food-detail/food-detail?id=200',
      })
    })
  })

  // ──────────────────────────────────────
  // 分支三：type === 'hotel'
  // ──────────────────────────────────────
  describe('type === "hotel" → 跳转酒店详情', () => {
    test('有 targetId：跳转 hotel-detail?id=targetId', () => {
      const ctx = makeContext([
        { id: 2, type: 'hotel', targetId: 300 },
      ])

      goToDetail.call(ctx, makeEvent(2))

      expect(wx.navigateTo).toHaveBeenCalledWith({
        url: '/packageHotel/pages/hotel-detail/hotel-detail?id=300',
      })
    })
  })

  // ──────────────────────────────────────
  // 分支四：type === 'route'
  // ──────────────────────────────────────
  describe('type === "route" → 跳转路线列表', () => {
    test('跳转 list 页面（忽略 targetId）', () => {
      const ctx = makeContext([
        { id: 3, type: 'route', targetId: 400 },
      ])

      goToDetail.call(ctx, makeEvent(3))

      expect(wx.navigateTo).toHaveBeenCalledWith({
        url: '/pages/list/list?type=route&title=旅游路线',
      })
    })
  })

  // ──────────────────────────────────────
  // 分支五：type === 'external'
  // ──────────────────────────────────────
  describe('type === "external" → 跳转外部链接', () => {
    test('有 targetUrl：跳转 targetUrl', () => {
      const ctx = makeContext([
        { id: 4, type: 'external', targetId: 500, targetUrl: 'https://example.com/page' },
      ])

      goToDetail.call(ctx, makeEvent(4))

      expect(wx.navigateTo).toHaveBeenCalledWith({
        url: 'https://example.com/page',
      })
    })

    test('无 targetUrl（条件不满足）：走 else 兜底 scenic-detail', () => {
      const ctx = makeContext([
        { id: 4, type: 'external', targetId: 500 },
        // 没有 targetUrl → type === 'external' && banner.targetUrl → false
      ])

      goToDetail.call(ctx, makeEvent(4))

      expect(wx.navigateTo).toHaveBeenCalledWith({
        url: '/pages/scenic-detail/scenic-detail?id=500',
      })
    })

    test('targetUrl 为空字符串：走 else 兜底', () => {
      const ctx = makeContext([
        { id: 4, type: 'external', targetId: 500, targetUrl: '' },
      ])

      goToDetail.call(ctx, makeEvent(4))

      expect(wx.navigateTo).toHaveBeenCalledWith({
        url: '/pages/scenic-detail/scenic-detail?id=500',
      })
    })
  })

  // ──────────────────────────────────────
  // 分支六：else → 默认跳转景点详情
  // ──────────────────────────────────────
  describe('其他 type → 默认跳转景点详情', () => {
    test('type === "scenic"：跳转 scenic-detail?id=targetId', () => {
      const ctx = makeContext([
        { id: 5, type: 'scenic', targetId: 600 },
      ])

      goToDetail.call(ctx, makeEvent(5))

      expect(wx.navigateTo).toHaveBeenCalledWith({
        url: '/pages/scenic-detail/scenic-detail?id=600',
      })
    })

    test('type === "red"：跳转 scenic-detail?id=targetId', () => {
      const ctx = makeContext([
        { id: 6, type: 'red', targetId: 700 },
      ])

      goToDetail.call(ctx, makeEvent(6))

      expect(wx.navigateTo).toHaveBeenCalledWith({
        url: '/pages/scenic-detail/scenic-detail?id=700',
      })
    })

    test('type 为未知值：跳转 scenic-detail?id=targetId', () => {
      const ctx = makeContext([
        { id: 7, type: 'unknown_type', targetId: 800 },
      ])

      goToDetail.call(ctx, makeEvent(7))

      expect(wx.navigateTo).toHaveBeenCalledWith({
        url: '/pages/scenic-detail/scenic-detail?id=800',
      })
    })
  })

  // ──────────────────────────────────────
  // 边界情况
  // ──────────────────────────────────────
  describe('边界情况', () => {
    test('banner id 类型不匹配（字符串 vs 数字）：严格比较', () => {
      const ctx = makeContext([
        { id: 1, type: 'scenic', targetId: 100 },
      ])

      goToDetail.call(ctx, makeEvent('1')) // 字符串 '1'

      // Array.find 使用 === 严格比较，'1' !== 1，找不到 banner
      expect(wx.navigateTo).toHaveBeenCalledWith({
        url: '/pages/scenic-detail/scenic-detail?id=1',
      })
    })

    test('多个 banner 中匹配正确的那个', () => {
      const ctx = makeContext([
        { id: 1, type: 'food', targetId: 111 },
        { id: 2, type: 'hotel', targetId: 222 },
        { id: 3, type: 'scenic', targetId: 333 },
      ])

      goToDetail.call(ctx, makeEvent(2))

      expect(wx.navigateTo).toHaveBeenCalledWith({
        url: '/packageHotel/pages/hotel-detail/hotel-detail?id=222',
      })
    })
  })
})

// ══════════════════════════════════════════════════════════════
// goToList — 多类型入口路由（6 个分支）
// ══════════════════════════════════════════════════════════════
describe('goToList — 多类型入口路由', () => {
  beforeEach(() => { jest.clearAllMocks() })

  test('type === "food"：跳转美食列表页', () => {
    goToList.call(makePageCtx(), makeEvent('food', 'type'))
    expect(wx.navigateTo).toHaveBeenCalledWith({ url: '/packageFood/pages/food/food' })
  })

  test('type === "hotel"：跳转酒店列表页', () => {
    goToList.call(makePageCtx(), makeEvent('hotel', 'type'))
    expect(wx.navigateTo).toHaveBeenCalledWith({ url: '/packageHotel/pages/hotel/hotel' })
  })

  test('type === "scenic"：跳转 list 页面 — 必去景点', () => {
    goToList.call(makePageCtx(), makeEvent('scenic', 'type'))
    expect(wx.navigateTo).toHaveBeenCalledWith({ url: '/pages/list/list?type=scenic&title=必去景点' })
  })

  test('type === "route"：跳转 list 页面 — 精品路线', () => {
    goToList.call(makePageCtx(), makeEvent('route', 'type'))
    expect(wx.navigateTo).toHaveBeenCalledWith({ url: '/pages/list/list?type=route&title=精品路线' })
  })

  test('type === "red"：跳转 list 页面 — 红色旅游', () => {
    goToList.call(makePageCtx(), makeEvent('red', 'type'))
    expect(wx.navigateTo).toHaveBeenCalledWith({ url: '/pages/list/list?type=red&title=红色旅游' })
  })

  test('type === "culture"：跳转 list 页面 — 民俗体验', () => {
    goToList.call(makePageCtx(), makeEvent('culture', 'type'))
    expect(wx.navigateTo).toHaveBeenCalledWith({ url: '/pages/list/list?type=culture&title=民俗体验' })
  })
})

// ══════════════════════════════════════════════════════════════
// 简单导航函数
// ══════════════════════════════════════════════════════════════
describe('简单导航函数', () => {
  beforeEach(() => { jest.clearAllMocks() })

  test('goToSearch：跳转搜索页', () => {
    goToSearch.call(makePageCtx())
    expect(wx.navigateTo).toHaveBeenCalledWith({ url: '/pages/search/search' })
  })

  test('goToScenicList：跳转 list?type=scenic', () => {
    goToScenicList.call(makePageCtx())
    expect(wx.navigateTo).toHaveBeenCalledWith({ url: '/pages/list/list?type=scenic&title=热门景点' })
  })

  test('goToScenicDetail：跳转 scenic-detail?id=xxx', () => {
    goToScenicDetail.call(makePageCtx(), makeEvent(42))
    expect(wx.navigateTo).toHaveBeenCalledWith({ url: '/pages/scenic-detail/scenic-detail?id=42' })
  })

  test('goToStrategyList：跳转发现页', () => {
    goToStrategyList.call(makePageCtx())
    expect(wx.navigateTo).toHaveBeenCalledWith({ url: '/pages/discover/discover' })
  })

  test('goToStrategyDetail：跳转 strategy-detail?id=xxx', () => {
    goToStrategyDetail.call(makePageCtx(), makeEvent(99))
    expect(wx.navigateTo).toHaveBeenCalledWith({
      url: '/packageDetail/pages/strategy-detail/strategy-detail?id=99',
    })
  })

  test('goToDiscover：reLaunch 到发现页', () => {
    goToDiscover.call(makePageCtx())
    expect(wx.reLaunch).toHaveBeenCalledWith({ url: '/pages/discover/discover' })
  })

  test('goToMy：reLaunch 到我的页面', () => {
    goToMy.call(makePageCtx())
    expect(wx.reLaunch).toHaveBeenCalledWith({ url: '/pages/my/my' })
  })
})

// ══════════════════════════════════════════════════════════════
// loadBannerData — API 成功 / 失败
// ══════════════════════════════════════════════════════════════
describe('loadBannerData', () => {
  beforeEach(() => { jest.clearAllMocks() })

  test('API 成功：setData 使用映射后的 bannerList', async () => {
    const ctx = makePageCtx()
    request.mockResolvedValue({
      code: 200,
      data: [
        { id: 1, title: '黄果树', image: '/img/a.jpg', type: 'scenic', targetId: 10 },
        { id: 2, title: '梵净山', image: '/img/b.jpg', type: 'scenic', targetId: 20 },
      ],
    })

    await loadBannerData.call(ctx)

    expect(ctx.setData).toHaveBeenCalledWith({
      bannerList: [
        { id: 1, title: '黄果树',   image: '/img/a.jpg', type: 'scenic', targetId: 10 },
        { id: 2, title: '梵净山',   image: '/img/b.jpg', type: 'scenic', targetId: 20 },
      ],
    })
  })

  test('API 失败：setData 使用兜底 banner 数据', async () => {
    const ctx = makePageCtx()
    request.mockRejectedValue(new Error('网络错误'))

    loadBannerData.call(ctx)            // 不返回 Promise，fire-and-forget
    await new Promise(r => setTimeout(r, 0)) // 等待 Promise 链完成

    const callArg = ctx.setData.mock.calls[0][0]
    expect(callArg.bannerList).toBeDefined()
    expect(callArg.bannerList.length).toBe(5)
    expect(callArg.bannerList[0]).toHaveProperty('id')
    expect(callArg.bannerList[0]).toHaveProperty('title')
    expect(callArg.bannerList[0]).toHaveProperty('image')
  })
})

// ══════════════════════════════════════════════════════════════
// loadHotScenic — API 成功 / 失败
// ══════════════════════════════════════════════════════════════
describe('loadHotScenic', () => {
  beforeEach(() => { jest.clearAllMocks() })

  test('API 成功：setData 使用映射后的 hotScenic', async () => {
    const ctx = makePageCtx()
    request.mockResolvedValue({
      code: 200,
      data: [
        { id: 1, name: '黄果树', region: '安顺', rating: '4.8', coverImage: '/img/a.jpg' },
        { id: 2, name: '织金洞', region: '毕节', rating: '4.6', coverImage: '/img/b.jpg' },
      ],
    })

    await loadHotScenic.call(ctx)

    expect(ctx.setData).toHaveBeenCalledWith({
      hotScenic: [
        { id: 1, name: '黄果树', location: '安顺', rating: '4.8', image: '/img/a.jpg' },
        { id: 2, name: '织金洞', location: '毕节', rating: '4.6', image: '/img/b.jpg' },
      ],
    })
  })

  test('score 字段回退到 rating', async () => {
    const ctx = makePageCtx()
    request.mockResolvedValue({
      code: 200,
      data: [{ id: 3, name: '韭菜坪', region: '毕节', score: '4.5', coverImage: '/img/c.jpg' }],
    })

    await loadHotScenic.call(ctx)

    expect(ctx.setData).toHaveBeenCalledWith({
      hotScenic: [{ id: 3, name: '韭菜坪', location: '毕节', rating: '4.5', image: '/img/c.jpg' }],
    })
  })

  test('API 失败：setData 使用兜底热门景点数据', async () => {
    const ctx = makePageCtx()
    request.mockRejectedValue(new Error('超时'))

    loadHotScenic.call(ctx)
    await new Promise(r => setTimeout(r, 0))

    const callArg = ctx.setData.mock.calls[0][0]
    expect(callArg.hotScenic).toBeDefined()
    expect(callArg.hotScenic.length).toBe(5)
    expect(callArg.hotScenic[0]).toHaveProperty('name')
    expect(callArg.hotScenic[0]).toHaveProperty('location')
  })
})

// ══════════════════════════════════════════════════════════════
// loadStrategyList — API 成功 / 失败
// ══════════════════════════════════════════════════════════════
describe('loadStrategyList', () => {
  beforeEach(() => { jest.clearAllMocks() })

  test('API 成功：setData 使用映射后的 strategyList', async () => {
    const ctx = makePageCtx()
    request.mockResolvedValue({
      code: 200,
      data: [
        { id: 1, title: '贵州3日游', author: '小明', createTime: '2026-05-30 10:00:00', coverImage: '/img/a.jpg' },
      ],
    })

    await loadStrategyList.call(ctx)

    expect(ctx.setData).toHaveBeenCalledWith({
      strategyList: [
        { id: 1, title: '贵州3日游', author: '小明', date: '2026-05-30', image: '/img/a.jpg' },
      ],
    })
  })

  test('createTime 为空时 date 回退为空字符串', async () => {
    const ctx = makePageCtx()
    request.mockResolvedValue({
      code: 200,
      data: [{ id: 2, title: '攻略标题', author: '小红', coverImage: '/img/x.jpg' }],
    })

    await loadStrategyList.call(ctx)

    expect(ctx.setData).toHaveBeenCalledWith({
      strategyList: [{ id: 2, title: '攻略标题', author: '小红', date: '', image: '/img/x.jpg' }],
    })
  })

  test('API 失败：setData 使用兜底攻略数据', async () => {
    const ctx = makePageCtx()
    request.mockRejectedValue(new Error('服务器错误'))

    loadStrategyList.call(ctx)
    await new Promise(r => setTimeout(r, 0))

    const callArg = ctx.setData.mock.calls[0][0]
    expect(callArg.strategyList).toBeDefined()
    expect(callArg.strategyList.length).toBe(2)
    expect(callArg.strategyList[0]).toHaveProperty('title')
    expect(callArg.strategyList[0]).toHaveProperty('author')
  })
})

// ══════════════════════════════════════════════════════════════
// loadQuickEntry — 静态数据加载
// ══════════════════════════════════════════════════════════════
describe('loadQuickEntry', () => {
  beforeEach(() => { jest.clearAllMocks() })

  test('setData 被调用且包含 6 个快捷入口', () => {
    const ctx = makePageCtx()
    loadQuickEntry.call(ctx)
    const callArg = ctx.setData.mock.calls[0][0]
    expect(callArg.quickEntry).toBeDefined()
    expect(callArg.quickEntry).toHaveLength(6)
    expect(callArg.quickEntry[0]).toHaveProperty('name')
    expect(callArg.quickEntry[0]).toHaveProperty('icon')
    expect(callArg.quickEntry[0]).toHaveProperty('type')
    expect(callArg.quickEntry[0]).toHaveProperty('bgColor')
  })
})
