# deeptutor Analysis

## 1. Overview & Features

DeepTutor is an **agent-native intelligent learning companion** developed by the Data Intelligence Lab at HKU (HKUDS). It combines an AI-powered tutoring backend (Python) with a modern web frontend (Next.js) to deliver a personalized, multi-modal learning experience.

### Core Features

- **Unified Chat Workspace** -- Five distinct modes coexist in a single conversation thread: Chat, Deep Solve, Quiz Generation, Deep Research, and Math Animator. Users can switch modes mid-conversation without losing context.
- **Personal TutorBots** -- Autonomous, persistent AI tutor agents (powered by nanobot) that each have their own workspace, memory, personality ("soul templates"), and skill set. They support proactive heartbeat check-ins, multi-channel deployment (Telegram, Discord, Slack, etc.), and sub-agent orchestration.
- **AI Co-Writer** -- A Markdown editor where AI acts as a first-class collaborator. Users can select text and apply rewrite, expand, or shorten actions, optionally grounding responses in knowledge bases or web search.
- **Guided Learning** -- Converts user-provided topics and materials into structured, step-by-step visual learning journeys. The system designs a learning plan, generates interactive HTML pages for each knowledge point, enables contextual Q&A alongside each step, and produces a completion summary.
- **Knowledge Hub** -- Upload PDF, Markdown, and text files to create RAG-ready knowledge bases. Organize insights across sessions in color-coded notebooks with categories and bookmarks.
- **Persistent Memory** -- Maintains a learner profile (preferences, knowledge level, goals, communication style) and a running summary of learning progress. Shared across all features and TutorBots.
- **Agent-Native CLI** -- Full-featured Typer-based CLI with interactive REPL, one-shot execution, knowledge base lifecycle management, session management, and dual output modes (rich terminal rendering for humans, structured JSON for AI agents).
- **Visualization** -- Generates charts, diagrams, and SVG graphics via Chart.js, Mermaid, or raw SVG based on natural language descriptions.
- **Playground** -- A developer/testing interface for directly executing individual tools (RAG, web search, code execution, etc.) and capabilities (deep solve, quiz generation, deep research) with live streaming output.
- **Multi-provider LLM support** -- 25+ LLM providers including OpenAI, Anthropic, Gemini, DeepSeek, Ollama, vLLM, LM Studio, and various Chinese providers (DashScope, Zhipu, VolcEngine, etc.).

## 2. Technologies

### Backend (Python 3.11+)
| Layer | Technology |
|:--|:--|
| Web Framework | FastAPI + Uvicorn |
| Real-time Communication | WebSocket (via `websockets` library) |
| LLM Integration | OpenAI SDK, Anthropic SDK (native, no litellm) |
| RAG / Document Indexing | LlamaIndex |
| Data Validation | Pydantic v2 |
| CLI Framework | Typer + Rich + prompt_toolkit |
| Embeddings | Multiple providers via OpenAI-compatible APIs |
| Database | aiosqlite (async SQLite) |
| Math Animation | Manim (optional dependency) |
| Search | Brave, Tavily, Jina, SearXNG, DuckDuckGo, Perplexity |
| Code Execution | Sandboxed Python execution |
| Agent Engine | nanobot (for TutorBot) |

### Frontend (Next.js 16 / React 19)
| Layer | Technology |
|:--|:--|
| Framework | Next.js 16 with App Router |
| UI | React 19, Tailwind CSS 3.4, CSS variables for theming |
| Charts | Chart.js + react-chartjs-2 |
| Diagrams | Mermaid, Cytoscape |
| Markdown | react-markdown + remark-gfm + remark-math + rehype-katex + rehype-raw |
| Animations | Framer Motion |
| i18n | i18next + react-i18next (English + Chinese) |
| Icons | lucide-react |
| PDF Generation | jsPDF + html2canvas |
| Code Highlighting | react-syntax-highlighter |

### DevOps
| Tool | Usage |
|:--|:--|
| Docker | Multi-stage Dockerfile, docker-compose with dev/ghcr variants |
| Pre-commit | .pre-commit-config.yaml with ruff, bandit, detect-secrets |
| CI/CD | GitHub Actions |
| Linting | Ruff (replaces Black + isort + flake8) |
| Security | Bandit, detect-secrets |

## 3. Architecture

### High-Level Architecture

```
Entry Points:  CLI (Typer)  |  WebSocket /api/v1/ws  |  Python SDK
                    |                   |                   |
              +---------------------------------------------+
              |              ChatOrchestrator                |
              |   routes to ChatCapability (default)         |
              |   or a selected deep Capability              |
              +----------+--------------+-------------------+
                         |              |
              +----------v--+  +--------v-----------+
              | ToolRegistry |  | CapabilityRegistry |
              |  (Level 1)   |  |   (Level 2)        |
              +--------------+  +--------------------+
```

