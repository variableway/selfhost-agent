import { ArrowRight, Clock, BookOpen, Zap } from 'lucide-react';
import { Series, Tutorial } from '../../types';

interface SeriesCardProps {
  series: Series;
  tutorials: Tutorial[];
  onClick: () => void;
  index?: number;
}

export function SeriesCard({ series, tutorials, onClick, index = 0 }: SeriesCardProps) {
  const totalDuration = tutorials.reduce((sum, t) => sum + t.duration, 0);
  const completedCount = 0; // TODO: Get from progress
  const progress = tutorials.length > 0 ? (completedCount / tutorials.length) * 100 : 0;
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'from-green-500 to-emerald-500';
      case 'intermediate': return 'from-yellow-500 to-orange-500';
      case 'advanced': return 'from-red-500 to-pink-500';
      default: return 'from-accent to-secondary';
    }
  };
  
  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '入门';
      case 'intermediate': return '进阶';
      case 'advanced': return '高级';
      default: return '入门';
    }
  };
  
  return (
    <div 
      onClick={onClick}
      className="group relative bg-bg-card rounded-2xl border border-border-primary overflow-hidden cursor-pointer card-hover"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Gradient Border Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Glow Effect */}
      <div 
        className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"
        style={{ background: series.color }}
      />
      
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div 
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-lg"
            style={{ 
              background: `linear-gradient(135deg, ${series.color}20 0%, ${series.color}40 100%)`,
              boxShadow: `0 8px 32px ${series.color}30`
            }}
          >
            {series.icon || '📚'}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`
                px-2 py-0.5 text-xs font-medium rounded-full
                bg-gradient-to-r ${getDifficultyColor(series.difficulty)} text-white
              `}>
                {getDifficultyText(series.difficulty)}
              </span>
            </div>
            <h3 className="font-bold text-lg text-text-primary truncate group-hover:text-accent transition-colors">
              {series.title}
            </h3>
          </div>
        </div>
        
        {/* Description */}
        <p className="text-text-secondary text-sm mt-3 line-clamp-2 leading-relaxed">
          {series.description}
        </p>
        
        {/* Stats */}
        <div className="flex items-center gap-4 mt-4 text-sm">
          <div className="flex items-center gap-1.5 text-text-muted">
            <div className="p-1 rounded-lg bg-bg-tertiary">
              <BookOpen size={14} className="text-accent" />
            </div>
            <span>{tutorials.length} 个教程</span>
          </div>
          <div className="flex items-center gap-1.5 text-text-muted">
            <div className="p-1 rounded-lg bg-bg-tertiary">
              <Clock size={14} className="text-secondary" />
            </div>
            <span>{totalDuration} 分钟</span>
          </div>
        </div>
        
        {/* Progress Bar */}
        {progress > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-text-muted flex items-center gap-1">
                <Zap size={12} className="text-warning" />
                学习进度
              </span>
              <span className="text-accent font-medium">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-accent to-secondary rounded-full transition-all duration-500 shadow-glow"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
        
        {/* Action */}
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-border-primary">
          <div className="flex -space-x-2">
            {tutorials.slice(0, 3).map((t, i) => (
              <div 
                key={t.id}
                className="w-8 h-8 rounded-full bg-bg-tertiary border-2 border-bg-card flex items-center justify-center text-xs"
                style={{ zIndex: 3 - i }}
              >
                {i + 1}
              </div>
            ))}
            {tutorials.length > 3 && (
              <div className="w-8 h-8 rounded-full bg-bg-tertiary border-2 border-bg-card flex items-center justify-center text-xs text-text-muted">
                +{tutorials.length - 3}
              </div>
            )}
          </div>
          
          <button className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-accent to-secondary text-white text-sm font-medium rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 shadow-glow">
            <span>开始学习</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
