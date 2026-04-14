# UC1-B Bug Fix


## Task 1: fix build bug

```
       Error The "beforeDevCommand" terminated with a non-zero status code._deref_trait, serde_core(build), libc(build.rs), zerocopy(build), proc-macro2(…
```
Please fix this bug

## Task 2: Fix Bug

···
> 1 | export * from "./lib/utils";
    | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  2 | export * from "./components/ui/accordion";
  3 | export * from "./components/ui/alert-dialog";
  4 | export * from "./components/ui/alert";

Import traces:
  #1 [Client Component Browser]:
    ./packages/ui/src/index.ts [Client Component Browser]
    ./apps/desktop/src/app/page.tsx [Client Component Browser]
    ./apps/desktop/src/app/page.tsx [Server Component]

  #2 [Client Component SSR]:
    ./packages/ui/src/index.ts [Client Component SSR]
    ./apps/desktop/src/app/page.tsx [Client Component SSR]
    ./apps/desktop/src/app/page.tsx [Server Component]

  #3 [Client Component Browser]:
    ./packages/ui/src/index.ts [Client Component Browser]
    ./apps/desktop/src/components/layout/app-shell.tsx [Client Component Browser]
    ./apps/desktop/src/components/layout/app-shell.tsx [Server Component]
    ./apps/desktop/src/app/layout.tsx [Server Component]

  #4 [Client Component SSR]:
    ./packages/ui/src/index.ts [Client Component SSR]
    ./apps/desktop/src/components/layout/app-shell.tsx [Client Component SSR]
    ./apps/desktop/src/components/layout/app-shell.tsx [Server Component]
    ./apps/desktop/src/app/layout.tsx [Server Component]

https://nextjs.org/docs/messages/module-not-found 
[browser] ./packages/ui/src/index.ts:1:1
Module not found: Can't resolve './lib/utils'
> 1 | export * from "./lib/utils";
    | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  2 | export * from "./components/ui/accordion";
  3 | export * from "./components/ui/alert-dialog";
  4 | export * from "./components/ui/alert";

Import traces:
  #1 [Client Component Browser]:
    ./packages/ui/src/index.ts [Client Component Browser]
    ./apps/desktop/src/app/page.tsx [Client Component Browser]
    ./apps/desktop/src/app/page.tsx [Server Component]

  #2 [Client Component SSR]:
    ./packages/ui/src/index.ts [Client Component SSR]
    ./apps/desktop/src/app/page.tsx [Client Component SSR]
    ./apps/desktop/src/app/page.tsx [Server Component]

  #3 [Client Component Browser]:
    ./packages/ui/src/index.ts [Client Component Browser]
    ./apps/desktop/src/components/layout/app-shell.tsx [Client Component Browser]
    ./apps/desktop/src/components/layout/app-shell.tsx [Server Component]
    ./apps/desktop/src/app/layout.tsx [Server Component]

  #4 [Client Component SSR]:
    ./packages/ui/src/index.ts [Client Component SSR]
    ./apps/desktop/src/components/layout/app-shell.tsx [Client Component SSR]
    ./apps/desktop/src/components/layout/app-shell.tsx [Server Component]
    ./apps/desktop/src/app/layout.tsx [Server Component]

https://nextjs.org/docs/messages/module-not-found 
[browser] ./packages/ui/src/index.ts:1:1
Module not found: Can't resolve './lib/utils'
> 1 | export * from "./lib/utils";
    | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  2 | export * from "./components/ui/accordion";
  3 | export * from "./components/ui/alert-dialog";
  4 | export * from "./components/ui/alert";

Import traces:
  #1 [Client Component Browser]:
    ./packages/ui/src/index.ts [Client Component Browser]
    ./apps/desktop/src/app/page.tsx [Client Component Browser]
    ./apps/desktop/src/app/page.tsx [Server Component]

  #2 [Client Component SSR]:
    ./packages/ui/src/index.ts [Client Component SSR]
    ./apps/desktop/src/app/page.tsx [Client Component SSR]
    ./apps/desktop/src/app/page.tsx [Server Component]

  #3 [Client Component Browser]:
    ./packages/ui/src/index.ts [Client Component Browser]
    ./apps/desktop/src/components/layout/app-shell.tsx [Client Component Browser]
    ./apps/desktop/src/components/layout/app-shell.tsx [Server Component]
    ./apps/desktop/src/app/layout.tsx [Server Component]

  #4 [Client Component SSR]:
    ./packages/ui/src/index.ts [Client Component SSR]
    ./apps/desktop/src/components/layout/app-shell.tsx [Client Component SSR]
    ./apps/desktop/src/components/layout/app-shell.tsx [Server Component]
    ./apps/desktop/src/app/layout.tsx [Server Component]

https://nextjs.org/docs/messages/module-not-found 
··· 
please fix bug

## Task 3: Create Workspace can't select a folder to create a workspace

1. Create Workspace can't select a folder to create a workspace
2. click the 浏览按钮没法工作


