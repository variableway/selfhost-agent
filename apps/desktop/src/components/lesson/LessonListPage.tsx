import { useAppStore } from '../../store/useAppStore';
import {
  Plus,
  BookOpen,
  FileText,
  Trash2,
  Eye,
  ArrowLeft,
  FolderOpen,
  Tag,
} from 'lucide-react';

interface LessonListPageProps {
  onBack: () => void;
  onCreateNew: () => void;
  onLessonClick: (lessonId: string) => void;
}

export function LessonListPage({ onBack, onCreateNew, onLessonClick }: LessonListPageProps) {
  const { lessons, deleteLesson } = useAppStore();

  const handleDelete = (e: React.MouseEvent, lessonId: string) => {
    e.stopPropagation();
    if (confirm('确定要删除这个课程系列吗？')) {
      deleteLesson(lessonId);
    }
  };

  const difficultyLabel = (d: string) =>
    d === 'beginner' ? '初级' : d === 'intermediate' ? '中级' : '高级';

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-4xl mx-auto px-8 py-12">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          <span>返回首页</span>
        </button>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-secondary flex items-center justify-center shadow-glow">
              <FolderOpen size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">我的课程系列</h1>
              <p className="text-sm text-text-muted">管理已创建的课程和上传的文件</p>
            </div>
          </div>
          <button
            onClick={onCreateNew}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent to-secondary text-white text-sm font-semibold hover:opacity-90 shadow-glow transition-all"
          >
            <Plus size={18} />
            创建新课程
          </button>
        </div>

        {lessons.length === 0 ? (
          <div className="text-center py-20 bg-bg-card rounded-2xl border border-border-primary border-dashed">
            <BookOpen size={56} className="mx-auto mb-4 text-text-muted opacity-30" />
            <p className="text-text-muted mb-2">还没有创建课程</p>
            <p className="text-sm text-text-muted mb-6">创建一个课程系列，上传 Markdown 文件开始学习</p>
            <button
              onClick={onCreateNew}
              className="px-6 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:opacity-90 transition-all"
            >
              创建第一个课程
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                onClick={() => onLessonClick(lesson.id)}
                className="group p-5 bg-bg-card border border-border-primary rounded-2xl hover:border-accent/30 hover:shadow-glow transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                      <BookOpen size={20} className="text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-primary">{lesson.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center gap-1 text-xs text-text-muted">
                          <Tag size={10} />
                          {lesson.category}
                        </span>
                        <span className="text-xs text-text-muted">
                          · {difficultyLabel(lesson.difficulty)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, lesson.id)}
                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-text-muted hover:text-red-400 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {lesson.description && (
                  <p className="text-sm text-text-muted mb-3 line-clamp-2">{lesson.description}</p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <FileText size={14} />
                    <span>{lesson.sections.length} 个章节</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                    <Eye size={14} />
                    <span>预览</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
