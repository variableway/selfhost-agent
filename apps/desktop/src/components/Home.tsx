import { useAppStore } from '../store/useAppStore';
import { SeriesCard } from './tutorial/SeriesCard';
import { TutorialCard } from './tutorial/TutorialCard';
import { FolderOpen, FileText, Plus, Sparkles, TrendingUp, Clock, ArrowRight, Zap } from 'lucide-react';

interface HomeProps {
  onSeriesClick: (seriesId: string) => void;
  onTutorialClick: (tutorialId: string) => void;
  onImportClick: () => void;
  onAddDirectoryClick: () => void;
}

export function Home({ onSeriesClick, onTutorialClick, onImportClick, onAddDirectoryClick }: HomeProps) {
  const { series, getFilteredTutorials } = useAppStore();
  
  const filteredTutorials = getFilteredTutorials();
  const recentTutorials = filteredTutorials.slice(0, 6);
  
  const stats = [
    { label: '教程总数', value: filteredTutorials.length, icon: FileText, color: 'from-accent to-secondary' },
    { label: '系列课程', value: series.length, icon: FolderOpen, color: 'from-emerald-500 to-teal-500' },
    { label: '学习时长', value: '120+', icon: Clock, color: 'from-amber-500 to-orange-500' },
  ];
  
  return (
    <div className="h-full overflow-auto">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-secondary/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative px-8 py-12">
          <div className="max-w-4xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full mb-6">
              <Sparkles size={16} className="text-accent" />
              <span className="text-sm text-accent font-medium">交互式学习平台</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
              可执行
              <span className="text-gradient"> 教程</span>
            </h1>
            <p className="text-lg text-text-secondary max-w-2xl leading-relaxed">
              边学边做，让技术学习变得简单有趣。每个教程都包含可执行的命令，
              点击运行即可在终端中看到实时结果。
            </p>
            
            {/* Stats */}
            <div className="flex flex-wrap gap-4 mt-8">
              {stats.map((stat, index) => (
                <div 
                  key={stat.label}
                  className="flex items-center gap-3 px-5 py-3 bg-bg-card/50 backdrop-blur-sm border border-border-primary rounded-2xl"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-glow`}>
                    <stat.icon size={20} className="text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-text-primary">{stat.value}</div>
                    <div className="text-xs text-text-muted">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="px-8 pb-8 space-y-10">
        {/* Featured Series */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-secondary flex items-center justify-center shadow-glow">
                <TrendingUp size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-text-primary">推荐系列</h2>
                <p className="text-sm text-text-muted">精选学习路径</p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 text-sm text-accent hover:text-accent-hover transition-colors group">
              查看全部
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {series.map((s, index) => (
              <SeriesCard
                key={s.id}
                series={s}
                tutorials={filteredTutorials.filter((t) => t.series === s.id)}
                onClick={() => onSeriesClick(s.id)}
                index={index}
              />
            ))}
          </div>
        </section>
        
        {/* Recent Tutorials */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-glow">
                <FileText size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-text-primary">
                  {filteredTutorials.length > 0 ? '搜索结果' : '最近教程'}
                </h2>
                <p className="text-sm text-text-muted">
                  {filteredTutorials.length > 0 ? `找到 ${filteredTutorials.length} 个教程` : '最新发布的内容'}
                </p>
              </div>
            </div>
          </div>
          
          {recentTutorials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {recentTutorials.map((tutorial, index) => (
                <TutorialCard
                  key={tutorial.id}
                  tutorial={tutorial}
                  onClick={() => onTutorialClick(tutorial.id)}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-bg-card rounded-2xl border border-border-primary border-dashed">
              <FileText size={48} className="mx-auto mb-4 text-text-muted opacity-50" />
              <p className="text-text-muted">没有找到匹配的教程</p>
              <button 
                onClick={() => {}}
                className="mt-4 text-accent hover:underline text-sm"
              >
                清除搜索条件
              </button>
            </div>
          )}
        </section>
        
        {/* Quick Actions */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-secondary/5 rounded-2xl" />
          <div className="relative p-6 rounded-2xl border border-border-primary">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-glow">
                <Zap size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-text-primary">快速操作</h2>
                <p className="text-sm text-text-muted">扩展你的学习内容</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <button
                onClick={onAddDirectoryClick}
                className="group flex items-center gap-3 px-6 py-4 bg-bg-card border border-border-primary rounded-xl text-text-primary hover:border-accent/50 hover:shadow-glow transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <FolderOpen size={24} className="text-accent" />
                </div>
                <div className="text-left">
                  <span className="font-semibold block">添加本地目录</span>
                  <span className="text-sm text-text-muted">导入本地教程文件夹</span>
                </div>
              </button>
              
              <button
                onClick={onImportClick}
                className="group flex items-center gap-3 px-6 py-4 bg-bg-card border border-border-primary rounded-xl text-text-primary hover:border-secondary/50 hover:shadow-glow transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                  <Plus size={24} className="text-secondary" />
                </div>
                <div className="text-left">
                  <span className="font-semibold block">导入教程</span>
                  <span className="text-sm text-text-muted">从文件或URL导入</span>
                </div>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
