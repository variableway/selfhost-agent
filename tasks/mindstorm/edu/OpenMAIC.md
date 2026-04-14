# OpenMAIC Analysis

## 1. Overview & Features

**OpenMAIC** (Open Multi-Agent Interactive Classroom) is an open-source AI-powered educational platform developed by THU-MAIC (Tsinghua University). It transforms any topic or document into a rich, interactive classroom experience in one click.

### Core Purpose
The system automatically generates complete educational courses from user prompts or uploaded documents, then delivers them through an immersive multi-agent classroom where AI teachers and AI classmates interact with the learner in real time.

### Main Features

**Lesson Generation (Two-Stage Pipeline)**
- Stage 1: AI analyzes user requirements (topic description, uploaded PDF/PPTX/docs) and generates a structured lesson outline with scene descriptions
- Stage 2: Each outline item becomes a fully rendered "scene" -- slides, quizzes, interactive simulations, or PBL activities -- complete with AI narration actions

**Four Scene Types**
1. **Slides** -- Canvas-based slide presentations with AI teacher delivering lectures via voice narration, spotlight effects, and laser pointer animations
2. **Quiz** -- Interactive quizzes (single-choice, multiple-choice, short-answer) with real-time AI grading and feedback
3. **Interactive Simulation** -- HTML-based interactive experiments (physics simulators, flowcharts, data visualizations) for hands-on learning
4. **PBL (Project-Based Learning)** -- Choose a role and collaborate with AI agents on structured projects with milestones, issues, and deliverables

**Multi-Agent Classroom**
- AI agents with distinct roles (teacher, assistant, student peers) and personalities
- Classroom Discussion -- agents proactively initiate discussions; user can jump in
- Roundtable Debate -- multiple agents discuss a topic with whiteboard illustrations
- Q&A Mode -- ask questions freely; AI teacher responds with slides, diagrams, or whiteboard drawings
- Whiteboard -- agents draw on a shared whiteboard in real time (text, shapes, charts, tables, LaTeX formulas, lines)

**Export**
- PowerPoint (.pptx) with images, charts, and LaTeX formulas
- Interactive HTML pages (self-contained)

**Additional Capabilities**
- Text-to-Speech (TTS) with multiple voice providers
- Automatic Speech Recognition (ASR) for voice interaction
- Web Search integration for up-to-date information
- Internationalization (Chinese and English)
- Dark mode
- OpenClaw integration for messaging app control (Feishu, Slack, Telegram, etc.)

## 2. Technologies

### Frontend
- **Next.js 16** (App Router) with React 19 and TypeScript 5
- **Tailwind CSS 4** for styling with shadcn/ui + Radix UI components
- **Zustand** for state management (multiple stores: stage, canvas, settings, media generation, whiteboard history)
- **Dexie** (IndexedDB) for client-side persistent storage (9-table schema: stages, scenes, audioFiles, imageFiles, snapshots, chatSessions, playbackState, stageOutlines, mediaFiles, generatedAgents)
- **ProseMirror** for rich text editing
- **ECharts** for chart rendering
- **KaTeX / Temml** for LaTeX formula rendering
- **React Flow (@xyflow/react)** for flow-based visualizations
- **Motion** (Framer Motion successor) for animations
- **i18next** for internationalization

### AI / LLM
- **Vercel AI SDK** (`ai`, `@ai-sdk/react`) for streaming chat completions
- **LangGraph** (`@langchain/langgraph`, `@langchain/core`) for multi-agent orchestration via state graphs
- **CopilotKit** for AI assistant integration
- **OpenAI SDK** as fallback provider interface
- Provider abstraction supporting: OpenAI, Anthropic, Google Gemini, DeepSeek, MiniMax, Grok (xAI), Qwen, Kimi, GLM, SiliconFlow, Doubao, Ollama, and any OpenAI-compatible API
- Unified provider model with three API types: `openai`, `anthropic`, `google`

### Media & Generation
- **TTS Providers**: OpenAI, Azure, GLM, Qwen, MiniMax, ElevenLabs
- **ASR Providers**: OpenAI Whisper, Qwen
- **Image Generation**: Seedream, Qwen Image, Nano Banana, MiniMax, Grok
- **Video Generation**: Seedance, Kling, Veo, Sora, MiniMax, Grok
- **PDF Processing**: unpdf, MinerU for advanced document parsing
- **Web Search**: Tavily API