### Two-Layer Plugin Model

**Level 1 -- Tools** (single-function, LLM-callable):
- `rag` -- Knowledge base retrieval (RAG)
- `web_search` -- Web search with citations
- `code_execution` -- Sandboxed Python execution
- `reason` -- Dedicated deep-reasoning LLM call
- `brainstorm` -- Breadth-first idea exploration
- `paper_search` -- arXiv academic paper search
- `geogebra_analysis` -- Image to GeoGebra commands (4-stage vision pipeline)

**Level 2 -- Capabilities** (multi-step agent pipelines):
- `chat` -- Default tool-augmented conversation
- `deep_solve` -- Plan -> Reason -> Write pipeline
- `deep_question` -- Ideation -> Evaluation -> Generation -> Validation
- `deep_research` -- Multi-agent research + reporting
- `math_animator` -- Mathematical concept to Manim animation
- `visualize` -- Natural language to Chart.js/SVG/Mermaid rendering

### Core Data Structures

**UnifiedContext** -- A single dataclass that flows through the orchestrator into every tool/capability invocation:
- `session_id`, `user_message`, `conversation_history`
- `enabled_tools`, `active_capability`, `knowledge_bases`
- `attachments` (images/files), `config_overrides`, `language`
- `notebook_context`, `history_context`, `memory_context`

**StreamEvent** -- Unified streaming event format with typed enums:
- Event types: `STAGE_START`, `STAGE_END`, `THINKING`, `OBSERVATION`, `CONTENT`, `TOOL_CALL`, `TOOL_RESULT`, `PROGRESS`, `SOURCES`, `RESULT`, `ERROR`, `SESSION`, `DONE`
- Each event carries: `type`, `source`, `stage`, `content`, `metadata`, `session_id`, `turn_id`, `seq`, `timestamp`

**StreamBus** -- Async event fan-out channel:
- Producer side: capabilities emit events via convenience helpers (`content()`, `thinking()`, `tool_call()`, `progress()`, etc.)
- Consumer side: async iterator yielding events until closed
- Supports history replay for late subscribers
- `stage()` context manager for STAGE_START/STAGE_END wrapping

### Frontend State Management

**UnifiedChatContext** -- React context + useReducer pattern managing:
- Multiple sessions with independent state (tools, capability, knowledge bases, messages)
- WebSocket connection lifecycle (UnifiedWSClient) with automatic reconnection
- Session switching, loading, and binding server-assigned IDs
- Stream event accumulation into assistant messages
- LRU eviction of cached sessions (max 20)

**Guide Session State** -- Separate state machine for Guided Learning:
- Knowledge points with per-point HTML page generation
- Page statuses: `pending` | `generating` | `ready` | `failed`
- Progress tracking and completion summaries
- Notebook integration for grounding learning plans

### Backend Module Organization

```
deeptutor/
  core/           -- StreamEvent, StreamBus, UnifiedContext, protocols
  runtime/        -- ChatOrchestrator, ToolRegistry, CapabilityRegistry, RunMode
  capabilities/   -- chat, deep_solve, deep_question, deep_research, math_animator, visualize
  tools/builtin/  -- rag, web_search, code_execution, reason, brainstorm, paper_search
  agents/         -- Multi-agent solvers (solve/), question generators (question/)
  tutorbot/       -- nanobot-based TutorBot (agent/, channels/, heartbeat/, cron/, skills/)
  services/       -- LLM config, path management, embedding, memory
  api/            -- FastAPI routers (unified WebSocket endpoint)
  cli/            -- Typer CLI entry point
```

### Communication Protocol

All real-time communication uses WebSocket with JSON messages:
- Client -> Server: `start_turn` (with content, tools, capability, knowledge_bases, config)
- Server -> Client: Stream events (NDJSON-style), each with typed envelope
- Supports turn cancellation, session subscription for resuming active turns

## 4. Applicable Features for Innate Playground

The following DeepTutor features and patterns are directly applicable to the Innate Playground project (Tauri + Next.js interactive tutorial/education desktop app):

### 4.1 Guided Learning System
**What it does**: Converts topics into structured, step-by-step visual learning journeys with interactive HTML pages for each knowledge point.

**How it maps to Innate**:
- **Executable tutorials**: The guided learning pipeline (plan -> generate interactive pages -> contextual Q&A -> completion summary) maps directly to Innate's executable tutorial concept. Each knowledge point becomes a self-contained tutorial step with rich HTML rendering.
- **Progress tracking**: The `SessionState` with per-step status tracking (`pending`/`generating`/`ready`/`failed`) and progress percentage is an excellent model for tracking tutorial completion.
- **Session persistence**: The ability to pause, resume, and revisit any step at any time is essential for desktop apps where users close and reopen.

