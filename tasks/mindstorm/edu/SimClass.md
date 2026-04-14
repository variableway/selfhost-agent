# SimClass / MAIC-Core Analysis

## 1. Overview & Features

SimClass is a multi-agent classroom simulation framework developed by Tsinghua University's KEG lab, accepted at NAACL 2025. It is part of the broader MAIC (Massive AI-empowered Courses) platform -- a system for creating highly immersive, AI-powered learning classrooms using large language models.

**Core purpose**: Simulate a real classroom environment where multiple LLM-powered agents (teacher, teaching assistant, and peer students) interact with a real human student to deliver course content, answer questions, and create a dynamic learning atmosphere.

**Main features**:
- **Multi-agent classroom roles**: Teacher, Teaching Assistant, and multiple student archetypes (Class Clown, Inquisitive Mind, Note Taker, Deep Thinker), each with distinct system prompts and behavioral patterns.
- **Automated lesson preparation (PreClass)**: Upload a PPTX file, and the system automatically extracts text, generates slide descriptions, builds a hierarchical agenda structure, writes teaching scripts, and creates quiz questions -- all via LLM pipelines.
- **Interactive classroom delivery (InClass)**: A state-machine-driven classroom session that walks students through slides, reads scripts, asks quiz questions, and manages agent interactions via a "Director" pattern.
- **Director pattern**: An LLM-based "director" decides which agent should speak next based on conversation history, agent roles, and classroom context -- enabling natural turn-taking.
- **User interaction modes**: Supports both interactive mode (user types responses) and continuous mode (auto-advance), with probabilistic "heat-up" triggers for student agents when the user is silent.
- **Question/Answer system**: Generates multiple-choice questions per slide section, presents them to the user, evaluates answers, and provides teacher feedback via LLM.
- **Streaming LLM responses**: Supports streaming generation from both ZhipuAI (GLM-4) and OpenAI (GPT-4o) APIs with response caching.

## 2. Technologies

**Backend**:
- **Python** -- primary language
- **FastAPI** -- REST API framework (endpoints: `/inclass/trigger`, `/inclass/get_status`, `/preclass/trigger`, `/preclass/get_status`)
- **MongoDB (PyMongo)** -- primary data store for sessions, agents, chat history, lecture content, agendas, function states, and LLM caches
- **RabbitMQ (pika)** -- message queue for asynchronous job processing across all services
- **Pydantic** -- request/response validation

**LLM Providers**:
- **ZhipuAI (GLM-4)** -- primary LLM for in-class agent interactions and director decisions
- **OpenAI (GPT-4o)** -- used for pre-class content generation (scripts, structures, questions)

**Document Processing**:
- **python-pptx** -- PowerPoint file parsing
- **PyMuPDF (fitz)** -- PDF processing
- **Base64 encoding** -- slide image storage

**Key Libraries**:
- `retry` -- retry logic for API calls
- `colorama` -- colored console logging
- `tqdm` -- progress bars for batch processing
- `bson` -- MongoDB ObjectId handling

## 3. Architecture

### 3.1 High-Level System Architecture

```
[PPTX File Upload]
        |
        v
  PreClass Pipeline (async, RabbitMQ workers)
  +--------------------------------------------------+
  | START -> PPTX2PDF -> PDF2PNG -> PPT2TEXT ->     |
  | GEN_DESCRIPTION -> GEN_STRUCTURE -> GEN_SHOWFILE |
  | -> GEN_READSCRIPT -> GEN_ASKQUESTION -> PUSH     |
  +--------------------------------------------------+
        |
        v
  [Agenda + Functions stored in MongoDB]
        |
        v
  InClass Runtime (state machine per session)
  +--------------------------------------------------+
  | ClassroomSession <-> Function Executors           |
  |   ShowFile | ReadScript | AskQuestion            |
  | Director (LLM) selects next speaker              |
  | Agents respond via LLM with system prompts       |
  +--------------------------------------------------+
        |
        v
  [Chat Action Flow -> Frontend]
```

### 3.2 Module Breakdown

