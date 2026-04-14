# MAIC-Core Analysis

## 1. Overview & Features

MAIC (Massive AI-empowered Courses) is an open-source multi-agent learning platform developed by Tsinghua University's KEG group. It creates AI-powered immersive classrooms driven by large language models, where multiple intelligent agents (teacher, teaching assistant, peer students) interact with a real student.

The backend core (`MAIC-Core`) provides two major subsystems:

### PreClass (Slide2Lecture)
- Converts PowerPoint presentations into structured, interactive lecture content through a multi-stage pipeline.
- Stages: PPTX -> PDF -> PNG image extraction -> text extraction -> LLM-based slide description -> hierarchical structure generation -> teaching script generation -> quiz/question generation.
- The output is a tree-structured agenda where each slide page has attached "functions" (ShowFile, ReadScript, AskQuestion).

### InClass (Live Classroom Session)
- Runs a real-time classroom session with a stateful, step-based function execution engine.
- A "director" LLM agent selects which participant speaks next (teacher, TA, peer students, or the real user).
- Supports multiple interaction modes: continuous auto-play, user Q&A, forced agent engagement ("heat-up talk"), and quiz checkpoints.
- Agents include: Teacher (AI), Teaching Assistant (AI), Class Clown, Inquisitive Mind, Note Taker, Deep Thinker (all AI student peers).

### Key Features
- **Multi-agent orchestration**: A director agent decides turn-taking based on conversation context and agent personas.
- **Agenda-driven classroom flow**: The lecture progresses through a pre-built agenda tree using depth-first traversal.
- **Interactive quizzes**: Auto-generated multiple-choice questions inserted at section boundaries, with teacher feedback on student answers.
- **LLM caching**: MongoDB-backed request/response caching to reduce redundant API calls.
- **Async job queue**: RabbitMQ-based job distribution for scalable, concurrent processing.
- **Session persistence**: Full classroom state (chat history, function progress, user input status) persisted in MongoDB.

## 2. Technologies

| Layer | Technology |
|-------|-----------|
| Language | Python 3 |
| Web Framework | FastAPI (with Uvicorn) |
| Database | MongoDB (via pymongo) |
| Message Queue | RabbitMQ (via pika) |
| LLM Providers | OpenAI GPT-4o (vision), ZhipuAI GLM-4 |
| Document Processing | PyMuPDF (PDF), python-pptx (PPTX), LibreOffice (conversion via Docker) |
| Data Validation | Pydantic |
| Retry/Resilience | retry library |
| Logging | Python logging + colorama |
| Containerization | Docker (for LibreOffice conversion) |

## 3. Architecture

### Module Structure

```
MAIC-Core/
  api/                      # FastAPI route handlers
    preclass.py             # /preclass/trigger, /preclass/get_status
    inclass.py              # /inclass/trigger, /inclass/get_status
  config.py                 # CLI args -> config (MongoDB, LLM keys)
  launch_api.py             # FastAPI app entry point
  utils.py                  # Logging, file utilities, RabbitMQ helpers
  data/                     # MongoDB collection wrappers
    session.py              # inclass.session collection
    function_session.py     # inclass.function_session collection
    agent.py                # inclass.agent collection
    chat_action_flow.py     # inclass.chat_action_flow collection
    course.py               # inclass.course collection
    module.py               # inclass.module collection
    lecture.py              # lecture.info, lecture.file_snippet collections
    agenda.py               # lecture.agenda collection
  service/
    __init__.py             # Service registry (get_services())
    llm/                    # LLM abstraction layer
      base.py               # BASE_LLM_CACHE (MongoDB-backed caching)
      openai.py             # OPENAI + OPENAI_SERVICE (job queue worker)
      zhipuai.py            # ZHIPUAI + ZHIPUAI_SERVICE (job queue worker)
      mock.py               # MockLLMService for testing
    preclass/               # Pre-class processing pipeline
      main.py               # PRECLASS_MAIN - orchestrator (stage machine)
      model.py              # AgendaStruct, PPTPageStruct, FunctionBase, ShowFile, ReadScript, AskQuestion
      processors/
        pptx2pdf.py         # PPTX to PDF conversion service
        pdf2png.py          # PDF to PNG image extraction service
        ppt2text.py         # PPT text extraction service
        gen_description.py  # LLM-based slide description generation
        gen_structure.py    # Hierarchical agenda structure generation
        gen_showfile.py     # ShowFile function binding to agenda nodes
        gen_readscript.py   # Teaching script generation per slide
        gen_askquestion.py  # Quiz/question generation per section
        qa_utils.py         # Question parsing utilities
    inclass/                # In-class session engine
      main.py               # INCLASS_SERVICE - session worker (RabbitMQ consumer)
      classroom_session.py  # ClassroomSession - core session state manager
      commandline.py        # CLI debugger for classroom sessions
      functions/
        base_class.py       # Function base class with step() interface
        enums.py            # Action types, identity types, content types
        showFile.py         # ShowFile function executor
        readScript.py       # ReadScript function executor (with director)
        askQuestion.py      # AskQuestion function executor (quiz flow)
        __init__.py         # Function registry (get_function)
```

