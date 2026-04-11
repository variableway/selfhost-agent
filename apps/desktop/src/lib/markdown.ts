import { LessonSection } from '../types';

let sectionCounter = 0;

export function createSectionFromFile(
  fileName: string,
  filePath: string,
  content: string,
  order: number
): LessonSection {
  const ext = fileName.endsWith('.mdx') ? 'mdx' : 'md';
  return {
    id: `section-${Date.now()}-${++sectionCounter}`,
    fileName,
    filePath,
    content,
    fileType: ext,
    order,
    createdAt: new Date().toISOString(),
  };
}

export function extractCodeBlocks(markdown: string): { language: string; code: string }[] {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const blocks: { language: string; code: string }[] = [];
  let match;
  while ((match = codeBlockRegex.exec(markdown)) !== null) {
    blocks.push({
      language: match[1] || 'text',
      code: match[2].trim(),
    });
  }
  return blocks;
}
