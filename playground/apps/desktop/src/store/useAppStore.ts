import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Tutorial, Series, Progress, TerminalPosition, TerminalEntry, Workspace, FileNode } from '../types';
import { tutorials as initialTutorials } from '../data/tutorials';
import { series as initialSeries } from '../data/series';
import { tauriStorage } from '../lib/tauri-storage';
import { TutorialFile, SeriesFile, scanBuiltinTutorials, scanWorkspaceTutorials, scanWorkspaceSeries, deriveSeries, BUILTIN_SERIES } from '../lib/tutorial-scanner';

interface AppState {
  // Data
  tutorials: Tutorial[];
  series: Series[];
  progress: Record<string, Progress>;

  // UI State
  searchQuery: string;
  selectedCategory: string | null;
  selectedDifficulty: string | null;

  // Terminal State
  terminalPosition: TerminalPosition;
  terminalVisible: boolean;
  isExecuting: boolean;
  terminalEntries: TerminalEntry[];

  // Actions
  setTutorials: (tutorials: Tutorial[]) => void;
  setSeries: (series: Series[]) => void;
  setSearchQuery: (query: string) => void;
  setCategory: (category: string | null) => void;
  setDifficulty: (difficulty: string | null) => void;

  // Terminal Actions
  showTerminal: () => void;
  hideTerminal: () => void;
  toggleTerminalPosition: () => void;
  setTerminalPosition: (position: TerminalPosition) => void;
  addTerminalEntry: (entry: TerminalEntry) => void;
  addTerminalOutput: (output: string) => void;
  clearTerminal: () => void;
  setIsExecuting: (executing: boolean) => void;
  executeCommandInTerminal: (command: string) => void;
  killRunningCommand: () => void;

  // Progress Actions
  updateProgress: (progress: Progress) => void;

  // Workspace State
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  defaultWorkspaceId: string | null;
  fileTree: FileNode[];
  selectedFile: FileNode | null;
  fileContent: string;
  selectedFolderPath: string | null;

  // Workspace Actions
  createWorkspace: (name: string, path: string) => void;
  deleteWorkspace: (id: string) => void;
  setDefaultWorkspace: (id: string | null) => void;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  setFileTree: (tree: FileNode[]) => void;
  setSelectedFile: (file: FileNode | null) => void;
  setFileContent: (content: string) => void;
  setSelectedFolderPath: (path: string | null) => void;

  // Discovered tutorials (from MDX frontmatter scanning)
  discoveredTutorials: TutorialFile[];
  discoveredSeries: SeriesFile[];
  scanTutorials: () => Promise<void>;

  // Getters
  getFilteredTutorials: () => Tutorial[];
  getTutorialsBySeries: (seriesId: string) => Tutorial[];
}

const mockTutorials = initialTutorials;
const mockSeries = initialSeries;

