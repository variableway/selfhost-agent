# AI Agent Playground Desktop Application

> 可行性分析、架构设计与实现计划

## 一、项目概述

**目标用户**：对 AI Agent 感兴趣但技术能力有限的用户（安装困难、环境配置不熟悉）

**核心价值**：一个桌面应用，提供一键安装环境 + 交互式教程 + 内置终端，让非技术用户在 5-10 分钟内完成每个学习步骤。

**功能清单**：

| 功能 | 描述 |
|------|------|
| 学习 RoadMap | 可视化的学习路径，展示所有教程的进度和依赖关系 |
| 教程系统 | 每个教程 5-10 分钟，包含安装脚本和验证步骤 |
| 内置终端 | 在应用中直接看到安装过程，无需切换到外部终端 |
| 一键安装 | 自动安装依赖、配置环境变量、启动服务、测试功能 |
| Skill 教程 | 如何使用 AI Skill、AI Agent CLI 生成应用 |
| 工具配置教程 | OpenClaw 等工具的配置教程 |
| 视频教程 | 每个教程配有短视频，展示实际安装过程 |

---

## 二、技术选型分析

### 推荐方案：Tauri v2 + Next.js + shadcn/ui

| 技术 | 版本 | 角色 | 成熟度 |
|------|------|------|--------|
| **Tauri** | v2.x | 桌面容器 + 系统命令执行 | 生产就绪（2024年发布稳定版） |
| **Next.js** | 15.x | 前端框架（App Router） | 非常成熟 |
| **shadcn/ui** | 最新 | UI 组件库 | 非常成熟 |
| **xterm.js** | 5.x | 终端模拟器 | VS Code 同款，非常成熟 |
| **portable-pty** / Rust PTY | - | 伪终端实现 | 可用，需要适配 |

### 为什么选 Tauri 而不是 Electron？

| 对比项 | Tauri v2 | Electron |
|--------|----------|----------|
| 安装包大小 | ~10-20MB | ~150-300MB |
| 内存占用 | 低（50-100MB） | 高（200-500MB） |
| 系统命令执行 | Rust 原生 shell 插件 | Node.js child_process |
| 安全性 | 默认拒绝，ACL 控制 | 需要自行处理 |
| 目标用户友好度 | 轻量，下载快 | 体积大，下载慢 |
| 跨平台 | macOS / Windows / Linux | 同 |

**结论**：目标用户是技术新手，安装包大小很重要。Tauri 的轻量优势非常适合。

### 已有基础

项目已有 `innate-next-mono/` monorepo，包含：
- `packages/ui` — shadcn/ui 组件库（50+ 组件已就绪）
- `packages/utils` — 工具函数
- `packages/tsconfig` — TypeScript 配置
- `skills/` — 教程定义的 JSON Schema 和已有教程
- `scripts/` — Mac/Windows 安装脚本已就绪
- `docs/` — 完整的教程文档体系

---

## 三、核心难点分析与解决方案

### 难点 1：系统命令执行（难度：中高）

**挑战**：在桌面应用中安全地执行 `brew install`、`npm install` 等系统命令。

**解决方案**：

```
┌─────────────────────────────────────────────────┐
│  Frontend (Next.js + xterm.js)                  │
│  ┌─────────┐  WebSocket/Tauri Events  ┌───────┐ │
│  │ xterm.js│◄────────────────────────►│ PTY   │ │
│  │ Terminal│                           │ Layer │ │
│  └─────────┘                           └───┬───┘ │
└────────────────────────────────────────────┼─────┘
                                             │
┌────────────────────────────────────────────┼─────┐
│  Tauri Backend (Rust)                      │     │
│  ┌──────────────────────────────────────┐  │     │
│  │ shell plugin / portable-pty          │◄─┘     │
│  │ - 执行系统命令                        │        │
│  │ - 流式输出 stdout/stderr              │        │
│  │ - 进程管理（kill, pause）             │        │
│  └──────────────────────────────────────┘        │
└─────────────────────────────────────────────────┘
```

**技术细节**：
- Tauri v2 的 `shell` 插件支持执行命令并通过事件系统流式传输输出
- 使用 Tauri 的 Command 系统（`#[tauri::command]`）封装 PTY 操作
- 通过 `portable-pty`（Rust crate）或 `shell` 插件的 `Command::new().spawn()` 实现真正的终端交互
- 前端使用 xterm.js 渲染终端界面

### 难点 2：跨平台兼容（难度：中）

**挑战**：Mac 和 Windows 的命令、路径、权限完全不同。

