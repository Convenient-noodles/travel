/**
 * 安全区域计算工具
 * 消除 7 处重复的 safeAreaTop 计算逻辑：
 *   discover、history、about、scenic-detail、culture-detail、red-detail、strategy-detail
 *
 * 用法：
 *   const { getSafeArea } = require('../../utils/safe-area')
 *   this.setData(getSafeArea())
 */
const getSafeArea = () => {
  let safeAreaTop = 0
  let navBarHeight = 0
  let contentTop = 0

  // 优先使用新版 API
  try {
    if (typeof wx.getWindowInfo === 'function') {
      const windowInfo = wx.getWindowInfo()
      if (windowInfo) {
        const safeAreaTopPx = windowInfo.safeArea?.top || windowInfo.statusBarHeight || 0
        safeAreaTop = Math.round(safeAreaTopPx * 2)
        navBarHeight = safeAreaTop + 88
        contentTop = safeAreaTop + 88 + 88
      }
    }
  } catch (e) {
    console.log('[safe-area] getWindowInfo not available')
  }

  // 降级到旧版 API
  if (safeAreaTop === 0) {
    try {
      const systemInfo = wx.getSystemInfoSync()
      if (systemInfo) {
        const safeAreaTopPx = systemInfo.safeArea?.top || systemInfo.statusBarHeight || 0
        safeAreaTop = Math.round(safeAreaTopPx * 2)
        navBarHeight = safeAreaTop + 88
        contentTop = safeAreaTop + 88 + 88
      }
    } catch (e2) {
      console.log('[safe-area] getSystemInfoSync also failed, using defaults')
      safeAreaTop = 40
      navBarHeight = 128
      contentTop = 216
    }
  }

  return { safeAreaTop, navBarHeight, contentTop }
}

module.exports = { getSafeArea }
