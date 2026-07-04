/**
 * utils/safe-area.js — 单元测试
 * 覆盖函数：getSafeArea
 */
const { getSafeArea } = require('../safe-area')

// ========== Mock 微信 API ==========
global.wx = {
  getWindowInfo: undefined,
  getSystemInfoSync: undefined,
}

describe('getSafeArea', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ==================== 新版 API 可用 ====================
  test('getWindowInfo 返回正常数据：使用返回的安全区', () => {
    global.wx.getWindowInfo = jest.fn(() => ({
      safeArea: { top: 44 },
      statusBarHeight: 44
    }))

    const result = getSafeArea()

    expect(result.safeAreaTop).toBe(88)   // 44 * 2
    expect(result.navBarHeight).toBe(176) // 88 + 88
    expect(result.contentTop).toBe(264)   // 88 + 88 + 88
  })

  test('getWindowInfo 无 safeArea.top：回退到 statusBarHeight', () => {
    global.wx.getWindowInfo = jest.fn(() => ({
      safeArea: {},
      statusBarHeight: 20
    }))

    const result = getSafeArea()
    expect(result.safeAreaTop).toBe(40) // 20 * 2
  })

  test('getWindowInfo 全部为 0/falsy：降级到旧版 API', () => {
    global.wx.getWindowInfo = jest.fn(() => ({
      safeArea: {},
      statusBarHeight: 0
    }))

    // 旧版 API 可用
    global.wx.getSystemInfoSync = jest.fn(() => ({
      safeArea: { top: 44 },
      statusBarHeight: 44
    }))

    const result = getSafeArea()
    expect(result.safeAreaTop).toBe(88)
  })

  // ==================== 旧版 API 降级 ====================
  test('getWindowInfo 不存在：降级到 getSystemInfoSync', () => {
    delete global.wx.getWindowInfo

    global.wx.getSystemInfoSync = jest.fn(() => ({
      safeArea: { top: 30 },
      statusBarHeight: 44
    }))

    const result = getSafeArea()
    expect(result.safeAreaTop).toBe(60) // 30 * 2
  })

  test('getWindowInfo 抛异常：降级到 getSystemInfoSync', () => {
    global.wx.getWindowInfo = jest.fn(() => { throw new Error('not supported') })

    global.wx.getSystemInfoSync = jest.fn(() => ({
      safeArea: { top: 44 },
      statusBarHeight: 44
    }))

    const result = getSafeArea()
    expect(result.safeAreaTop).toBe(88)
  })

  test('getSystemInfoSync 无 safeArea：回退到 statusBarHeight', () => {
    delete global.wx.getWindowInfo

    global.wx.getSystemInfoSync = jest.fn(() => ({
      statusBarHeight: 22
    }))

    const result = getSafeArea()
    expect(result.safeAreaTop).toBe(44) // 22 * 2
  })

  // ==================== 全部失败 → 使用默认值 ====================
  test('两个 API 都抛异常：使用硬编码默认值', () => {
    global.wx.getWindowInfo = jest.fn(() => { throw new Error('crash') })
    global.wx.getSystemInfoSync = jest.fn(() => { throw new Error('crash also') })

    const result = getSafeArea()

    expect(result.safeAreaTop).toBe(40)
    expect(result.navBarHeight).toBe(128)
    expect(result.contentTop).toBe(216)
  })

  test('getWindowInfo 无且 getSystemInfoSync 抛异常：使用默认值', () => {
    delete global.wx.getWindowInfo
    global.wx.getSystemInfoSync = jest.fn(() => { throw new Error('crash') })

    const result = getSafeArea()
    expect(result.safeAreaTop).toBe(40)
  })

  // ==================== 类型检查 ====================
  test('返回对象包含三个属性', () => {
    global.wx.getWindowInfo = jest.fn(() => ({
      safeArea: { top: 44 },
      statusBarHeight: 44
    }))

    const result = getSafeArea()
    expect(result).toHaveProperty('safeAreaTop')
    expect(result).toHaveProperty('navBarHeight')
    expect(result).toHaveProperty('contentTop')
    expect(typeof result.safeAreaTop).toBe('number')
  })
})
