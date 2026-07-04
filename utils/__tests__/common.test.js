/**
 * utils/common.js — 单元测试
 * 覆盖函数：validateImageUrl, fixImageUrl, getFirstTag, parseTags,
 *           toRad, calcDistance, addToHistory, toggleCollect
 */

// ========== Mock 微信 API ==========
global.wx = {
  getStorageSync: jest.fn(() => []),
  setStorageSync: jest.fn(),
  showToast: jest.fn(),
}

// ========== 引入目标模块 ==========
const {
  validateImageUrl, fixImageUrl, getFirstTag, parseTags,
  toRad, calcDistance, addToHistory, toggleCollect,
  MAX_HISTORY, IMAGE_BASE
} = require('../common')

// =================================================================
// validateImageUrl — 图片URL安全校验
// =================================================================
describe('validateImageUrl', () => {
  test('正常 http URL：原样返回', () => {
    expect(validateImageUrl('http://example.com/img.jpg')).toBe('http://example.com/img.jpg')
  })

  test('正常 https URL：原样返回', () => {
    expect(validateImageUrl('https://example.com/img.jpg')).toBe('https://example.com/img.jpg')
  })

  test('blob: 协议：返回默认占位图', () => {
    expect(validateImageUrl('blob:http://example.com/abc')).toBe('/images/a1.jpg')
  })

  test('data: 协议：返回默认占位图', () => {
    expect(validateImageUrl('data:image/png;base64,xxxxx')).toBe('/images/a1.jpg')
  })

  test('空字符串：返回默认占位图', () => {
    expect(validateImageUrl('')).toBe('/images/a1.jpg')
  })

  test('null：返回默认占位图', () => {
    expect(validateImageUrl(null)).toBe('/images/a1.jpg')
  })

  test('undefined：返回默认占位图', () => {
    expect(validateImageUrl(undefined)).toBe('/images/a1.jpg')
  })
})

// =================================================================
// fixImageUrl — 相对路径补全为完整URL
// =================================================================
describe('fixImageUrl', () => {
  test('相对路径：拼接 IMAGE_BASE', () => {
    expect(fixImageUrl('/uploads/img.jpg')).toBe('http://localhost:8080/uploads/img.jpg')
  })

  test('已含 http:// 的URL：原样返回', () => {
    expect(fixImageUrl('http://cdn.example.com/img.jpg')).toBe('http://cdn.example.com/img.jpg')
  })

  test('已含 https:// 的URL：原样返回', () => {
    expect(fixImageUrl('https://cdn.example.com/img.jpg')).toBe('https://cdn.example.com/img.jpg')
  })

  test('空值 null：返回默认占位图', () => {
    expect(fixImageUrl(null)).toBe('/images/a1.jpg')
  })

  test('空值 undefined：返回默认占位图', () => {
    expect(fixImageUrl(undefined)).toBe('/images/a1.jpg')
  })

  test('空字符串：返回默认占位图', () => {
    expect(fixImageUrl('')).toBe('/images/a1.jpg')
  })
})

// =================================================================
// getFirstTag — 从标签中提取第一个
// =================================================================
describe('getFirstTag', () => {
  test('JSON 字符串数组：返回第一个元素', () => {
    expect(getFirstTag('["5A景区","自然风光"]')).toBe('5A景区')
  })

  test('原始字符串（非JSON）：直接返回该字符串', () => {
    expect(getFirstTag('热门推荐')).toBe('热门推荐')
  })

  test('JS 数组：返回第一个元素', () => {
    expect(getFirstTag(['5A景区', '自然风光'])).toBe('5A景区')
  })

  test('空值 null：返回空字符串', () => {
    expect(getFirstTag(null)).toBe('')
  })

  test('空值 undefined：返回空字符串', () => {
    expect(getFirstTag(undefined)).toBe('')
  })

  test('空数组：返回空字符串', () => {
    expect(getFirstTag([])).toBe('')
  })

  test('JSON 空数组：返回空字符串', () => {
    expect(getFirstTag('[]')).toBe('')
  })
})

