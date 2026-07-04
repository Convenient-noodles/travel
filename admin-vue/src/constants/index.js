/**
 * 全局常量定义
 * 消除硬编码的地区列表、类型映射、状态映射、分页配置在多个文件中的重复
 */

// ==================== 贵州地区列表 ====================
// 消除 hotel/edit.vue、scenic/index.vue、hotel/index.vue 中的重复定义
export const GUIZHOU_REGIONS = [
  '贵阳', '遵义', '安顺', '毕节', '铜仁', '黔东南', '黔南'
]

// ==================== 酒店类型映射 ====================
// 消除 hotel/index.vue 和 hotel/edit.vue 中的重复定义
export const HOTEL_TYPE_MAP = {
  luxury: '豪华酒店',
  comfort: '舒适酒店',
  economy: '经济酒店',
  boutique: '精品民宿'
}
export const HOTEL_TYPE_OPTIONS = Object.entries(HOTEL_TYPE_MAP).map(([value, label]) => ({ value, label }))

// ==================== 订单状态映射 ====================
// 消除 order/index.vue 中的硬编码
export const ORDER_STATUS_MAP = {
  pending: '待支付',
  paid: '已支付',
  refunding: '退款申请中',
  refunded: '已退款'
}

// ==================== 上下架状态 ====================
export const STATUS_MAP = { 1: '上架', 0: '下架' }
export const RECOMMEND_MAP = { 1: '是', 0: '否' }

// ==================== 分页默认配置 ====================
// 消除各页面不一致的 pageSizes 定义
export const DEFAULT_PAGE_SIZES = [10, 20, 50, 100]
export const DEFAULT_PAGE_SIZE = 10

// ==================== 文件上传限制 ====================
export const UPLOAD_LIMITS = {
  maxImageSize: 5 * 1024 * 1024,       // 5MB
  maxQrSize: 2 * 1024 * 1024,          // 2MB
  validImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
}

// ==================== 食品分类 ====================
export const FOOD_CATEGORY_MAP = {
  special: '特色美食',
  snack: '风味小吃',
  hotpot: '贵州火锅',
  noodle: '粉面特色'
}

// ==================== 攻略分类 ====================
export const STRATEGY_CATEGORIES = ['攻略', '贴士', '公告', '文化']
