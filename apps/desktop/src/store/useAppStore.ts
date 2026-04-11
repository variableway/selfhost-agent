import { create } from 'zustand';
import { Tutorial, Series, Progress, TerminalPosition, SeriesLesson, LessonSection } from '../types';

interface AppState {
  // Data
  tutorials: Tutorial[];
  series: Series[];
  progress: Record<string, Progress>;
  
  // UI State
  currentTutorial: Tutorial | null;
  currentSeries: Series | null;
  searchQuery: string;
  selectedCategory: string | null;
  selectedDifficulty: string | null;
  
  // Terminal State
  terminalPosition: TerminalPosition;
  terminalVisible: boolean;
  isExecuting: boolean;
  terminalOutput: string[];
  
  // Actions
  setTutorials: (tutorials: Tutorial[]) => void;
  setSeries: (series: Series[]) => void;
  setCurrentTutorial: (tutorial: Tutorial | null) => void;
  setCurrentSeries: (series: Series | null) => void;
  setSearchQuery: (query: string) => void;
  setCategory: (category: string | null) => void;
  setDifficulty: (difficulty: string | null) => void;
  
  // Terminal Actions
  showTerminal: () => void;
  hideTerminal: () => void;
  toggleTerminalPosition: () => void;
  setTerminalPosition: (position: TerminalPosition) => void;
  addTerminalOutput: (output: string) => void;
  clearTerminal: () => void;
  setIsExecuting: (executing: boolean) => void;
  
  // Progress Actions
  updateProgress: (progress: Progress) => void;

  // Lesson State (UC1)
  lessons: SeriesLesson[];
  currentLesson: SeriesLesson | null;
  previewSectionIndex: number;

  // Lesson Actions (UC1)
  createLesson: (title: string, category: string, description?: string, difficulty?: 'beginner' | 'intermediate' | 'advanced') => string;
  addSectionToLesson: (lessonId: string, section: LessonSection) => void;
  removeSectionFromLesson: (lessonId: string, sectionId: string) => void;
  reorderSections: (lessonId: string, sectionIds: string[]) => void;
  deleteLesson: (lessonId: string) => void;
  setCurrentLesson: (lesson: SeriesLesson | null) => void;
  setPreviewSectionIndex: (index: number) => void;

  // Filtered Data
  getFilteredTutorials: () => Tutorial[];
  getTutorialsBySeries: (seriesId: string) => Tutorial[];
}

// Mock data for initial state
const mockTutorials: Tutorial[] = [
  {
    id: 'tutorial-001',
    title: '安装 Node.js',
    description: '使用 fnm 安装和管理 Node.js 版本',
    category: 'dev-tools',
    difficulty: 'beginner',
    duration: 10,
    tags: ['nodejs', 'fnm', 'javascript'],
    series: 'nodejs-fundamentals',
    order: 1,
    createdAt: '2026-04-01',
    updatedAt: '2026-04-01',
    source: 'builtin',
  },
  {
    id: 'tutorial-002',
    title: 'Git 基础',
    description: '学习 Git 的基本操作',
    category: 'dev-tools',
    difficulty: 'beginner',
    duration: 15,
    tags: ['git', 'version-control'],
    series: 'git-fundamentals',
    order: 1,
    createdAt: '2026-04-01',
    updatedAt: '2026-04-01',
    source: 'builtin',
  },
  {
    id: 'tutorial-003',
    title: 'Python 环境配置',
    description: '使用 uv 管理 Python 环境',
    category: 'dev-tools',
    difficulty: 'beginner',
    duration: 10,
    tags: ['python', 'uv'],
    series: 'python-fundamentals',
    order: 1,
    createdAt: '2026-04-01',
    updatedAt: '2026-04-01',
    source: 'builtin',
  },
  {
    id: 'tutorial-004',
    title: 'ls 命令详解',
    description: '掌握目录列表命令',
    category: 'terminal',
    difficulty: 'beginner',
    duration: 5,
    tags: ['terminal', 'bash'],
    series: 'terminal-basics',
    order: 1,
    createdAt: '2026-04-01',
    updatedAt: '2026-04-01',
    source: 'builtin',
  },
  {
    id: 'tutorial-005',
    title: 'cd 和 pwd 命令',
    description: '学习目录导航',
    category: 'terminal',
    difficulty: 'beginner',
    duration: 5,
    tags: ['terminal', 'bash'],
    series: 'terminal-basics',
    order: 2,
    createdAt: '2026-04-01',
    updatedAt: '2026-04-01',
    source: 'builtin',
  },
];