### Infrastructure
- **pnpm** monorepo with workspace packages (`pptxgenjs`, `mathml2omml`)
- **Vercel** deployment with serverless API routes (~18 endpoints)
- **Docker** support with `docker-compose.yml`
- **Vitest** for unit tests, **Playwright** for E2E tests
- **Prettier + ESLint** for code quality

## 3. Architecture

### High-Level Architecture

```
User Input (topic/docs)
        |
  [Generation Pipeline]  -- Two-stage AI generation
        |
  Stage + Scenes (stored in IndexedDB)
        |
  [Playback Engine]  -- State machine for classroom delivery
        |
  [Action Engine]  -- Executes 16+ action types on slides/whiteboard
        |
  [Multi-Agent Orchestration]  -- LangGraph director graph
        |
  UI Components (Stage, ChatArea, SceneSidebar, CanvasArea, Roundtable)
```

### Core Modules

#### 3.1 Generation Pipeline (`lib/generation/`)
The two-stage content generation system:
- **`pipeline-runner.ts`** -- Top-level orchestration: creates `GenerationSession`, calls Stage 1 (outline), then Stage 2 (scenes)
- **`outline-generator.ts`** -- Stage 1: User requirements + optional PDF content -> structured `SceneOutline[]` with type, title, key points, duration, and type-specific config (quizConfig, interactiveConfig, pblConfig)
- **`scene-generator.ts`** -- Stage 2: Each outline -> full scene content (PPTist slide elements, quiz questions, interactive HTML, PBL project config) with AI-generated actions
- **`scene-builder.ts`** -- Standalone scene construction utilities
- **`action-parser.ts`** -- Parses AI-structured output into typed `Action` objects
- **`json-repair.ts`** -- Robust JSON parsing for LLM output
- **`interactive-post-processor.ts`** -- Post-processes generated interactive HTML
- **`prompt-formatters.ts`** -- Builds system/user prompts for AI calls
- **`prompts/`** -- Template-based prompt system with snippets and templates

Key data structures:
```typescript
// Stage 1 output
interface SceneOutline {
  id: string;
  type: 'slide' | 'quiz' | 'interactive' | 'pbl';
  title: string;
  description: string;
  keyPoints: string[];
  order: number;
  quizConfig?: { questionCount, difficulty, questionTypes };
  interactiveConfig?: { conceptName, conceptOverview, designIdea };
  pblConfig?: { projectTopic, projectDescription, targetSkills };
  mediaGenerations?: MediaGenerationRequest[];
}

// Generation session tracking
interface GenerationSession {
  id: string;
  requirements: UserRequirements;
  sceneOutlines?: SceneOutline[];
  progress: GenerationProgress; // currentStage, overallProgress, stageProgress
}
```

#### 3.2 Multi-Agent Orchestration (`lib/orchestration/`)
LangGraph-based director system:
- **`director-graph.ts`** -- `StateGraph` with nodes: `director` (decides which agent speaks) and `agent_generate` (generates agent response). Topology: `START -> director -> agent_generate -> director (loop) -> END`
- **`director-prompt.ts`** -- Builds the director LLM prompt with conversation history, agent summaries, whiteboard ledger. Parses director decisions (next agent, end, cue user)
- **`prompt-builder.ts`** -- Builds structured prompts for individual agents with system prompt, conversation context, store state (current scene, mode, whiteboard state)
- **`stateless-generate.ts`** -- Streaming response parser for agent output with structured action extraction
- **`tool-schemas.ts`** -- Defines available action schemas per agent role
- **`ai-sdk-adapter.ts`** -- Bridges Vercel AI SDK `LanguageModel` to LangGraph's expected interface
- **`registry/`** -- Agent registry with Zustand store for managing agent configurations (default + generated agents)

Key data structures:
```typescript
// LangGraph state
OrchestratorState = {
  messages, storeState, availableAgentIds, maxTurns,
  languageModel, thinkingConfig, discussionContext,
  currentAgentId, turnCount, agentResponses: AgentTurnSummary[],
  whiteboardLedger: WhiteboardActionRecord[], shouldEnd
}

// Agent configuration
interface AgentConfig {
  id, name, role, persona, avatar, color,
  allowedActions: string[], priority, voiceConfig
}
```