#### Data Layer (`data/`)
Thin MongoDB collection wrappers providing CRUD operations:
- **`agent.py`** -- Agent definitions (name, type, instruction/system prompt)
- **`session.py`** -- Classroom session metadata (user_id, lecture_id, agent list)
- **`course.py`** -- Course definitions
- **`lecture.py`** -- Lecture content, file snippets (text + base64 PNG per slide)
- **`agenda.py`** -- Hierarchical agenda tree (sections -> subsections -> PPT pages)
- **`conv_msg.py`** -- Conversation messages
- **`chat_action_flow.py`** -- Real-time action log: speak, showFile, allowInput, question, answer, user_answer, control, update_function_status
- **`function_session.py`** -- Per-function execution state (call type, value, status, is_done flag)
- **`module.py`** -- Module definitions

#### Service Layer (`service/`)

**LLM Abstraction (`service/llm/`)**:
- `base.py` -- `BASE_LLM_CACHE` with MongoDB-backed query/response caching and usage tracking
- `zhipuai.py` -- ZhipuAI (GLM-4) integration with async job queue pattern (trigger -> MongoDB -> RabbitMQ -> worker -> response)
- `openai.py` -- OpenAI integration with same queue pattern plus synchronous polling (`get_response_sync`)
- `mock.py` -- Mock LLM for testing

**PreClass Pipeline (`service/preclass/`)**:
Orchestrated multi-stage pipeline via `PRECLASS_MAIN`. Each stage is an independent RabbitMQ worker:
1. `pptx2pdf` -- Convert PPTX to PDF
2. `pdf2png` -- Convert PDF pages to PNG images
3. `ppt2text` -- Extract text from PPT slides, store with base64 images
4. `gen_description` -- LLM generates descriptions for each slide
5. `gen_structure` -- LLM generates hierarchical agenda tree (sections/subsections) via incremental prompting with `Structurelizor`
6. `gen_showfile` -- Bind ShowFile functions to each PPT node
7. `gen_readscript` -- LLM (GPT-4o with vision) generates teaching scripts for each slide via `PPTScriptGenerator`
8. `gen_askquestion` -- LLM generates 3 multiple-choice questions per section via `QAGenerator`

**InClass Runtime (`service/inclass/`)**:
- `classroom_session.py` -- `ClassroomSession` class managing session state, chat history, agent lookups, agenda traversal, LLM job management, and user input control
- `main.py` -- `INCLASS_SERVICE` with RabbitMQ worker for processing classroom steps
- `commandline.py` -- CLI debugger for interactive testing
- `functions/` -- Function executors (state machines):
  - `base_class.py` -- Abstract `Function` base with `step()` returning `bool` (continue flag)
  - `showFile.py` -- Displays slide content, immediately advances
  - `readScript.py` -- Complex multi-phase state machine: UNREAD -> WAITING_USER_INPUT -> NEED_CALL_DIRECTOR -> WAITING_DIRECTOR_RETURN -> FORCE_AGENT_TO_HEATUP_TALK -> FINISHED
  - `askQuestion.py` -- Multi-phase quiz flow: NEED_TRANSFORM_SENTENCE -> NOT_ASKED -> WAITING_STUDENT_ANSWER -> FORCE_CALL_TEACHER_BEFORE_RETURN -> WAIT_FINISH -> FINISHED

#### API Layer (`api/`)
- `inclass.py` -- POST `/inclass/trigger` (session_id + user_input), POST `/inclass/get_status`
- `preclass.py` -- POST `/preclass/trigger` (source_file), POST `/preclass/get_status`

### 3.3 Key Data Structures

**Agenda Tree** (`model.py`):
- `AgendaStruct` -- tree node with title, children, and function list
- `PPTPageStruct` -- leaf node representing a slide
- `FunctionBase` / `ShowFile` / `ReadScript` / `AskQuestion` -- serializable function definitions with call name, label, and value dict

**Chat Action Flow**:
Each action stored in MongoDB with: action type, actor (agent_id or "user" or "system"), session_id, step_id, content, function_id, timestamp, and optional streaming_id.

**Agent Roles** (IdentityDict enum):
- Creator (0), Teacher (1), Assistant (2), Student (3), System (4), AI (5)
- AI Teacher (6), AI Assistant (7), AI Student (8), Script Agent (9)

