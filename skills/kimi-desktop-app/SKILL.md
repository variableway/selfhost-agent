# Innate Playground 桌面/Web 应用开发 Skill

> 用于在 Innate 项目中开发 Innate Playground（Tauri + Next.js 桌面/Web 应用）的专业 Skill
> 版本: 1.0.0
> 支持工具: Kimi CLI, Claude Code, Codex CLI, Cursor

---

## 用途

本 Skill 指导 AI 助手在 Innate 项目中开发 **Innate Playground** —— 一个基于 **Tauri v2 + Next.js 16 + React 19** 的交互式技能学习桌面/Web 应用。

应用主入口：`playground/apps/desktop/`

---

## 项目架构

```
playground/                          # Monorepo 根目录
├── apps/desktop/                    # Innate Playground 主应用
│   ├── src/
│   │   ├── app/                     # Next.js App Router 页面
│   │   │   ├── page.tsx             # 首页
│   │   │   ├── courses/             # 课程相关页面
│   │   │   ├── tutorials/           # 技能列表页
│   │   │   ├── tutorial/[id]/       # 技能详情页（动态路由）
│   │   │   ├── admin/               # 管理后台
│   │   │   │   ├── workspace/       # 工作区管理
│   │   │   │   └── courses/         # 课程管理
│   │   │   └── settings/            # 设置页
│   │   ├── components/
│   │   │   ├── layout/              # 布局组件（Sidebar, MenuBar, StatusBar）
│   │   │   ├── terminal-panel.tsx   # 终端面板（xterm.js）
│   │   │   ├── terminal-view.tsx    # 终端视图容器
│   │   │   ├── tutorial/
│   │   │   │   ├── run-button.tsx   # 代码运行按钮
│   │   │   │   └── tutorial-markdown.tsx
│   │   │   └── workspace/
│   │   │       └── workspace-page.tsx
│   │   ├── lib/
│   │   │   ├── tutorial-scanner.ts  # MDX/教程扫描与文件操作
│   │   │   └── tauri-storage.ts     # Zustand 持久化存储适配器
│   │   ├── store/
│   │   │   └── useAppStore.ts       # Zustand 全局状态
│   │   └── types/
│   │       └── index.ts             # TypeScript 类型定义
│   ├── src-tauri/                   # Rust Tauri 后端
│   │   ├── src/lib.rs               # PTY + 自定义命令
│   │   ├── src/main.rs              # 入口
│   │   ├── capabilities/default.json # 权限配置
│   │   ├── Cargo.toml
│   │   └── tauri.conf.json
│   ├── public/tutorials/            # 内置教程 MDX
│   │   ├── _course.json
│   │   ├── openclaw-quickstart/
│   │   ├── vibe-coding/
│   │   ├── terminal-basics/
│   │   └── *.mdx
│   ├── next.config.ts               # output: "export"
│   ├── package.json
│   └── tsconfig.json
│
├── packages/ui/                     # @innate/ui 组件库
├── packages/utils/                  # @innate/utils 工具包
├── packages/tsconfig/               # 共享 TS 配置
├── package.json                     # pnpm workspace 根配置
└── pnpm-workspace.yaml
```

---

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Tauri | v2.10.3 | 桌面应用框架 |
| Next.js | 16.2.2 | React 框架（App Router） |
| React | 19.2.4 | UI 库 |
| TypeScript | 6.x | 类型系统 |
| Tailwind CSS | v4 | 样式方案 |
| pnpm | 10.32.1 | 包管理 + workspaces |
| Zustand | v5 | 状态管理 |
| xterm.js | v5.5.0 | 终端渲染 |
| portable-pty | 0.8 | Rust PTY 后端 |
| Radix UI | — | 组件基础（@innate/ui） |
| lucide-react | 0.511.0 | 图标库 |

---

## 快速开始

### 启动开发环境

```bash
# 方式 1: 项目根目录启动脚本
./start-playground.sh

# 方式 2: 手动启动
cd playground
pnpm install
cd apps/desktop
npx tauri dev
```

**开发服务器地址**: `http://localhost:3001`

### 构建应用

```bash
cd playground/apps/desktop

# 1. 构建 Next.js 静态导出（输出到 out/）
next build

# 2. 构建 Tauri 桌面安装包
npx tauri build
```

---

## 核心开发规范

### 1. Next.js 静态导出配置

`playground/apps/desktop/next.config.ts` **必须**包含以下配置：

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",           // 静态导出（Tauri 要求）
  distDir: "out",             // 输出目录
  images: {
    unoptimized: true,        // 静态导出必须禁用图片优化
  },
  typescript: {
    ignoreBuildErrors: true,  // 减少构建阻塞
  },
  transpilePackages: ["@innate/ui", "@innate/utils"],
};