#### 3.3 Playback Engine (`lib/playback/`)
State machine driving classroom delivery:
- States: `idle`, `playing`, `paused`, `live`
- Transitions triggered by user interaction or automatic progression
- Manages action sequencing within scenes (speech -> whiteboard draw -> spotlight, etc.)
- Supports both autonomous mode (auto-advance) and playback mode (manual control)

#### 3.4 Action Engine (`lib/action/engine.ts`)
Unified execution layer for all agent actions:
- **Fire-and-forget actions**: spotlight (focus on element, dim rest), laser (point at element)
- **Synchronous actions**: speech (TTS playback), whiteboard operations (open/close, draw text/shape/chart/latex/table/line, clear, delete), video playback, discussion trigger
- Each action type has typed parameters (coordinates, dimensions, colors, content)
- Auto-opens whiteboard when draw actions arrive while it is closed
- Manages animation timing (fade-in delays, cascade clear animations)

#### 3.5 Slide System (`lib/types/slides.ts`, `components/slide-renderer/`)
PPTist-compatible canvas-based slide editor:
- 9 element types: text, image, shape, line, chart, table, latex, video, audio
- Full property model: positioning (left/top/width/height), rotation, grouping, linking, shadows, outlines, gradients, animations
- Canvas viewport with configurable ratio and size
- Slide backgrounds: solid color, image, gradient
- Animation system: entrance/exit/attention effects with click/meantime/auto triggers

#### 3.6 State Management (`lib/store/`)
Zustand stores:
- **`stage.ts`** -- Core store: Stage (course), Scenes[], currentSceneId, generation state, chat sessions, mode (autonomous/playback). Persists to IndexedDB via debounced save
- **`canvas.ts`** -- Canvas rendering state: zoom, grid, selection, effects (spotlight, laser), whiteboard open/close, video playback
- **`settings.ts`** -- All user preferences: providers (API keys, base URLs, models), TTS/ASR config, agent settings, layout preferences. Persisted to localStorage with server sync
- **`media-generation.ts`** -- Async media generation task tracking (images/videos)
- **`whiteboard-history.ts`** -- Undo/redo snapshots for whiteboard
- **`snapshot.ts`** -- Scene-level undo/redo snapshots

#### 3.7 Data Persistence (`lib/utils/database.ts`)
Dexie (IndexedDB) with 9 tables across 9 schema versions:
- `stages` -- Course metadata
- `scenes` -- Scene content (slide elements, quiz questions, interactive HTML, PBL config)
- `audioFiles` -- TTS audio blobs
- `imageFiles` -- Image blobs
- `chatSessions` -- Multi-agent chat history
- `playbackState` -- Playback progress per course
- `stageOutlines` -- Generation outlines for resume-on-refresh
- `mediaFiles` -- AI-generated media (images/videos) with compound key `stageId:elementId`
- `generatedAgents` -- AI-generated agent profiles

#### 3.8 API Routes (`app/api/`)
~18 server endpoints:
- **Generation**: `/api/generate/scene-outlines-stream`, `/api/generate/scene-content`, `/api/generate/image`, `/api/generate/video`, `/api/generate/tts`, `/api/generate/agent-profiles`, `/api/generate/scene-actions`
- **Async Jobs**: `/api/generate-classroom` (submit + poll via jobId)
- **Chat**: `/api/chat` (SSE streaming for multi-agent), `/api/pbl/chat`
- **Quiz**: `/api/quiz-grade`
- **Media**: `/api/proxy-media`, `/api/classroom-media/[classroomId]/[...path]`
- **Utility**: `/api/parse-pdf`, `/api/transcription`, `/api/web-search`, `/api/verify-*` (model/provider checks), `/api/health`, `/api/access-code/*`

#### 3.9 PBL System (`lib/pbl/`)
Project-Based Learning module:
- `PBLProjectConfig` with project info, agents (roles), issue board (tasks with assignees), and chat
- MCP (Model Context Protocol) integration for structured project management: `project-mcp.ts`, `agent-mcp.ts`, `issueboard-mcp.ts`, `mode-mcp.ts`
- Agent templates with role divisions (management vs development)
- System prompt builder for PBL-specific agent behavior

#### 3.10 AI Provider Abstraction (`lib/ai/`)
- `providers.ts` -- Unified provider registry with model metadata, capability detection (streaming, tools, vision, thinking), and adapter selection
- `llm.ts` -- LLM call abstraction that handles provider-specific formatting, thinking mode, and streaming
- `thinking-context.ts` -- React context for managing thinking/reasoning configuration across the app