**解决方案**：
- 复用现有的 `scripts/install/` 脚本（已有 Mac/Windows 版本）
- 在 Rust 层做平台检测，调用对应的脚本
- 教程 JSON 中的 `platform` 字段已经区分了 `macos` 和 `windows`

### 难点 3：安装过程中的权限提升（难度：中低）

**挑战**：某些安装需要 sudo（Mac）或管理员权限（Windows）。

**解决方案**：
- Mac：使用 `osascript` 弹出权限提示，或提示用户手动在终端运行
- Windows：应用启动时请求管理员权限（manifest 配置）
- 优先使用不需要 root 的方案（如 `fnm` 替代 `nvm`，`uv` 替代系统 Python）

### 难点 4：视频教程集成（难度：低）

**挑战**：教程需要配视频。

**解决方案**：
- MVP 阶段使用外部视频链接（YouTube/Bilibili）
- 后续可考虑内嵌视频播放器（Tauri 的 webview 原生支持 `<video>` 标签）

---

## 四、架构设计

### 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                    Tauri Window                         │
│  ┌────────────────────────────────────────────────────┐ │
│  │              Next.js (App Router)                   │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │ │
│  │  │ RoadMap  │ │ Tutorial │ │  Terminal View   │   │ │
│  │  │ Page     │ │ Page     │ │  (xterm.js)      │   │ │
│  │  └──────────┘ └──────────┘ └──────────────────┘   │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │ │
│  │  │ Settings │ │ Progress │ │  Video Player    │   │ │
│  │  │ Page     │ │ Tracker  │ │  (iframe/link)   │   │ │
│  │  └──────────┘ └──────────┘ └──────────────────┘   │ │
│  │                                                    │ │
│  │  State: Zustand / Jotai                            │ │
│  │  UI: shadcn/ui (已有 packages/ui)                  │ │
│  └────────────────────────────────────────────────────┘ │
│                         │ Tauri IPC                     │
│  ┌──────────────────────┼───────────────────────────┐  │
│  │              Rust Backend                         │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────┐ │  │
│  │  │ Shell Plugin│  │ PTY Manager  │  │ Config  │ │  │
│  │  │ (命令执行)   │  │ (终端管理)   │  │ Store   │ │  │
│  │  └─────────────┘  └──────────────┘  └─────────┘ │  │
│  │  ┌─────────────┐  ┌──────────────┐               │  │
│  │  │ Platform    │  │ Script       │               │  │
│  │  │ Detector    │  │ Runner       │               │  │
│  │  └─────────────┘  └──────────────┘               │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 模块划分

```
innate-next-mono/
├── apps/
│   └── desktop/                    # Tauri + Next.js 桌面应用
│       ├── src-tauri/              # Rust 后端
│       │   ├── src/
│       │   │   ├── main.rs         # Tauri 入口
│       │   │   ├── commands/       # Tauri Commands
│       │   │   │   ├── shell.rs    # Shell 命令执行
│       │   │   │   ├── pty.rs      # PTY 管理
│       │   │   │   └── platform.rs # 平台检测
│       │   │   └── scripts/        # 内置安装脚本
│       │   ├── Cargo.toml
│       │   └── tauri.conf.json
│       ├── src/                    # Next.js 前端
│       │   ├── app/
│       │   │   ├── layout.tsx
│       │   │   ├── page.tsx        # 首页 / RoadMap
│       │   │   ├── tutorial/
│       │   │   │   └── [id]/
│       │   │   │       └── page.tsx # 教程详情页
│       │   │   └── settings/
│       │   │       └── page.tsx    # 设置页
│       │   ├── components/
│       │   │   ├── terminal/       # xterm.js 终端组件
│       │   │   ├── roadmap/        # 学习路径组件
│       │   │   ├── tutorial/       # 教程卡片组件
│       │   │   └── layout/         # 布局组件
│       │   ├── lib/
│       │   │   ├── tauri.ts        # Tauri IPC 封装
│       │   │   └── tutorial-loader.ts # 教程数据加载
│       │   └── store/              # 状态管理
│       ├── package.json
│       └── next.config.js
├── packages/
│   ├── ui/         # 已有 - shadcn/ui 组件
│   ├── utils/      # 已有 - 工具函数
│   └── tsconfig/   # 已有 - TS 配置
```

### 数据流

