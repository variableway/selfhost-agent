# Use Case 1: Setup Proejct

Please refer [text](../features/F1.1-init-tauri-nextjs.md) to understand the context.

## Task 1: Check out current proejct status

There are two desktop project here:
1. [desktop application](../../apps/desktop) This is desktop applicaiton created without nextjs,let's call it D1App
2. [nextjs-desktop-application](../../playground/apps/desktop) this is a desktop application with nextjs,Let's call it D2App
3. try to work on nextjs version, but don't change existing desktop application in Step 1, keep this project unchange
4. There are two color theme in these two project, D2App should support both, please make the change,and also and a theme change in the menu bar
5. D1App has menu bar, please add this into D2App
6. D1App terminal version is better than D2App,please make sure D2App use D1App terminal sulution,please make the change 
7. D2App keep the sidebar
8. Add Admin Category in Sidebar, and Menu bar, the sub item is workspace,lesson

verification:
1. menu bar is added
2. admin category and sub-item is created in sidebar
3. terminal solution is using D1App solution


## Task 2: Workspace Page

1. click sidebar workspace
2. if workspace is not existing or created，Workspace Page is displayed with new workspace button
3. User add local folder, and add a workspace name to create workspace, default to create three folders:
   1. skills:skill related files
   2. Apps:application related files
   3. KM: knowledge base related files
   4. lessons: lesson related files
   and add a explain for these three folders
4. After workspace is created， the workspace page is a two column layout
   - leftside： all files in the workspace, folder structure/file structure
   - right side: the selected file content or a list of files in the selected folder

## Task 3: Create Series 


```
Failed to create series: "forbidden path: /Users/patrick/workspace/innate/tutorials/_series, maybe it is not allowed on the scope for `allow-exists` permission in your capability file"
src/app/admin/lesson/page.tsx (333:20) @ <unknown>

  331 |       onSave();
  332 |     } catch (err) {
> 333 |       console.error('Failed to create series:', err);
      |                    ^
  334 |     } finally {
  335 |       setSaving(false);
  336 |     }
Call Stack
4
Hide 3 ignore-listed frame(s)
createConsoleError
../../node_modules/.pnpm/next@16.2.2_@babel+core@7.29.0_react-dom@19.2.4_react@19.2.4/node_modules/next/src/next-devtools/shared/console-error.ts (16:39)
handleConsoleError
../../node_modules/.pnpm/next@16.2.2_@babel+core@7.29.0_react-dom@19.2.4_react@19.2.4/node_modules/next/src/next-devtools/userspace/app/errors/use-error-handler.ts (31:31)
error
../../node_modules/.pnpm/next@16.2.2_@babel+core@7.29.0_react-dom@19.2.4_react@19.2.4/node_modules/next/src/next-devtools/userspace/app/errors/intercept-console-error.ts (36:27)
<unknown>
src/app/admin/lesson/page.tsx (333:20)
``` 
please fix this create series bug, when save a series, error occured.

## Task 4: Clicked Created Series, nothing happened

1. Clicked Created Series, nothing happened
2. It should go to series detail page

## Task 5: Upload MDX file workflow analysis

based on current project implementation,please give me an instruction on how to create tutorial:
1. new MDX/MD file, template needed, or generate from input value,user uploaded MD file,no need to add any format information
2. How to Write the MDX/MD file, the template is needed
3. How to apply to static folder, write locally, then scan it, then the series alive in the workspace

## Task 6: Series,Lessons,Tutorials Concept

Read the project, tell me what's the exact meaning of the concept about series, lessons, tutorials concept in this project.
Maybe need to simplify these three concept :
1. tutorial: 3-5 piece of tutorials
2. Lesson: several tutorials
3. Series: sveral lessons

But current project implementation, the concept is not clear, please check it, especially Lesson Concept.
And give me you advice.

## Task 7: Tutorials，Lessons，Series Re-Org


⏺ Explore(Analyze D2App tutorial/series/lesson types)
  ⎿  Done (27 tool uses · 55.0k tokens · 1m 35s)
  (ctrl+o to expand)

⏺ Now let me read the actual type files for the precise definitions.

  Read 4 files (ctrl+o to expand)

