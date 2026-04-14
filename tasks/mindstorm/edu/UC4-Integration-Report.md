# UC4 Integration Report: Open Source Projects for Innate Playground

> Date: 2026-04-14
> Context: Innate Playground — Tauri + Next.js desktop app with executable tutorials, terminal, flashcard UI, visual classroom

---

## Executive Summary

Five open-source projects were analyzed for integration potential with Innate Playground:

| Project | Type | Integration Priority |
|---------|------|---------------------|
| **OpenMAIC** | Full-stack AI classroom (Next.js 16 + React 19) | **Highest** — same stack, direct component reuse |
| **DeepTutor** | Agent-native learning platform (Python + Next.js) | **High** — guided learning, quiz system, plugin architecture |
| **MAIC-Core** | Multi-agent classroom backend (Python) | **Medium-High** — state machine patterns, agent personas |
| **SimClass** | Classroom simulation framework (Python) | **Medium** — MAIC-Core frontend, research reference |
| **Awesome-AI-Era-Edu** | Paper collection (173 papers) | **Medium** — content seeding, resource library |

---

## 1. OpenMAIC — Highest Priority Integration

**Why highest**: Same tech stack (Next.js 16, React 19, Zustand, shadcn/ui, Tailwind). Components can be ported directly.

### What to integrate

| Feature | How | Effort |
|---------|-----|--------|
| **Quiz system** (QuizQuestion types + AI grading) | Port quiz components + API routes for flashcard UI | Low |
| **Two-stage generation pipeline** | Adapt outline→content pipeline to generate MDX tutorials from prompts | Medium |
| **Action engine** (16 action types) | Extend with Tauri shell actions for executable tutorials | Medium |
| **Interactive HTML scenes** | Embed as iframe/sandbox in tutorial steps | Low |
| **Provider abstraction** (12+ LLMs) | Use directly for AI tutoring in app | Low |
| **Dexie/IndexedDB persistence** | Already have tauri-storage, but Dexie pattern useful for caching | Low |
| **Multi-agent classroom UI** | Simplify to 2-3 agents (teacher + 1-2 peers) | High |

### Implementation approach
1. Copy quiz types and UI components from OpenMAIC
2. Adapt the generation pipeline to produce MDX + frontmatter
3. Add `RunCommand` action type that bridges to Tauri PTY
4. Use the provider abstraction for user-configurable AI backends

---

## 2. DeepTutor — Guided Learning & Plugin Architecture

### What to integrate

| Feature | How | Effort |
|---------|-----|--------|
| **Guided Learning** (step-by-step journeys) | Core pattern for tutorial progression with per-step status | Medium |
| **QuizViewer** (card-based: choice/written/coding) | Direct model for flashcard UI | Low |
| **StreamEvent protocol** | Typed events for terminal progress reporting via Tauri IPC | Medium |
| **Two-layer plugin architecture** (Tool → Capability) | Tutorial step operations vs. complete workflows | Medium |
| **Knowledge Base / RAG** | Context-aware AI tutoring from uploaded materials | High |
| **Learner profile / Memory** | Adaptive difficulty and personalized paths | Medium |

### Implementation approach
1. Adopt the guided learning data model (session → steps → status)
2. Port QuizViewer as the flashcard component
3. Implement StreamEvent over Tauri's event system
4. Use Tool/Capability abstraction for tutorial step extensibility

---

## 3. MAIC-Core — State Machine & Agent Patterns

### What to integrate

| Feature | How | Effort |
|---------|-----|--------|
| **Function.step() state machine** | Pattern for executable tutorial steps (execute→verify→advance) | Low |
| **AgendaStruct tree** | Hierarchical tutorial organization (series → tutorial → steps) | Low |
| **Director pattern** | Simplified single-agent director for tutorial flow control | Medium |
| **Agent persona system** | 6 archetypes → pick 2-3 for visual classroom | Medium |
| **QAGenerator pipeline** | Auto-generate quizzes from tutorial MDX content | Medium |
| **Chat action event sourcing** | Track all user/tutorial interactions for progress | Medium |

### Implementation approach
1. Adopt AgendaStruct as the tutorial metadata model
2. Implement Function.step() state machine in TypeScript for tutorial steps
3. Port QAGenerator to generate flashcards from MDX content via LLM
4. Use event sourcing pattern for progress tracking

---