```
用户点击"一键安装"
        │
        ▼
┌─────────────────┐
│ 前端读取 Skill   │ ← skills/beginner/terminal-setup-mac.json
│ JSON 定义        │
└────────┬────────┘
         │ 根据 steps 依次执行
         ▼
┌─────────────────┐
│ Tauri IPC       │ ← invoke('execute_step', { command, ... })
│ Command 调用    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Rust Shell      │ ← Command::new(command).spawn()
│ 执行命令        │   stdout/stderr 通过事件流式返回
└────────┬────────┘
         │ Tauri Events
         ▼
┌─────────────────┐
│ xterm.js        │ ← 实时显示命令输出
│ 渲染终端输出    │   更新步骤状态（成功/失败）
└─────────────────┘
```

---

## 五、实现计划

### Phase 1：MVP 基础框架（1-2 周）

| 任务 | 难度 | 描述 |
|------|------|------|
| T1.1 初始化 Tauri + Next.js 项目 | 低 | 在 `apps/desktop/` 创建 Tauri v2 + Next.js 应用 |
| T1.2 配置 shadcn/ui | 低 | 复用已有的 `packages/ui` |
| T1.3 实现首页 RoadMap | 低 | 展示学习路径，读取 `skills/` JSON 渲染 |
| T1.4 实现教程列表页 | 低 | 卡片式展示所有教程，按难度和平台过滤 |
| T1.5 基础布局和导航 | 低 | Sidebar + 主内容区 |

### Phase 2：终端集成（1-2 周）

| 任务 | 难度 | 描述 |
|------|------|------|
| T2.1 Rust Shell 命令层 | 中 | 封装 Tauri shell 插件，支持命令执行和输出流 |
| T2.2 xterm.js 终端组件 | 中 | 在 Next.js 中集成 xterm.js |
| T2.3 实时输出通信 | 中高 | Tauri 事件系统 + xterm.js 双向数据流 |
| T2.4 步骤执行引擎 | 中 | 按 Skill JSON 的 steps 依次执行命令 |

### Phase 3：教程系统完善（1-2 周）

| 任务 | 难度 | 描述 |
|------|------|------|
| T3.1 教程详情页 | 中 | 展示教程内容 + 内置终端 + 进度跟踪 |
| T3.2 一键安装流程 | 中 | 自动执行所有步骤，显示进度条 |
| T3.3 验证步骤 | 低 | 执行验证命令，显示安装结果 |
| T3.4 进度持久化 | 低 | 记录用户完成的教程，localStorage / 文件 |

### Phase 4：内容扩展与优化（持续）

| 任务 | 难度 | 描述 |
|------|------|------|
| T4.1 添加更多 Skill 教程 | 低 | 按已有 Schema 创建更多教程 JSON |
| T4.2 视频教程集成 | 低 | 嵌入视频链接或播放器 |
| T4.3 AI Skill 教程 | 中 | Claude Code、OpenClaw 等配置教程 |
| T4.4 打包和分发 | 中 | macOS .dmg、Windows .exe / .msi |

---

## 六、可行性结论

### 总体评估：**可行，难度中等**

| 维度 | 评分 | 说明 |
|------|------|------|
| 技术可行性 | ⭐⭐⭐⭐⭐ | Tauri v2 已生产就绪，shell 插件成熟，xterm.js 经过验证 |
| 开发难度 | ⭐⭐⭐ | 终端集成是唯一的技术挑战点，但有成熟方案 |
| 时间预估 | ⭐⭐⭐⭐ | MVP 2-4 周可完成（基于已有 monorepo 和脚本） |
| 用户价值 | ⭐⭐⭐⭐⭐ | 对非技术用户降低门槛，直接可用 |
| 可维护性 | ⭐⭐⭐⭐ | JSON Schema 驱动教程，内容与代码分离 |

### 关键优势

1. **已有大量基础**：monorepo、UI 组件库、安装脚本、教程文档体系已就绪
2. **Tauri 轻量**：安装包小，适合非技术用户下载安装
3. **JSON Schema 驱动**：教程内容通过 JSON 定义，无需改代码即可扩展
4. **shadcn/ui 丰富**：50+ 组件已准备好，UI 开发效率高

### 主要风险

1. **PTY 集成复杂度**：在 Tauri 中实现完整的伪终端交互可能需要额外的 Rust crate
2. **Windows 权限模型**：Windows 的 UAC 和 PowerShell 执行策略可能需要特殊处理
3. **中文用户环境**：部分用户可能使用中文路径，需要注意编码问题

### 建议的下一步

1. 先完成 Phase 1 的 T1.1（初始化项目），验证 Tauri + Next.js 的基本集成
2. 快速实现一个最简单的教程页面 + 手动执行脚本，验证端到端流程
3. 然后再投入终端集成的开发
