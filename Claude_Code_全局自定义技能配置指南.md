# Claude Code 全局自定义技能配置指南

> 日期：2026年7月4日 | 适用版本：Claude Code（最新版）

---

## 目录

1. [概述：为什么要自定义技能](#1-概述为什么要自定义技能)
2. [~/.claude/ 目录结构详解](#2-claude-目录结构详解)
3. [方式一：全局 CLAUDE.md（最简单）](#3-方式一全局-claudemd最简单)
4. [方式二：skills/ 目录（推荐，模块化）](#4-方式二skills-目录推荐模块化)
5. [方式三：agents/ 目录（复杂任务）](#5-方式三agents-目录复杂任务)
6. [三种方式对比](#6-三种方式对比)
7. [全局 settings.json 与 Hooks](#7-全局-settingsjson-与-hooks)
8. [你的实际环境](#8-你的实际环境)
9. [快速上手三步走](#9-快速上手三步走)
10. [常见问题与注意事项](#10-常见问题与注意事项)

---

## 1. 概述：为什么要自定义技能

Claude Code 提供了丰富的内置斜杠命令（如 `/code-review`、`/fix`、`/commit` 等），但在实际开发中，你可能有自己高频使用的操作流程。自定义技能让你可以：

- 创建专属的 `/` 命令，一个指令完成一系列操作
- **跨项目复用** —— 全局技能在所有项目中都能调用
- **团队共享** —— 项目级技能可以提交到 Git 仓库，团队成员共用
- **自动化重复工作** —— 配合 Hooks 实现自动触发

---

## 2. ~/.claude/ 目录结构详解

全局配置放在用户目录下的 `.claude/` 文件夹中。

> Windows 路径：`C:\Users\<用户名>\.claude\`

```
~/.claude/
├── CLAUDE.md              # 全局指令文件（所有项目生效）
├── settings.json          # 全局设置（权限、环境变量、Hooks）
├── keybindings.json       # 键盘快捷键绑定
├── skills/                # 自定义技能目录 ★推荐
│   ├── translate.md
│   └── commit.md
├── agents/                # 自定义代理目录
│   └── research-agent.md
└── hooks/                 # 钩子脚本目录
    └── pre-command.sh
```

### 各文件作用域说明

| 路径 | 作用 | 作用域 |
|------|------|--------|
| `~/.claude/CLAUDE.md` | 全局系统指令，每次对话自动加载 | 所有项目 |
| `~/.claude/skills/*.md` | 自定义技能/斜杠命令定义 | 所有项目 |
| `~/.claude/agents/*.md` | 独立代理定义 | 所有项目 |
| `~/.claude/settings.json` | 全局设置（权限、主题、模型等） | 所有项目 |
| `项目/.claude/settings.json` | 项目专属设置 | 仅该项目 |
| `项目/CLAUDE.md` | 项目专属指令 | 仅该项目 |

> 💡 **优先级规则**：项目级配置覆盖全局配置，项目 CLAUDE.md 的内容会附加到全局 CLAUDE.md 之后。

---

## 3. 方式一：全局 CLAUDE.md（最简单）

在 `~/.claude/CLAUDE.md` 中直接定义 `/` 命令行为。文件内容会作为系统提示注入到每次对话中，Claude 会识别这些命令并执行对应操作。

### 基础示例

```markdown
# 全局 Claude Code 指令

## 自定义斜杠命令

- `/translate` — 将选中的文本翻译成中文
- `/explain`  — 详细解释选中的代码，说明每行做了什么
- `/commit`   — 分析当前 git diff，生成规范的 commit message
- `/docs`     — 为选中的函数/类生成 JSDoc 或文档注释
- `/test`     — 为选中的函数生成单元测试

## 通用行为规则

- 始终使用中文回复
- 代码解释时给出具体示例
- 生成 commit message 使用 Conventional Commits 格式
```

### 多步操作命令

```markdown
## /commit
当用户调用 /commit 时：
1. 查看 git status 和 git diff
2. 分析变更内容，生成 Conventional Commits 格式的提交信息
3. 提交信息使用中文描述
4. 格式: <type>(<scope>): <中文描述>
5. 执行 git commit -m "生成的信息"
```

> 💡 **优势**：零额外文件，修改即时生效。适合简单指令和行为规则。

---

## 4. 方式二：skills/ 目录（推荐，模块化）

每个技能一个 `.md` 文件，使用 YAML frontmatter 定义元数据，互不干扰，方便管理和分享。**这是官方推荐的方式。**

### 文件格式

```markdown
---
name: <技能名>
description: <简短描述>
trigger: /<斜杠命令>
---

<技能的具体指令，Markdown 格式>
```

### 示例 1：翻译技能

**文件：** `~/.claude/skills/translate.md`

```markdown
---
name: translate
description: 将选中文本翻译为中文
trigger: /translate
---

当你被要求使用 /translate 命令时：
1. 如果用户提供了文本，直接翻译为中文
2. 如果用户提供了代码，翻译其中的注释和字符串
3. 保持代码结构和逻辑不变
```

### 示例 2：智能提交

**文件：** `~/.claude/skills/commit.md`

```markdown
---
name: commit
description: 生成规范的中文提交信息并提交
trigger: /commit
---

当你被要求使用 /commit 时：
1. 查看 git status 和 git diff
2. 分析变更内容
3. 生成 Conventional Commits 格式的提交信息（中文描述）
4. 展示给用户确认
5. 确认后执行 git commit
```

### 示例 3：项目初始化

**文件：** `~/.claude/skills/init-project.md`

```markdown
---
name: init-project
description: 一键初始化新项目
trigger: /init-project
---

当你被要求使用 /init-project 时：
1. 询问用户项目类型（前端/后端/全栈）
2. 询问技术栈偏好（React/Vue、Express/FastAPI 等）
3. 使用官方脚手架创建项目
4. 初始化 Git 仓库
5. 安装依赖
6. 输出项目启动命令
```

---

## 5. 方式三：agents/ 目录（复杂任务）

Agent 适合需要**多步骤、多轮交互、自主决策**的复杂任务。每个 Agent 可以配置独立的模型、工具集和工作流。

### 文件格式

```markdown
---
model: sonnet          # 使用的模型
tools:                 # 可用的工具列表
  - Bash
  - Write
  - Read
  - Glob
---

<Agent 的系统提示词和行为规则>
```

### 示例：深度研究代理

**文件：** `~/.claude/agents/research-agent.md`

```markdown
---
model: sonnet
tools:
  - Bash
  - Read
  - Glob
  - WebSearch
  - WebFetch
---

你是深度研究助手。当你被调用时：
1. 接收用户的研究问题
2. 将问题分解为多个子问题
3. 对每个子问题进行搜索和分析
4. 综合所有信息形成完整报告
5. 标注所有信息来源
6. 用中文输出结构化的研究报告
```

---

## 6. 三种方式对比

| 维度 | CLAUDE.md | skills/ | agents/ |
|------|-----------|---------|---------|
| **复杂度** | 简单指令 | 单一技能 | 多步骤工作流 |
| **文件组织** | 一个文件全部定义 | 一技能一文件 | 一代理一文件 |
| **触发方式** | `/` 命令或关键词 | `/` 命令 | `/agent-name` |
| **独立程度** | 在当前对话中执行 | 在当前对话中执行 | 可有独立上下文 |
| **适用场景** | 行为规则、快捷命令 | 独立功能模块 | 复杂自主任务 |

> 💡 **简单判断**：只需一个 `/xxx` 命令做一件事 → skills/。需要多步骤、多轮交互、自主决策 → agents/。

---

## 7. 全局 settings.json 与 Hooks

Hooks（钩子）允许你在特定事件（如工具调用前后、会话开始/结束）自动执行脚本。这比技能更底层，用于自动化环境行为而非用户交互。

### 示例配置

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "echo '文件已保存'"
          }
        ]
      }
    ]
  },
  "permissions": {
    "allow": [
      "Bash(git *)",
      "Bash(npm *)"
    ]
  },
  "env": {
    "MY_CUSTOM_VAR": "some-value"
  }
}
```

### Hooks 实际应用场景

| 场景 | 钩子类型 | 说明 |
|------|---------|------|
| 审计日志 | PreToolUse | 记录所有执行的命令 |
| 环境检查 | SessionStart | 确保所需工具已安装 |
| 自动格式化 | PostToolUse | 保存文件后自动运行 Prettier |
| 通知 | PostToolUse | 命令完成后发送桌面通知 |

---

## 8. 你的实际环境

当前你的 `~/.claude/` 目录已有内容：

```
~/.claude/
├── backups/
├── cache/
├── file-history/
├── ide/
├── plugins/
├── projects/
├── sessions/
├── session-env/
├── shell-snapshots/
├── history.jsonl
└── settings.json      ← 已有：API 配置、模型设置、主题
```

### 当前全局 settings.json

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://api.deepseek.com/anthropic",
    "ANTHROPIC_AUTH_TOKEN": "sk-***",
    "ANTHROPIC_MODEL": "deepseek-v4-pro[1m]",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "deepseek-v4-pro[1m]",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "deepseek-v4-pro[1m]",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "deepseek-v4-flash[1m]",
    "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": "1",
    "CLAUDE_CODE_EFFORT_LEVEL": "max"
  },
  "theme": "auto"
}
```

### 你目前缺少的（需创建）

- ❌ `~/.claude/CLAUDE.md` — 全局指令文件
- ❌ `~/.claude/skills/` — 自定义技能目录
- ❌ `~/.claude/agents/` — 自定义代理目录

---

## 9. 快速上手三步走

### 步骤 1：创建目录

```bash
mkdir -p ~/.claude/skills ~/.claude/agents
```

### 步骤 2：创建第一个技能文件

```bash
cat > ~/.claude/skills/hello.md << 'EOF'
---
name: hello
description: 测试技能，打招呼
trigger: /hello
---

当用户使用 /hello 命令时，用中文友好地打招呼，
并询问今天可以帮什么忙。
EOF
```

### 步骤 3：测试

重新打开 Claude Code（或开启新对话），输入 `/hello` 测试。

---

## 10. 常见问题与注意事项

### 命名规范

技能文件名使用 kebab-case（如 `my-skill.md`），不要有空格。

### trigger 字段

斜杠命令必须以 `/` 开头，如 `trigger: /my-command`。

### description 字段

保持简短清晰，这会显示在命令提示中供用户参考。

### 优先级

项目级 `skills/` 覆盖全局 `~/.claude/skills/`。

### 生效时机

修改技能文件后需要**重新启动对话**才能生效。

### CLAUDE.md vs skills/

当两者定义冲突时，`skills/` 中的定义优先级更高。

### Windows 路径

`~/.claude/` 在 Windows 上对应 `C:\Users\<用户名>\.claude\`。

### 团队共享

项目级技能（`.claude/skills/`）可以提交到 Git，团队成员 pull 即可使用。

---

> 📖 更多信息请查阅官方文档：https://code.claude.com/docs

---

*— 文档结束 —*
