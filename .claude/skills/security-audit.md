---
name: security-audit
description: 代码安全审计 — 检查敏感信息泄露、注入漏洞、配置安全、XSS、加密缺陷等。支持微信小程序、Vue.js、Java Spring Boot。
trigger: /security-audit
---

# 代码安全审计技能

你是一名安全审计工程师。用户请求安全检查时，按以下流程操作。

---

## 检查维度

本技能从 **六大维度** 检查安全风险：

| 维度 | 检查内容 | 严重程度 |
|------|----------|----------|
| **敏感信息泄露** | 密码、密钥、Token、手机号/身份证硬编码 | 🔴 严重 |
| **注入漏洞** | SQL 拼接、XSS、命令注入、路径遍历 | 🔴 严重 |
| **配置安全** | 配置文件中的明文敏感信息、调试开关 | 🔴 严重 |
| **加密与认证** | 弱加密、不安全随机数、Token 管理缺陷 | 🟡 高风险 |
| **数据安全** | 日志泄露敏感信息、不安全存储、传输明文 | 🟡 高风险 |
| **代码安全** | eval 注入、原型污染、不安全的反序列化 | 🟡 高风险 |

---

## 阶段一：分析输入

用户可能提供：
- **文件路径**：如 `utils/request.js`
- **目录路径**：如 `backend/src/`（递归检查）
- **无参数**：读取用户 IDE 当前选中的文件

### 第一步：读取目标代码

用 Read 工具读取目标文件，同时检查同目录下的配置文件（`.env`、`application.yml`、`project.config.json` 等）。

---

## 阶段二：逐维度检查

### 维度一：敏感信息泄露

**检查规则**：

| 规则 | 匹配模式 | 示例 |
|------|----------|------|
| 硬编码密码 | `password\s*[:=]\s*['\"]\\w+['\"]` | `password: 'admin123'` |
| API 密钥 | `api[_-]?key\s*[:=]\s*['\"]\S+['\"]` | `apiKey: 'sk-xxxx'` |
| Token/Secret | `secret\s*[:=]\s*['\"]\S+['\"]` | `secret: 'jwt-secret-2024'` |
| 数据库连接串 | `jdbc:|mongodb://|mysql://` 含用户名密码 | `jdbc:mysql://root:123456@localhost/db` |
| 手机号 | `1[3-9]\d{9}` 硬编码在代码中 | `phone: '13800138000'` |
| 身份证号 | `\d{17}[\dXx]` | `idCard: '...'` |
| 私钥/证书 | `-----BEGIN.*PRIVATE KEY-----` | PEM 格式密钥 |
| 内网地址 | `192\.168\.|10\.\d+\.|172\.(1[6-9]\|2\d\|3[01])\.` | `192.168.1.100` |

**输出格式**：
```
### 🔴 敏感信息泄露

❌ 高危 — backend/src/main/resources/application.yml:12
   discovery: jdbc:mysql://root:123456@localhost:3306/travel
   问题：数据库密码 123456 以明文写在配置文件中
   建议：使用 ${DB_PASSWORD} 环境变量替代

❌ 高危 — utils/request.js:5
   const BASE_URL = 'http://localhost:8080/api'
   问题：内网地址暴露在客户端代码中
   建议：使用配置文件 + 环境变量，生产环境使用正式域名
```

### 维度二：注入漏洞

**检查规则**：

| 类型 | 危险模式 | 语言 |
|------|----------|------|
| SQL 拼接 | `"SELECT.*" \+ \| "INSERT.*" \+ \| 'DELETE.*' +` | Java/JS |
| 动态 SQL | `\$\{.*\}` 在 MyBatis 中 | Java |
| XSS 反射 | `innerHTML\s*=\|document\.write\(\|eval\(.*\+` | JavaScript |
| 命令注入 | `exec\(\|child_process\|Runtime\.exec\(` | JS/Java |
| 路径遍历 | `\.\.\/\|\.\.\\\\` 拼接路径 | 通用 |
| URL 跳转 | `location\.href\s*=\s*\w+\|wx\.navigateTo\(\{.*url:\s*\w+` | JS |