**Agent Personas** (hardcoded in readScript.py / askQuestion.py):
- Teacher -- teaches and answers questions
- Assistant -- maintains classroom order
- Class Clown -- keeps things lively, redirects off-topic students
- Inquisitive Mind -- asks probing questions
- Note Taker -- summarizes key points
- Deep Thinker -- poses challenging follow-up questions

### 3.4 Director Pattern

The "Director" is an LLM call that receives:
1. Conversation history formatted with agent names
2. Role descriptions for all eligible speakers
3. Special actors (e.g., "Continue Class" to advance slides)

The Director outputs only a speaker name, determining who speaks next. This enables dynamic, context-aware turn-taking that feels natural.

### 3.5 State Machine Execution

Each classroom function (ShowFile, ReadScript, AskQuestion) is a state machine with phases. The `step()` method:
1. Reads current phase from function status
2. Executes phase-specific logic
3. Updates phase in MongoDB
4. Returns `True` (continue execution) or `False` (wait for user input)

This allows both synchronous CLI debugging and asynchronous production deployment via RabbitMQ.

## 4. Applicable Features for Innate Playground

### 4.1 Multi-Agent Persona System
**Applicable to**: Visual classroom UI, interactive tutorials
SimClass defines distinct AI agent personas with specific roles and system prompts. This pattern can be adapted for Innate Playground:
- An "Instructor" agent that delivers tutorial content
- A "Mentor" agent that answers questions and provides hints
- A "Peer Student" agent that asks the questions a beginner might ask
- A "Reviewer" agent that evaluates code/exercise submissions

### 4.2 Hierarchical Agenda/Content Structure
**Applicable to**: Executable tutorials, course organization
The `AgendaStruct` / `PPTPageStruct` tree structure for organizing course content into sections, subsections, and individual content pages maps directly to a tutorial system where:
- Tutorials are organized as courses with chapters and lessons
- Each lesson has associated content (text, code, exercises)
- Progress tracking follows the tree structure (DFS traversal)

### 4.3 State-Machine Function Executors
**Applicable to**: Executable tutorials, terminal integration
The `Function` base class pattern with `step()` and phase-based state machines is ideal for:
- **Terminal command tutorials**: UNREAD -> WAITING_USER_INPUT -> EXECUTING -> VERIFYING -> COMPLETED
- **Code exercise steps**: PRESENT -> CODING -> TESTING -> FEEDBACK
- **Flashcard interactions**: SHOW_QUESTION -> WAITING_ANSWER -> SHOW_ANSWER -> SELF_ASSESSMENT

### 4.4 Director Pattern for Dynamic Flow Control
**Applicable to**: Interactive tutorial flow, adaptive learning
The Director pattern (LLM decides next action based on context) can power:
- Adaptive tutorial pacing (skip ahead if user demonstrates knowledge, review if struggling)
- Dynamic difficulty adjustment
- Context-aware hints and intervention
- Deciding when to show a flashcard vs. terminal exercise vs. reading material

### 4.5 Automated Content Generation Pipeline
**Applicable to**: Tutorial content creation
The PreClass pipeline (upload content -> generate structured lessons) maps to:
- Upload tutorial markdown/code -> auto-generate exercises
- Auto-generate flashcards from tutorial content
- Auto-generate quiz questions with explanations
- Auto-structure raw content into hierarchical lessons

### 4.6 Chat Action Flow Architecture
**Applicable to**: Terminal integration, real-time UI updates
The action flow system (speak, showFile, allowInput, question, answer) with timestamps and function bindings can be adapted for:
- Terminal output events (command output, error, success)
- Tutorial step events (instruction, hint, verification)
- User interaction gating (disable input during processing, enable for responses)
- Real-time event streaming to the Tauri frontend

### 4.7 Question/Answer System with LLM Feedback
**Applicable to**: Flashcard-style UI
The AskQuestion executor (present question -> collect answer -> evaluate -> LLM-generated feedback) is directly applicable to flashcard UI:
- Present flashcard question (multiple choice, fill-in-blank, code)
- Collect user answer
- Evaluate correctness
- Generate personalized explanation via LLM