export default nextConfig;
```

**关键点**：Tauri 的 `frontendDist` 指向 `../out`，因此 Next.js 必须静态导出。

### 2. Tauri 配置

`playground/apps/desktop/src-tauri/tauri.conf.json`：

```json
{
  "$schema": "../node_modules/@tauri-apps/cli/config.schema.json",
  "productName": "Innate Playground",
  "version": "0.1.0",
  "identifier": "com.innate.playground",
  "build": {
    "frontendDist": "../out",
    "devUrl": "http://localhost:3001",
    "beforeDevCommand": "node ./node_modules/next/dist/bin/next dev --port 3001",
    "beforeBuildCommand": "node ./node_modules/next/dist/bin/next build"
  },
  "app": {
    "windows": [
      {
        "title": "Innate Playground - 边做边学",
        "width": 1200,
        "height": 800,
        "resizable": true,
        "fullscreen": false
      }
    ],
    "security": {
      "csp": null
    }
  },
  "bundle": {
    "active": true,
    "targets": "all",
    "icon": [ "icons/32x32.png", "icons/128x128.png", ... ]
  }
}
```

### 3. 页面组件必须是 "use client"

由于页面中使用 Tauri API（`window.__TAURI_INTERNALS__`），所有页面组件都必须是客户端组件：

```tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <LoadingSpinner />;
  }

  return <div>...</div>;
}
```

**为什么需要 `mounted` 状态**：
- Next.js 会先进行 SSR 渲染
- Tauri API 只在客户端 window 对象上存在
- 不等待 mounted 会导致 hydration mismatch

### 4. 禁用桌面端右键菜单

在 `app-shell.tsx` 中已全局禁用：

```tsx
useEffect(() => {
  const handler = (e: MouseEvent) => e.preventDefault();
  document.addEventListener("contextmenu", handler);
  return () => document.removeEventListener("contextmenu", handler);
}, []);
```

### 5. Tauri / Web 双端兼容判断

所有调用 Tauri API 的地方必须检查环境：

```typescript
const isTauri = (): boolean =>
  typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
```

**示例**：

```typescript
if (isTauri()) {
  const { invoke } = await import("@tauri-apps/api/core");
  await invoke("my_command", { arg: "value" });
} else {
  // Web fallback 逻辑
}
```

---

## Rust 后端开发

### 项目结构

```
src-tauri/
├── Cargo.toml
├── tauri.conf.json
├── capabilities/default.json    # 权限声明
├── build.rs
├── icons/
└── src/
    ├── main.rs
    └── lib.rs                   # 核心：PTY + 命令
```

### Cargo.toml 依赖

```toml
[dependencies]
serde_json = "1.0"
serde = { version = "1.0", features = ["derive"] }
log = "0.4"
tauri = { version = "2.10.3", features = [] }
tauri-plugin-log = "2"
tauri-plugin-shell = "2"
tauri-plugin-dialog = "2"
tauri-plugin-fs = "2"
tauri-plugin-store = "2"
portable-pty = "0.8"
tokio = { version = "1", features = ["io-util"] }
```

### 添加自定义 Rust 命令

在 `src-tauri/src/lib.rs` 中：

```rust
#[tauri::command]
fn my_command(name: &str) -> String {
    format!("Hello, {}!", name)
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            greet,
            get_platform,
            pty_write,
            pty_resize,
            my_command,   // 新命令在这里注册
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### 权限配置

新增命令后，检查 `capabilities/default.json` 是否需要新权限：

```json
{
  "permissions": [
    "core:default",
    "dialog:default",
    "dialog:allow-open",
    "fs:default",
    {
      "identifier": "fs:allow-read-dir",
      "allow": [{ "path": "$HOME/**" }]
    },
    "store:default",
    "shell:allow-execute",
    "shell:allow-spawn",
    "shell:allow-kill",
    "shell:allow-stdin-write"
  ]
}
```

---

## 状态管理（Zustand）

### Store 位置

`playground/apps/desktop/src/store/useAppStore.ts`

### 持久化配置

使用 `zustand/middleware` 的 `persist` + 自定义 `tauriStorage`：

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { tauriStorage } from '../lib/tauri-storage';

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // state and actions
    }),
    {
      name: 'innate-playground-storage',
      storage: tauriStorage,
      partialize: (state) => ({
        workspaces: state.workspaces,
        progress: state.progress,
        defaultWorkspaceId: state.defaultWorkspaceId,
      }),
    }
  )
);
```

### tauriStorage 双端适配

`playground/apps/desktop/src/lib/tauri-storage.ts`：

- **Tauri 环境**：使用 `@tauri-apps/plugin-store` 的 `app-state.json`
- **Web 环境**：回退到 `localStorage`
- **写队列**：单例 + 队列化写入，避免并发 SST 文件冲突

---

## 终端功能（PTY + xterm.js）

### 前端：terminal-panel.tsx

- 使用 `@xterm/xterm` + `@xterm/addon-fit`
- Tauri 模式：通过事件 `pty-output` / `pty-exit` 与 Rust 通信
- Web 模式：模拟常见 shell 命令（`ls`, `cd`, `node -v` 等）
- 支持右侧/底部分栏、拖拽调整大小

### 后端：lib.rs PTY 实现

```rust
// 在 setup 中初始化持久 PTY
let pty_system = native_pty_system();
let pair = pty_system.openpty(PtySize { rows: 24, cols: 80, ... })
    .expect("Failed to open PTY");

