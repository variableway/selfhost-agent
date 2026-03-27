# OpenMAIC 互动课堂转换计划

> 将 selfhost-agent guides 转换为互动课堂形式

---

## 项目概述

### 目标
将现有的静态 Markdown 指南文档转换为 OpenMAIC 互动课堂形式，提供沉浸式、多 Agent 的学习体验。

### OpenMAIC 简介
OpenMAIC 是清华大学开源的 AI 互动课堂平台，支持：
- 一键生成课程（输入主题或上传文档）
- 多 Agent 课堂（AI 老师 + AI 同学实时互动）
- 丰富的场景类型（幻灯片、测验、交互模拟、项目式学习）
- 白板绘图和语音讲解
- 导出 PPT 和交互式 HTML

---

## 1. 可行性/难度分析

### 1.1 可行性评估

| 维度 | 评估 | 说明 |
|------|------|------|
| **内容适配** | ✅ 高度可行 | 现有 guides 已结构化，易于转换 |
| **技术要求** | ✅ 可行 | OpenMAIC 开源，可本地部署 |
| **API 成本** | ⚠️ 中等 | 需要 LLM API（推荐 Gemini Flash，成本低） |
| **时间投入** | ✅ 可控 | 初始化后生成自动化 |

### 1.2 难度评估

| 任务 | 难度 | 说明 |
|------|------|------|
| 部署 OpenMAIC | ⭐⭐ 中等 | 需要 Node.js 20+、pnpm、API Key |
| 创建课程内容 | ⭐ 简单 | 直接输入主题或上传文档 |
| 定制化课程 | ⭐⭐⭐ 较难 | 需要调整 prompt 和结构 |
| 集成到项目 | ⭐⭐ 中等 | 可作为子模块或独立服务 |

### 1.3 结论

**可行性: 高**

现有 guides 已经是结构化的教程内容，非常适合转换为 OpenMAIC 课程。主要工作是：
1. 部署 OpenMAIC 实例
2. 为每个 guide 创建对应的课程
3. 优化课程生成 prompt

---

## 2. 功能分析

### 2.1 现有 Guides 内容

| Guide | 内容 | 适合的场景类型 |
|-------|------|----------------|
| cmd-basics.md | 命令行基础 | Slides + Quiz + Interactive |
| nodejs-setup.md | Node.js 安装 | Slides + Quiz |
| python-setup.md | Python 安装 | Slides + Quiz |
| ide-setup.md | IDE 选择 | Slides + Quiz |
| ai-cli-tools.md | AI CLI 工具 | Slides + Quiz + PBL |
| git-intro.md | Git 基础 | Slides + Quiz + Interactive |

### 2.2 转换后的课堂功能

#### 每个课程包含

1. **幻灯片讲解** (Slides)
   - AI 老师语音讲解
   - 重点内容高亮
   - 激光笔动画效果

2. **互动测验** (Quiz)
   - 单选/多选/简答题
   - 实时评分和反馈
   - 错误答案解释

3. **交互模拟** (Interactive)
   - 终端命令模拟器
   - 实时代码运行
   - 可视化流程图

4. **项目式学习** (PBL)
   - 角色扮演（如：DevOps 工程师）
   - 里程碑任务
   - AI 协作完成项目

### 2.3 新增功能（相比静态文档）

| 功能 | 说明 |
|------|------|
| 语音讲解 | AI 老师读出内容，适合听觉学习者 |
| 实时问答 | 随时提问，AI 即时回答 |
| 白板演示 | 绘制流程图、架构图 |
| 同学讨论 | AI 同学参与讨论，模拟课堂氛围 |
| 进度追踪 | 记录学习进度和测验成绩 |
| 多语言 | 支持中英文切换 |

---

## 3. 技术分析

### 3.1 OpenMAIC 技术栈

```
Frontend:  Next.js + React + TypeScript + Zustand + Tailwind
Backend:   Next.js API Routes + LangGraph
AI:        OpenAI / Anthropic / Google Gemini / DeepSeek / Grok
Storage:   LocalStorage / 可扩展数据库
Export:    PPTX (pptxgenjs) + HTML
```

### 3.2 部署选项

