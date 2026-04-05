# Local AI Playground - 架构设计文档

## 1. 整体架构概览

Local AI Playground 旨在为用户提供**可视化环境配置**、**教程引导**、**内置工具**与**本地操作**的无缝体验。由于需要直接操作本地机器（如安装依赖、配置环境），同时提供直观的 UI 界面，整体架构建议采用 **客户端/服务端（C/S）混合架构**，并区分为**本地端（Local App）**与**Web端（Web Portal）**。

### 1.1 双端形态设计
*   **Web 端 (云端门户/只读态)**：
    *   **功能**：展示产品 ROADMAP、基础教程、云端 AI 服务（如各家云端 Claw 的聚合导航入口）、UI 组件库预览。
    *   **限制**：无法直接执行本地 shell 命令，不具备操作本地机器的权限。
*   **本地端 (Local App/全功能态)**：
    *   **功能**：全功能版本。包含 Web 端的所有展示能力，同时具备底层系统访问权限，能够执行一键安装脚本、读写本地配置文件、拉起本地 IDE，并实时捕获终端输出（Terminal Output）展示在 UI 上。

## 2. 技术选型建议 (Tech Stack)

考虑到需要快速构建跨平台桌面应用，并且兼顾 Web 端的代码复用，推荐以下技术栈：

*   **前端/UI 层 (Frontend)**：
    *   框架：React 或 Vue.js (便于构建复杂的交互组件和 Dashboard)。
    *   UI 库：Tailwind CSS + Shadcn UI 或类似现代组件库，快速搭建美观的界面。
    *   终端模拟器组件：[Xterm.js](https://xtermjs.org/) (用于在前端实时渲染后端执行的命令行输出)。
*   **本地端容器 (Desktop Wrapper)**：
    *   方案 A：**Electron** (成熟度高，Node.js 生态丰富，方便执行本地脚本和文件操作)。
    *   方案 B：**Tauri** (基于 Rust，包体积更小，内存占用更低，适合“轻量级”定位)。
*   **本地服务层 (Local Daemon/Service)**：
    *   如果使用 Electron，可以直接利用 Node.js 的 `child_process`、`fs` 模块。
    *   核心职责：代理执行 Shell 命令、管理本地配置文件（如 `.env`, `settings.json`）、管理子进程生命周期。

## 3. 核心模块设计

### 3.1 环境向导与安装模块 (Setup Wizard Module)
*   **功能**：引导用户输入必要的 API Keys、选择要安装的组件。
*   **执行器 (Executor)**：将用户的 UI 操作转化为对应的 Shell 脚本（如 `setup-glm.sh`、`brew install` 等）。
*   **状态同步**：实时将脚本的执行日志（stdout/stderr）通过 WebSocket 或 IPC 通道回传给前端，使用 Xterm.js 渲染。

### 3.2 教程与路线图模块 (Tutorial & Roadmap Module)
*   **功能**：提供结构化的 Markdown/MDX 渲染引擎，展示逐步教程。
*   **可交互代码块**：教程中的命令代码块（如 `pip install xxx`）可以直接点击“运行”按钮，在下方嵌入的终端窗口中立刻执行并查看结果。

### 3.3 效率工具与组件库模块 (Tools & Components Module)
*   **内置工具中心**：预装 AI 助手、翻译、生图等即开即用的工具。
*   **组件 Playground**：提供 ChatDashboard、UI Layout 等基础组件的拖拽或代码演示（类似 Storybook），让用户直观感受 AI 工具的组成部分。
*   **Browser CLI 引擎**：集成类似 Playwright 或 Puppeteer 的轻量级封装，允许用户通过简单的命令或 UI 操作驱动浏览器完成日常任务。

## 4. 终端透明化设计 (Terminal Integration)
“终端透明化”是本产品的核心亮点之一。
*   **实现机制**：
    1.  用户在 UI 点击“一键配置”。
    2.  前端向本地 Service 发送 `EXECUTE_TASK` 指令。
    3.  Service 启动子进程执行脚本，并将标准输出流接入 `node-pty` (或相应的伪终端库)。
    4.  输出流实时发送给前端界面的 Xterm.js 实例。
*   **用户体验**：左侧/上方是友好的 UI 引导和说明，右侧/下方是滚动的黑底白字终端日志。既降低了门槛，又保留了“黑客感”和过程的透明度。