### 4.8 Session Management and Progress Tracking
**Applicable to**: Desktop app state management
The session/progress model (session -> agenda -> function_session with is_done flags) provides a pattern for:
- Persistent tutorial progress (resume where left off)
- Per-step completion tracking
- Session branching (copy_current_session for "try again" scenarios)

### 4.9 LLM Caching and Cost Tracking
**Applicable to**: LLM integration efficiency
The `BASE_LLM_CACHE` with MongoDB-backed caching and token usage tracking enables:
- Reduced API costs via response caching
- Usage analytics for cost monitoring
- Offline replay of cached responses

### 4.10 User Input Control Mechanism
**Applicable to**: Terminal integration, tutorial flow
The allowInput (enabled/disabled/forced) action flow pattern can control:
- When the terminal is interactive vs. read-only during demonstrations
- When flashcard answers are accepted vs. display-only
- Forced interaction points where user must respond to continue

## 5. Integration Recommendations

### 5.1 Adapt the Agenda Structure for Tutorials
Replace the PPT-centric agenda with a tutorial-centric one:
```
Course
  -> Chapter
    -> Lesson
      -> Step (ShowContent | RunCommand | Exercise | Flashcard)
```
Use the same DFS traversal and function executor pattern. Each Step type would be a new `Function` subclass with its own state machine.

### 5.2 Implement Function Executors for Tauri + Next.js
Port the Python state machine pattern to TypeScript:
```typescript
abstract class TutorialStep {
  abstract step(context: StepContext): Promise<boolean>;
  abstract initStatus: Record<string, unknown>;
}
class ShowContent extends TutorialStep { ... }
class RunCommand extends TutorialStep { ... }
class ExerciseStep extends TutorialStep { ... }
class FlashcardStep extends TutorialStep { ... }
```
These executors would emit events to the Tauri frontend via the event system.

### 5.3 Use the Director Pattern for Tutorial Navigation
Instead of a rigid linear flow, use an LLM-based director to decide:
- Whether the user needs a hint
- Whether to show a flashcard review
- Whether to proceed to the next step or revisit
- Which agent persona should respond

### 5.4 Leverage PreClass Pipeline for Content Generation
Build a content generation pipeline that:
1. Takes tutorial markdown files as input
2. Generates structured lesson content (like gen_structure)
3. Auto-creates flashcards from key concepts (like gen_askquestion)
4. Generates terminal exercise sequences with expected outputs (like gen_readscript)

### 5.5 Replace RabbitMQ with Tauri Event System
For a desktop app, replace the RabbitMQ-based async queue with:
- Tauri's event system for frontend-backend communication
- Rust-side state management instead of MongoDB
- SQLite or local JSON for persistence instead of MongoDB

### 5.6 Implement Agent Personas as Chat Companions
Create AI companion agents that appear in the visual classroom:
- An instructor avatar that delivers content
- A helper avatar that assists with exercises
- Student avatars that model good questions and answers
These can use the same system prompt + history pattern from SimClass.

### 5.7 Adapt the Chat Action Flow for Terminal Events
Design a unified event stream that includes:
- `terminal_output` -- command execution results
- `show_content` -- markdown/code display
- `ask_question` -- flashcard or quiz prompt
- `user_input` -- user response (text, code, or terminal command)
- `agent_response` -- AI-generated feedback
- `step_transition` -- move to next tutorial step

### 5.8 Implement LLM Caching Locally
Port the `BASE_LLM_CACHE` pattern to use:
- IndexedDB (via the Next.js frontend) or SQLite (via Tauri/Rust) for response caching
- Local token usage tracking to help users monitor API costs
- Cache invalidation on content updates

### 5.9 Key Papers and Resources
- SimClass: "Simulating Classroom Education with LLM-Empowered Agents" (NAACL 2025) -- arXiv:2406.19226
- MAIC: "From MOOC to MAIC: Reshaping Online Teaching and Learning through LLM-driven Agents" -- arXiv:2409.03512
- Slide2Lecture: "Awaking the Slides" (KDD 2025) -- arXiv:2409.07372
- MAIC Documentation: https://doc.maic.chat/
- MAIC Project Page: https://project.maic.chat/
