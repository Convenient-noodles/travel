/**
 * utils/request.js — 单元测试
 * 覆盖函数：request
 */
const { request, BASE_URL } = require('../request')

// ========== Mock 微信 API ==========
global.wx = {
  request: jest.fn(),
}

describe('request', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ==================== 成功路径 ====================
  test('正确拼接 BASE_URL', () => {
    wx.request.mockImplementation((opts) => {
      expect(opts.url).toBe(BASE_URL + '/test/endpoint')
      opts.success({ statusCode: 200, data: { code: 200, data: { ok: true } } })
    })

    return request({ url: '/test/endpoint' }).then(res => {
      expect(res).toEqual({ code: 200, data: { ok: true } })
    })
  })

  test('默认方法为 GET', () => {
    wx.request.mockImplementation((opts) => {
      expect(opts.method).toBe('GET')
      opts.success({ statusCode: 200, data: { code: 200, data: {} } })
    })

    return request({ url: '/test' })
  })

  test('指定 POST 方法通过', () => {
    wx.request.mockImplementation((opts) => {
      expect(opts.method).toBe('POST')
      opts.success({ statusCode: 200, data: { code: 200, data: {} } })
    })

    return request({ url: '/test', method: 'POST' })
  })

  test('data 默认值为空对象', () => {
    wx.request.mockImplementation((opts) => {
      expect(opts.data).toEqual({})
      opts.success({ statusCode: 200, data: { code: 200, data: {} } })
    })

    return request({ url: '/test' })
  })

  test('data 正确传递', () => {
    wx.request.mockImplementation((opts) => {
      expect(opts.data).toEqual({ name: 'test', value: 123 })
      opts.success({ statusCode: 200, data: { code: 200, data: {} } })
    })

    return request({ url: '/test', data: { name: 'test', value: 123 } })
  })

  test('设置超时时间', () => {
    wx.request.mockImplementation((opts) => {
      expect(opts.timeout).toBe(20000)
      opts.success({ statusCode: 200, data: { code: 200, data: {} } })
    })

    return request({ url: '/test', timeout: 20000 })
  })

  test('默认超时为 15000ms', () => {
    wx.request.mockImplementation((opts) => {
      expect(opts.timeout).toBe(15000)
      opts.success({ statusCode: 200, data: { code: 200, data: {} } })
    })

    return request({ url: '/test' })
  })

  test('Content-Type 为 application/json', () => {
    wx.request.mockImplementation((opts) => {
      expect(opts.header['Content-Type']).toBe('application/json')
      opts.success({ statusCode: 200, data: { code: 200, data: {} } })
    })

    return request({ url: '/test' })
  })

  // ==================== 业务错误 ====================
  test('业务错误 code≠200：reject 带 message', () => {
    wx.request.mockImplementation((opts) => {
      opts.success({ statusCode: 200, data: { code: 400, message: '参数错误' } })
    })

    return expect(request({ url: '/test' })).rejects.toThrow('参数错误')
  })

  test('业务错误无 message：默认错误信息', () => {
    wx.request.mockImplementation((opts) => {
      opts.success({ statusCode: 200, data: { code: 500 } })
    })

    return expect(request({ url: '/test' })).rejects.toThrow('请求失败')
  })

  // ==================== 网络错误 ====================
  test('statusCode ≠ 200：reject 网络请求失败', () => {
    wx.request.mockImplementation((opts) => {
      opts.success({ statusCode: 404, data: null })
    })

    return expect(request({ url: '/test' })).rejects.toThrow('网络请求失败')
  })

  test('statusCode 500：reject 网络请求失败', () => {
    wx.request.mockImplementation((opts) => {
      opts.success({ statusCode: 500, data: null })
    })

    return expect(request({ url: '/test' })).rejects.toThrow('网络请求失败')
  })

  // ==================== 请求失败 ====================
  test('wx.request fail：reject 含 URL 和方法信息', () => {
    wx.request.mockImplementation((opts) => {
      opts.fail({ errMsg: 'request:fail timeout' })
    })

    return expect(request({ url: '/test' })).rejects.toThrow(
      '请求 GET /test 失败: request:fail timeout'
    )
  })

  test('wx.request fail 无 errMsg：使用默认文本', () => {
    wx.request.mockImplementation((opts) => {
      opts.fail({})
    })

    return expect(request({ url: '/data', method: 'PUT' })).rejects.toThrow(
      '请求 PUT /data 失败: 未知错误'
    )
  })
})