async function writeToPty(data: string) {
  if ("__TAURI_INTERNALS__" in window) {
    const { invoke } = await import("@tauri-apps/api/core");
    await invoke("pty_write", { data });
  } else {
    // Web fallback: dispatch event for the terminal panel to handle
    window.dispatchEvent(new CustomEvent("web-pty-write", { detail: data }));
  }
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
  // Initial state
  tutorials: mockTutorials,
  series: mockSeries,
  progress: {},

  searchQuery: '',
  selectedCategory: null,
  selectedDifficulty: null,

  terminalPosition: 'hidden',
  terminalVisible: false,
  isExecuting: false,
  terminalEntries: [],

  // Actions
  setTutorials: (tutorials) => set({ tutorials }),
  setSeries: (series) => set({ series }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setCategory: (selectedCategory) => set({ selectedCategory }),
  setDifficulty: (selectedDifficulty) => set({ selectedDifficulty }),

  // Terminal Actions
  showTerminal: () => set({
    terminalVisible: true,
    terminalPosition: 'right'
  }),
  hideTerminal: () => set({
    terminalVisible: false,
    terminalPosition: 'hidden'
  }),
  toggleTerminalPosition: () => set((state) => ({
    terminalPosition: state.terminalPosition === 'right' ? 'bottom' : 'right',
  })),
  setTerminalPosition: (terminalPosition) => set({ terminalPosition }),
  addTerminalEntry: (entry) => set({ terminalEntries: [...get().terminalEntries, entry] }),
  addTerminalOutput: (output) => set({ terminalEntries: [...get().terminalEntries, { type: 'stdout', text: output }] }),
  clearTerminal: () => set({ terminalEntries: [] }),
  setIsExecuting: (isExecuting) => set({ isExecuting }),

  executeCommandInTerminal: (command: string) => {
    get().showTerminal();
    // Write the command + Enter to the persistent PTY session
    writeToPty(command + "\r");
  },

  killRunningCommand: () => {
    // Send Ctrl+C to the PTY
    writeToPty("\x03");
  },

  // Progress Actions
  updateProgress: (progress) => set((state) => ({
    progress: {
      ...state.progress,
      [progress.tutorialId]: progress,
    },
  })),

  // Workspace State
  workspaces: [],
  currentWorkspace: null,
  defaultWorkspaceId: null,
  fileTree: [],
  selectedFile: null,
  fileContent: '',
  selectedFolderPath: null,

  // Workspace Actions
  createWorkspace: (name, path) => {
    const id = `ws-${Date.now()}`;
    const now = new Date().toISOString();
    const workspace: Workspace = { id, name, path, createdAt: now, updatedAt: now };
    set((state) => {
      const isFirst = !state.defaultWorkspaceId;
      return {
        workspaces: [...state.workspaces, workspace],
        ...(isFirst ? { defaultWorkspaceId: id } : {}),
      };
    });
  },
  deleteWorkspace: (id) => set((state) => ({
    workspaces: state.workspaces.filter((w) => w.id !== id),
    currentWorkspace: state.currentWorkspace?.id === id ? null : state.currentWorkspace,
    defaultWorkspaceId: state.defaultWorkspaceId === id ? null : state.defaultWorkspaceId,
  })),
  setDefaultWorkspace: (id) => set({ defaultWorkspaceId: id }),
  setCurrentWorkspace: (currentWorkspace) => set({
    currentWorkspace,
    fileTree: [],
    selectedFile: null,
    fileContent: '',
    selectedFolderPath: null,
  }),
  setFileTree: (fileTree) => set({ fileTree }),
  setSelectedFile: (selectedFile) => set({ selectedFile, fileContent: '' }),
  setFileContent: (fileContent) => set({ fileContent }),
  setSelectedFolderPath: (selectedFolderPath) => set({ selectedFolderPath }),

  // Discovered tutorials
  discoveredTutorials: [],
  discoveredSeries: [],
  scanTutorials: async () => {
    try {
      const builtinTutorials = await scanBuiltinTutorials();
      const state = get();
      const workspacePath = state.currentWorkspace?.path || state.defaultWorkspaceId
        ? state.workspaces.find((w: Workspace) => w.id === state.defaultWorkspaceId)?.path
        : undefined;

      let workspaceTutorials: TutorialFile[] = [];
      let workspaceSeries: any[] = [];

      if (workspacePath) {
        workspaceTutorials = await scanWorkspaceTutorials(workspacePath);
        workspaceSeries = await scanWorkspaceSeries(workspacePath);
      }

      // Merge: workspace tutorials override builtin with same slug
      const slugSet = new Set(workspaceTutorials.map((t) => t.slug));
      const merged = [...workspaceTutorials, ...builtinTutorials.filter((t) => !slugSet.has(t.slug))];

      const allSeries = deriveSeries(merged, [...BUILTIN_SERIES, ...workspaceSeries]);

      set({ discoveredTutorials: merged, discoveredSeries: allSeries });
    } catch (e) {
      console.error('[scanTutorials] failed:', e);
    }
  },

  // Getters
  getFilteredTutorials: () => {
    const { tutorials, searchQuery, selectedCategory, selectedDifficulty } = get();
    return tutorials.filter((tutorial) => {
      const matchesSearch = !searchQuery ||
        tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tutorial.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || tutorial.category === selectedCategory;
      const matchesDifficulty = !selectedDifficulty || tutorial.difficulty === selectedDifficulty;
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  },

  getTutorialsBySeries: (seriesId: string) => {
    const { tutorials } = get();
    return tutorials
      .filter((t) => t.series === seriesId)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  },
}),
{
  name: 'innate-playground-storage',
  storage: tauriStorage,
  partialize: (state) => ({
    workspaces: state.workspaces,
    progress: state.progress,
    defaultWorkspaceId: state.defaultWorkspaceId,
  }),
}
  )
);
