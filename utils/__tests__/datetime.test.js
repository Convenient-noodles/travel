/**
 * utils/datetime.js — 单元测试
 * 覆盖函数：formatDate, formatDateTime, formatRelativeTime
 */
const { formatDate, formatDateTime, formatRelativeTime } = require('../datetime')

// =================================================================
// formatDate — 格式化为 yyyy-MM-dd
// =================================================================
describe('formatDate', () => {
  test('Date 对象：返回 yyyy-MM-dd 格式', () => {
    expect(formatDate(new Date('2026-06-28'))).toBe('2026-06-28')
  })

  test('ISO 日期字符串：正确解析', () => {
    expect(formatDate('2026-01-05')).toBe('2026-01-05')
  })

  test('时间戳：正确格式化', () => {
    const d = new Date('2026-12-31')
    expect(formatDate(d.getTime())).toBe('2026-12-31')
  })

  test('跨月日期：正确补零', () => {
    expect(formatDate(new Date('2026-03-09'))).toBe('2026-03-09')
  })

  test('空值 null：返回空字符串', () => {
    expect(formatDate(null)).toBe('')
  })

  test('空值 undefined：返回空字符串', () => {
    expect(formatDate(undefined)).toBe('')
  })

  test('空字符串：返回空字符串', () => {
    expect(formatDate('')).toBe('')
  })

  test('无效日期字符串：返回空字符串', () => {
    expect(formatDate('not-a-date')).toBe('')
  })

  test('Invalid Date 对象：返回空字符串', () => {
    expect(formatDate(new Date('invalid'))).toBe('')
  })
})

// =================================================================
// formatDateTime — 格式化为 yyyy-MM-dd HH:mm
// =================================================================
describe('formatDateTime', () => {
  test('Date 对象：返回完整日期时间', () => {
    const d = new Date('2026-06-28T16:10:00')
    expect(formatDateTime(d)).toBe('2026-06-28 16:10')
  })

  test('时间部分正确补零（个位数分钟）', () => {
    const d = new Date('2026-01-01T08:05:00')
    expect(formatDateTime(d)).toBe('2026-01-01 08:05')
  })

  test('时间部分正确补零（个位数小时）', () => {
    const d = new Date('2026-01-01T00:00:00')
    expect(formatDateTime(d)).toBe('2026-01-01 00:00')
  })

  test('午夜时间', () => {
    const d1 = new Date('2026-06-28T00:00:00')
    expect(formatDateTime(d1)).toBe('2026-06-28 00:00')
  })

  test('ISO 字符串：正确解析', () => {
    expect(formatDateTime('2026-12-25T23:59:00')).toBe('2026-12-25 23:59')
  })

  test('空值 null：返回空字符串', () => {
    expect(formatDateTime(null)).toBe('')
  })

  test('空值 undefined：返回空字符串', () => {
    expect(formatDateTime(undefined)).toBe('')
  })

  test('空字符串：返回空字符串', () => {
    expect(formatDateTime('')).toBe('')
  })

  test('无效日期：返回空字符串', () => {
    expect(formatDateTime('abc')).toBe('')
  })
})

// =================================================================
// formatRelativeTime — 相对时间描述
// =================================================================
describe('formatRelativeTime', () => {
  test('刚刚：小于 60 秒', () => {
    const justNow = Date.now() - 30 * 1000
    expect(formatRelativeTime(justNow)).toBe('刚刚')
  })

  test('刚刚：0 秒前', () => {
    expect(formatRelativeTime(Date.now())).toBe('刚刚')
  })

  test('X 分钟前：1-59 分钟', () => {
    const fiveMinAgo = Date.now() - 5 * 60 * 1000
    expect(formatRelativeTime(fiveMinAgo)).toBe('5分钟前')
  })

  test('X 分钟前：边界 59 分钟', () => {
    const almostHour = Date.now() - 59 * 60 * 1000
    expect(formatRelativeTime(almostHour)).toBe('59分钟前')
  })

  test('X 小时前：1-23 小时', () => {
    const threeHoursAgo = Date.now() - 3 * 3600 * 1000
    expect(formatRelativeTime(threeHoursAgo)).toBe('3小时前')
  })

  test('X 天前：1-6 天', () => {
    const twoDaysAgo = Date.now() - 2 * 86400 * 1000
    expect(formatRelativeTime(twoDaysAgo)).toBe('2天前')
  })

  test('X 天前：边界 6 天', () => {
    const sixDaysAgo = Date.now() - 6 * 86400 * 1000
    expect(formatRelativeTime(sixDaysAgo)).toBe('6天前')
  })

  test('X 周前：7 天及以上', () => {
    const tenDaysAgo = Date.now() - 10 * 86400 * 1000
    expect(formatRelativeTime(tenDaysAgo)).toBe('1周前')
  })

  test('超过 4 周：显示具体日期', () => {
    const oldDate = new Date('2026-01-15')
    const result = formatRelativeTime(oldDate.getTime())
    // 超过 4 周 → 返回 formatDate 的结果
    expect(result).toBe('2026-01-15')
  })

  test('空值 null：返回空字符串', () => {
    expect(formatRelativeTime(null)).toBe('')
  })

  test('空值 undefined：返回空字符串', () => {
    expect(formatRelativeTime(undefined)).toBe('')
  })

  test('空字符串：返回空字符串', () => {
    expect(formatRelativeTime('')).toBe('')
  })
})
