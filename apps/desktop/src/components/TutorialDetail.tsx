import { useState } from 'react';
import { ArrowLeft, Play, CheckCircle, Clock, BookOpen, Terminal, Copy, Check, Sparkles, RotateCcw } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

interface TutorialDetailProps {
  tutorialId: string;
  onBack: () => void;
}

export function TutorialDetail({ tutorialId, onBack }: TutorialDetailProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const { 
    tutorials, 
    showTerminal, 
    addTerminalOutput, 
    setIsExecuting,
    updateProgress,
    progress,
  } = useAppStore();
  
  const tutorial = tutorials.find((t) => t.id === tutorialId);
  const tutorialProgress = progress[tutorialId];
  
  if (!tutorial) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-text-muted text-lg">教程不存在</div>
      </div>
    );
  }
  
  const handleRun = (code: string, id: string) => {
    showTerminal();
    setIsExecuting(true);
    
    addTerminalOutput(`$ ${code}`);
    
    // Mock execution
    setTimeout(() => {
      addTerminalOutput('');
      addTerminalOutput('\x1b[36mℹ\x1b[0m 正在执行命令...');
      addTerminalOutput('');
      
      setTimeout(() => {
        addTerminalOutput('\x1b[32m✓\x1b[0m 命令执行成功！');
        addTerminalOutput('');
        setIsExecuting(false);
      }, 800);
    }, 300);
  };
  
  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };
  
  const handleMarkComplete = () => {
    updateProgress({
      tutorialId,
      completed: true,
      completedSections: [],
      completedAt: new Date().toISOString(),
    });
  };
  
  const handleReset = () => {
    updateProgress({
      tutorialId,
      completed: false,
      completedSections: [],
    });
  };
  
  const difficultyConfig = {
    beginner: { text: '入门', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
    intermediate: { text: '进阶', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
    advanced: { text: '高级', color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/20' },
  };
  
  const difficulty = difficultyConfig[tutorial.difficulty];
  
  // Mock content sections
  const sections = [
    {
      type: 'text',
      content: `## 什么是 ${tutorial.title}？\n\n这是一个关于 ${tutorial.title} 的教程。在这里，你将学习如何使用相关工具，并通过实际操作来掌握核心概念。本教程适合${difficulty.text}水平的用户。`
    },
    {
      type: 'text',
      content: '## 前置条件\n\n在开始之前，请确保你已经：\n- 安装了终端工具\n- 具备基本的命令行知识\n- 有稳定的网络连接'
    },
    {
      type: 'executable',
      id: 'step-1',
      title: '安装',
      description: '执行以下命令进行安装：',
      code: 'brew install node',
      language: 'bash'
    },
    {
      type: 'text',
      content: '安装完成后，你可以通过运行 `node -v` 来验证安装是否成功。如果看到版本号输出，说明安装成功。'
    },
    {
      type: 'executable',
      id: 'step-2',
      title: '验证安装',
      description: '验证 Node.js 和 npm 是否正确安装：',
      code: 'node -v && npm -v',
      language: 'bash'
    },
    {
      type: 'text',
      content: '## 总结\n\n恭喜！你已经完成了本教程的学习。现在你可以开始使用这个工具了。建议继续学习系列中的其他教程，以获得更全面的知识。'
    }
  ];
  
  return (
    <div className="h-full overflow-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 glass-strong border-b border-border-primary px-8 py-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-4 group"
        >
          <div className="w-8 h-8 rounded-lg bg-bg-card border border-border-primary flex items-center justify-center group-hover:border-border-hover transition-colors">
            <ArrowLeft size={16} />
          </div>
          <span>返回</span>
        </button>
        
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${difficulty.bg} ${difficulty.color} border ${difficulty.border}`}>
                {difficulty.text}
              </span>
              <span className="flex items-center gap-1 text-sm text-text-muted">
                <Clock size={14} />
                {tutorial.duration} 分钟
              </span>
              {tutorialProgress?.completed && (
                <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-success/10 text-success border border-success/20">
                  <CheckCircle size={12} />
                  已完成
                </span>
              )}
            </div>
            
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              {tutorial.title}
            </h1>
            <p className="text-text-secondary text-lg">
              {tutorial.description}
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            {tutorialProgress?.completed ? (
              <>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2.5 bg-bg-card border border-border-primary text-text-secondary rounded-xl hover:border-border-hover transition-all"
                >
                  <RotateCcw size={18} />
                  <span>重置进度</span>
                </button>
                <div className="flex items-center gap-2 px-4 py-2.5 bg-success/10 border border-success/30 text-success rounded-xl">
                  <CheckCircle size={18} />
                  <span className="font-medium">已完成</span>
                </div>
              </>
            ) : (
              <button
                onClick={handleMarkComplete}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-accent to-secondary text-white font-medium rounded-xl hover:shadow-glow transition-all"
              >
                <CheckCircle size={18} />
                <span>标记完成</span>
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="px-8 py-8 max-w-4xl">
        <div className="space-y-8">
          {sections.map((section, index) => (
            <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
              {section.type === 'text' ? (
                <div className="prose prose-invert prose-lg max-w-none">
                  <div 
                    className="text-text-secondary leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: section.content
                        .replace(/## (.*)/, '<h2 class="text-2xl font-bold text-text-primary mb-4 mt-8">$1</h2>')
                        .replace(/- (.*)/g, '<li class="ml-4 mb-2">$1</li>')
                        .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-bg-card rounded text-accent text-sm">$1</code>')
                    }}
                  />
                </div>
              ) : section.type === 'executable' ? (
                <div className="bg-bg-card rounded-2xl border border-border-primary overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-5 py-4 bg-bg-secondary/50 border-b border-border-primary">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                        <Terminal size={20} className="text-accent" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-text-primary">{section.title}</h3>
                        <p className="text-sm text-text-muted">{section.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(section.code, section.id)}
                        className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition-all"
                        title="复制"
                      >
                        {copiedId === section.id ? <Check size={18} className="text-success" /> : <Copy size={18} />}
                      </button>
                      <button
                        onClick={() => handleRun(section.code, section.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent to-secondary text-white font-medium rounded-xl hover:shadow-glow transition-all"
                      >
                        <Play size={16} className="fill-current" />
                        运行
                      </button>
                    </div>
                  </div>
                  
                  {/* Code */}
                  <div className="p-5 bg-bg-primary">
                    <pre className="font-mono text-sm text-text-primary overflow-x-auto">
                      <code>{section.code}</code>
                    </pre>
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
        
        {/* Footer CTA */}
        <div className="mt-12 p-6 bg-gradient-to-r from-accent/10 to-secondary/10 border border-accent/20 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-secondary flex items-center justify-center shadow-glow">
              <Sparkles size={28} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-text-primary mb-1">
                {tutorialProgress?.completed ? '想要学习更多？' : '完成本教程！'}
              </h3>
              <p className="text-text-secondary">
                {tutorialProgress?.completed 
                  ? '继续探索系列中的其他教程，提升你的技能。' 
                  : '完成上面的步骤，然后点击"标记完成"按钮。'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
