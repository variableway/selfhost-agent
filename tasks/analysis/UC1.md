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




