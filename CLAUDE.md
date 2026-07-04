# CLAUDE.md — 项目指令与自定义技能

## /unit-test — 单元测试技能

当用户调用 `/unit-test` 时，你是一名测试工程师，按以下流程操作：

---

### 阶段一：分析输入

用户可能提供：
- **文件路径**：如 `utils/common.js`、`admin-vue/src/api/user.js`
- **函数名**：如 `calcDistance`、`formatDate`
- **目录路径**：如 `utils/`（表示对目录下所有可测函数生成测试）
- **无参数**（当前打开的编辑器文件）：读取用户 IDE 当前选中的文件作为测试目标

#### 第一步：读取目标代码

用 Read 工具读取目标文件，分析：
1. 项目类型（小程序 / Vue / Java）
2. 导出方式（`module.exports` / `export` / `public`）
3. 所有可测试的函数清单
4. 函数参数、返回值类型、依赖关系

#### 第二步：确认测试范围

如果用户未指定具体函数，列出文件中所有函数让用户确认：

📋 检测到以下可测试函数：
  1. funcA(args) — 功能描述
  2. funcB(args) — 功能描述
  ...

请问要对哪些函数生成测试？（输入 "全部" 或函数名/编号）

---

### 阶段二：选择测试框架

根据项目类型自动选择：

| 项目类型 | 测试框架 | 配置文件 |
|----------|----------|----------|
| 微信小程序 (CommonJS) | **Jest** | `jest.config.js` |
| Vue.js 管理后台 | **Vitest** / Jest | `vitest.config.js` |
| Java Spring Boot | **JUnit 5** + Mockito | `pom.xml` (已有) |

#### 框架安装（按需）

检查项目是否已安装测试框架。如果没有：
- **微信小程序**：`npm install --save-dev jest`
- **Vue.js**：`cd admin-vue && npm install --save-dev vitest @vue/test-utils jsdom`
- **Java**：检查 `pom.xml` 是否已有 `spring-boot-starter-test`

---

### 阶段三：编写测试代码

#### 原则

1. **覆盖核心逻辑** — 正常输入、边界值、异常输入、空值/undefined
2. **Mock 外部依赖** — 微信 API (`wx.*`)、HTTP 请求、存储 API
3. **每个测试用例只测一件事** — 一个 `test()` 对应一个断言场景
4. **描述清晰** — 测试名称用中文描述预期行为
5. **遵循项目风格** — 缩进、命名、注释风格与目标文件一致

#### 微信小程序专用 Mock

```javascript
global.wx = {
  getStorageSync: jest.fn(),
  setStorageSync: jest.fn(),
  showToast: jest.fn(),
  request: jest.fn(),
  login: jest.fn(),
}
```

#### 测试文件命名

| 源文件 | 测试文件 |
|--------|----------|
| `utils/common.js` | `utils/__tests__/common.test.js` |
| `admin-vue/src/api/user.js` | `admin-vue/src/api/__tests__/user.test.js` |
| `backend/.../XXXService.java` | `backend/src/test/.../XXXServiceTest.java` |

#### JavaScript 测试模板

```javascript
/**
 * <文件名> — 单元测试
 * 覆盖函数：funcA, funcB
 */
const { funcA, funcB } = require('../target-file')

describe('funcA', () => {
  beforeEach(() => { jest.clearAllMocks() })

  test('正常输入：返回预期结果', () => {
    expect(funcA('valid-input')).toBe('expected-output')
  })
  test('空字符串：返回默认值', () => {
    expect(funcA('')).toBe('default-value')
  })
  test('传入 null：返回安全默认值', () => {
    expect(funcA(null)).toBe('default-value')
  })
})
```

#### Java 测试模板

```java
@DisplayName("XXXService 单元测试")
class XXXServiceTest {
    @Mock private SomeRepository repository;
    private XXXService service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        service = new XXXService(repository);
    }

    @Test
    @DisplayName("正常查询：返回预期结果")
    void shouldReturnExpectedResult() {
        when(repository.findById(1L)).thenReturn(Optional.of(expectedEntity));
        var result = service.getById(1L);
        assertTrue(result.isPresent());
    }
}
```

---

### 阶段四：配置测试运行器

#### Jest 配置（微信小程序）

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

在 `package.json` 添加：
```json
"scripts": {
  "test": "jest",
  "test:coverage": "jest --coverage"
}
```

---

### 阶段五：执行测试

```bash
# JavaScript / 小程序
npm test
npx jest utils/__tests__/common.test.js   # 指定文件

# Vue.js
cd admin-vue && npx vitest run

# Java
cd backend && mvn test
cd backend && mvn test -Dtest=XXXServiceTest  # 指定类
```

执行后收集：
- ✅ 通过数 / ❌ 失败数 / 总数
- ⏱️ 执行时间
- 📊 代码覆盖率（如有）

---

### 阶段六：生成测试报告

以以下格式输出：

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

### funcA
- ✅ 正常输入：返回预期结果
- ✅ 边界值：正确处理
- ✅ 异常输入：返回安全默认值

---

## 🔧 问题与建议

_（如有失败用例，在此列出原因和修复建议）_
```

---

### 阶段七：清理与收尾

1. 如果安装了新的 npm 依赖，提醒用户提交 `package.json`
2. 建议将 `coverage/` 目录加入 `.gitignore`
3. 询问用户是否需要将测试配置提交到 git
