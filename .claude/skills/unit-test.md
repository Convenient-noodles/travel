---
name: unit-test
description: 对指定代码自动编写单元测试、执行测试、生成测试报告。支持微信小程序、Vue.js、Java Spring Boot。
trigger: /unit-test
---

# 单元测试技能

你是一名测试工程师。用户请求对代码编写并执行单元测试时，按以下流程操作。

---

## 阶段一：分析输入

用户可能提供：
- **文件路径**：如 `utils/common.js`、`admin-vue/src/api/user.js`
- **函数名**：如 `calcDistance`、`formatDate`
- **目录路径**：如 `utils/`（表示对目录下所有可测函数生成测试）
- **无参数**（当前打开的编辑器文件）：读取用户 IDE 当前选中的文件作为测试目标

### 第一步：读取目标代码

用 Read 工具读取目标文件，分析：
1. 项目类型（小程序 / Vue / Java）
2. 导出方式（`module.exports` / `export` / `public`）
3. 所有可测试的函数清单
4. 函数参数、返回值类型、依赖关系

### 第二步：确认测试范围

如果用户未指定具体函数，列出文件中所有函数让用户确认：
```
📋 检测到以下可测试函数：
  1. validateImageUrl(url) — 图片URL验证
  2. fixImageUrl(url) — 图片URL修复
  3. getFirstTag(tags) — 标签解析
  4. parseTags(tags) — 统一标签解析
  5. calcDistance(from, to) — 地理距离计算
  6. formatDate(date) — 日期格式化
  7. formatDateTime(date) — 日期时间格式化
  8. formatRelativeTime(timestamp) — 相对时间

请问要对哪些函数生成测试？（输入 "全部" 或函数名/编号）
```

---

## 阶段二：选择测试框架

根据项目类型自动选择：

| 项目类型 | 测试框架 | 断言库 | 配置文件 |
|----------|----------|--------|----------|
| 微信小程序 (CommonJS) | **Jest** | Jest 内置 expect | `jest.config.js` |
| Vue.js 管理后台 | **Vitest** / Jest | Vitest 内置 | `vitest.config.js` / `jest.config.js` |
| Java Spring Boot | **JUnit 5** + Mockito | JUnit Assertions | `pom.xml` (已有) |

### 框架安装（按需）

检查项目是否已安装测试框架。如果没有：

**微信小程序 (根目录)**：
```bash
npm install --save-dev jest
```

**Vue.js (admin-vue/)**：
```bash
cd admin-vue && npm install --save-dev vitest @vue/test-utils jsdom
```

**Java 后端**：检查 `pom.xml` 是否已有 `spring-boot-starter-test`，通常已内置。

---

## 阶段三：编写测试代码

### 原则

1. **覆盖核心逻辑** — 正常输入、边界值、异常输入、空值/undefined
2. **Mock 外部依赖** — 微信 API (`wx.*`)、HTTP 请求、存储 API
3. **每个测试用例只测一件事** — 一个 `test()` 对应一个断言场景
4. **描述清晰** — 测试名称用中文描述预期行为
5. **遵循项目风格** — 缩进、命名、注释风格与目标文件一致

### 微信小程序专用 Mock

所有 `wx.*` API 都需要在测试文件中 Mock：

```javascript
// 在每个测试文件顶部添加
global.wx = {
  getStorageSync: jest.fn(),
  setStorageSync: jest.fn(),
  showToast: jest.fn(),
  request: jest.fn(),
  login: jest.fn(),
  // 按需添加其他 wx.* API
}
```

### 测试文件命名规范

| 源文件 | 测试文件 |
|--------|----------|
| `utils/common.js` | `utils/__tests__/common.test.js` 或 `utils/common.test.js` |
| `utils/datetime.js` | `utils/__tests__/datetime.test.js` |
| `admin-vue/src/api/user.js` | `admin-vue/src/api/__tests__/user.test.js` |
| `backend/src/.../XXXService.java` | `backend/src/test/.../XXXServiceTest.java` |

### 测试用例模板

#### JavaScript 模板

```javascript
/**
 * <文件名> — 单元测试
 * 覆盖函数：funcA, funcB, funcC
 */

// ========== 引入目标模块 ==========
const { funcA, funcB } = require('../target-file')

// ========== Mock 微信 API（仅小程序项目） ==========
global.wx = {
  getStorageSync: jest.fn(() => []),
  setStorageSync: jest.fn(),
  showToast: jest.fn(),
}

// ========== 测试用例 ==========
describe('funcA', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // 正常情况
  test('正常输入：返回预期结果', () => {
    expect(funcA('valid-input')).toBe('expected-output')
  })

  // 边界值
  test('空字符串：返回默认值', () => {
    expect(funcA('')).toBe('default-value')
  })

  // 异常输入
  test('传入 null：返回安全默认值', () => {
    expect(funcA(null)).toBe('default-value')
  })

  // 数组/对象输入
  test('传入对象：正确处理', () => {
    expect(funcA({ key: 'value' })).toEqual({ result: 'processed' })
  })
})

describe('funcB', () => {
  // 同上结构
})
```

