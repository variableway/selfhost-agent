# UC2 Analysis: Import Tutorial from URL or Video

> Date: 2026-04-14
> Status: Analysis & Planning

---

## 1. URL Import Analysis

### 1.1 Proof of Concept: Zhihu Article

**Test URL**: https://zhuanlan.zhihu.com/p/2026969413518107721
**Title**: "Gemma 4 本地部署保姆级教程"
**Result**: Successfully extracted full article content via web reader.

The article contains:
- **Structured sections**: 4 main sections (What is Gemma, Ollama CLI, LM Studio GUI, Summary)
- **Executable commands**: `ollama pull gemma:2b`, `ollama run gemma:2b`, `ollama list`, `ollama stop gemma:2b`, `irm https://lmstudio.ai/install.ps1 | iex`
- **Step-by-step instructions**: Numbered steps with clear actions
- **Concepts**: Gemma vs Gemma 4, parameter sizes (2B/7B), memory requirements
- **Scripts**: PowerShell one-liner for LM Studio install

**Conclusion**: Structured tech articles from Zhihu, blogs, and docs sites are **highly convertible** to tutorials.

### 1.2 URL Source Type Matrix

| Source Type | Examples | Content Quality | Extraction Difficulty | Convertible? |
|------------|----------|----------------|----------------------|-------------|
| **Tech blogs** (知乎, CSDN, 掘金) | zhuanlan.zhihu.com | High — structured, step-by-step | Low (HTML parse) | **Yes** |
| **GitHub repos/MD** | github.com/datawhalechina/self-llm | Very High — markdown, code blocks | Low (GitHub API / raw MD) | **Yes** |
| **GitHub awesome lists** | github.com/hesamsheikh/awesome-openclaw-usecases | Medium — curated links, descriptions | Low (MD table parse) | **Partial** |
| **Reddit posts** | reddit.com/r/LocalLLaMA/... | Medium-Low — unstructured, comments | Medium (Reddit API) | **Partial** |
| **Skool/Forums** | skool.com | Medium — community posts | Medium-High | **Partial** |
| **YouTube** | youtube.com/watch?v=... | Video content | High (transcript extraction) | **With LLM** |
| **Threads/Short posts** | threads.net/@... | Low — short, unstructured | Medium | **With LLM only** |

### 1.3 What Can Be Extracted

From a well-structured URL, we can extract:

1. **Concepts** — Technical terms, model names, tool names (e.g., "Gemma 4", "Ollama", "LM Studio")
2. **Executable Steps** — CLI commands in code blocks (e.g., `ollama pull gemma:2b`)
3. **Installation Scripts** — One-liners or multi-line scripts
4. **Prerequisites** — Hardware requirements, OS requirements, dependencies
5. **Verification Commands** — Commands to check success (e.g., `ollama --version`)
6. **Warnings/Tips** — Important notes for users

---

## 2. Video Import Analysis

### 2.1 YouTube Video Processing

**Pipeline**:
```
YouTube URL → YouTube Data API (metadata) → Transcript API (captions) → LLM Processing → Tutorial MDX
```

**Technical approaches**:
1. **YouTube Transcript API** — Extract auto-generated or manual captions
   - `youtube-transcript-api` (Python) or `youtubei.js` (JS)
   - Supports `timertext` format with timestamps
   - Works for most videos with auto-captions

2. **Whisper (local)** — For videos without captions
   - Download audio via `yt-dlp`
   - Transcribe with Whisper (openai-whisper or faster-whisper)
   - Higher quality but slower

3. **LLM Processing** — Convert transcript to structured tutorial
   - Feed transcript + metadata to LLM
   - Prompt: "Extract executable commands, step-by-step instructions, concepts, and prerequisites"
   - Output: MDX with frontmatter

### 2.2 Feasibility Assessment

| Approach | Quality | Speed | Cost | Complexity |
|----------|---------|-------|------|-----------|
| YouTube Transcript API | Medium | Fast (seconds) | Free | Low |
| Whisper transcription | High | Slow (minutes) | Compute | Medium |
| LLM post-processing | High | Medium | API cost | Medium |

---

## 3. Architecture Design

### 3.1 Module Architecture