### Core Data Structures

**AgendaStruct (Tree)**: A hierarchical tree of lecture sections. Internal nodes are sections (type="node"), leaf nodes are PPT pages (type="ppt"). Each node has an attached list of `FunctionBase` instances.

**PPTPageStruct (Leaf)**: Represents a single slide with content reference, stringified display text, and attached functions.

**FunctionBase**: Abstract action attached to agenda nodes. Three concrete types:
- `ShowFile(file_id)`: Display a slide image.
- `ReadScript(script)`: Teacher reads a teaching script, then opens interactive discussion.
- `AskQuestion(question, type, selects, answer, reference)`: Present a quiz, collect student answer, provide feedback.

**ClassroomSession**: Manages the full lifecycle of a student's classroom session. Tracks:
- Current function (via `function_session` DB collection, ordered by `function_idx`)
- Chat action flow (message history, user input state, function status updates)
- Agent list (teacher, TA, AI student peers)
- LLM job status (async streaming responses)

### Execution Flow

**PreClass Pipeline** (state machine with stages):
```
START -> PPTX2PDF -> PDF2PNG -> PPT2TEXT -> GEN_DESCRIPTION ->
GEN_STRUCTURE -> GEN_SHOWFILE -> GEN_READSCRIPT -> GEN_ASKQUESTION -> FINISHED
```
Each stage is a separate RabbitMQ worker. The orchestrator (`PRECLASS_MAIN`) advances stages and triggers the next processor via message queue with callback.

**InClass Session** (step-based function execution):
```
trigger(session_id, user_input) -> push to RabbitMQ ->
worker picks up -> ClassroomSession.get_current_function() ->
executor = get_function(function.call) ->
executor.step(value, function_id, classroom_session) ->
  if return True: requeue for next step
  if return False: wait for user input, then re-trigger
```

Each function executor (`ReadScript`, `AskQuestion`, `ShowFile`) implements a state machine via `phase` in `function_status`. The `ReadScript` executor includes a "director" pattern where an LLM decides which agent speaks next based on conversation context and agent roles.

### Job Queue Pattern
All services (LLM calls, processors, in-class sessions) follow the same pattern:
1. `trigger()`: Insert job into MongoDB, push job ID to RabbitMQ.
2. `launch_worker()`: Consume from RabbitMQ, process job, update MongoDB.
3. `get_status()` / `get_response()`: Poll MongoDB for results.

## 4. Applicable Features for Innate Playground

### 4.1 Agenda-Driven Tutorial Flow
MAIC's agenda tree structure (`AgendaStruct`) is directly applicable to structuring executable tutorials. Each tutorial can be a tree of sections, where leaf nodes contain executable steps (analogous to PPT pages with attached functions). This maps well to Innate's tutorial progression system.

### 4.2 Function Execution Engine (Step-Based State Machine)
The `Function` base class with `step()` returning `bool` (continue or wait) is an excellent pattern for Innate's executable tutorials. Each tutorial step can be a function executor with its own state machine:
- `ExecuteCommand`: Run a terminal command and verify output.
- `ShowContent`: Display markdown/code content.
- `AskQuiz`: Present a flashcard/quiz and verify the answer.
- `WaitForTerminal`: Wait for user to complete a terminal action.

### 4.3 Multi-Agent Classroom Interaction
MAIC's agent system (teacher, TA, peer students with distinct personalities) can be adapted for Innate's visual classroom feature:
- An AI tutor agent that guides students through tutorials.
- Peer agents that simulate classroom dynamics (asking questions, providing hints).
- A "director" agent that orchestrates which agent speaks next based on context.