let cmd = if cfg!(windows) {
    CommandBuilder::new("cmd")
} else {
    CommandBuilder::new("sh")
};

let _child = pair.slave.spawn_command(cmd)
    .expect("Failed to spawn shell");

// 管理 writer / master
app.manage(AppPtyState(Mutex::new(AppState {
    master: Some(master),
    writer: Some(writer),
})));

// 后台线程读取 PTY 输出并推送到前端
std::thread::spawn(move || {
    // read -> app_handle.emit("pty-output", data)
});
```

### 执行命令流程

Store 中的 `executeCommandInTerminal`：

1. 显示终端面板
2. 若设置了工作区，先 `cd` 到工作区路径
3. 延迟 300ms 后发送实际命令到 PTY
4. PTY 执行并将输出通过事件流推送到 xterm.js

```typescript
executeCommandInTerminal: (command: string) => {
  const state = get();
  state.showTerminal();
  const wsPath = state.currentWorkspace?.path || ...;
  if (wsPath) {
    writeToPty(`cd "${wsPath}"\r`);
    setTimeout(() => writeToPty(command + "\r"), 300);
  } else {
    writeToPty(command + "\r");
  }
}
```

---

## UI 组件库规范

### 使用 `@innate/ui`

```tsx
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Separator,
  SidebarProvider,
  SidebarInset,
} from "@innate/ui";
import { cn } from "@innate/ui";
```

### 组件设计原则

1. **基于 Radix UI**: `packages/ui/src/components/ui/` 下所有组件都基于 Radix
2. **CVA 变体**: 使用 `class-variance-authority` 管理组件变体
3. **className 合并**: 始终使用 `cn()` 工具
4. **导出注册**: 新组件必须在 `packages/ui/src/index.ts` 导出

### 添加新 UI 组件步骤

1. 在 `playground/packages/ui/src/components/ui/` 创建组件（参考 button.tsx, card.tsx）
2. 基于 Radix UI primitive
3. Tailwind CSS 样式化
4. 在 `playground/packages/ui/src/index.ts` 中 `export * from './components/ui/xxx'`
5. 在应用中 `import { Xxx } from "@innate/ui"`

---

## 教程/课程系统

### 教程扫描器

`playground/apps/desktop/src/lib/tutorial-scanner.ts`

核心能力：
- **`scanBuiltin()`**: 扫描 `public/tutorials/` 下的内置 MDX 教程
- **`scanWorkspace(path)`**: 通过 Tauri FS API 扫描用户本地工作区的教程
- **`loadSkillContent(slug, workspacePath, courseId)`**: 加载单篇技能内容（builtin -> workspace）
- **`saveSkillToWorkspace(...)`**: 保存 MDX 到工作区
- **`generateSkillMDX(meta)`**: 根据元数据生成带 frontmatter 的 MDX

### MDX Frontmatter 格式

```yaml
---
title: 安装 Node.js
description: 使用 fnm 安装 Node.js
difficulty: beginner
duration: 10
category: dev-tools
tags: [nodejs, fnm]
source: local
---
```

### 内置课程目录结构

```
public/tutorials/
├── _course.json                   # 课程元数据
├── tutorial-001.mdx               # 独立技能
├── openclaw-quickstart/
│   ├── _course.json
│   ├── 01-install.mdx
│   ├── 02-manual-install.mdx
│   └── ...
└── terminal-basics/
    ├── _course.json
    ├── 01-ls.mdx
    └── 02-cd-pwd.mdx
```

---

## 页面路由结构

`playground/apps/desktop/src/app/`

| 路由 | 文件 | 说明 |
|------|------|------|
| `/` | `page.tsx` | 首页（Dashboard） |
| `/courses` | `courses/page.tsx` | 课程列表 |
| `/courses/detail` | `courses/detail/page.tsx` | 课程详情 |
| `/tutorials` | `tutorials/page.tsx` | 技能列表 |
| `/tutorial/[id]` | `tutorial/[id]/page.tsx` | 技能详情（MDX 渲染） |
| `/tutorial/edit` | `tutorial/edit/page.tsx` | 技能编辑 |
| `/admin/workspace` | `admin/workspace/page.tsx` | 工作区管理 |
| `/admin/courses` | `admin/courses/page.tsx` | 课程管理 |
| `/settings` | `settings/page.tsx` | 设置页 |

**动态路由页面结构示例**：

```tsx
// tutorial/[id]/page.tsx
export { default } from "./client";