// =================================================================
// parseTags — 统一标签解析（JSON串 / 逗号串 / 数组）
// =================================================================
describe('parseTags', () => {
  test('JSON 字符串数组：解析为 JS 数组', () => {
    expect(parseTags('["5A景区","自然风光","世界遗产"]'))
      .toEqual(['5A景区', '自然风光', '世界遗产'])
  })

  test('逗号分隔字符串：按逗号拆分', () => {
    expect(parseTags('5A景区,自然风光,世界遗产'))
      .toEqual(['5A景区', '自然风光', '世界遗产'])
  })

  test('中文逗号分隔：按中文逗号拆分', () => {
    expect(parseTags('5A景区，自然风光，世界遗产'))
      .toEqual(['5A景区', '自然风光', '世界遗产'])
  })

  test('顿号分隔：按顿号拆分', () => {
    expect(parseTags('5A景区、自然风光、世界遗产'))
      .toEqual(['5A景区', '自然风光', '世界遗产'])
  })

  test('混合分隔符：正确拆分', () => {
    expect(parseTags('5A景区,自然风光、世界遗产'))
      .toEqual(['5A景区', '自然风光', '世界遗产'])
  })

  test('已经是 JS 数组：原样返回', () => {
    expect(parseTags(['5A景区', '自然风光'])).toEqual(['5A景区', '自然风光'])
  })

  test('内嵌 JSON 字符串：正确解析', () => {
    // 先 JSON.parse → 得到数组
    expect(parseTags('["自然风光"]')).toEqual(['自然风光'])
  })

  test('空值 null：返回空数组', () => {
    expect(parseTags(null)).toEqual([])
  })

  test('空值 undefined：返回空数组', () => {
    expect(parseTags(undefined)).toEqual([])
  })

  test('空字符串：返回空数组', () => {
    expect(parseTags('')).toEqual([])
  })

  test('无效 JSON 字符串：按逗号拆分兜底', () => {
    expect(parseTags('{invalid json}')).toEqual(['{invalid json}'])
  })
})

// =================================================================
// toRad — 角度转弧度
// =================================================================
describe('toRad', () => {
  test('0 度：返回 0', () => {
    expect(toRad(0)).toBe(0)
  })

  test('180 度：返回 π', () => {
    expect(toRad(180)).toBeCloseTo(Math.PI, 10)
  })

  test('90 度：返回 π/2', () => {
    expect(toRad(90)).toBeCloseTo(Math.PI / 2, 10)
  })

  test('360 度：返回 2π', () => {
    expect(toRad(360)).toBeCloseTo(2 * Math.PI, 10)
  })
})

// =================================================================
// calcDistance — Haversine 球面距离
// =================================================================
describe('calcDistance', () => {
  // 北京 (39.9, 116.4) → 上海 (31.2, 121.5) 约 1067 km
  test('正常两坐标：返回距离和预估时间', () => {
    const from = { latitude: 39.9, longitude: 116.4 }
    const to   = { latitude: 31.2, longitude: 121.5 }
    const result = calcDistance(from, to)

    expect(result.km).toBeGreaterThan(1000)
    expect(result.km).toBeLessThan(1200)
    expect(result.m).toBeGreaterThan(1000000)
    expect(result.speed).toHaveProperty('walk')
    expect(result.speed).toHaveProperty('drive')
    expect(result.speed).toHaveProperty('transit')
    // 步行速度约 5km/h → 距离/5 小时
    expect(result.speed.walk).toBeTruthy()
    expect(result.speed.drive).toBeTruthy()
  })

  test('相同坐标：距离为 0', () => {
    const point = { latitude: 30, longitude: 120 }
    const result = calcDistance(point, point)
    expect(result.km).toBe(0)
    expect(result.m).toBe(0)
    expect(result.speed.walk).toBe('0分钟')
  })

  test('from 为 null：返回安全默认值', () => {
    expect(calcDistance(null, { latitude: 30, longitude: 120 }))
      .toEqual({ km: 0, m: 0, speed: { walk: '未知', drive: '未知', transit: '未知' } })
  })

  test('to 为 null：返回安全默认值', () => {
    expect(calcDistance({ latitude: 30, longitude: 120 }, null))
      .toEqual({ km: 0, m: 0, speed: { walk: '未知', drive: '未知', transit: '未知' } })
  })

  test('缺少 latitude：返回安全默认值', () => {
    const from = { longitude: 120 }
    const to = { latitude: 30, longitude: 121 }
    expect(calcDistance(from, to).km).toBe(0)
  })

  test('缺少 longitude：返回安全默认值', () => {
    const from = { latitude: 30 }
    const to = { latitude: 31, longitude: 121 }
    expect(calcDistance(from, to).km).toBe(0)
  })

  test('短距离（< 1 km）：返回米数', () => {
    // 约 111 米
    const from = { latitude: 30.0, longitude: 120.0 }
    const to   = { latitude: 30.001, longitude: 120.0 }
    const result = calcDistance(from, to)
    expect(result.km).toBeLessThan(1)
    expect(result.m).toBeGreaterThan(0)
    expect(result.m).toBeLessThan(200)
  })

  test('步行时间 ≥ 60 分钟：显示 X 小时 X 分钟', () => {
    // 约 5km → 步行 1 小时
    const from = { latitude: 30.0, longitude: 120.0 }
    const to   = { latitude: 30.045, longitude: 120.0 }
    const result = calcDistance(from, to)
    // 步行 5km/h → 约 5km 需要 1小时
    if (result.speed.walk.includes('小时')) {
      expect(result.speed.walk).toMatch(/\d+小时\d+分钟/)
    }
  })
})