## 4. Applicable Features for Innate Playground

### 4.1 Direct Applicability: Generation Pipeline for Tutorials
The two-stage generation pipeline (outline -> scenes) maps directly to generating executable tutorials. Instead of "classroom scenes", the pipeline can produce "tutorial steps" with:
- Step outlines (analogous to SceneOutline) with type (explanation, exercise, quiz, hands-on)
- Step content generation (analogous to scene content) with actions

### 4.2 Multi-Agent Teaching System
The multi-agent orchestration pattern (LangGraph director + role-based agents) can be adapted for:
- An AI tutor agent that guides users through tutorials
- An AI peer agent that demonstrates common mistakes
- A director that decides when to explain, quiz, or let the user practice
- The agent registry and configuration system allows users to customize learning companions

### 4.3 Quiz and Assessment System
The quiz infrastructure (single/multiple/short-answer, AI grading, feedback) can be directly reused for flashcard-style assessment:
- QuizContent type with QuizQuestion[] structure
- AI-powered grading via `/api/quiz-grade`
- Real-time feedback with explanations

### 4.4 Action System for Visual Demonstrations
The 16+ action types provide a vocabulary for visual demonstrations in tutorials:
- Spotlight/laser for focusing attention on specific UI elements
- Whiteboard drawing for step-by-step explanations
- Chart/table rendering for data visualization
- LaTeX support for mathematical formulas
- The fire-and-forget vs synchronous distinction is useful for terminal integration (sync = wait for command output, async = show highlights)

### 4.5 Interactive Simulation Framework
The interactive scene type (HTML sandbox in iframe) is directly applicable:
- Embed executable code playgrounds
- Interactive terminal simulations
- Visual demonstrations of concepts
- The `interactiveConfig` structure (conceptName, conceptOverview, designIdea) maps well to tutorial exercise definitions

### 4.6 Slide-Based Content Delivery
The canvas-based slide system can render tutorial "pages" with:
- Rich content (text, images, code blocks via monospace text, charts)
- Progressive reveal via animations
- Spotlight/laser effects for guided tutorials

### 4.7 State Management and Persistence
The Zustand + Dexie (IndexedDB) pattern is portable to Tauri:
- Zustand stores work in any React environment
- IndexedDB is available in Tauri's WebView
- The debounced save pattern is production-ready
- The generation state machine (idle -> generating -> completed/error) with retry logic is directly useful

### 4.8 Provider Abstraction
The multi-provider LLM abstraction (OpenAI, Anthropic, Google, DeepSeek, etc.) with unified API is valuable for:
- Allowing users to bring their own API keys
- Fallback provider chains
- Per-task model selection (cheap model for outlines, powerful model for complex generation)

### 4.9 PBL System for Project-Based Tutorials
The PBL module's issue board and role-based agent collaboration can structure hands-on tutorials:
- Milestones map to tutorial chapters
- Issues map to exercises
- Role selection lets users pick their difficulty (beginner gets more hints)

### 4.10 TTS/ASR Integration
Voice capabilities enhance accessibility:
- Read tutorial explanations aloud
- Voice commands for hands-free navigation
- Multi-language TTS for internationalization

## 5. Integration Recommendations

### 5.1 Architecture Mapping: OpenMAIC -> Innate Playground

| OpenMAIC Concept | Innate Playground Equivalent |
|---|---|
| Stage (course) | Tutorial Course / Learning Path |
| Scene (page) | Tutorial Step / Lesson Page |
| Slide | Explanation Page (rich content) |
| Quiz | Flashcard / Assessment |
| Interactive | Executable Exercise (terminal playground) |
| PBL | Hands-on Project |
| Agent | AI Tutor / Learning Companion |
| Action | Tutorial Animation / UI Command |
| Generation Pipeline | Tutorial Content Generator |

### 5.2 Recommended Integration Approach

**Phase 1: Core Type System Adoption**
Adopt the TypeScript type definitions from `lib/types/` as the data model foundation:
- `Scene`, `SceneContent`, `SceneType` -> Tutorial step types
- `Action` union type -> Tutorial action vocabulary
- `Slide`, `PPTElement` -> Rich content rendering
- `QuizQuestion`, `QuizOption` -> Flashcard/quiz data model
- `GenerationSession`, `GenerationProgress` -> Tutorial generation state