// tutorial/[id]/client.tsx
"use client";
export default function TutorialDetailClient({ id }) {
  // 实际渲染逻辑
}
```

---

## 常见开发任务

### 添加新页面

1. 在 `src/app/` 下创建目录（如 `src/app/my-page/page.tsx`）
2. 文件顶部加 `"use client"`
3. 使用 `useRouter` 进行导航
4. 从 `@innate/ui` 导入 UI 组件
5. 如果需要，在 `app-sidebar.tsx` / `menu-bar.tsx` 中添加导航入口

### 添加新的 Tauri Rust 命令

1. 在 `src-tauri/src/lib.rs` 中编写 `#[tauri::command]` 函数
2. 在 `.invoke_handler(tauri::generate_handler![...])` 中注册
3. 若涉及新权限，更新 `capabilities/default.json`
4. 前端通过 `invoke("command_name", args)` 调用

### 添加内置教程

1. 在 `public/tutorials/` 下创建 `.mdx` 文件
2. 按 `01-slug.mdx` 格式命名（课程内）或 `slug.mdx`（独立）
3. 若放入课程文件夹，同步更新该文件夹的 `_course.json`
4. 若新增课程文件夹，在 `tutorial-scanner.ts` 的 `BUILTIN_COURSE_FOLDERS` 中注册
5. 在 `knownPatterns` 中补充文件名映射

### 修改全局状态

1. 打开 `src/store/useAppStore.ts`
2. 在 interface 中添加 state / action 定义
3. 在 store 实现中添加初始值和 action
4. 若需持久化，检查 `partialize` 是否需要包含新字段

---

## 最佳实践与注意事项

### ✅ Do

- [x] 所有页面组件顶部加 `"use client"`
- [x] 页面渲染前检查 `mounted` 状态，避免 hydration mismatch
- [x] Tauri API 调用前检查 `"__TAURI_INTERNALS__" in window`
- [x] 使用 `@innate/ui` 组件和 `cn()` 保持 UI 一致
- [x] 新增 Rust 命令后同步更新 `capabilities/default.json`
- [x] 使用 pnpm workspace 协议引用本地包：`"workspace:*"`
- [x] 课程文件夹内的技能文件使用编号前缀（`01-`, `02-`）控制顺序
- [x] 终端相关的命令执行使用 `writeToPty` 统一入口

### ❌ Don't

- [ ] 在页面组件中忘记 `"use client"` 导致 Tauri API 报错
- [ ] 在服务端渲染阶段直接访问 `window` 对象
- [ ] 修改 Tauri 配置后忘记同步 `frontendDist` 和 Next.js `distDir`
- [ ] 在 Zustand 中直接修改原状态对象（始终用 `set`）
- [ ] 将 `node_modules` 或 `.next` 提交到版本控制

---

## 问题排查速查

| 问题 | 排查方向 |
|------|----------|
| `window.__TAURI_INTERNALS__ is not defined` | 页面是否 `"use client"`；是否在 SSR 阶段访问 |
| Tauri dev 白屏/找不到页面 | 检查 `next.config.ts` 是否有 `output: "export"`；检查 `tauri.conf.json` 的 `devUrl` 和端口 |
| Next.js 构建失败 | 检查动态路由是否有 `generateStaticParams` 或是否在客户端加载 |
| 样式丢失/不生效 | Tailwind v4 不使用 `tailwind.config.js`，检查 `globals.css` 是否有 `@import "tailwindcss"` |
| Zustand 状态不持久 | 检查 `tauriStorage` 是否被正确使用；检查 `partialize` 配置 |
| 终端无输出 | 检查 Rust 后端 `pty_write` / `pty_resize` 是否注册；检查 `capabilities/default.json` 的 shell 权限 |
| 内置教程不显示 | 检查 `tutorial-scanner.ts` 中的 `BUILTIN_COURSE_FOLDERS` 和 `knownPatterns` 是否包含新课程 |
| pnpm workspace 包找不到 | 检查 `pnpm-workspace.yaml` 和 `package.json` 的 `dependencies` 是否使用 `workspace:*` |

---

## 更新日志

### v1.0.0 (2026-04-16)
- 初始版本
- 基于 Innate Playground (`playground/apps/desktop`) 开发规范
- 涵盖 Tauri v2 + Next.js 16 + React 19 + Tailwind v4 开发
- 包含 Zustand 持久化、PTY 终端、MDX 教程系统、@innate/ui 组件库规范