## Task 4: Create Workspace didn't create folders
1. Create Workspace didn't create folders
2. The UI to display the Path is not aligned with Whole page, need to fix it or just 


## Task 5: workspace is deletable and could set default workspace folder
1. workspace is deletable and could set default workspace folder
2. right click the workspace ,then delte,and set to default option displayed in workspace page
3. then you can delete the workspace or set to default workspace folder


## Task 6: Terminal can't run commands
1. Terminal can't run commands
2. click run button in tutorial, the command doesn't run in terminal 

## Task 7: Making Menu Bar stay on the Header

1. Make Sure Menu Bar stay in same play when scrolling the page

## Task 8: After Create Workspace,and save it,restart it, it is existing

1. After Create Workspace,and save it,restart it, it is existing
2. Maybe think about using SQLite to store this information
3. Because some lesson process aslo need to be stored. Maybe SQLite is good choice

## Task 9 : Terminal Panel is not resizable

1. Terminal Panel is not resizable
2. It should be resizable

## Task 10: Workspace Path Display in Header
After Workspace is created, then going to detail page:

1. The UI to display the Path is not aligned with Whole page, need to fix it or just 

## Task 11: Fix bug

```sh
Module not found: Can't resolve '@tauri-apps/plugin-store'
./apps/desktop/src/lib/tauri-storage.ts (6:26)

Module not found: Can't resolve '@tauri-apps/plugin-store'
  4 |
  5 | async function getTauriStore() {
> 6 |   const { load } = await import('@tauri-apps/plugin-store');
    |                          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  7 |   return load('app-state.json', { autoSave: false });
  8 | }
  9 |

Import traces:
  Client Component Browser:
    ./apps/desktop/src/lib/tauri-storage.ts [Client Component Browser]
    ./apps/desktop/src/store/useAppStore.ts [Client Component Browser]
    ./apps/desktop/src/components/layout/app-shell.tsx [Client Component Browser]
    ./apps/desktop/src/components/layout/app-shell.tsx [Server Component]
    ./apps/desktop/src/app/layout.tsx [Server Component]

  Client Component SSR:
    ./apps/desktop/src/lib/tauri-storage.ts [Client Component SSR]
    ./apps/desktop/src/store/useAppStore.ts [Client Component SSR]
    ./apps/desktop/src/components/layout/app-shell.tsx [Client Component SSR]
    ./apps/desktop/src/components/layout/app-shell.tsx [Server Component]
    ./apps/desktop/src/app/layout.tsx [Server Component]

https://nextjs.org/docs/messages/module-not-found
```



## Task 12: Workspace can‘t ne deleted and set to default

Workspace can‘t ne deleted and set to default


## Task 13: In Workspace Detail page, the preview of file content page is not full width

1. In Workspace Detail page, the preview of file content page is not full width
2. The path of workspace is also not full width

## Task 14: In Workspace Detail page, Markdown Content need to fully support

1. In Workspace Detail page, Markdown Content need to fully support
2. Andd the ToC of Markdown Content should be in the right side of the markdown Content

## Task 15: terminal Panel is not displayed

1. currently terminal pannel is not displayed
2. need to act same as before, in the right side of the tutorial, the terminal panel is displayed
   and the install process is showing realtime

## Task 16: relocate the admin category and tutorial 

1. put tutorial in top and admin in the bottom of the sidebar
2. change admin to 管理
3. add setting to 管理 category

## Task 17: menu bar lesson and series leads to 404

1. menu bar lesson and series leads to 404
2. please let lessons to tutorial page
3. series leads to tutorial page which layout is based one series

## Task 18: after click run button， terminal is nothing happened

1. click the run button in toturials，terminal is not running any command
2. should execute the run task，and terminal display the realtime log
3. terminal style should be same as [text](../../../apps/desktop) terminal style but with resizable，and
   consistent them style/color style with current project
## Task 19: Sidebar，category should be first level，others are sub categories，or sub menu

1.Sidebar，category should be first level，others are sub categories，or sub menu
2. sub category or sub menu could be unfolded and folded

## Task 20: clean up search box in home page

1. remove search box in home page，cause there is search box in toolbar menu

## Task 21: making sure the default path of terminal started is the workplace location

1. making sure the default path of terminal started is the workplace location
2. if workspace is not set，then use the user root location
3. first command executed，and seems nothing happened
4. only one terminal session or when command is invoked by tutorial，one session by default

## Task 22: bug fix

```
Runtime Error



Input/output error (os error 5)
Call Stack
2
Hide 2 ignore-listed frame(s)
coerceError
../../node_modules/.pnpm/next@16.2.2_@babel+core@7.29.0_react-dom@19.2.4_react@19.2.4/node_modules/next/src/next-devtools/userspace/app/errors/stitched-error.ts (14:39)
onUnhandledRejection
../../node_modules/.pnpm/next@16.2.2_@babel+core@7.29.0_react-dom@19.2.4_react@19.2.4/node_modules/next/src/next-devtools/userspace/app/errors/use-error-handler.ts (110:28)
``` 
fix this bug