**Phase 2: Generation Pipeline Adaptation**
Port the two-stage generation pipeline:
1. User describes what they want to learn (topic + skill level)
2. Stage 1: Generate tutorial outline (step-by-step plan)
3. Stage 2: Generate step content with actions (explanations, exercises, quizzes)
4. Adapt `prompt-formatters.ts` and `prompts/templates/` for tutorial-specific prompts

**Phase 3: Multi-Agent Tutor System**
Implement a simplified version of the LangGraph director graph:
- Single "tutor" agent for MVP (use the single-agent code path which skips LLM director calls)
- Add peer agents later for collaborative learning
- Port `prompt-builder.ts` for building tutor prompts with context (current step, user progress)

**Phase 4: Action Engine for Terminal Integration**
Extend the ActionEngine for Tauri-specific actions:
- Keep: spotlight, laser, speech, whiteboard, chart, table, latex
- Add: `terminal_execute` (run shell command), `terminal_type` (simulate typing), `file_open` (open file in editor), `browser_navigate` (open URL)
- The synchronous action pattern (await completion) maps naturally to terminal commands (await output)

**Phase 5: Visual Classroom UI**
Port the stage component architecture:
- Scene sidebar -> Tutorial step navigation
- Canvas area -> Content renderer (slide, quiz, interactive)
- Chat area -> AI tutor conversation
- Roundtable -> Multi-agent discussion (future)
- Whiteboard -> Step-by-step visual explanations

### 5.3 Technical Considerations for Tauri + Next.js

**What Works Directly:**
- All React components and hooks (Next.js App Router patterns work in Tauri's WebView)
- Zustand state management
- Dexie/IndexedDB for client-side storage
- Tailwind CSS styling
- i18next internationalization
- Vercel AI SDK streaming (client-side)

**What Needs Adaptation:**
- API routes -> Tauri commands (Rust backend) or a local Next.js server running inside Tauri
- LangGraph orchestration -> Either keep as server-side API or port director logic to client-side
- Server-sent events -> Tauri event system or WebSocket for local communication
- File system access -> Tauri FS APIs instead of browser-only approaches
- Terminal integration -> Tauri shell plugin for executing commands

**What to Replace:**
- Vercel deployment -> Tauri desktop packaging
- `server-providers.yml` -> Tauri config or local settings file
- Cookie-based auth -> Tauri secure storage
- SSR middleware -> Client-side only

### 5.4 Code Reuse Strategy

**High Reuse (copy with minor edits):**
- `lib/types/` -- All type definitions (data model foundation)
- `lib/generation/` -- Generation pipeline (core AI logic)
- `lib/orchestration/` -- Multi-agent system
- `lib/action/` -- Action engine
- `lib/store/` -- State management patterns
- `lib/utils/` -- Utility functions (geometry, element, audio-player)
- `configs/` -- Shape paths, themes, fonts, hotkeys

**Medium Reuse (adapt for Tauri):**
- `lib/ai/` -- Provider abstraction (works client-side)
- `lib/audio/` -- TTS/ASR providers
- `lib/media/` -- Image/video generation
- `components/scene-renderers/` -- Quiz, interactive, PBL renderers
- `components/slide-renderer/` -- Canvas-based slide system
- `components/whiteboard/` -- SVG whiteboard
- `components/agent/` -- Agent avatar and config UI

**Low Reuse (reference only):**
- `app/api/` -- Next.js API routes (reimplement as Tauri commands)
- `middleware.ts` -- Next.js specific
- `lib/server/` -- Server-side logic (SSRF guard, classroom storage, job runner)
- `Dockerfile`, `vercel.json` -- Deployment config

### 5.5 Key Design Patterns to Adopt

1. **Two-stage generation with progress tracking** -- The `GenerationSession` + `GenerationProgress` pattern gives users real-time feedback during tutorial creation

2. **Stateless multi-agent API** -- Client maintains all state, server is stateless. This maps well to Tauri where the local backend is always available

3. **Action-based agent interaction** -- Agents communicate through typed actions, not free-form text. This makes tutorial steps deterministic and replayable

4. **Scene-type polymorphism** -- A single `Scene` interface with discriminated union content types (slide/quiz/interactive/pbl) allows heterogeneous tutorial steps in one course

5. **Agent role-based capabilities** -- Different agent roles get different action sets, ensuring generated content stays within the agent's demonstrated capabilities

6. **IndexedDB with Dexie for rich data** -- The schema design (9 tables with foreign keys) demonstrates how to persist complex educational content client-side without a server database
