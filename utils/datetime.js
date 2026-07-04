/**
 * 日期时间工具模块
 * 消除 6 处重复的 formatDate/formatDateTime/formatTime 函数
 * 消除 discover、hotel-detail、hotel-payment、culture-detail、history、collection 中的独立实现
 */
const pad = (n) => String(n).padStart(2, '0')

/** 格式化日期：2026-06-28 */
const formatDate = (date) => {
  if (!date) return ''
  const d = date instanceof Date ? date : new Date(date)
  if (isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** 格式化日期时间：2026-06-28 16:10 */
const formatDateTime = (date) => {
  if (!date) return ''
  const d = date instanceof Date ? date : new Date(date)
  if (isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** 相对时间：刚刚 / X分钟前 / X小时前 / X天前 / X周前 / 超过1周显示日期 */
const formatRelativeTime = (timestamp) => {
  if (!timestamp) return ''
  const now = Date.now()
  const diff = now - new Date(timestamp).getTime()
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return '刚刚'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}小时前`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}天前`
  const weeks = Math.floor(days / 7)
  if (weeks < 4) return `${weeks}周前`
  return formatDate(timestamp)
}

module.exports = { formatDate, formatDateTime, formatRelativeTime }