const mockSeries: Series[] = [
  {
    id: 'nodejs-fundamentals',
    title: 'Node.js 基础',
    description: '从零开始学习 Node.js 开发环境配置',
    category: 'dev-tools',
    difficulty: 'beginner',
    icon: '📦',
    color: '#339933',
    tutorials: ['tutorial-001'],
    createdAt: '2026-04-01',
    updatedAt: '2026-04-01',
  },
  {
    id: 'git-fundamentals',
    title: 'Git 基础',
    description: '掌握版本控制的核心概念',
    category: 'dev-tools',
    difficulty: 'beginner',
    icon: '🌲',
    color: '#f05032',
    tutorials: ['tutorial-002'],
    createdAt: '2026-04-01',
    updatedAt: '2026-04-01',
  },
  {
    id: 'python-fundamentals',
    title: 'Python 基础',
    description: 'Python 开发环境配置指南',
    category: 'dev-tools',
    difficulty: 'beginner',
    icon: '🐍',
    color: '#3776ab',
    tutorials: ['tutorial-003'],
    createdAt: '2026-04-01',
    updatedAt: '2026-04-01',
  },
  {
    id: 'terminal-basics',
    title: '终端基础',
    description: '命令行入门必修课程',
    category: 'terminal',
    difficulty: 'beginner',
    icon: '🖥️',
    color: '#4a5568',
    tutorials: ['tutorial-004', 'tutorial-005'],
    createdAt: '2026-04-01',
    updatedAt: '2026-04-01',
  },
];

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  tutorials: mockTutorials,
  series: mockSeries,
  progress: {},
  
  currentTutorial: null,
  currentSeries: null,
  searchQuery: '',
  selectedCategory: null,
  selectedDifficulty: null,
  
  terminalPosition: 'hidden',
  terminalVisible: false,
  isExecuting: false,
  terminalOutput: [],
  
  // Actions
  setTutorials: (tutorials) => set({ tutorials }),
  setSeries: (series) => set({ series }),
  setCurrentTutorial: (currentTutorial) => set({ currentTutorial }),
  setCurrentSeries: (currentSeries) => set({ currentSeries }),
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
  addTerminalOutput: (output) => set((state) => ({
    terminalOutput: [...state.terminalOutput, output],
  })),
  clearTerminal: () => set({ terminalOutput: [] }),
  setIsExecuting: (isExecuting) => set({ isExecuting }),
  
  // Progress Actions
  updateProgress: (progress) => set((state) => ({
    progress: {
      ...state.progress,
      [progress.tutorialId]: progress,
    },
  })),

  // Lesson State
  lessons: [],
  currentLesson: null,
  previewSectionIndex: 0,

  // Lesson Actions
  createLesson: (title, category, description, difficulty = 'beginner') => {
    const id = `lesson-${Date.now()}`;
    const now = new Date().toISOString();
    const lesson: SeriesLesson = {
      id,
      title,
      category,
      description,
      difficulty,
      sections: [],
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({ lessons: [...state.lessons, lesson] }));
    return id;
  },

  addSectionToLesson: (lessonId, section) => set((state) => ({
    lessons: state.lessons.map((l) =>
      l.id === lessonId
        ? { ...l, sections: [...l.sections, section], updatedAt: new Date().toISOString() }
        : l
    ),
  })),

  removeSectionFromLesson: (lessonId, sectionId) => set((state) => ({
    lessons: state.lessons.map((l) =>
      l.id === lessonId
        ? {
            ...l,
            sections: l.sections.filter((s) => s.id !== sectionId),
            updatedAt: new Date().toISOString(),
          }
        : l
    ),
  })),

  reorderSections: (lessonId, sectionIds) => set((state) => ({
    lessons: state.lessons.map((l) => {
      if (l.id !== lessonId) return l;
      const reordered = sectionIds
        .map((id, idx) => {
          const section = l.sections.find((s) => s.id === id);
          return section ? { ...section, order: idx } : null;
        })
        .filter(Boolean) as LessonSection[];
      return { ...l, sections: reordered, updatedAt: new Date().toISOString() };
    }),
  })),

  deleteLesson: (lessonId) => set((state) => ({
    lessons: state.lessons.filter((l) => l.id !== lessonId),
  })),

  setCurrentLesson: (currentLesson) => set({ currentLesson }),
  setPreviewSectionIndex: (previewSectionIndex) => set({ previewSectionIndex }),

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
}));
