/**
 * 公共工具函数模块
 * 消除 validateImageUrl / fixImageUrl / getFirstTag / calcDistance
 * addToHistory / toggleCollect / parseTags 在多个页面中的重复定义
 */
const IMAGE_BASE = 'http://localhost:8080'
const MAX_HISTORY = 100

// ==================== 图片处理 ====================

const validateImageUrl = (url) => {
  if (!url || url.startsWith('blob:') || url.startsWith('data:')) {
    return '/images/a1.jpg'
  }
  return url
}

const fixImageUrl = (url) => {
  if (!url) return '/images/a1.jpg'
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  return IMAGE_BASE + url
}

// ==================== 标签解析 ====================

const getFirstTag = (tags) => {
  if (!tags) return ''
  if (typeof tags === 'string') {
    try {
      const parsed = JSON.parse(tags)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed[0]
      }
    } catch (e) {
      return tags
    }
  }
  if (Array.isArray(tags) && tags.length > 0) {
    return tags[0]
  }
  return ''
}

/**
 * 统一标签解析：支持 JSON 字符串、逗号分隔字符串、数组
 * 消除 5 处不同变体的 parseTags 实现
 */
const parseTags = (tags) => {
  if (!tags) return []
  if (Array.isArray(tags)) return tags
  if (typeof tags === 'string') {
    try {
      const parsed = JSON.parse(tags)
      if (Array.isArray(parsed)) return parsed
      return tags.split(/[,，、]/).filter(Boolean)
    } catch (e) {
      return tags.split(/[,，、]/).filter(Boolean)
    }
  }
  return []
}

// ==================== 地理计算 ====================

const toRad = (deg) => (deg * Math.PI) / 180

/**
 * Haversine 距离计算（两个坐标点）
 * 消除 navigation.js 和 hotel-detail.js 中的重复实现
 * @param {{ latitude: number, longitude: number }} from
 * @param {{ latitude: number, longitude: number }} to
 * @returns {Object} { km: number, m: number, speed: { walk: string, drive: string, transit: string } }
 */
const calcDistance = (from, to) => {
  if (!from || !to || !from.latitude || !from.longitude || !to.latitude || !to.longitude) {
    return { km: 0, m: 0, speed: { walk: '未知', drive: '未知', transit: '未知' } }
  }
  const R = 6371
  const dLat = toRad(to.latitude - from.latitude)
  const dLon = toRad(to.longitude - from.longitude)
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.latitude)) * Math.cos(toRad(to.latitude)) * Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const km = R * c
  const m = Math.round(km * 1000)

  const walkMin = Math.ceil((km / 5) * 60)
  const driveMin = Math.ceil((km / 40) * 60)
  const transitMin = Math.ceil((km / 25) * 60)

  return {
    km: parseFloat(km.toFixed(2)),
    m,
    speed: {
      walk: walkMin >= 60 ? `${Math.floor(walkMin / 60)}小时${walkMin % 60}分钟` : `${walkMin}分钟`,
      drive: driveMin >= 60 ? `${Math.floor(driveMin / 60)}小时${driveMin % 60}分钟` : `${driveMin}分钟`,
      transit: transitMin >= 60 ? `${Math.floor(transitMin / 60)}小时${transitMin % 60}分钟` : `${transitMin}分钟`
    }
  }
}

// ==================== 浏览历史 ====================

/**
 * 添加浏览历史（去重 + 上限控制）
 * 消除 scenic-detail、strategy-detail、food-detail 中的重复实现
 * @param {string} key - 存储键名
 * @param {Object} item - 要保存的记录
 */
const addToHistory = (key, item) => {
  try {
    let history = wx.getStorageSync(key) || []
    history = history.filter(h => h.id !== item.id)
    history.unshift({ ...item, time: Date.now() })
    if (history.length > MAX_HISTORY) history = history.slice(0, MAX_HISTORY)
    wx.setStorageSync(key, history)
  } catch (e) {
    console.error('[common] 保存历史记录失败:', e)
  }
}

// ==================== 收藏切换 ====================

/**
 * 收藏/取消收藏 toggle
 * 消除 4 处独立实现的 collection toggle 逻辑
 * @param {string} key - 存储键名
 * @param {Object} item - 收藏项（必须含 id）
 * @param {boolean} isCollected - 当前是否已收藏
 * @returns {boolean} 切换后的收藏状态
 */
const toggleCollect = (key, item, isCollected) => {
  try {
    let list = wx.getStorageSync(key) || []
    if (isCollected) {
      list = list.filter(c => c.id !== item.id)
      wx.showToast({ title: '已取消收藏', icon: 'none' })
      wx.setStorageSync(key, list)
      return false
    } else {
      list.push({ ...item, collectTime: Date.now() })
      wx.showToast({ title: '已加入收藏', icon: 'success' })
      wx.setStorageSync(key, list)
      return true
    }
  } catch (e) {
    console.error('[common] 收藏操作失败:', e)
    wx.showToast({ title: '操作失败', icon: 'none' })
    return isCollected
  }
}

module.exports = {
  validateImageUrl, fixImageUrl, getFirstTag, parseTags,
  toRad, calcDistance, addToHistory, toggleCollect,
  MAX_HISTORY, IMAGE_BASE
}