### 4.2 Quiz / Flashcard System (Deep Question)
**What it does**: Generates quizzes from topics or documents with multiple question types (choice, written, coding), difficulty levels, answer validation, and follow-up discussion.

**How it maps to Innate**:
- **Flashcard-style UI**: The `QuizViewer` component's card-based navigation (numbered circles, prev/next, progress bar) is a direct model for flashcard-style learning. Each card shows a question, accepts an answer, and provides immediate feedback with color-coded correctness indicators.
- **Question types**: Support for choice, written, and coding question types covers most interactive tutorial assessment needs.
- **Follow-up Q&A per question**: The `QuestionFollowupPanel` enables contextual discussion about each quiz question -- this could power "explain why" functionality after a user answers incorrectly.
- **Notebook/categorization**: Questions can be bookmarked, organized into categories, and saved to notebooks for review -- useful for spaced repetition systems.
- **Question generation pipeline**: The multi-agent generation pipeline (ideation -> generation) with knowledge base grounding can be adapted to generate flashcards from tutorial content.

### 4.3 Two-Layer Plugin Architecture (Tools + Capabilities)
**What it does**: Separates single-function tools (Level 1) from multi-step agent pipelines (Level 2), with a central orchestrator routing requests.

**How it maps to Innate**:
- **Tutorial step types as tools**: Individual operations (terminal command execution, code verification, file operations) map to Level 1 tools. Each tutorial step can declare which tools it needs.
- **Tutorial flows as capabilities**: Complete tutorial workflows (learn concept -> practice -> quiz -> review) map to Level 2 capabilities. Each flow has defined stages and orchestrates tools.
- **Plugin discovery**: The manifest-based plugin system (`manifest.yaml` + capability class) enables extensible tutorial types without modifying core code.

### 4.4 Streaming Event Protocol
**What it does**: Provides a unified, typed streaming event format for all tool/capability communication with stage tracking, progress, and error handling.

**How it maps to Innate**:
- **Terminal integration**: The `TOOL_CALL`/`TOOL_RESULT` event types directly model terminal command execution and output streaming. The `stage()` context manager provides natural "running command X" -> "command output" boundaries.
- **Progress reporting**: The `PROGRESS` event type with `current`/`total` metadata enables progress bars for long-running tutorial steps (installations, builds).
- **Rich content**: `CONTENT` events with markdown support enable rich tutorial explanations to stream progressively.
- **Tauri adaptation**: The WebSocket-based protocol can be replaced with Tauri's event system (JS <-> Rust IPC) using the same event structure.

### 4.5 Knowledge Base / RAG Integration
**What it does**: Upload documents (PDF, Markdown, text) to create searchable, RAG-ready knowledge bases that power conversations, research, and quiz generation.

**How it maps to Innate**:
- **Tutorial content storage**: Tutorial materials can be organized into knowledge bases that the AI tutor draws from. This enables the tutor to give contextually relevant help.
- **Document-grounded learning**: Users can import their own materials and have the system generate tutorials, quizzes, and explanations from them.
- **Search and retrieval**: The RAG tool enables students to ask questions grounded in specific course materials rather than generic AI responses.

### 4.6 Memory and Learner Profile
**What it does**: Maintains a persistent learner profile (preferences, knowledge level, goals) and a running learning summary across all sessions.

**How it maps to Innate**:
- **Adaptive difficulty**: The learner profile enables the system to adjust tutorial difficulty, skip already-mastered content, and focus on weak areas.
- **Progress continuity**: The learning summary ensures that when a user returns, the system knows what they have already completed and can suggest next steps.
- **Personalized tutoring**: Combined with the knowledge base, memory enables the AI tutor to give explanations that reference what the user has already learned.

### 4.7 Visual Classroom Components
**What it does**: Renders diagrams (Mermaid), charts (Chart.js), SVG graphics, and math notation (KaTeX) inline in learning content.

**How it maps to Innate**:
- **Visual explanations**: The Mermaid, Chart.js, and SVG rendering pipeline enables rich visual content in tutorial steps -- flowcharts, sequence diagrams, bar charts, etc.
- **Math support**: KaTeX rendering in markdown content enables mathematical tutorials with properly rendered equations.
- **Code highlighting**: The `RichCodeBlock` component with syntax highlighting is essential for programming tutorials.

### 4.8 Playground / Developer Testing Interface
**What it does**: Provides a UI for directly executing individual tools and capabilities with live streaming output, parameter configuration, and trace visualization.