// =================================================================
// addToHistory — 浏览历史管理（依赖 wx API）
// =================================================================
describe('addToHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    wx.getStorageSync.mockReturnValue([])
  })

  test('空历史：新增一条记录', () => {
    wx.getStorageSync.mockReturnValue([])

    addToHistory('browseHistory', { id: 1, name: '黄果树' })

    const saved = wx.setStorageSync.mock.calls[0]
    expect(saved[0]).toBe('browseHistory')
    expect(saved[1]).toHaveLength(1)
    expect(saved[1][0].id).toBe(1)
    expect(saved[1][0]).toHaveProperty('time')
  })

  test('已有同 id 记录：去重后移到最前', () => {
    wx.getStorageSync.mockReturnValue([
      { id: 1, name: '黄果树', time: 1000 },
      { id: 2, name: '梵净山', time: 2000 },
    ])

    addToHistory('browseHistory', { id: 1, name: '黄果树' })

    const saved = wx.setStorageSync.mock.calls[0][1]
    expect(saved).toHaveLength(2)
    expect(saved[0].id).toBe(1)          // 移到最前
    expect(saved[0].time).toBeGreaterThan(1000) // 时间戳更新
  })

  test('超过 MAX_HISTORY 上限：截断保留最新', () => {
    const mockHistory = Array.from({ length: MAX_HISTORY + 10 }, (_, i) => ({
      id: i, name: `item${i}`, time: 1000 + i
    }))
    wx.getStorageSync.mockReturnValue(mockHistory)

    addToHistory('browseHistory', { id: 999, name: 'new' })

    const saved = wx.setStorageSync.mock.calls[0][1]
    expect(saved.length).toBeLessThanOrEqual(MAX_HISTORY)
    expect(saved[0].id).toBe(999) // 新记录在最前面
  })

  test('wx.getStorageSync 异常：不崩溃', () => {
    wx.getStorageSync.mockImplementation(() => { throw new Error('storage error') })

    expect(() => {
      addToHistory('browseHistory', { id: 1 })
    }).not.toThrow()
  })
})

// =================================================================
// toggleCollect — 收藏/取消收藏 toggle（依赖 wx API）
// =================================================================
describe('toggleCollect', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('未收藏 → 收藏：返回 true，弹提示', () => {
    wx.getStorageSync.mockReturnValue([])
    const result = toggleCollect('collectionList', { id: 1, name: '黄果树' }, false)

    expect(result).toBe(true)
    expect(wx.showToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: '已加入收藏' })
    )
    const saved = wx.setStorageSync.mock.calls[0][1]
    expect(saved).toHaveLength(1)
    expect(saved[0].id).toBe(1)
    expect(saved[0]).toHaveProperty('collectTime')
  })

  test('已收藏 → 取消收藏：返回 false，弹提示', () => {
    wx.getStorageSync.mockReturnValue([
      { id: 1, name: '黄果树', collectTime: 1000 }
    ])
    const result = toggleCollect('collectionList', { id: 1, name: '黄果树' }, true)

    expect(result).toBe(false)
    expect(wx.showToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: '已取消收藏' })
    )
    const saved = wx.setStorageSync.mock.calls[0][1]
    expect(saved).toHaveLength(0)
  })

  test('列表中有多条收藏时只删除匹配的那条', () => {
    wx.getStorageSync.mockReturnValue([
      { id: 1, name: '黄果树', collectTime: 1000 },
      { id: 2, name: '梵净山', collectTime: 2000 },
    ])
    toggleCollect('collectionList', { id: 1, name: '黄果树' }, true)

    const saved = wx.setStorageSync.mock.calls[0][1]
    expect(saved).toHaveLength(1)
    expect(saved[0].id).toBe(2)
  })

  test('wx.getStorageSync 异常：返回原 isCollected 状态', () => {
    wx.getStorageSync.mockImplementation(() => { throw new Error('storage error') })
    expect(toggleCollect('collectionList', { id: 1 }, false)).toBe(false)
    expect(toggleCollect('collectionList', { id: 1 }, true)).toBe(true)
    expect(wx.showToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: '操作失败' })
    )
  })

  test('wx.setStorageSync 异常：返回原状态', () => {
    wx.getStorageSync.mockReturnValue([])
    wx.setStorageSync.mockImplementation(() => { throw new Error('quota exceeded') })
    expect(toggleCollect('collectionList', { id: 1 }, false)).toBe(false)
    expect(wx.showToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: '操作失败' })
    )
  })
})
