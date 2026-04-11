import { useState, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { createSectionFromFile } from '../../lib/markdown';
import {
  FileText,
  ArrowLeft,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Trash2,
  BookOpen,
  Tag,
  FileUp,
} from 'lucide-react';

interface CreateLessonPageProps {
  onBack: () => void;
  onLessonCreated: (lessonId: string) => void;
}

export function CreateLessonPage({ onBack, onLessonCreated }: CreateLessonPageProps) {
  const { createLesson, addSectionToLesson, reorderSections, removeSectionFromLesson, lessons } = useAppStore();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentLesson = lessons.find((l) => l.id === lessonId);

  const handleCreateLesson = () => {
    if (!title.trim() || !category.trim()) return;
    const id = createLesson(title.trim(), category.trim(), description.trim() || undefined, difficulty);
    setLessonId(id);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !lessonId) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const text = await file.text();
        const order = currentLesson?.sections.length ?? 0;
        const section = createSectionFromFile(file.name, file.name, text, order);
        addSectionToLesson(lessonId, section);
      }
    } catch (err) {
      console.error('Failed to read file:', err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleMoveSection = (sectionId: string, direction: 'up' | 'down') => {
    if (!currentLesson) return;
    const sections = [...currentLesson.sections];
    const idx = sections.findIndex((s) => s.id === sectionId);
    if (direction === 'up' && idx > 0) {
      [sections[idx - 1], sections[idx]] = [sections[idx], sections[idx - 1]];
    } else if (direction === 'down' && idx < sections.length - 1) {
      [sections[idx], sections[idx + 1]] = [sections[idx + 1], sections[idx]];
    }
    reorderSections(
      lessonId!,
      sections.map((s) => s.id)
    );
  };

  const handleRemoveSection = (sectionId: string) => {
    if (!lessonId) return;
    removeSectionFromLesson(lessonId, sectionId);
  };

  const canCreate = title.trim() && category.trim();
  const canFinish = currentLesson && currentLesson.sections.length > 0;

  // Step 1: Create lesson metadata
  if (!lessonId) {
    return (
      <div className="h-full overflow-auto">
        <div className="max-w-2xl mx-auto px-8 py-12">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-8"
          >
            <ArrowLeft size={20} />
            <span>返回</span>
          </button>

          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-secondary flex items-center justify-center shadow-glow">
              <BookOpen size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">创建系列课程</h1>
              <p className="text-sm text-text-muted">创建一个新的课程系列，然后上传 Markdown 文件</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                课程名称 *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例如：Node.js 入门指南"
                className="w-full px-4 py-3 bg-bg-card border border-border-primary rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent focus:shadow-glow transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                <Tag size={14} className="inline mr-1" />
                分类 *
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="例如：dev-tools, terminal, ai"
                className="w-full px-4 py-3 bg-bg-card border border-border-primary rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent focus:shadow-glow transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                描述
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="简要描述这个课程系列的内容..."
                rows={3}
                className="w-full px-4 py-3 bg-bg-card border border-border-primary rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent focus:shadow-glow transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                难度
              </label>
              <div className="flex gap-3">
                {(['beginner', 'intermediate', 'advanced'] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      difficulty === d
                        ? 'bg-accent text-white'
                        : 'bg-bg-card border border-border-primary text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {d === 'beginner' ? '初级' : d === 'intermediate' ? '中级' : '高级'}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleCreateLesson}
              disabled={!canCreate}
              className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
                canCreate
                  ? 'bg-gradient-to-r from-accent to-secondary text-white hover:opacity-90 shadow-glow'
                  : 'bg-bg-card text-text-muted border border-border-primary cursor-not-allowed'
              }`}
            >
              创建课程
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Upload files and manage sections
  return (
    <div className="h-full overflow-auto">
      <div className="max-w-3xl mx-auto px-8 py-12">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          <span>返回</span>
        </button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{currentLesson?.title}</h1>
            <p className="text-sm text-text-muted">
              {currentLesson?.category} · {currentLesson?.sections.length ?? 0} 个章节
            </p>
          </div>
          <button
            onClick={() => lessonId && onLessonCreated(lessonId)}
            disabled={!canFinish}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              canFinish
                ? 'bg-gradient-to-r from-accent to-secondary text-white hover:opacity-90 shadow-glow'
                : 'bg-bg-card text-text-muted border border-border-primary cursor-not-allowed'
            }`}
          >
            预览教程
          </button>
        </div>

        {/* Upload Area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="mb-8 border-2 border-dashed border-border-primary rounded-2xl p-8 text-center cursor-pointer hover:border-accent/50 hover:bg-accent/5 transition-all group"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,.mdx"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
          <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/20 transition-colors">
            {uploading ? (
              <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            ) : (
              <FileUp size={28} className="text-accent" />
            )}
          </div>
          <p className="text-text-primary font-medium mb-1">
            {uploading ? '上传中...' : '点击上传 Markdown 文件'}
          </p>
          <p className="text-sm text-text-muted">支持 .md 和 .mdx 格式，可多选</p>
        </div>

        {/* Sections List */}
        {currentLesson && currentLesson.sections.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-text-primary mb-4">课程章节</h2>
            {currentLesson.sections.map((section, index) => (
              <div
                key={section.id}
                className="flex items-center gap-3 p-4 bg-bg-card border border-border-primary rounded-xl hover:border-border-hover transition-all group"
              >
                <GripVertical size={18} className="text-text-muted shrink-0" />
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-accent">{index + 1}</span>
                </div>
                <FileText size={18} className="text-text-secondary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {section.fileName}
                  </p>
                  <p className="text-xs text-text-muted">
                    {section.fileType.toUpperCase()} · {(section.content.length / 1024).toFixed(1)}KB
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleMoveSection(section.id, 'up')}
                    disabled={index === 0}
                    className="p-1.5 rounded-lg hover:bg-bg-hover text-text-secondary disabled:opacity-30 transition-all"
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button
                    onClick={() => handleMoveSection(section.id, 'down')}
                    disabled={index === currentLesson.sections.length - 1}
                    className="p-1.5 rounded-lg hover:bg-bg-hover text-text-secondary disabled:opacity-30 transition-all"
                  >
                    <ChevronDown size={16} />
                  </button>
                  <button
                    onClick={() => handleRemoveSection(section.id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-text-secondary hover:text-red-400 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state hint */}
        {currentLesson && currentLesson.sections.length === 0 && (
          <div className="text-center py-8 text-text-muted">
            <FileText size={40} className="mx-auto mb-3 opacity-30" />
            <p>还没有上传文件，点击上方区域上传 Markdown 文件</p>
          </div>
        )}
      </div>
    </div>
  );
}
