# Local AI Playground - 架构设计文档 (Gemini 3.1 版)

## 1. 整体架构原则
Local AI Playground 需要同时满足“轻量级”、“跨平台”、“本地环境操控”和“友好的图形化引导”等需求。由于需要执行本地脚本并实时捕获终端输出，系统架构必须采用 **C/S (客户端/服务端) 混合架构**。为最大化代码复用率，前端 UI 应尽可能一套代码同时适配 Web 端和本地桌面端。

## 2. 双端形态与沙盒机制
*   **Web 端 (云端沙盒态)**：
    *   主要用于展示 ROADMAP、教程说明、组件文档（类似 Storybook）以及各大云 Claw 的入口导航。
    *   **限制**：无法突破浏览器沙盒操作本地系统，所有涉及本地执行的“一键安装”按钮将被替换为“下载客户端”或“复制命令”。
*   **本地端 (原生操作态)**：
    *   作为全功能客户端，拥有系统级权限。
    *   能够拉起子进程（Child Process）执行 Bash/PowerShell 脚本，读写本地配置文件（如环境变量、Settings.json），并在 UI 中嵌入真实的 Terminal 模拟器实时回传日志。

## 3. 技术选型方案

为实现上述架构，推荐采用以下技术栈：
*   **前端/UI 渲染层**：
    *   **框架**：React + TypeScript (提供最佳的组件化能力)。
    *   **UI 库**：Tailwind CSS + Shadcn UI 或类似现代组件库，快速搭建配置向导和控制台面板。
    *   **终端模拟器**：[Xterm.js](https://xtermjs.org/) (用于在前端完美渲染本地命令行输出流)。
*   **本地桌面容器 (Desktop Container)**：
    *   推荐使用 **Tauri (Rust)** 或 **Electron (Node.js)**。鉴于产品定位“轻量级”，Tauri 在包体积和内存占用上有显著优势；但考虑到需要大量执行 Node.js 生态的脚本（如 NPM 安装、Puppeteer 操作），Electron 可能会带来更低的接入成本。
*   **本地代理服务 (Local Daemon)**：
    *   作为 UI 和操作系统的中间层，负责接收前端指令（如 `INSTALL_OPENCLAW`），生成并执行对应的 Shell 脚本，并将 stdout/stderr 流式返回给前端的 Xterm.js。

## 4. 核心模块与子系统设计

### 4.1 环境配置引擎 (Environment Setup Engine)
*   **交互向导**：引导用户输入必要的 API Keys、选择要安装的组件路径等。
*   **脚本执行器**：将 UI 配置转化为对应的本地执行命令（如 `curl`, `brew`, `npm install` 等），自动生成相应的 `.env` 或 `settings.json` 文件。
*   **状态同步机制**：UI 界面与后台执行状态解耦，通过 WebSocket/IPC 实时同步进度条和日志。

### 4.2 互动式教程阅读器 (Interactive Tutorial Reader)
*   提供结构化的 Markdown/MDX 渲染。
*   **代码块执行能力**：教程中的示例代码块（如 `pip install openai` 或一段 Python 测试代码）旁附带“运行”按钮，点击后直接发送至本地代理服务执行，结果在下方终端展示。

### 4.3 效率工具与组件挂载点 (Tools & Components Registry)
*   **内置效率工具集**：预置 AI 助手、翻译、生图等即开即用的独立模块。
*   **UI/Chat 组件演示区**：提供类似 Storybook 的 Playground，展示 ChatDashboard、UI Layout 的代码与效果，让用户直观感受 AI 工具的组成要素。
*   **浏览器自动化服务**：集成无头浏览器（Headless Browser，如 Playwright/Puppeteer），封装成简易的 CLI 命令供前端调用，完成诸如“自动抓取网页总结”等复杂任务。

## 5. 终端透明化实现路径 (Terminal Transparency)
本产品的核心体验“透明化执行过程”通过以下机制实现：
1.  **用户触发**：用户在 UI 点击“一键安装 OpenClaw”。
2.  **指令下发**：前端通过 IPC 通道向本地 Service 发送 `EXECUTE_TASK`。
3.  **进程拉起**：Service 拉起 `node-pty` (或相应的伪终端进程) 执行脚本。
4.  **流式传输**：`node-pty` 捕获标准输出和标准错误流，实时推送回前端。
5.  **UI 渲染**：前端界面的左侧保留友好的步骤引导，右侧或下方的 Xterm.js 实例滚动显示黑底白字的终端日志。既消除了用户的恐惧感，也保留了真实的“黑客”体验。