| 方式 | 复杂度 | 成本 | 推荐 |
|------|--------|------|------|
| **本地开发** | ⭐ | 免费 | 开发测试 |
| **Vercel** | ⭐⭐ | 免费/付费 | 生产推荐 |
| **Docker** | ⭐⭐⭐ | 服务器费用 | 私有部署 |
| **Hosted** | ⭐ | 按使用付费 | 最简单 |

### 3.3 API 成本估算

使用 Gemini 3 Flash（推荐）：

| 操作 | 估算成本 |
|------|----------|
| 生成一个 10 页课程 | ~$0.01 |
| 1 小时互动课堂 | ~$0.05-0.10 |
| 每日 100 用户学习 | ~$5-10 |

### 3.4 集成方案

#### 方案 A: 独立部署（推荐）
```
selfhost-agent/           # 现有项目
openmaic/                 # 独立部署的 OpenMAIC
```
- 优点：独立维护，互不影响
- 缺点：需要单独部署

#### 方案 B: 嵌入链接
```
selfhost-agent/
├── README.md             # 添加 "在线学习" 链接
└── docs/
    └── classroom-links.md # 课程链接列表
```
- 优点：最简单
- 缺点：依赖外部服务

#### 方案 C: 生成静态 HTML
```
selfhost-agent/
└── docs/
    └── interactive/      # 导出的交互式 HTML
        ├── cmd-basics/
        └── nodejs-setup/
```
- 优点：完全离线可用
- 缺点：无实时互动功能

---

## 4. 计划/任务分析

### 4.1 Phase 1: 环境准备 (1-2 天)

| 任务 | 时间 | 产出 |
|------|------|------|
| 安装 Node.js 20+ | 10 分钟 | Node.js 环境 |
| 安装 pnpm | 5 分钟 | pnpm 包管理器 |
| 克隆 OpenMAIC | 5 分钟 | 项目代码 |
| 配置 API Key | 10 分钟 | .env.local |
| 启动开发服务器 | 5 分钟 | localhost:3000 |

**命令：**
```bash
# 安装依赖
fnm install 20
fnm use 20
npm install -g pnpm

# 克隆项目
git clone https://github.com/THU-MAIC/OpenMAIC.git
cd OpenMAIC
pnpm install

# 配置
cp .env.example .env.local
# 编辑 .env.local，添加 API Key

# 启动
pnpm dev
```

### 4.2 Phase 2: 课程创建 (2-3 天)

| 课程 | 输入方式 | 预计时间 |
|------|----------|----------|
| 命令行基础 | 上传 cmd-basics.md | 30 分钟 |
| Node.js 安装 | 输入主题 + 上传文档 | 30 分钟 |
| Python 安装 | 输入主题 + 上传文档 | 30 分钟 |
| IDE 选择 | 输入主题 | 20 分钟 |
| AI CLI 工具 | 输入主题 + 上传文档 | 30 分钟 |
| Git 基础 | 上传 git-intro.md | 30 分钟 |

**生成方式：**
1. 打开 OpenMAIC Web 界面
2. 输入课程主题或上传 Markdown 文档
3. 等待 AI 生成（约 2-5 分钟）
4. 预览和调整
5. 导出或发布

### 4.3 Phase 3: 优化定制 (1-2 天)

| 任务 | 说明 |
|------|------|
| 调整课程结构 | 优化章节划分 |
| 添加测验题 | 确保覆盖关键知识点 |
| 创建交互模拟 | 终端命令模拟器 |
| 优化 prompt | 提高生成质量 |

### 4.4 Phase 4: 集成发布 (1 天)

| 任务 | 说明 |
|------|------|
| 选择部署方式 | Vercel / Docker / Hosted |
| 更新 README | 添加课程链接 |
| 创建课程索引 | 列出所有可用课程 |
| 文档说明 | 如何使用互动课堂 |

---

## 5. 课程结构设计

### 5.1 每个课程的标准结构

