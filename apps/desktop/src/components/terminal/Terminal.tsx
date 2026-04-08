import { useEffect, useRef, useState } from 'react';
import { X, Minimize2, PanelRight, PanelBottom, Trash2, TerminalIcon, Maximize2, Command } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export function Terminal() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const {
    terminalPosition,
    terminalVisible,
    terminalOutput,
    isExecuting,
    hideTerminal,
    toggleTerminalPosition,
    addTerminalOutput,
    clearTerminal,
    setIsExecuting,
  } = useAppStore();
  
  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalOutput]);
  
  // Focus input when terminal becomes visible
  useEffect(() => {
    if (terminalVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [terminalVisible]);
  
  if (!terminalVisible) return null;
  
  const handleExecute = () => {
    if (!input.trim()) return;
    
    const command = input.trim();
    addTerminalOutput(`$ ${command}`);
    setCommandHistory(prev => [...prev, command]);
    setHistoryIndex(-1);
    
    // Mock execution
    setIsExecuting(true);
    setTimeout(() => {
      addTerminalOutput('');
      addTerminalOutput('  \x1b[36mℹ\x1b[0m  正在执行命令...');
      addTerminalOutput('');
      
      setTimeout(() => {
        addTerminalOutput('  \x1b[32m✓\x1b[0m  命令执行成功！');
        addTerminalOutput('');
        setIsExecuting(false);
      }, 800);
    }, 300);
    
    setInput('');
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleExecute();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setInput('');
        } else {
          setHistoryIndex(newIndex);
          setInput(commandHistory[newIndex]);
        }
      }
    }
  };
  
  const renderOutput = (line: string, index: number) => {
    // Parse ANSI colors
    const parts = line.split(/(\x1b\[\d+m)/g);
    const elements: React.ReactNode[] = [];
    let currentColor = '';
    
    parts.forEach((part, i) => {
      if (part.startsWith('\x1b[')) {
        const code = part.slice(2, -1);
        switch (code) {
          case '32m': currentColor = 'text-emerald-400'; break;
          case '31m': currentColor = 'text-rose-400'; break;
          case '33m': currentColor = 'text-amber-400'; break;
          case '36m': currentColor = 'text-cyan-400'; break;
          case '35m': currentColor = 'text-fuchsia-400'; break;
          case '0m': currentColor = ''; break;
          default: currentColor = '';
        }
      } else if (part) {
        elements.push(
          <span key={i} className={currentColor}>
            {part}
          </span>
        );
      }
    });
    
    if (line.startsWith('$')) {
      return (
        <div key={index} className="flex items-center gap-2 py-0.5">
          <span className="text-accent font-bold">➜</span>
          <span className="text-cyan-400">~</span>
          <span className="text-text-primary">{line.slice(2)}</span>
        </div>
      );
    }
    
    return <div key={index} className="py-0.5">{elements.length > 0 ? elements : line}</div>;
  };
  
  return (
    <div 
      className={`
        bg-bg-primary flex flex-col border-border-primary animate-slide-up
        ${terminalPosition === 'right' 
          ? 'w-[450px] border-l' 
          : 'h-[350px] border-t'
        }
      `}
    >
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-bg-secondary/50 border-b border-border-primary">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-secondary flex items-center justify-center shadow-glow">
            <TerminalIcon size={16} className="text-white" />
          </div>
          <div>
            <span className="text-sm font-semibold text-text-primary">终端</span>
            {isExecuting && (
              <span className="flex items-center gap-1.5 text-xs text-accent ml-2">
                <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                执行中
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {/* Clear */}
          <button
            onClick={clearTerminal}
            className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition-all"
            title="清除输出"
          >
            <Trash2 size={16} />
          </button>
          
          {/* Position Toggle */}
          <button
            onClick={toggleTerminalPosition}
            className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition-all"
            title={terminalPosition === 'right' ? '切换到底部' : '切换到右侧'}
          >
            {terminalPosition === 'right' ? <PanelBottom size={16} /> : <PanelRight size={16} />}
          </button>
          
          {/* Minimize */}
          <button
            onClick={hideTerminal}
            className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition-all"
            title="最小化"
          >
            <Minimize2 size={16} />
          </button>
        </div>
      </div>
      
      {/* Terminal Output */}
      <div 
        ref={terminalRef}
        className="flex-1 overflow-auto p-4 font-mono text-sm space-y-1 terminal-text bg-bg-primary"
      >
        {terminalOutput.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-text-muted">
            <Command size={48} className="mb-4 opacity-20" />
            <p className="text-sm">点击教程中的"运行"按钮开始执行命令</p>
            <p className="text-xs mt-2 opacity-60">或直接在此输入命令</p>
          </div>
        ) : (
          terminalOutput.map((line, index) => renderOutput(line, index))
        )}
      </div>
      
      {/* Terminal Input */}
      <div className="flex items-center gap-3 px-4 py-3 border-t border-border-primary bg-bg-secondary/30">
        <div className="flex items-center gap-2 text-accent shrink-0">
          <span className="font-bold">➜</span>
          <span className="text-cyan-400">~</span>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入命令..."
          disabled={isExecuting}
          className="flex-1 bg-transparent text-text-primary font-mono text-sm placeholder:text-text-muted focus:outline-none disabled:opacity-50"
        />
        {isExecuting && (
          <div className="flex items-center gap-1 text-accent text-xs">
            <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
            执行中
          </div>
        )}
      </div>
    </div>
  );
}
