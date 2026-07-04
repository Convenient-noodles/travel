# 🏔️ 带你黔游 — 智慧文旅综合服务平台

> 基于 **微信小程序 + Vue3 管理后台 + Spring Boot 后端** 的智慧文旅平台，集景区导览、酒店预订、美食推荐、红色旅游、订单管理于一体，为游客和管理者提供一站式文旅解决方案。

---

## 📖 目录

- [系统架构](#系统架构)
- [功能模块](#功能模块)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [快速开始](#快速开始)
- [API 接口](#api-接口)
- [数据库设计](#数据库设计)
- [项目统计](#项目统计)

---

## 系统架构

```
┌─────────────────────────────────────────────────┐
│                   前端层                          │
│  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ 微信小程序     │  │ Vue3 管理后台             │  │
│  │ (原生开发)     │  │ (Element Plus + Pinia)   │  │
│  └──────┬───────┘  └───────────┬──────────────┘  │
│         │                      │                  │
└─────────┼──────────────────────┼──────────────────┘
          │    HTTP / HTTPS      │
          ▼                      ▼
┌─────────────────────────────────────────────────┐
│                   后端层                          │
│  ┌──────────────────────────────────────────┐   │
│  │     Spring Boot 3.2 RESTful API           │   │
│  │  ┌──────┐ ┌────────┐ ┌────────────────┐  │   │
│  │  │ JWT  │ │ 15 个  │ │ 文件上传/图片   │  │   │
│  │  │ 鉴权  │ │Controller│ │ 存储服务      │  │   │
│  │  └──────┘ └────────┘ └────────────────┘  │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│                   数据层                          │
│  ┌──────────┐  ┌───────────┐  ┌──────────────┐  │
│  │ MySQL 8  │  │ 文件存储   │  │ 第三方服务    │  │
│  │ 14 张表  │  │ uploads/  │  │ 地图/支付/短信 │  │
│  └──────────┘  └───────────┘  └──────────────┘  │
└─────────────────────────────────────────────────┘
```

---

## 功能模块

### 🎯 用户端（微信小程序）

| 模块 | 功能 | 页面数 |
|------|------|--------|
| 🏞️ 景区导览 | 景区列表、详情、在线预订、地图导航 | 4 |
| 🏨 酒店预订 | 酒店搜索、房型选择、在线下单、支付 | 3 |
| 🍜 美食推荐 | 美食列表、详情、特色推荐 | 2 |
| 🎨 文化体验 | 非遗文化、民俗活动详情 | 1 |
| 🔴 红色旅游 | 红色景点、革命历史介绍 | 1 |
| 🗺️ 旅游攻略 | 攻略列表、详情浏览 | 1 |
| 🚌 旅游路线 | 推荐路线、路线详情 | 1 |
| 👤 个人中心 | 订单管理、预订管理、收藏、浏览历史 | 6 |
| 🔍 其他 | 搜索、导航、意见反馈、关于 | 4 |

### 🖥️ 管理端（Vue3 后台）

| 模块 | 功能 |
|------|------|
| 📊 数据仪表盘 | 订单统计、收入概览、数据可视化（ECharts） |
| 🏞️ 景区管理 | 景区信息增删改查、上下架管理 |
| 🏨 酒店管理 | 酒店信息、房型配置、支付设置 |
| 🍜 美食管理 | 美食信息维护 |
| 🎨 文化体验管理 | 非遗/文化活动管理 |
| 🔴 红色旅游管理 | 红色景点信息维护 |
| 🗺️ 攻略管理 | 旅游攻略编辑发布 |
| 🚌 路线管理 | 旅游路线规划管理 |
| 🖼️ 轮播图管理 | 首页 Banner 配置 |
| 📋 订单管理 | 所有订单查看、状态处理 |
| 📅 预订管理 | 酒店预订审核管理 |
| 👥 用户管理 | 管理员账号管理 |
| ⚙️ 系统配置 | 系统参数设置 |
| 📝 操作日志 | 管理员操作记录 |

---

## 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| **小程序端** | 微信小程序原生 + 腾讯地图 SDK | — |
| **管理后台** | Vue 3 + Element Plus + Pinia + ECharts + Vite | Vue 3.4 |
| **后端框架** | Spring Boot + MyBatis | Spring Boot 3.2.5 |
| **数据库** | MySQL | 8.0 |
| **安全认证** | JWT (jjwt) + BCrypt 密码加密 | jjwt 0.12.3 |
| **构建工具** | Maven (后端) + Vite (前端) | — |
| **语言** | Java 21 + JavaScript (ES6+) | Java 21 |

---

## 项目结构

```
wx--s/
│
├── 📱 微信小程序（主包）
│   ├── pages/                     # 主包页面（14个页面）
│   │   ├── index/                 # 首页 - 景区推荐
│   │   ├── discover/              # 发现 - 攻略/文化/红色旅游
│   │   ├── list/                  # 景区列表
│   │   ├── scenic-detail/         # 景区详情 + 预订
│   │   ├── search/                # 全局搜索
│   │   ├── navigation/            # 地图导航
│   │   ├── login/                 # 微信登录
│   │   ├── my/                    # 个人中心
│   │   ├── my-orders/             # 我的订单
│   │   ├── my-bookings/           # 我的预订
│   │   ├── collection/            # 我的收藏
│   │   ├── history/               # 浏览历史
│   │   ├── feedback/              # 意见反馈
│   │   └── about/                 # 关于我们
│   ├── app.js / app.json / app.wxss  # 小程序入口
│   ├── utils/                     # 工具函数（API请求、日期、地图SDK）
│   └── images/                    # 静态图片资源
│
├── 📦 小程序分包
│   ├── packageDetail/pages/       # 详情分包（攻略/文化/红色/路线）
│   ├── packageFood/pages/         # 美食分包（列表/详情）
│   └── packageHotel/pages/        # 酒店分包（列表/详情/支付）
│
├── 🖥️ admin-vue/                  # Vue3 管理后台
│   ├── src/
│   │   ├── api/                   # 14个 API 模块
│   │   ├── views/                 # 16个业务页面
│   │   ├── layout/                # 布局组件
│   │   ├── router/                # 路由配置
│   │   ├── stores/                # Pinia 状态管理
│   │   └── styles/                # 全局样式
│   └── vite.config.js
│
└── ⚙️ backend/                    # Spring Boot 后端
    ├── src/main/java/com/example/tourism/
    │   ├── controller/            # 15个 REST Controller
    │   ├── service/               # 业务逻辑层 + 实现
    │   ├── mapper/                # MyBatis Mapper 接口
    │   ├── entity/                # 14个数据实体
    │   ├── dto/                   # 数据传输对象
    │   ├── config/                # Spring 配置（JWT/CORS/拦截器）
    │   ├── util/                  # 工具类（JWT/MD5/响应封装）
    │   └── exception/             # 全局异常处理
    ├── src/main/resources/
    │   ├── mapper/                # MyBatis XML（14个）
    │   ├── sql/                   # 数据库初始化 SQL
    │   └── application.yml        # 应用配置
    └── pom.xml                    # Maven 依赖
```

---

## 快速开始

### 环境要求

| 工具 | 版本要求 |
|------|----------|
| JDK | 17+ (推荐 21) |
| Maven | 3.6+ |
| Node.js | 18+ |
| MySQL | 8.0+ |
| 微信开发者工具 | 最新稳定版 |

### 1. 后端启动

```bash
cd backend

# 创建数据库
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS tourism_db DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 导入初始数据（表结构 + 基础数据）
mysql -u root -p tourism_db < query

# 修改 application.yml 中的数据库连接信息
# spring.datasource.url=jdbc:mysql://localhost:3306/tourism_db
# spring.datasource.username=你的数据库用户名
# spring.datasource.password=你的数据库密码

# 编译并启动（默认端口 8080）
mvn spring-boot:run
```

### 2. 管理后台启动

```bash
cd admin-vue

# 安装依赖
npm install

# 启动开发服务器（默认端口 3000）
npm run dev

# 生产构建
npm run build
```

访问 `http://localhost:3000`，默认管理员账号见数据库初始化脚本。

### 3. 微信小程序启动

1. 下载 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 导入项目，选择 `wx--s/` 根目录
3. 在 `project.config.json` 中填写你的 AppID
4. 在 `utils/request.js` 中修改后端 API 地址
5. 编译运行

---

## API 接口

后端共 **15 个 Controller**，提供 **60+** RESTful 接口：

| Controller | 路径前缀 | 说明 |
|------------|----------|------|
| AdminUserController | `/api/admin/*` | 管理员登录与账号管理 |
| ScenicSpotController | `/api/scenic/*` | 景区增删改查 |
| HotelController | `/api/hotel/*` | 酒店管理 |
| FoodController | `/api/food/*` | 美食管理 |
| CultureExperienceController | `/api/culture/*` | 文化体验管理 |
| RedTourismController | `/api/red-tourism/*` | 红色旅游管理 |
| StrategyController | `/api/strategy/*` | 旅游攻略管理 |
| TourRouteController | `/api/route/*` | 旅游路线管理 |
| BannerController | `/api/banner/*` | 轮播图管理 |
| OrderController | `/api/order/*` | 订单管理 |
| BookingController | `/api/booking/*` | 酒店预订管理 |
| RegionController | `/api/region/*` | 地区管理 |
| DashboardController | `/api/dashboard/*` | 数据仪表盘 |
| SystemConfigController | `/api/config/*` | 系统配置 |
| UploadController | `/api/upload/*` | 图片上传 |

> 除登录接口外，所有管理端接口均需携带 JWT Token 进行身份验证。

---

## 数据库设计

### 核心数据表（14 张）

| 表名 | 说明 | 主要字段 |
|------|------|----------|
| `admin_user` | 管理员账号 | username, password(BCrypt), nickname, avatar |
| `scenic_spot` | 景区信息 | name, region_id, description, price, lat/lng, images |
| `hotel` | 酒店信息 | name, region_id, address, price, facilities, images |
| `food` | 美食信息 | name, region_id, description, price, images |
| `culture_experience` | 文化体验 | name, description, type, images |
| `red_tourism_site` | 红色景点 | name, description, historical_significance, images |
| `strategy` | 旅游攻略 | title, content, author, images |
| `tour_route` | 旅游路线 | name, spots, duration, price |
| `order` | 订单记录 | openid, scenic_id/hotel_id/food_id, total_price, status, pay_type |
| `booking` | 酒店预订 | openid, hotel_id, check_in, check_out, status, num_rooms |
| `region` | 地区信息 | name, description, image |
| `banner` | 轮播图 | title, image_url, link_url, sort_order |
| `system_config` | 系统配置 | config_key, config_value |
| `operation_log` | 操作日志 | admin_id, action, target, create_time |

---

## 项目统计

| 指标 | 数量 |
|------|------|
| 微信小程序页面 | 20+ |
| 管理后台页面 | 16 |
| 后端 Controller | 15 |
| REST API 接口 | 60+ |
| 数据库表 | 14 |
| 代码总量 | 约 15,000+ 行 |

---

## 核心特性

- ✅ **JWT 身份认证** — 无状态鉴权，BCrypt 密码加密存储
- ✅ **微信 openid 用户体系** — 基于微信登录的用户识别
- ✅ **景区/酒店/美食全流程** — 浏览 → 详情 → 预订 → 支付
- ✅ **小程序分包加载** — 优化首屏加载速度，支持预加载
- ✅ **ECharts 数据可视化** — 仪表盘实时展示运营数据
- ✅ **图片上传管理** — 支持多图上传与存储
- ✅ **地图导航** — 集成腾讯地图 SDK，实时导航到景区
- ✅ **操作日志** — 管理员操作全程记录可追溯
- ✅ **全局异常处理** — 统一错误响应格式
- ✅ **CORS 跨域支持** — 前后端分离部署无障碍

---

## 开源协议

MIT License