#### Java 模板

```java
package com.example.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@DisplayName("XXXService 单元测试")
class XXXServiceTest {

    @Mock
    private SomeRepository repository;

    private XXXService service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        service = new XXXService(repository);
    }

    @Test
    @DisplayName("正常查询：返回预期结果")
    void shouldReturnExpectedResult() {
        // Given
        when(repository.findById(1L)).thenReturn(Optional.of(expectedEntity));

        // When
        var result = service.getById(1L);

        // Then
        assertTrue(result.isPresent());
        assertEquals("expected", result.get().getName());
    }

    @Test
    @DisplayName("空结果：返回 Optional.empty()")
    void shouldReturnEmptyForNonExistentId() {
        when(repository.findById(999L)).thenReturn(Optional.empty());
        assertTrue(service.getById(999L).isEmpty());
    }
}
```

---

## 阶段四：配置测试运行器

### 微信小程序 — Jest 配置

在项目根目录创建 `jest.config.js`：

```javascript
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js', '**/*.test.js'],
  collectCoverageFrom: [
    'utils/**/*.js',
    'pages/**/*.js',
    '!**/node_modules/**',
    '!**/__tests__/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'text-summary', 'html'],
}
```

在 `package.json` 添加 scripts：
```json
"scripts": {
  "test": "jest",
  "test:coverage": "jest --coverage"
}
```

### Vue.js — Vitest 配置

在 `admin-vue/vite.config.js` 中追加 test 配置，或创建 `vitest.config.js`。

---

## 阶段五：执行测试

### 运行命令

```bash
# JavaScript / 小程序
npm test

# 指定测试文件
npx jest utils/__tests__/common.test.js

# Vue.js
cd admin-vue && npx vitest run

# Java
cd backend && mvn test

# Java 指定测试类
cd backend && mvn test -Dtest=XXXServiceTest
```

### 执行后收集结果

记录以下指标：
- ✅ 通过数 / ❌ 失败数 / 总数
- ⏱️ 执行时间
- 📊 代码覆盖率（如有）

---

## 阶段六：生成测试报告

以以下格式输出报告：

```markdown
# 🧪 单元测试报告

**目标文件**：`utils/common.js`
**测试文件**：`utils/__tests__/common.test.js`
**执行时间**：2026-07-04 17:30
**框架**：Jest 29

---

## 📊 测试结果

| 状态 | 数量 |
|------|------|
| ✅ 通过 | 16 |
| ❌ 失败 | 0 |
| 📝 总计 | 16 |
| ⏱️ 耗时 | 1.2s |

## 📈 覆盖率

| 指标 | 百分比 |
|------|--------|
| 语句覆盖率 | 94.5% |
| 分支覆盖率 | 87.3% |
| 函数覆盖率 | 100% |
| 行覆盖率 | 93.8% |

## 📋 测试用例清单

### validateImageUrl
- ✅ 正常URL：返回原URL
- ✅ blob: 前缀：返回默认图
- ✅ data: 前缀：返回默认图
- ✅ 空字符串：返回默认图
- ✅ null 输入：返回默认图

### calcDistance
- ✅ 正常两个坐标：返回正确距离
- ✅ 缺少纬度：返回 0
- ✅ 空对象：返回 0
- ✅ null 输入：返回 0

### toggleCollect
- ✅ 未收藏时收藏：返回 true
- ✅ 已收藏时取消：返回 false
- ✅ 存储异常：返回原状态

---

## 🔧 问题与建议

_（如有失败用例，在此列出原因和修复建议）_
```

---

## 阶段七：清理与收尾

1. 如果安装了新的 npm 依赖，提醒用户提交 `package.json` 和 `package-lock.json`
2. 建议将 `coverage/` 目录加入 `.gitignore`
3. 询问用户是否需要将测试配置提交到 git

---

## 快速参考

| 场景 | 命令 |
|------|------|
| 全部测试 | `npm test` |
| 单个文件 | `npx jest path/to/file.test.js` |
| 监视模式 | `npm test -- --watch` |
| 覆盖率 | `npm test -- --coverage` |
| Java 全部 | `cd backend && mvn test` |
| Java 单个 | `cd backend && mvn test -Dtest=ClassName` |