```
┌─────────────────────────────────────────────────┐
│                  URL Import UI                    │
│  (Input URL → Preview → Edit → Save as Tutorial) │
└───────────────┬─────────────────────────────────┘
                │
┌───────────────▼─────────────────────────────────┐
│              Content Fetcher                      │
│  ┌──────────┬──────────┬──────────┬────────────┐ │
│  │ Web Page │ YouTube  │ GitHub   │  Reddit     │ │
│  │ Fetcher  │ Fetcher  │ Fetcher  │  Fetcher    │ │
│  └────┬─────┴────┬─────┴────┬─────┴─────┬──────┘ │
└───────┼──────────┼──────────┼───────────┼────────┘
        │          │          │           │
┌───────▼──────────▼──────────▼───────────▼────────┐
│              Content Normalizer                    │
│  HTML → Markdown → Structured JSON                │
└───────────────────┬──────────────────────────────┘
                    │
┌───────────────────▼──────────────────────────────┐
│              LLM Content Processor                 │
│  ┌────────────┬──────────────┬──────────────────┐ │
│  │ Command    │ Step          │ Concept          │ │
│  │ Extractor  │ Structurer   │ Identifier       │ │
│  └────────────┴──────────────┴──────────────────┘ │
└───────────────────┬──────────────────────────────┘
                    │
┌───────────────────▼──────────────────────────────┐
│           MDX Tutorial Generator                   │
│  Structured Data → MDX + Frontmatter               │
└───────────────────┬──────────────────────────────┘
                    │
┌───────────────────▼──────────────────────────────┐
│           Tutorial Storage                         │
│  Save to workspace/tutorials/{slug}.mdx            │
└───────────────────────────────────────────────────┘
```

### 3.2 Data Models

```typescript
// Fetched raw content
interface FetchedContent {
  url: string;
  title: string;
  description: string;
  content: string;          // Markdown/HTML body
  source: 'web' | 'youtube' | 'github' | 'reddit';
  author?: string;
  publishedAt?: string;
  images?: string[];
}

// LLM-extracted structured data
interface ExtractedTutorial {
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedMinutes: number;
  concepts: string[];         // ["Ollama", "Gemma 4", "LLM"]
  prerequisites: string[];   // ["Windows 10+", "8GB RAM"]
  steps: ExtractedStep[];
  sourceUrl: string;
}

interface ExtractedStep {
  title: string;
  description: string;
  commands?: string[];        // Executable commands
  verification?: string;      // How to verify success
  warnings?: string[];
}

// Final MDX output
interface GeneratedMDX {
  frontmatter: TutorialFrontmatter;
  body: string;               // MDX content with <RunButton />
}
```

### 3.3 Interaction Flow

```
User pastes URL
    │
    ▼
[Fetch & Preview] ──→ Show extracted title, description, step count
    │
    ▼
[User Edits] ──→ Adjust title, series, difficulty, commands
    │
    ▼
[Generate MDX] ──→ Create MDX with frontmatter + <RunButton> components
    │
    ▼
[Save to Workspace] ──→ Write to workspace/tutorials/{slug}.mdx
    │
    ▼
[Refresh Tutorials] ──→ Scan picks up new tutorial
```

---

## 4. Technology Selection

### 4.1 Content Fetching

| Technology | Purpose | Choice |
|-----------|---------|--------|
| **Tauri HTTP** | Fetch web pages | `@tauri-apps/plugin-http` (already available) |
| **Readability** | Extract article content from HTML | `@mozilla/readability` + `jsdom` |
| **GitHub API** | Fetch repo README / markdown files | `https://api.github.com/repos/{owner}/{repo}/readme` |
| **YouTube Transcript** | Extract video captions | `youtubei.js` (Node.js, no API key) |
| **Reddit API** | Fetch post + comments | `https://www.reddit.com/{path}.json` (public JSON API) |

### 4.2 LLM Processing

| Option | Pros | Cons | Choice |
|--------|------|------|--------|
| **Local LLM (Ollama)** | Free, private, offline | Quality varies, slow on low-end | Fallback |
| **Cloud LLM (OpenAI/GLM)** | High quality, fast | Cost, needs API key | Primary |
| **Rule-based extraction** | Free, fast, no LLM needed | Misses nuance, fragile | For simple cases |

**Recommended approach**: Rule-based extraction for commands + LLM refinement for structure.

### 4.3 Command Extraction (Rule-based, no LLM needed)

```
Patterns to detect executable commands:
1. Code blocks with shell syntax (```bash, ```sh, ```powershell)
2. Lines starting with $ or > or #
3. Lines matching common patterns:
   - (apt|brew|yum|dnf|npm|pip|cargo|go)\s+(install|add|remove)
   - (curl|wget)\s+
   - (docker|kubectl|git)\s+
   - (ollama|python|node)\s+
