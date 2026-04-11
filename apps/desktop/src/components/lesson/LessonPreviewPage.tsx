import { useAppStore } from '../../store/useAppStore';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Copy,
  Check,
  FileText,
} from 'lucide-react';
import { useState } from 'react';

interface LessonPreviewPageProps {
  lessonId: string;
  onBack: () => void;
}

export function LessonPreviewPage({ lessonId, onBack }: LessonPreviewPageProps) {
  const { lessons, previewSectionIndex, setPreviewSectionIndex } = useAppStore();
  const [copiedBlock, setCopiedBlock] = useState<string | null>(null);

  const lesson = lessons.find((l) => l.id === lessonId);
  if (!lesson) {
    return (
      <div className="h-full flex items-center justify-center text-text-muted">
        课程未找到
      </div>
    );
  }

  const sections = lesson.sections;
  const currentSection = sections[previewSectionIndex];
  const isFirst = previewSectionIndex === 0;
  const isLast = previewSectionIndex === sections.length - 1;
  const totalSections = sections.length;

  const handleCopy = (code: string, blockId: string) => {
    navigator.clipboard.writeText(code);
    setCopiedBlock(blockId);
    setTimeout(() => setCopiedBlock(null), 2000);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-8 py-4 border-b border-border-primary bg-bg-secondary/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 rounded-lg hover:bg-bg-hover text-text-secondary hover:text-text-primary transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-text-primary">{lesson.title}</h1>
              <p className="text-xs text-text-muted">
                {lesson.category} · {currentSection?.fileName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <FileText size={16} className="text-text-muted" />
            <span className="text-sm text-text-secondary">
              {previewSectionIndex + 1} / {totalSections}
            </span>
          </div>
        </div>

        {/* Section tabs */}
        {totalSections > 1 && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            {sections.map((section, idx) => (
              <button
                key={section.id}
                onClick={() => setPreviewSectionIndex(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  idx === previewSectionIndex
                    ? 'bg-accent text-white'
                    : 'bg-bg-card border border-border-primary text-text-secondary hover:text-text-primary'
                }`}
              >
                {section.fileName}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-8 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="prose prose-invert prose-sm max-w-none">
            {currentSection ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  pre({ children, ...props }) {
                    const codeElement = props.node?.children?.[0];
                    let codeString = '';
                    if (codeElement && 'children' in codeElement) {
                      const textChild = (codeElement as any).children?.[0];
                      if (typeof textChild === 'string') {
                        codeString = textChild;
                      }
                    }
                    const blockId = `code-${previewSectionIndex}-${props.node?.position?.start.line ?? 0}`;
                    return (
                      <div className="relative group">
                        <pre className="bg-bg-primary border border-border-primary rounded-xl p-4 overflow-x-auto">
                          {children}
                        </pre>
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleCopy(codeString, blockId)}
                            className="p-1.5 rounded-lg bg-bg-card/80 hover:bg-bg-hover text-text-secondary transition-all"
                            title="复制代码"
                          >
                            {copiedBlock === blockId ? (
                              <Check size={14} className="text-green-400" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  },
                  code({ className, children, ...props }) {
                    const isInline = !className;
                    if (isInline) {
                      return (
                        <code className="bg-bg-primary px-1.5 py-0.5 rounded text-accent text-xs" {...props}>
                          {children}
                        </code>
                      );
                    }
                    return (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                  h1: ({ children }) => (
                    <h1 className="text-2xl font-bold text-text-primary mt-8 mb-4">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-xl font-bold text-text-primary mt-6 mb-3">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-lg font-semibold text-text-primary mt-4 mb-2">{children}</h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-text-secondary leading-relaxed mb-4">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside text-text-secondary space-y-1 mb-4">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside text-text-secondary space-y-1 mb-4">{children}</ol>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-accent/50 pl-4 italic text-text-muted my-4">
                      {children}
                    </blockquote>
                  ),
                  a: ({ href, children }) => (
                    <a href={href} className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">
                      {children}
                    </a>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-4">
                      <table className="min-w-full border border-border-primary rounded-lg">
                        {children}
                      </table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="px-4 py-2 bg-bg-card border border-border-primary text-text-primary text-left text-sm font-semibold">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="px-4 py-2 border border-border-primary text-text-secondary text-sm">
                      {children}
                    </td>
                  ),
                }}
              >
                {currentSection.content}
              </ReactMarkdown>
            ) : (
              <div className="text-center py-16 text-text-muted">
                <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
                <p>暂无内容</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      {totalSections > 1 && (
        <div className="shrink-0 px-8 py-4 border-t border-border-primary bg-bg-secondary/50">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            <button
              onClick={() => setPreviewSectionIndex(previewSectionIndex - 1)}
              disabled={isFirst}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                isFirst
                  ? 'text-text-muted cursor-not-allowed'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
              }`}
            >
              <ChevronLeft size={18} />
              上一节
            </button>

            {/* Progress dots */}
            <div className="flex items-center gap-1.5">
              {sections.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setPreviewSectionIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === previewSectionIndex
                      ? 'bg-accent w-6'
                      : 'bg-border-primary hover:bg-text-muted'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => setPreviewSectionIndex(previewSectionIndex + 1)}
              disabled={isLast}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                isLast
                  ? 'text-text-muted cursor-not-allowed'
                  : 'bg-accent text-white hover:opacity-90'
              }`}
            >
              下一节
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