**How it maps to Innate**:
- **Tutorial preview/editing**: The playground pattern can be adapted for tutorial authors to preview and test tutorial steps before publishing.
- **Interactive debugging**: The trace panel (grouping events by stage) can show students what is happening behind the scenes during tutorial execution.
- **Tool exploration**: Students can use a playground-like interface to experiment with commands and tools freely.

### 4.9 Notebook System
**What it does**: Organizes learning records across sessions into color-coded notebooks with categories, bookmarks, and the ability to save insights from any feature.

**How it maps to Innate**:
- **Student notes**: Students can save key takeaways, code snippets, and quiz results into organized notebooks.
- **Cross-session review**: Notebooks persist across tutorial sessions, enabling spaced repetition and review.
- **Category organization**: Color-coded categories help students organize notes by topic or difficulty.

## 5. Integration Recommendations

### 5.1 Architecture Adaptation for Tauri + Next.js

**Replace WebSocket with Tauri IPC**: DeepTutor uses WebSocket for real-time communication between the Next.js frontend and FastAPI backend. In Innate Playground (Tauri + Next.js), replace this with Tauri's event system:
- Map `StreamBus` events to Tauri's `emit`/`listen` pattern
- Use Tauri commands (Rust -> JS) for synchronous operations like knowledge base queries
- Keep the same `StreamEvent` data structure for consistency

**Embed the Python backend via sidecar**: DeepTutor's Python backend can run as a Tauri sidecar process, with the frontend communicating via localhost WebSocket or Tauri's shell plugin.

### 5.2 Priority Feature Implementation

**Phase 1 -- Core Tutorial Engine** (highest priority):
1. Adopt the `StreamEvent`/`StreamBus` protocol for tutorial step execution and progress reporting
2. Implement the Guided Learning session state machine (`SessionState`) for tutorial flow management
3. Port the `RichMarkdownRenderer` with KaTeX + Mermaid + code highlighting for tutorial content display
4. Build a `TutorialOrchestrator` modeled on `ChatOrchestrator` that routes tutorial steps to appropriate handlers

**Phase 2 -- Interactive Assessment**:
1. Port the `QuizViewer` component as a flashcard UI with choice/written/coding question types
2. Implement question generation pipeline for auto-generating flashcards from tutorial content
3. Build the notebook system for bookmarking, categorization, and cross-session review
4. Add the `QuestionFollowupPanel` pattern for post-answer explanations

**Phase 3 -- AI-Powered Features**:
1. Integrate the RAG pipeline for context-aware tutoring grounded in tutorial materials
2. Implement the memory/learner profile system for adaptive difficulty and personalized pacing
3. Add the visualization pipeline (Chart.js, Mermaid, SVG) for rich visual content in tutorials
4. Build a playground-like interface for free-form tool exploration

**Phase 4 -- Advanced Features**:
1. Port the TutorBot concept as persistent desktop tutors with scheduled check-ins
2. Implement deep_solve-like multi-step problem solving for complex tutorial challenges
3. Add Co-Writer-like AI-assisted note-taking within the tutorial environment
4. Build terminal integration using the tool_call/tool_result event pattern

### 5.3 Key Code Patterns to Adopt

1. **UnifiedContext as the request envelope**: Every tutorial step request should carry the same contextual information (session, user message, enabled tools, knowledge bases, language, config). This enables seamless switching between tutorial modes.

2. **CapabilityManifest for tutorial type definitions**: Define each tutorial type (interactive, quiz, code-along, guided reading) as a manifest with stages, required tools, and configuration schema. This makes the system extensible.

3. **useReducer + Context for state management**: The `UnifiedChatContext` pattern of using a single reducer to manage complex multi-session state is well-suited for managing multiple concurrent tutorials in the desktop app.

4. **TracePanel for execution transparency**: The trace panel pattern of grouping execution events by stage and showing them in collapsible sections is ideal for showing students what terminal commands ran, what their output was, and what the AI tutor is "thinking."

5. **ProcessLogs for terminal output**: The `ProcessLogs` component that streams real-time log lines with an activity indicator is directly applicable for showing terminal command output in tutorials.

### 5.4 What NOT to Adopt

- **TutorBot multi-channel messaging** -- Innate is a desktop app; the Telegram/Discord/Slack channel integrations are not needed.
- **SSE streaming via HTTP** -- Tauri IPC is more efficient than Server-Sent Events for a desktop app.
- **Docker deployment model** -- Not relevant for a desktop application.
- **Multi-user authentication** -- Innate Playground is single-user; the planned auth system can be deferred.
- **25+ LLM provider abstraction** -- Start with 2-3 providers (OpenAI, Anthropic, Ollama for local) and expand later.