4. Windows-specific: irm | iex, winget install
```

---

## 5. Special Scenario: Reddit / Community Content

### 5.1 Analysis

Reddit/community posts are **less structured** but can contain valuable:
- Quick tips (e.g., "3-step Gemma deployment")
- Troubleshooting solutions
- Configuration snippets
- Tool recommendations

### 5.2 Extraction Strategy

1. **Fetch via JSON API**: `https://www.reddit.com/r/{sub}/comments/{id}/{title}.json`
2. **Extract post body + top comments**
3. **LLM classification**: Is this content tutorial-worthy?
   - Has executable commands → Yes
   - Has step-by-step instructions → Yes
   - Just discussion/opinion → No
4. **Generate compact flashcard-style tutorial** instead of full tutorial

### 5.3 self-llm Repository (Datawhale)

**URL**: https://github.com/datawhalechina/self-llm
**Content**: 50+ model deployment tutorials in Chinese
**Format**: Markdown files in `models/{ModelName}/` directories
**Value**: Direct source of high-quality, structured tutorials

**Extraction approach**:
1. Use GitHub API to list `models/` directory
2. Fetch each `{model}/` directory's markdown files
3. Parse frontmatter-like structure (model name, hardware requirements)
4. Convert commands to `<RunButton>` components
5. Auto-generate series per model family

---

## 6. Implementation Plan

### Phase 1: Basic URL Import (Week 1-2)

| Task | Description | Effort |
|------|------------|--------|
| T1 | Create Import UI component — URL input, preview, edit, save | 2 days |
| T2 | Implement web page fetcher using Tauri HTTP + Readability | 1 day |
| T3 | Build rule-based command extractor (regex for code blocks) | 1 day |
| T4 | Build MDX generator — extracted data → MDX + frontmatter | 1 day |
| T5 | Wire to workspace storage — save + scan refresh | 0.5 days |

### Phase 2: GitHub Integration (Week 2)

| Task | Description | Effort |
|------|------------|--------|
| T6 | GitHub URL detector — detect repo/file URLs | 0.5 days |
| T7 | GitHub content fetcher — API for README, raw MD files | 1 day |
| T8 | self-llm bulk importer — fetch all model tutorials | 2 days |
| T9 | Markdown-to-MDX converter — handle existing MD format | 1 day |

### Phase 3: LLM-Enhanced Extraction (Week 3)

| Task | Description | Effort |
|------|------------|--------|
| T10 | LLM provider abstraction — support OpenAI, GLM, Ollama | 1 day |
| T11 | Content structuring prompt — extract steps, commands, concepts | 1 day |
| T12 | Reddit/forum content handler — classify + extract | 1 day |
| T13 | YouTube transcript extractor — captions → text | 1 day |

### Phase 4: Advanced Features (Week 4)

| Task | Description | Effort |
|------|------------|--------|
| T14 | Import history — track imported URLs, re-import support | 1 day |
| T15 | Batch import — paste multiple URLs, bulk process | 1 day |
| T16 | Auto-series generation — group related imports into series | 1 day |
| T17 | Content diff — show what changed when re-importing | 1 day |

---

## 7. Key Technical Decisions

### 7.1 Fetch in Tauri vs Next.js

**Decision**: Fetch in **Tauri backend** (Rust HTTP client)
- Why: Avoids CORS, supports all URLs, no browser limitations
- How: `@tauri-apps/plugin-http` or Rust `reqwest` command
- Fallback: Use web reader MCP proxy for web-only mode

### 7.2 LLM Call Location

**Decision**: Call LLM from **frontend via API** (not Rust backend)
- Why: Simpler to implement, supports multiple providers via JS SDK
- How: OpenAI/Anthropic SDK from renderer process, or Ollama local API
- Config: User provides API key in Settings page

### 7.3 Storage Format

**Decision**: Same MDX + frontmatter as manual tutorials
- Why: Imported tutorials are first-class citizens alongside builtin/user-created
- Frontmatter addition: `sourceUrl`, `importedAt` fields
- No special treatment — same rendering pipeline

---

## 8. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Website blocks scraping | High | Medium | Multiple fetch strategies + user can paste content |
| LLM extracts wrong commands | Medium | High | Preview + edit before save |
| YouTube no captions | Medium | Low | Fallback to Whisper or skip |
| Reddit API rate limits | Low | Low | Use public JSON API, cache results |
| Content copyright | Medium | Medium | User responsibility, link to source |