### 4.4 Quiz/Flashcard Generation Pipeline
The `QAGenerator` class demonstrates how to auto-generate quiz content from teaching material using LLMs. This is directly applicable to Innate's flashcard system:
- Parse tutorial content into sections.
- Generate multiple-choice or open-ended questions per section.
- Attach quizzes at natural break points in the tutorial flow.

### 4.5 LLM Abstraction with Caching
The `BASE_LLM_CACHE` pattern (MongoDB-backed query/response caching) can be adapted for Innate:
- Cache LLM-generated tutorial content, quiz questions, and agent responses.
- Reduce API costs during development and repeated tutorial runs.
- Track token usage per feature.

### 4.6 Chat Action Flow System
The `chat_action_flow` data model provides a flexible event-sourcing pattern for tracking all classroom interactions:
- `speak` events (agent/user messages)
- `allowInput` events (enabling/disabling user interaction)
- `showFile` events (displaying content)
- `question`/`answer` events (quiz interactions)
- `update_function_status` events (state machine transitions)

This maps well to Innate's need for tracking terminal interactions, tutorial progress, and user actions.

### 4.7 Async Job Processing Architecture
The RabbitMQ + MongoDB job queue pattern can be applied to Innate for:
- Background LLM calls (generating tutorial content, agent responses).
- Terminal command execution in sandboxed environments.
- Long-running tutorial compilation/preparation tasks.

### 4.8 Agent Persona System
MAIC defines distinct agent personas with specific roles and instructions:
- Teacher: responsible for teaching and answering questions.
- Class Clown: re-engages off-topic students with humor.
- Inquisitive Mind: asks probing questions to stimulate thinking.
- Note Taker: summarizes key points for retention.
- Deep Thinker: challenges understanding with deeper questions.

These persona patterns can be adapted for Innate's educational AI companions, each with a specific pedagogical purpose.

## 5. Integration Recommendations

### 5.1 Short-Term: Data Model Adoption
Adapt MAIC's core data structures for Innate's tutorial system:

```typescript
// Tutorial Agenda Tree (adapted from AgendaStruct)
interface TutorialNode {
  type: 'section' | 'step';
  title: string;
  children: TutorialNode[];
  functions: TutorialFunction[];
}

interface TutorialFunction {
  call: 'ExecuteCommand' | 'ShowContent' | 'AskQuiz' | 'VerifyOutput';
  label: string;
  value: Record<string, any>;
}
```

### 5.2 Short-Term: Step-Based Execution Engine
Implement the `Function.step()` pattern in the Tauri backend:
- Each tutorial step is a state machine executor.
- Returns `{ continue: boolean }` to control flow.
- Integrates with the terminal via Tauri's shell API.
- User input events trigger re-execution (like MAIC's trigger/worker pattern).

### 5.3 Medium-Term: LLM Service Layer
Create a Rust/TypeScript service layer inspired by MAIC's LLM abstraction:
- Support multiple LLM providers (OpenAI, local models via Ollama).
- Implement request caching using SQLite (replacing MongoDB).
- Track token usage for cost monitoring.
- Use Tauri's async runtime instead of RabbitMQ for job processing.

### 5.4 Medium-Term: Quiz Generation
Port the `QAGenerator` pattern:
- Extract content from tutorial markdown files.
- Send to LLM with a structured prompt for quiz generation.
- Parse responses into `AskQuiz` function instances.
- Render as flashcard UI in the Next.js frontend.

### 5.5 Long-Term: Multi-Agent Classroom
Implement a simplified version of MAIC's classroom session for Innate:
- One AI tutor agent with configurable persona.
- Optional peer agents for collaborative learning scenarios.
- A simplified director that manages agent turn-taking.
- Integration with the visual classroom UI component.

### 5.6 Architecture Mapping (MAIC -> Innate)

| MAIC Component | Innate Equivalent |
|---------------|-------------------|
| MongoDB | SQLite (via Tauri) |
| RabbitMQ | Tauri async events/channels |
| FastAPI | Next.js API routes + Tauri commands |
| AgendaStruct | Tutorial tree (JSON) |
| FunctionBase.step() | TutorialStepExecutor.execute() |
| ClassroomSession | TutorialSession (state manager) |
| Chat Action Flow | Event log (SQLite table) |
| LLM Cache | SQLite-backed response cache |
| Director Agent | Turn-taking orchestrator |
| Agent Personas | AI companion configurations |
