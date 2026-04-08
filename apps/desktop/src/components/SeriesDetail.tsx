import { ArrowLeft, BookOpen, Clock, BarChart3, Trophy, Play, Sparkles } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { TutorialCard } from './tutorial/TutorialCard';

interface SeriesDetailProps {
  seriesId: string;
  onBack: () => void;
  onTutorialClick: (tutorialId: string) => void;
}

export function SeriesDetail({ seriesId, onBack, onTutorialClick }: SeriesDetailProps) {
  const { series, getTutorialsBySeries, progress } = useAppStore();
  
  const currentSeries = series.find((s) => s.id === seriesId);
  const tutorials = getTutorialsBySeries(seriesId);
  
  if (!currentSeries) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-text-muted text-lg">系列不存在</div>
      </div>
    );
  }
  
  const completedCount = tutorials.filter(
    (t) => progress[t.id]?.completed
  ).length;
  const progressPercent = tutorials.length > 0 
    ? (completedCount / tutorials.length) * 100 
    : 0;
  const totalDuration = tutorials.reduce((sum, t) => sum + t.duration, 0);
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'from-emerald-500 to-teal-500';
      case 'intermediate': return 'from-amber-500 to-orange-500';
      case 'advanced': return 'from-rose-500 to-pink-500';
      default: return 'from-accent to-secondary';
    }
  };
  
  const nextTutorial = tutorials.find(t => !progress[t.id]?.completed);
  
  return (
    <div className="h-full overflow-auto">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        {/* Background */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: `linear-gradient(135deg, ${currentSeries.color}40 0%, transparent 60%)`
          }}
        />
        <div 
          className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"
          style={{ background: `${currentSeries.color}30` }}
        />
        
        <div className="relative px-8 py-8">
          {/* Back Button */}
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-6 group"
          >
            <div className="w-8 h-8 rounded-lg bg-bg-card border border-border-primary flex items-center justify-center group-hover:border-border-hover transition-colors">
              <ArrowLeft size={16} />
            </div>
            <span>返回系列列表</span>
          </button>
          
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* Icon */}
            <div 
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shrink-0 shadow-glow"
              style={{ 
                background: `linear-gradient(135deg, ${currentSeries.color}30 0%, ${currentSeries.color}50 100%)`,
                boxShadow: `0 8px 32px ${currentSeries.color}40`
              }}
            >
              {currentSeries.icon || '📚'}
            </div>
            
            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className={`
                  px-3 py-1 text-xs font-semibold rounded-full text-white
                  bg-gradient-to-r ${getDifficultyColor(currentSeries.difficulty)}
                `}>
                  {currentSeries.difficulty === 'beginner' ? '入门' : 
                   currentSeries.difficulty === 'intermediate' ? '进阶' : '高级'}
                </span>
                <span className="flex items-center gap-1.5 text-sm text-text-muted">
                  <BookOpen size={14} />
                  {tutorials.length} 个教程
                </span>
                <span className="flex items-center gap-1.5 text-sm text-text-muted">
                  <Clock size={14} />
                  {totalDuration} 分钟
                </span>
              </div>
              
              <h1 className="text-3xl font-bold text-text-primary mb-2">
                {currentSeries.title}
              </h1>
              <p className="text-text-secondary text-lg leading-relaxed max-w-2xl">
                {currentSeries.description}
              </p>
              
              {/* Progress Section */}
              <div className="mt-6 p-4 bg-bg-card/50 backdrop-blur-sm border border-border-primary rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 size={18} className="text-accent" />
                    <span className="font-medium text-text-primary">学习进度</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-accent">{Math.round(progressPercent)}%</span>
                    <span className="text-text-muted">({completedCount}/{tutorials.length})</span>
                  </div>
                </div>
                <div className="h-3 bg-bg-tertiary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-accent to-secondary rounded-full transition-all duration-700 shadow-glow"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                
                {nextTutorial && progressPercent < 100 && (
                  <button
                    onClick={() => onTutorialClick(nextTutorial.id)}
                    className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-accent to-secondary text-white font-medium rounded-xl hover:shadow-glow transition-all"
                  >
                    <Play size={16} className="fill-current" />
                    继续学习: {nextTutorial.title}
                  </button>
                )}
                
                {progressPercent === 100 && (
                  <div className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl">
                    <Trophy size={18} />
                    <span className="font-medium">恭喜！你已完成本系列所有教程</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tutorials List */}
      <div className="px-8 pb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-secondary flex items-center justify-center shadow-glow">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-primary">教程列表</h2>
            <p className="text-sm text-text-muted">按顺序完成所有教程</p>
          </div>
        </div>
        
        {tutorials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tutorials.map((tutorial, index) => (
              <TutorialCard
                key={tutorial.id}
                tutorial={tutorial}
                completed={progress[tutorial.id]?.completed}
                onClick={() => onTutorialClick(tutorial.id)}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-bg-card rounded-2xl border border-border-primary border-dashed">
            <BookOpen size={64} className="mx-auto mb-4 text-text-muted opacity-30" />
            <p className="text-text-muted text-lg">该系列暂无教程</p>
          </div>
        )}
      </div>
    </div>
  );
}