⏺ Now I have the complete picture. Here's my analysis:

  ---
  Task 6: Series / Lessons / Tutorials — Concept Analysis

  Current State (What the code actually does)

  There are three concepts but only two are actively used in D2App:

  ┌──────────┬───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬───────────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ Concept  │                                                     D2App Reality                                                     │                                             D1App Reality                                             │
  ├──────────┼───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ Tutorial │ The atomic learning unit — a single MDX file (e.g. "ls 命令详解"). Has frontmatter with title, difficulty, duration,  │ Same type, mock data only                                                                             │
  │          │ etc.                                                                                                                  │                                                                                                       │
  ├──────────┼───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ Series   │ A group of tutorials — e.g. "终端基础" contains tutorial-004 + tutorial-005. Stored as JSON manifest or hardcoded.    │ Same structure                                                                                        │
  ├──────────┼───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ Lesson   │ Exists only as a sidebar label (/admin/lesson). The page manages Series + Tutorials. No Lesson type in D2App.         │ Has SeriesLesson type — a collection of uploaded MD/MDX file sections, completely separate from       │
  │          │                                                                                                                       │ Tutorial                                                                                              │
  └──────────┴───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴───────────────────────────────────────────────────────────────────────────────────────────────────────┘

  The Problem

  "Lesson" is the confused concept. Here's what's inconsistent:

  1. D2App has no Lesson type — types/index.ts only has Tutorial and Series. The /admin/lesson page is really just a combined Series+Tutorial CRUD manager.
  2. D1App's SeriesLesson is actually what a Tutorial should be — it's a piece of learning content made of markdown sections. The naming is backwards.
  3. The admin page says "Lesson Manager" but lets you create Series and Tutorials — not Lessons.
  4. No 3-level hierarchy exists — currently it's flat: Series → [Tutorial, Tutorial, ...]. There's no Series → [Lesson, Lesson] → [Tutorial, Tutorial] chain.

  Current Relationships (actual code)

  Series ──contains──→ Tutorial[]
     (1)                (N)

  Tutorial ──has content──→ MDX file (sections are inside the MDX)
  Tutorial ──belongs to──→ Series (optional, via seriesId)

  Your Proposed Hierarchy

  Series → Lesson[] → Tutorial[]

  This means: Series is the biggest container, Lessons are mid-level groupings, Tutorials are the atomic units.

  My Recommendation

  Given the codebase reality, I'd suggest simplifying to 2 levels, not 3:

  Option A: Keep 2 levels, rename for clarity

  Series (course) → Tutorial (lesson step)

  - Rename what's currently "Lesson Manager" → "Course Manager" or "Tutorial Center"
  - Series = Course (e.g. "终端基础", "OpenClaw 快速上手")
  - Tutorial = One learning step (e.g. "ls 命令详解", "AutoClaw 一键安装")
  - Remove the "Lesson" concept entirely — it adds no value over the existing Series→Tutorial relationship

  This is the simplest fix. The current code already works this way; it's just the naming that's confusing.

  Option B: If you really want 3 levels

  Series (track) → Lesson (course) → Tutorial (step)

  ┌───────┬──────────┬─────────────────────┬────────────────────────────────────┐
  │ Level │   Name   │       Example       │              Storage               │
  ├───────┼──────────┼─────────────────────┼────────────────────────────────────┤
  │ 1     │ Series   │ "AI Agent 开发"     │ _series/{id}.json                  │
  ├───────┼──────────┼─────────────────────┼────────────────────────────────────┤
  │ 2     │ Lesson   │ "OpenClaw 快速上手" │ _lessons/{id}.json with seriesId   │
  ├───────┼──────────┼─────────────────────┼────────────────────────────────────┤
  │ 3     │ Tutorial │ "AutoClaw 一键安装" │ tutorials/{slug}.mdx with lessonId │
  └───────┴──────────┴─────────────────────┴────────────────────────────────────┘

  This requires:
  - Adding a Lesson type between Series and Tutorial
  - Adding a lessonId field to Tutorial frontmatter
  - Changing Series to contain Lessons instead of Tutorials
  - Creating a new /admin/lesson page that actually manages Lessons
  - More complex navigation (3-level drill-down)

  My Advice: Go with Option A

  Reasons:
  1. The current content is short-form (5-20 min tutorials). A 3-level hierarchy adds navigation complexity without real benefit at this scale.
  2. All existing MDX files and data already fit the 2-level model perfectly.
  3. The "Lesson Manager" page just needs a rename to "Tutorial Center" or "课程管理" to eliminate confusion.
  4. If content grows later, you can introduce the 3rd level then — but right now it's premature.

  Concrete actions for Option A:
  - Drop the SeriesLesson and LessonSection types from D1App (or don't port them to D2App)
  - Rename /admin/lesson page header from "Lesson Manager" → "课程管理" (Course Manager)
  - Keep Series → Tutorial[] as the only hierarchy
  - The sidebar already shows this correctly (series as collapsible groups, tutorials as children)

Go with Option A, But need to make sure:
1. Course Could be composed by differen tutorials
2. Remove Series now, but the course is now in the series position
3. Can edit Tutorial in tutorial center page
4. could select the MDX file or upload(same as select one MD file in local) 
5. Different course could be add same tutorials, and in a course, tutorials could be sorted as the course's roadmp or agenda


