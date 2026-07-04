-- ==========================================
-- 民俗体验预约表
-- ==========================================

DROP TABLE IF EXISTS `bookings`;

CREATE TABLE `bookings` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `culture_id` BIGINT NOT NULL COMMENT '体验项目ID',
  `culture_name` VARCHAR(100) DEFAULT '' COMMENT '体验项目名称',
  `culture_image` VARCHAR(255) DEFAULT '' COMMENT '项目头图',
  `location` VARCHAR(100) DEFAULT '' COMMENT '地点',
  `duration` VARCHAR(30) DEFAULT '' COMMENT '时长',
  `name` VARCHAR(50) DEFAULT '' COMMENT '预约人姓名',
  `phone` VARCHAR(20) DEFAULT '' COMMENT '联系电话',
  `book_date` VARCHAR(30) DEFAULT '' COMMENT '预约日期',
  `count` INT DEFAULT 1 COMMENT '预约人数',
  `status` VARCHAR(20) NOT NULL DEFAULT 'confirmed' COMMENT 'confirmed已确认,cancelled已取消',
  `user_openid` VARCHAR(64) DEFAULT '' COMMENT '用户OpenID',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `delete_time` DATETIME DEFAULT NULL COMMENT '删除时间(软删除)',
  PRIMARY KEY (`id`),
  KEY `idx_culture_id` (`culture_id`),
  KEY `idx_status` (`status`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='民俗体验预约表';