```
课程: [主题名称]

├── 第 1 课: 概述
│   ├── Slides: 什么是 [主题]？为什么需要？
│   └── Quiz: 基础概念题 (3-5 题)
│
├── 第 2 课: 安装/配置
│   ├── Slides: 安装步骤
│   ├── Interactive: 终端模拟器
│   └── Quiz: 安装验证题
│
├── 第 3 课: 基础使用
│   ├── Slides: 核心命令/操作
│   ├── Interactive: 动手练习
│   └── Quiz: 使用场景题
│
├── 第 4 课: 进阶技巧
│   ├── Slides: 高级功能
│   └── PBL: 小项目实践
│
└── 第 5 课: 总结
    ├── Slides: 知识回顾
    ├── Quiz: 综合测试
    └── Whiteboard: 流程图总结
```

### 5.2 示例：命令行基础课程

```
课程: 命令行 5 分钟入门

第 1 课: 什么是命令行？
- Slides: 命令行 vs 图形界面
- Quiz: 概念理解

第 2 课: 7 个必学命令
- Slides: ls, cd, rm, cp, mv, cat, echo
- Interactive: 终端模拟器
- Quiz: 命令用法

第 3 课: 管道和重定向
- Slides: | > >> <
- Interactive: 管道练习
- Quiz: 组合命令

第 4 课: 实战练习
- PBL: 完成一个文件管理任务
- Whiteboard: 流程图演示

第 5 课: 故障排除
- Slides: 常见问题解决
- Quiz: 综合测试
```

---

## 6. 资源需求

### 6.1 人力资源

| 角色 | 投入 | 任务 |
|------|------|------|
| 开发者 | 3-5 天 | 部署、课程创建、集成 |
| 内容审核 | 1-2 天 | 审核课程质量 |

### 6.2 技术资源

| 资源 | 说明 |
|------|------|
| Node.js 20+ | 运行环境 |
| pnpm 10+ | 包管理 |
| LLM API Key | Gemini / OpenAI / Anthropic |
| 服务器（可选） | Vercel 免费版或自建 |

### 6.3 成本估算

| 项目 | 成本 |
|------|------|
| API 调用（开发） | ~$5 |
| API 调用（月度） | ~$10-50（取决于用户量） |
| Vercel 托管 | 免费（Hobby）或 $20/月（Pro） |

---

## 7. 风险与缓解

| 风险 | 可能性 | 影响 | 缓解措施 |
|------|--------|------|----------|
| API 成本超预期 | 中 | 中 | 使用 Gemini Flash，设置限额 |
| 生成质量不稳定 | 中 | 中 | 优化 prompt，人工审核 |
| 部署问题 | 低 | 高 | 使用 Vercel 一键部署 |
| 用户接受度低 | 低 | 中 | 保留静态文档作为备选 |

---

## 8. 成功指标

| 指标 | 目标 |
|------|------|
| 课程数量 | 6+ 个 |
| 每课程测验通过率 | > 80% |
| 用户反馈评分 | > 4.0/5.0 |
| 学习完成率 | > 60% |

---

## 9. 下一步行动

### 立即可做

1. **部署 OpenMAIC 本地实例**
   ```bash
   git clone https://github.com/THU-MAIC/OpenMAIC.git
   cd OpenMAIC
   pnpm install
   cp .env.example .env.local
   # 添加 API Key
   pnpm dev
   ```

2. **创建第一个测试课程**
   - 主题：命令行基础
   - 上传：docs/guides/1-terminal/cmd-basics.md
   - 验证生成效果

3. **评估和调整**
   - 检查生成质量
   - 调整 prompt
   - 决定部署方案

### 建议顺序

```
1. 本地部署测试 (1 天)
      ↓
2. 创建 1-2 个课程原型 (1 天)
      ↓
3. 评估效果，决定是否继续 (0.5 天)
      ↓
4. 批量创建课程 (2 天)
      ↓
5. 部署上线 (1 天)
      ↓
6. 更新项目文档 (0.5 天)
```

---

## 附录：参考链接

- [OpenMAIC GitHub](https://github.com/THU-MAIC/OpenMAIC)
- [OpenMAIC Live Demo](https://open.maic.chat)
- [OpenMAIC 文档](https://github.com/THU-MAIC/OpenMAIC#readme)
- [LangGraph 文档](https://langchain-ai.github.io/langgraph/)