**代码模式检查**：

```javascript
// ❌ 危险：SQL 拼接
const sql = "SELECT * FROM users WHERE name = '" + username + "'"

// ❌ 危险：URL 跳转未校验
wx.navigateTo({ url: options.targetUrl })  // 直接使用用户输入

// ❌ 危险：XSS
element.innerHTML = userInput

// ❌ 危险：eval
const fn = new Function('return ' + userInput)
```

**输出格式**：
```
### 🔴 注入漏洞

❌ 高危 — backend/src/.../UserMapper.java:15
   @Select("SELECT * FROM user WHERE name = '${name}'")
   问题：MyBatis ${} 直接拼接，存在 SQL 注入风险
   建议：改用 #{} 预编译参数

❌ 高危 — pages/scenic-detail/scenic-detail.js:42
   wx.navigateTo({ url: options.redirectUrl })
   问题：redirectUrl 来自页面参数，未校验白名单，存在任意跳转风险
   建议：校验 URL 前缀白名单，或使用路由名称映射
```

### 维度三：配置文件安全

**检查目标文件**：
- `application.yml` / `application.properties`（Java）
- `.env` / `.env.local`（JS/Vue）
- `project.config.json`（微信小程序）
- `vite.config.js` / `webpack.config.js`
- `settings.json`
- `*.config.json`

**检查规则**：

| 检查项 | 说明 |
|--------|------|
| 明文密码 | 配置中的 `password`、`passwd`、`pwd` 直接写值 |
| 调试开关 | `debug: true`、`NODE_ENV=development` 是否误提交 |
| CORS 配置 | `allowedOrigins: *` 通配符 |
| HTTPS 禁用 | `strict-ssl: false`、`verify: false` |
| 错误详情 | `showStacktrace: always`、`error-details: true` |
| Session 安全 | `cookie-secure: false`、`http-only: false` |

**输出格式**：
```
### 🔴 配置安全

❌ 高危 — backend/src/main/resources/application.yml:8
   password: 123456
   问题：数据库密码明文存储
   建议：使用 Jasypt 加密或环境变量

⚠️ 警告 — admin-vue/vite.config.js:15
   server.proxy 未配置路径过滤
   问题：可能代理敏感路径到后端
   建议：限定代理白名单路径
```

### 维度四：加密与认证

**检查规则**：

| 检查项 | 危险模式 |
|--------|----------|
| 弱哈希 | `MD5`、`SHA1` 用于密码存储 |
| 固定密钥 | `AES\.encrypt.*['\"]\w{10,}['\"]` 硬编码密钥 |
| Token 无过期 | JWT 未设 `expiresIn` |
| 不安全随机 | `Math\.random\(\)` 用于安全场景 |
| Token 明文存储 | `setStorageSync\('token'` 无加密 |
| 无签名校验 | 支付/退款回调无签名验证 |

**输出格式**：
```
### 🟡 加密与认证

⚠️ 警告 — backend/src/.../UserService.java:45
   DigestUtils.md5Hex(password)
   问题：MD5 已被破解，不应用于密码存储
   建议：使用 BCryptPasswordEncoder

⚠️ 警告 — app.js:38
   openid = 'wx_' + res.code
   问题：code 直接拼接作为标识，未换取真实 openid
   建议：将 code 发送到后端换取真实 openid 和 session_key
```

### 维度五：数据安全

**检查规则**：

| 检查项 | 说明 |
|--------|------|
| 日志泄露 | `console.log` 打印 password/token/手机号 |
| HTTP 明文 | `http://` 而非 `https://` 传输数据 |
| 敏感数据未脱敏 | 日志/前端展示完整手机号/身份证 |
| 本地存储 | `setStorageSync` 存储密码/支付信息 |
| 文件上传 | 未校验文件类型和大小 |

