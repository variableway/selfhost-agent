export interface Tutorial {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  tags: string[];
  series?: string;
  order?: number;
  content?: TutorialSection[];
  executableBlocks?: ExecutableBlock[];
  author?: string;
  createdAt: string;
  updatedAt: string;
  source?: 'builtin' | 'local' | 'imported';
  localPath?: string;
}

export interface TutorialSection {
  id: string;
  type: 'text' | 'code' | 'executable' | 'image' | 'video';
  content: string;
  language?: string;
  executable?: boolean;
}

export interface ExecutableBlock {
  id: string;
  code: string;
  language: 'bash' | 'powershell' | 'python' | 'javascript';
  platform?: ('macos' | 'windows' | 'linux')[];
  workingDirectory?: string;
  environment?: Record<string, string>;
  expectedOutput?: string;
}

export interface Series {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  icon?: string;
  color?: string;
  tutorials: string[];
  author?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Progress {
  tutorialId: string;
  completed: boolean;
  lastSection?: string;
  completedSections: string[];
  startedAt?: string;
  completedAt?: string;
}

export type TerminalPosition = 'hidden' | 'right' | 'bottom';

// UC1: Series Lesson types for file upload and management
export interface LessonSection {
  id: string;
  fileName: string;
  filePath: string;
  content: string;       // raw markdown content
  fileType: 'md' | 'mdx';
  order: number;
  createdAt: string;
}

export interface SeriesLesson {
  id: string;
  title: string;
  category: string;
  description?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  sections: LessonSection[];
  createdAt: string;
  updatedAt: string;
}
