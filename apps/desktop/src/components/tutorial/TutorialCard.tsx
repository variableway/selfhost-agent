import { Clock, Play, CheckCircle, Circle, Terminal, BookOpen } from 'lucide-react';
import { Tutorial } from '../../types';

interface TutorialCardProps {
  tutorial: Tutorial;
  completed?: boolean;
  onClick: () => void;
  index?: number;
}

const difficultyConfig = {
  beginner: { 
    text: '入门', 
    gradient: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-500/10',
    textColor: 'text-emerald-400'
  },
  intermediate: { 
    text: '进阶', 
    gradient: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-500/10',
    textColor: 'text-amber-400'
  },
  advanced: { 
    text: '高级', 
    gradient: 'from-rose-500 to-pink-500',
    bg: 'bg-rose-500/10',
    textColor: 'text-rose-400'
  },
};

export function TutorialCard({ tutorial, completed, onClick, index = 0 }: TutorialCardProps) {
  const difficulty = difficultyConfig[tutorial.difficulty];
  
  return (
    <div 
      onClick={onClick}
      className="group relative bg-bg-card rounded-2xl border border-border-primary overflow-hidden cursor-pointer card-hover animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Hover Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Top Accent Line */}
      <div className={`
        absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${difficulty.gradient}
        transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500
      `} />
      
      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className={`
                px-2 py-0.5 text-xs font-semibold rounded-full
                ${difficulty.bg} ${difficulty.textColor}
              `}>
                {difficulty.text}
              </span>
              {completed && (
                <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-success/10 text-success">
                  <CheckCircle size={10} />
                  已完成
                </span>
              )}
            </div>
            <h3 className="font-bold text-text-primary group-hover:text-accent transition-colors line-clamp-1">
              {tutorial.title}
            </h3>
          </div>
          
          {/* Status Icon */}
          <div className={`
            w-8 h-8 rounded-xl flex items-center justify-center shrink-0
            ${completed 
              ? 'bg-success/10 text-success' 
              : 'bg-bg-tertiary text-text-muted group-hover:bg-accent/10 group-hover:text-accent'
            }
            transition-all duration-200
          `}>
            {completed ? <CheckCircle size={18} /> : <Circle size={18} />}
          </div>
        </div>
        
        {/* Description */}
        <p className="text-text-secondary text-sm mt-2 line-clamp-2 leading-relaxed">
          {tutorial.description}
        </p>
        
        {/* Tags */}
        {tutorial.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {tutorial.tags.slice(0, 3).map((tag) => (
              <span 
                key={tag}
                className="px-2.5 py-1 bg-bg-tertiary text-text-muted text-xs rounded-lg border border-border-primary group-hover:border-border-hover transition-colors"
              >
                {tag}
              </span>
            ))}
            {tutorial.tags.length > 3 && (
              <span className="px-2.5 py-1 text-text-muted text-xs">
                +{tutorial.tags.length - 3}
              </span>
            )}
          </div>
        )}
        
        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border-primary/50">
          <div className="flex items-center gap-3">
            {/* Duration */}
            <div className="flex items-center gap-1.5 text-text-muted text-sm">
              <Clock size={14} />
              <span>{tutorial.duration} 分钟</span>
            </div>
            
            {/* Has Executable Badge */}
            <div className="flex items-center gap-1 text-text-muted text-sm">
              <Terminal size={14} className="text-accent" />
              <span>可执行</span>
            </div>
          </div>
          
          {/* Play Button */}
          <button className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
            transition-all duration-300 transform
            ${completed 
              ? 'bg-success/10 text-success hover:bg-success/20' 
              : 'bg-gradient-to-r from-accent to-secondary text-white opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 shadow-glow'
            }
          `}>
            <Play size={14} className={completed ? '' : 'fill-current'} />
            <span>{completed ? '复习' : '开始'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
