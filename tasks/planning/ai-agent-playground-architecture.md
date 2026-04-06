# AI Agent Playground — 架构设计

> 创建时间：2026-04-06
> 状态：待 Review

## 一、系统架构总览

```
┌─────────────────────────────────────────────────────────────────┐
│                        Tauri Window                             │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                  Next.js (App Router)                     │  │
│  │                                                           │  │
│  │   ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐  │  │
│  │   │ RoadMap │  │ Tutorial │  │ Terminal │  │Settings │  │  │
│  │   │  Page   │  │  Detail  │  │  View    │  │  Page   │  │  │
│  │   └────┬────┘  └────┬─────┘  └────┬─────┘  └────┬────┘  │  │
│  │        │            │             │              │        │  │
│  │   ┌────┴────────────┴─────────────┴──────────────┴────┐  │  │
│  │   │              State Management (Zustand)           │  │  │
│  │   │   - tutorialProgress   - terminalSessions         │  │  │
│  │   │   - currentStep        - platformInfo             │  │  │
│  │   └──────────────────────┬────────────────────────────┘  │  │
│  │                          │ Tauri IPC (invoke)            │  │
│  └──────────────────────────┼───────────────────────────────┘  │
│                             │                                   │
│  ┌──────────────────────────┼───────────────────────────────┐  │
│  │                   Rust Backend                           │  │
│  │                                                          │  │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐ │  │
│  │  │ Shell Engine │ │ PTY Manager  │ │ Platform Detector│ │  │
│  │  │              │ │              │ │                  │ │  │
│  │  │ - execute()  │ │ - spawn()    │ │ - os()           │ │  │
│  │  │ - spawn()    │ │ - write()    │ │ - arch()         │ │  │
│  │  │ - kill()     │ │ - resize()   │ │ - shell()        │ │  │
│  │  └──────┬───────┘ └──────┬───────┘ └──────────────────┘ │  │
│  │         │                │                               │  │
│  │  ┌──────┴────────────────┴──────────────────────────┐   │  │
│  │  │              Script Runner                        │   │  │
│  │  │  - runSkillSteps(skill: SkillJson)                │   │  │
│  │  │  - runStep(step: Step) → StepResult               │   │  │
│  │  │  - verify(expected: string) → bool                │   │  │
│  │  └───────────────────────────────────────────────────┘   │  │
│  │                                                          │  │
│  │  ┌───────────────────────────────────────────────────┐   │  │
│  │  │              Config Store                          │   │  │
│  │  │  - 用户进度持久化                                    │   │  │
│  │  │  - 环境变量配置                                      │   │  │
│  │  │  - 应用设置                                          │   │  │
│  │  └───────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Bundled Assets                         │  │
│  │  scripts/install/*.sh / *.ps1                             │  │
│  │  skills/**/*.json                                         │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 二、前端模块设计

### 2.1 页面路由

```
/                    → 首页 (RoadMap 概览)
/tutorial/[id]       → 教程详情页 (步骤 + 终端)
/settings            → 设置页 (环境变量、平台信息)
/about               → 关于页
```

### 2.2 组件树

```
<AppLayout>
  <Sidebar>
    <RoadMapNav />         ← 学习路径导航
    <TutorialList />       ← 教程列表（按难度分组）
    <PlatformBadge />      ← 当前平台标识 (macOS/Windows)
  </Sidebar>

  <MainContent>
    <RoadMapPage>          ← /
      <ProgressOverview />  ← 总体进度
      <SkillCard />         ← 各教程卡片（含进度和状态）
    </RoadMapPage>

    <TutorialDetailPage>   ← /tutorial/[id]
      <TutorialHeader />    ← 教程标题、描述、预计时间
      <StepList />          ← 步骤列表（可展开）
      <TerminalPanel />     ← xterm.js 终端面板
      <ActionBar />         ← 一键安装 / 下一步 / 重试
    </TutorialDetailPage>

    <SettingsPage>         ← /settings
      <EnvironmentInfo />   ← 检测到的环境信息
      <APIKeyConfig />      ← API Key 配置
    </SettingsPage>
  </MainContent>
</AppLayout>
```

### 2.3 状态管理 (Zustand)

```typescript
// stores/tutorial-store.ts
interface TutorialStore {
  // 教程数据
  skills: Skill[]                    // 所有教程
  currentSkill: Skill | null         // 当前查看的教程

  // 执行状态
  isRunning: boolean                 // 是否正在执行
  currentStepIndex: number           // 当前执行步骤
  stepResults: Map<number, StepResult> // 各步骤结果

  // 进度
  completedSkills: string[]          // 已完成的教程 ID
  progress: Map<string, number>      // 各教程进度百分比

  // Actions
  loadSkills(): Promise<void>
  executeStep(index: number): Promise<StepResult>
  executeAll(): Promise<void>        // 一键安装
  retryStep(index: number): Promise<void>
}