## 4. Visual Classroom / Flashcard Integration Plan

### Concept: Card-based Executable Classroom

Each tutorial is a deck of cards. Each card can be:
- **Content card** — MDX-rendered explanation with code examples
- **Executable card** — Terminal command with real-time output
- **Quiz card** — Multiple choice or coding challenge (from OpenMAIC/DeepTutor)
- **Simulation card** — Embedded HTML sandbox (from OpenMAIC interactive scenes)

### UI Layout
```
┌─────────────────────────────────────────┐
│  [Sidebar]     │  [Main Content Area]   │
│                │                         │
│  Series A ▼    │  ┌─────────────────┐   │
│   ├ Tutorial 1 │  │  Card 3/10      │   │
│   ├ Tutorial 2 │  │                 │   │
│  Series B ▼    │  │  [MDX Content]  │   │
│   ├ Tutorial 3 │  │  or [Terminal]  │   │
│                │  │  or [Quiz]      │   │
│                │  └─────────────────┘   │
│                │  [◄ Prev] [Next ►]     │
│                │  ● ● ● ○ ○ ○ ○ ○ ○ ○  │
└─────────────────────────────────────────┘
```

### Integration Matrix

| Feature | OpenMAIC | DeepTutor | MAIC-Core | Innate (existing) |
|---------|----------|-----------|-----------|-------------------|
| Card-based UI | Quiz scene | QuizViewer | — | RunButton |
| Executable steps | Action engine | StreamEvent | Function.step() | PTY terminal |
| Content generation | 2-stage pipeline | Guided Learning | PreClass pipeline | Admin lesson page |
| AI tutoring | Director graph | TutorBot | Director agent | — |
| Progress tracking | Dexie schema | Learner profile | Session state | Zustand progress |
| Flashcard/quiz | Quiz grading | Quiz types | QAGenerator | — |
| Simulation | HTML sandbox | — | — | — |

---

## 5. Phased Implementation Roadmap

### Phase 1: Core Card Engine (2 weeks)
- Design CardType union type (content, executable, quiz, simulation)
- Build CardDeck component with prev/next navigation + progress dots
- Port RunButton into ExecutableCard component
- Convert existing MDX tutorials into card sequences

### Phase 2: Quiz & Flashcard System (2 weeks)
- Port OpenMAIC quiz types (single-choice, multi-choice, short-answer)
- Build FlashCard component with flip animation
- Add AI grading via provider abstraction
- Implement spaced repetition tracking in Zustand

### Phase 3: AI Content Generation (2 weeks)
- Port OpenMAIC 2-stage generation pipeline
- Adapt to produce MDX + frontmatter tutorials
- Add LLM-powered quiz generation from tutorial content
- Integrate with admin lesson page

### Phase 4: Visual Classroom (3 weeks)
- Implement simplified Director agent (TypeScript)
- Build classroom UI with 2-3 AI personas
- Add chat-based Q&A alongside tutorials
- Agent can trigger executable cards and quizzes

### Phase 5: Advanced Features (ongoing)
- Knowledge base / RAG for context-aware tutoring
- Interactive HTML simulations (from OpenMAIC)
- Spaced repetition flashcard scheduling
- Paper/resource library (from Awesome-AI-Era-Edu)

---

## 6. Paper Download Implementation Plan (Awesome-AI-Era-Edu)

### Goal
Allow users to browse and download the 173 papers from Awesome-AI-Era-Edu within the app.

### Architecture
```
Awesome-AI-Era-Edu JSON data → Parse → Display in Resource Library UI
                                          ↓
                                    Download via:
                                    1. ArXiv PDF (75% of papers)
                                    2. Semantic Scholar API (fallback)
                                    3. Unpaywall API (open access)
                                    4. Browser fallback (manual)
```

### Tasks
1. **Bundle paper metadata** — Convert `classified_papers.json` into a static JSON file in the app
2. **Resource Library page** — `/resources` route with search, filter by category/subcategory
3. **Download service** — Tauri HTTP client to download PDFs, save to workspace
4. **ArXiv integration** — Extract ArXiv ID from URL, construct PDF URL (`https://arxiv.org/pdf/{id}.pdf`)
5. **Offline cache** — Store downloaded PDFs in workspace, track in IndexedDB
6. **Flashcard integration** — Auto-generate flashcards from paper abstracts

### Effort: 1-2 weeks