**输出格式**：
```
### 🟡 数据安全

⚠️ 警告 — pages/login/login.js:28
   console.log('登录成功', res.data)
   问题：日志可能打印完整用户信息（含手机号、openid）
   建议：生产环境移除调试日志或使用日志脱敏

⚠️ 警告 — utils/request.js:5
   const BASE_URL = 'http://localhost:8080/api'
   问题：HTTP 明文传输，数据可被中间人截获
   建议：生产环境使用 HTTPS
```

### 维度六：代码安全

**检查规则**：

| 检查项 | 危险模式 |
|--------|----------|
| eval 注入 | `eval\(`、`new Function\(`、`setTimeout\(str` |
| 原型污染 | `obj\[key\] = val` 无 key 校验（`__proto__`） |
| 反序列化 | Java `ObjectInputStream` 无过滤 |
| 正则 DoS | 嵌套量词的正则（`(a+)+`） |
| 构造函数劫持 | `this\[prop\] = value` 遍历用户输入 |

**输出格式**：
```
### 🟡 代码安全

⚠️ 警告 — admin-vue/src/utils/helpers.js:33
   const result = JSON.parse(userInput)
   问题：未 try-catch 包裹，恶意输入可导致崩溃
   建议：用 try-catch 包裹，解析失败返回默认值

⚠️ 警告 — pages/search/search.js:67
   list.sort((a, b) => a[b.sortKey] - b[b.sortKey])
   问题：sortKey 来自用户输入，可注入任意属性比较
   建议：校验 sortKey 仅允许白名单字段
```

---

## 阶段三：生成审计报告

```markdown
# 🔒 代码安全审计报告

**目标**：`backend/src/` + `utils/` + `pages/`
**审计时间**：2026-07-04
**检查文件数**：14

---

## 📊 总览

| 维度 | 严重 | 高风险 | 警告 | 状态 |
|------|------|--------|------|------|
| 敏感信息泄露 | 3 | 1 | 0 | 🔴 |
| 注入漏洞 | 1 | 2 | 0 | 🔴 |
| 配置安全 | 2 | 0 | 1 | 🔴 |
| 加密与认证 | 0 | 0 | 2 | 🟡 |
| 数据安全 | 0 | 0 | 3 | 🟡 |
| 代码安全 | 0 | 0 | 2 | 🟡 |
| **合计** | **6** | **3** | **8** | |

## 🏷️ 综合评级：🔴 高风险 — 存在严重安全问题需立即修复

---

## 🔴 严重问题（必须立即修复）

### 1. 数据库密码明文
- **文件**：`backend/src/main/resources/application.yml:12`
- **问题**：`password: 123456`
- **修复**：改用 `${DB_PASSWORD}` 环境变量

### 2. SQL 注入风险
- **文件**：`backend/src/.../ScenicMapper.java:20`
- **问题**：`@Select("SELECT * FROM scenic WHERE name LIKE '%${keyword}%'")`
- **修复**：改用 `#{}` 预编译

---

## 🟡 高风险问题（建议尽快修复）

### ...

---

## 🔧 修复优先级

| 优先级 | 问题 | 建议耗时 |
|--------|------|----------|
| P0 | 数据库密码明文 | 5 分钟 |
| P0 | SQL 注入 | 30 分钟 |
| P0 | API Key 泄露 | 10 分钟 |
| P1 | HTTP 明文传输 | 30 分钟 |
| P1 | Token 存储不安全 | 20 分钟 |
| P2 | 日志信息脱敏 | 1 小时 |
```

---

## 阶段四：询问修复

报告生成后询问：
```
🔒 审计报告已生成。

是否需要我逐个修复发现的安全问题？
- "修复 P0" — 先修复所有严重问题
- "全部修复" — 修复所有问题
- "跳过" — 仅保留报告
```

---

## 快速参考

| 命令 | 说明 |
|------|------|
| `/security-audit utils/` | 审计指定目录 |
| `/security-audit backend/src/` | 审计后端代码 |
| `/security-audit` | 审计当前文件 |
| `/security-audit --full` | 全项目扫描 |
