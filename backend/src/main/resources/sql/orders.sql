-- ==========================================
-- 酒店预订系统 - 订单表 & 收款码字段
-- 请逐条执行以下 SQL 语句
-- ==========================================

-- 1. 酒店表新增收款码字段（如果 hotels 表已存在）
ALTER TABLE hotels 
ADD COLUMN payment_qr_code VARCHAR(255) DEFAULT '' COMMENT '微信收款码图片URL' 
AFTER phone;

-- 2. 创建订单表
DROP TABLE IF EXISTS `orders`;

CREATE TABLE `orders` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `order_no` VARCHAR(30) NOT NULL COMMENT '订单编号',
  `hotel_id` BIGINT NOT NULL COMMENT '酒店ID',
  `hotel_name` VARCHAR(100) DEFAULT '' COMMENT '酒店名称',
  `hotel_image` VARCHAR(255) DEFAULT '' COMMENT '酒店头图',
  `room_name` VARCHAR(100) DEFAULT '' COMMENT '房型名称',
  `amount` DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '订单金额',
  `name` VARCHAR(50) DEFAULT '' COMMENT '入住人姓名',
  `phone` VARCHAR(20) DEFAULT '' COMMENT '联系电话',
  `check_in_date` DATETIME DEFAULT NULL COMMENT '入住时间',
  `check_out_date` DATETIME DEFAULT NULL COMMENT '退房时间',
  `nights` INT DEFAULT 1 COMMENT '入住晚数',
  `status` VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT 'pending待支付,paid已支付,refunded已退款',
  `user_openid` VARCHAR(64) DEFAULT '' COMMENT '用户OpenID',
  `pay_time` VARCHAR(30) DEFAULT '' COMMENT '支付时间',
  `refund_time` VARCHAR(30) DEFAULT '' COMMENT '退款时间',
  `refund_amount` DECIMAL(10,2) DEFAULT NULL COMMENT '退款金额',
  `refund_reason` VARCHAR(255) DEFAULT '' COMMENT '退款原因',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `delete_time` DATETIME DEFAULT NULL COMMENT '删除时间(软删除)',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_no` (`order_no`),
  KEY `idx_hotel_id` (`hotel_id`),
  KEY `idx_status` (`status`),
  KEY `idx_user_openid` (`user_openid`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='酒店预订订单表';