// stores/terminal-store.ts
interface TerminalStore {
  sessions: Map<string, TerminalSession>
  activeSessionId: string | null

  createSession(id: string): void
  writeData(id: string, data: string): void
  removeSession(id: string): void
}

// stores/platform-store.ts
interface PlatformStore {
  os: 'macos' | 'windows' | 'linux'
  arch: string
  shell: string
  installedTools: Map<string, string>  // tool → version
  detectEnvironment(): Promise<void>
}
```

---

## 三、Rust 后端模块设计

### 3.1 Tauri Commands

```rust
// commands/shell.rs

/// 执行单条命令，返回完整输出
#[tauri::command]
async fn execute_command(
    command: String,
    args: Vec<String>,
    cwd: Option<String>,
) -> Result<CommandResult, String>

/// 启动命令并流式输出（通过事件）
#[tauri::command]
async fn spawn_command(
    app: AppHandle,
    command: String,
    args: Vec<String>,
    cwd: Option<String>,
) -> Result<String, String>  // 返回 session_id

/// 终止正在运行的命令
#[tauri::command]
async fn kill_command(session_id: String) -> Result<(), String>

// commands/platform.rs

/// 检测当前平台信息
#[tauri::command]
async fn detect_platform() -> PlatformInfo

/// 检查工具是否已安装
#[tauri::command]
async fn check_tool_installed(tool: String) -> Option<String>  // 返回版本号

/// 批量检查已安装工具
#[tauri::command]
async fn check_tools(tools: Vec<String>) -> HashMap<String, Option<String>>

// commands/tutorial.rs

/// 执行 Skill JSON 中定义的一个步骤
#[tauri::command]
async fn execute_step(
    app: AppHandle,
    step: Step,
    platform: String,
) -> Result<StepResult, String>

/// 执行完整 Skill 的所有步骤
#[tauri::command]
async fn execute_skill(
    app: AppHandle,
    skill: Skill,
    platform: String,
) -> Result<Vec<StepResult>, String>
```

### 3.2 事件协议

```
Rust → Frontend 事件:

  "shell:stdout"    { session_id, data }    命令标准输出
  "shell:stderr"    { session_id, data }    命令错误输出
  "shell:exit"      { session_id, code }    命令退出
  "step:started"    { step_index }          步骤开始
  "step:completed"  { step_index, result }  步骤完成
  "step:failed"     { step_index, error }   步骤失败

Frontend → Rust 调用:

  invoke('execute_command', { command, args })
  invoke('spawn_command', { command, args })
  invoke('kill_command', { sessionId })
  invoke('execute_step', { step, platform })
  invoke('execute_skill', { skill, platform })
  invoke('detect_platform')
  invoke('check_tools', { tools })
```

---

## 四、数据模型

### 4.1 Skill JSON（已有，复用 `skills/skill-schema.json`）

```typescript
interface Skill {
  id: string
  name: string
  version: string
  description: string
  level: 'beginner' | 'intermediate' | 'advanced'
  platform: ('macos' | 'windows' | 'linux')[]
  prerequisites: string[]        // 依赖的其他 Skill ID
  steps: Step[]
  estimated_time: string
  tags: string[]
  automation: {
    full_script: string          // 一键安装脚本路径
    documentation: string        // 文档路径
  }
}

interface Step {
  order: number
  title: string
  description?: string
  action: {
    type: 'script' | 'manual' | 'verification'
    command: string
    expected_output?: string
    documentation?: string
  }
}
```

### 4.2 执行结果

```typescript
interface StepResult {
  stepIndex: number
  status: 'success' | 'failed' | 'skipped'
  output: string
  error?: string
  duration: number               // 毫秒
}

