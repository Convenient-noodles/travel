# 千游 - 智慧文旅平台

> 基于 **微信小程序 + Vue3 管理后台 + Spring Boot 后端** 的智慧文旅综合服务平台，集景区导览、酒店预订、美食推荐、订单管理于一体，为游客和管理者提供一站式文旅解决方案。

---

## 项目截图

### 管理后台
| 登录页 | 仪表盘 |
|:---:|:---:|
| ![登录](screenshots/01-login.png) | ![仪表盘](screenshots/02-dashboard.png) |

| 景区管理 | 酒店管理 | 订单管理 |
|:---:|:---:|:---:|
| ![景区](screenshots/03-scenic-management.png) | ![酒店](screenshots/04-hotel-management.png) | ![订单](screenshots/05-order-management.png) |

---

## 系统架构

```mermaid
graph TB
    subgraph "前端层"
        A[微信小程序]
    end

    subgraph "管理端"
        B[Vue3 + Element Plus 后台]
    end

    subgraph "后端层"
        C[Spring Boot 3 REST API]
        D[JWT 身份认证]
        E[MyBatis ORM]
    end

    subgraph "数据层"
        F[(MySQL 8.0)]
        G[文件存储 uploads/]
    end

    subgraph "第三方服务"
        H[地图 API]
        I[支付/短信]
    end

    A -->|HTTP/HTTPS| C
    B -->|HTTP/HTTPS| C
    C --> D
    C --> E
    E --> F
    C --> G
    A --> H
    A --> I
    C --> I
```

## 核心功能模块

```mermaid
graph LR
    subgraph "用户端（微信小程序）"
        A[景区浏览] --> A1[景区详情]
        A --> A2[在线预订]
        A --> A3[地图导航]
        B[酒店预订] --> B1[酒店列表]
        B --> B2[房型选择]
        B --> B3[在线下单]
        C[美食推荐] --> C1[美食列表]
        C --> C2[特色推荐]
    end

    subgraph "管理端（Vue3 后台）"
        D[景区管理]
        E[酒店管理]
        F[订单管理]
        G[用户管理]
    end

    subgraph "公共服务"
        H[地图导航]
        I[支付服务]
        J[短信通知]
        K[图片存储]
    end
```

## 技术架构详情

```mermaid
graph TB
    subgraph "前端层"
        A[微信小程序]
        B[Vue3 Admin]
        C[Element Plus]
        D[ECharts]
        E[Axios]
        F[Pinia]
        G[Vite]
        H[Sass]
    end

    subgraph "后端层"
        I[Spring Boot]
        J[MyBatis]
        K[JWT]
    end

    subgraph "数据层"
        L[MySQL 8.0]
        M[Redis]
        N[文件存储]
        O[OSS]
        P[Nginx]
    end
```

## 数据库 ER 图

```mermaid
erDiagram
    AdminUser {
        int id PK
        varchar username
        varchar password
        varchar nickname
        varchar avatar
        datetime create_time
    }
    ScenicSpot {
        int id PK
        varchar name
        int region_id FK
        text description
        decimal price
        varchar address
        decimal latitude
        decimal longitude
        varchar images
        int status
    }
    Hotel {
        int id PK
        varchar name
        int region_id FK
        text description
        varchar address
        decimal price
        varchar images
        int status
    }
    Food {
        int id PK
        varchar name
        int region_id FK
        text description
        decimal price
        varchar images
        int status
    }
    Order {
        int id PK
        varchar openid
        int scenic_id FK
        int hotel_id FK
        int food_id FK
        decimal total_price
        varchar status
        varchar pay_type
        datetime create_time
    }
    Booking {
        int id PK
        varchar openid
        int hotel_id FK
        date check_in
        date check_out
        varchar status
        int num_rooms
        datetime create_time
    }
    Region {
        int id PK
        varchar name
        varchar description
        varchar image
    }
    Banner {
        int id PK
        varchar title
        varchar image_url
        varchar link_url
        int sort_order
        int status
    }
    ScenicSpot }o--|| Region : "所属地区"
    Hotel }o--|| Region : "所属地区"
    Food }o--|| Region : "所属地区"
    Order }o--o| ScenicSpot : "关联景区"
    Order }o--o| Hotel : "关联酒店"
    Order }o--o| Food : "关联美食"
    Booking }o--|| Hotel : "预订酒店"
```

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| **用户端** | 微信小程序原生开发 | 20+ 页面覆盖文旅全场景 |
| **管理后台** | Vue 3 + Element Plus + Pinia + ECharts | SPA 应用，Vite 构建 |
| **后端** | Spring Boot 3 + MyBatis | RESTful API，16 个 Controller |
| **数据库** | MySQL 8.0 | 14 张数据表 |
| **安全** | JWT + BCrypt | 身份认证与权限管理 |
| **支付** | 微信支付 API | 支持小程序内支付 |
| **地图** | 腾讯/高德地图 API | 景区导航与位置服务 |

## 项目结构

```
wx--s/
├── pages/                    # 小程序页面
│   ├── index/                # 首页/景区推荐
│   ├── discover/             # 发现页/攻略
│   ├── search/               # 搜索
│   ├── list/                 # 景点列表
│   ├── scenic-detail/        # 景点详情
│   ├── navigation/           # 导航
│   ├── my/                   # 个人中心
│   ├── my-orders/            # 我的订单
│   ├── my-bookings/          # 我的预订
│   ├── login/                # 登录
│   ├── feedback/             # 意见反馈
│   └── history/              # 浏览历史
├── packageDetail/            # 套餐详情分包
├── packageFood/              # 美食分包
├── packageHotel/             # 酒店分包
├── utils/                    # 工具函数
├── admin-vue/                # Vue3 管理后台
│   ├── src/api/              # API 接口（14个模块）
│   └── src/views/            # 页面视图（16个页面）
└── backend/                  # Spring Boot 后端
    └── src/main/java/com/example/tourism/
        ├── controller/       # 15 个 Controller
        ├── service/          # 业务逻辑层
        ├── mapper/           # MyBatis Mapper
        ├── entity/           # 14 个实体类
        └── config/           # 配置（JWT/CORS等）
```

## 快速开始

### 后端

```bash
cd backend
# 创建数据库
mysql -u root -p -e "CREATE DATABASE tourism_db DEFAULT CHARSET utf8mb4;"
# 导入SQL
mysql -u root -p tourism_db < query
# 启动
mvn spring-boot:run
```

### 管理后台

```bash
cd admin-vue
npm install
npm run dev
# 访问 http://localhost:3000
```

### 微信小程序

1. 下载微信开发者工具
2. 导入项目 `wx--s/`
3. 配置 AppID
4. 编译运行

## 项目统计

- **Controller**: 15 个
- **API 接口**: 60+ 个 RESTful 接口
- **数据表**: 14 张
- **小程序页面**: 20+ 个
- **后台页面**: 16 个
- **代码量**: 约 15,000+ 行

## 核心特性

- ✅ JWT 身份认证 + BCrypt 密码加密
- ✅ 基于微信 openid 的用户体系
- ✅ 景区、酒店、美食全流程管理
- ✅ 小程序内在线支付
- ✅ 地图导航与位置服务
- ✅ 短信验证码通知
- ✅ ECharts 数据可视化仪表盘
- ✅ 图片上传与管理

## 开源协议

MIT