interface CommandResult {
  stdout: string
  stderr: string
  exitCode: number
  duration: number
}
```

### 4.3 用户进度

```typescript
interface UserProgress {
  completedSkills: string[]      // 已完成的 Skill ID
  skillProgress: {
    [skillId: string]: {
      completedSteps: number[]
      lastAttemptAt: string      // ISO 时间戳
      status: 'not_started' | 'in_progress' | 'completed' | 'failed'
    }
  }
  platform: PlatformInfo
  installedTools: Record<string, string>  // tool → version
}
```

---

## 五、目录结构（实现后）

```
innate-next-mono/
├── apps/
│   └── desktop/
│       ├── src-tauri/
│       │   ├── src/
│       │   │   ├── main.rs
│       │   │   ├── commands/
│       │   │   │   ├── mod.rs
│       │   │   │   ├── shell.rs
│       │   │   │   ├── platform.rs
│       │   │   │   └── tutorial.rs
│       │   │   ├── shell/
│       │   │   │   ├── mod.rs
│       │   │   │   ├── executor.rs     # 命令执行器
│       │   │   │   └── pty.rs          # PTY 管理
│       │   │   └── platform/
│       │   │       ├── mod.rs
│       │   │       └── detector.rs     # 平台检测
│       │   ├── scripts/                # 打包进应用的安装脚本
│       │   │   ├── mac/
│       │   │   └── windows/
│       │   ├── Cargo.toml
│       │   ├── tauri.conf.json
│       │   └── capabilities/
│       │       └── shell.json          # Shell 插件权限配置
│       ├── src/
│       │   ├── app/
│       │   │   ├── layout.tsx
│       │   │   ├── page.tsx            # RoadMap 首页
│       │   │   ├── tutorial/
│       │   │   │   └── [id]/
│       │   │   │       └── page.tsx
│       │   │   └── settings/
│       │   │       └── page.tsx
│       │   ├── components/
│       │   │   ├── layout/
│       │   │   │   ├── app-layout.tsx
│       │   │   │   ├── sidebar.tsx
│       │   │   │   └── header.tsx
│       │   │   ├── roadmap/
│       │   │   │   ├── roadmap-view.tsx
│       │   │   │   ├── skill-card.tsx
│       │   │   │   └── progress-overview.tsx
│       │   │   ├── tutorial/
│       │   │   │   ├── tutorial-detail.tsx
│       │   │   │   ├── step-list.tsx
│       │   │   │   ├── step-item.tsx
│       │   │   │   └── action-bar.tsx
│       │   │   └── terminal/
│       │   │       ├── terminal-panel.tsx
│       │   │       └── terminal-output.tsx
│       │   ├── lib/
│       │   │   ├── tauri.ts            # Tauri IPC 封装
│       │   │   ├── types.ts            # 类型定义
│       │   │   └── skill-loader.ts     # Skill JSON 加载
│       │   └── store/
│       │       ├── tutorial-store.ts
│       │       ├── terminal-store.ts
│       │       └── platform-store.ts
│       ├── package.json
│       ├── next.config.js
│       └── tailwind.config.ts
├── packages/
│   ├── ui/            # 已有
│   ├── utils/         # 已有
│   └── tsconfig/      # 已有
```

---

## 六、安全设计

### 6.1 Shell 命令安全

```
命令执行白名单:

允许的命令:
  ✓ brew, npm, node, python, pip, fnm, uv, git
  ✓ scripts/install/*.sh / *.ps1 (内置脚本)
  ✓ echo, cat, which, where, ver (验证命令)

需要确认的命令:
  ⚠ curl | sh 模式 (如 Homebrew 安装)
  ⚠ sudo / 管理员权限操作
  ⚠ 环境变量修改 (.zshrc, .bashrc, PATH)

禁止的命令:
  ✗ rm -rf /
  ✗ format, del /s
  ✗ 任何非 Skill JSON 定义的命令
```

### 6.2 Tauri Capabilities 配置

```json
{
  "identifier": "shell-capability",
  "windows": ["main"],
  "permissions": [
    "shell:allow-execute",
    "shell:allow-spawn",
    "shell:allow-kill"
  ],
  "scope": [
    { "cmd": "brew", "args": true },
    { "cmd": "npm", "args": true },
    { "cmd": "node", "args": true },
    { "cmd": "python3", "args": true },
    { "cmd": "fnm", "args": true },
    { "cmd": "uv", "args": true },
    { "cmd": "git", "args": true }
  ]
}
```

---

## 七、通信流程

### 7.1 一键安装流程

```
用户点击"一键安装"
    │
    ▼
[前端] tutorialStore.executeAll()
    │
    ▼
[前端] 依次调用 invoke('execute_step', { step, platform })
    │
    ▼
[Rust] 解析 step.action.command
    │
    ├── step.action.type == 'script'
    │       │
    │       ▼
    │   Shell::spawn(command)
    │       │
    │       ├── emit("shell:stdout", { data })  ──► xterm.js 渲染
    │       ├── emit("shell:stderr", { data })  ──► xterm.js 渲染(红色)
    │       └── emit("shell:exit", { code })    ──► 判断成功/失败
    │
    ├── step.action.type == 'verification'
    │       │
    │       ▼
    │   Shell::execute(command) → 比对 expected_output
    │
    └── step.action.type == 'manual'
            │
            ▼
        显示手动操作提示，等待用户确认

[Rust] 返回 StepResult
    │
    ▼
[前端] 更新步骤状态 UI → 下一步 or 报错
```

### 7.2 环境检测流程

```
应用启动
    │
    ▼
[Rust] detect_platform() → { os, arch, shell }
    │
    ▼
[Rust] check_tools(["node", "npm", "python3", "pip", "fnm", "uv", "git", "brew"])
    │
    ▼
[前端] 更新 platformStore.installedTools
    │
    ▼
[前端] 根据已安装工具，标记 Skill 的 prerequisites 状态
    │
    ▼
[前端] RoadMap 页面显示各教程的可用状态
```
