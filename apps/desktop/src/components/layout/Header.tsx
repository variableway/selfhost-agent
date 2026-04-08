import { useState } from 'react';
import { Home, BookOpen, FolderOpen, Settings, Search, Sparkles, Menu, X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

type Tab = 'home' | 'tutorials' | 'series' | 'settings';

interface HeaderProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
  const { searchQuery, setSearchQuery } = useAppStore();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const tabs: { id: Tab; label: string; icon: React.ReactNode; description: string }[] = [
    { id: 'home', label: '首页', icon: <Home size={18} />, description: '浏览推荐内容' },
    { id: 'tutorials', label: '教程', icon: <BookOpen size={18} />, description: '所有教程' },
    { id: 'series', label: '系列', icon: <FolderOpen size={18} />, description: '课程系列' },
    { id: 'settings', label: '设置', icon: <Settings size={18} />, description: '应用设置' },
  ];
  
  return (
    <header className="h-16 glass-strong border-b border-border-primary flex items-center px-6 gap-6 shrink-0 relative z-50">
      {/* Logo */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-secondary flex items-center justify-center shadow-glow">
          <Sparkles className="text-white" size={20} />
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-accent to-secondary animate-pulse-glow opacity-50" />
        </div>
        <div className="hidden md:block">
          <span className="font-bold text-lg text-gradient">Executable</span>
          <span className="block text-xs text-text-muted -mt-1">Tutorial</span>
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <nav className="hidden md:flex items-center gap-1 ml-4 bg-bg-primary/50 rounded-xl p-1 border border-border-primary">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${activeTab === tab.id 
                ? 'text-white' 
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
              }
            `}
          >
            {activeTab === tab.id && (
              <span className="absolute inset-0 bg-gradient-to-r from-accent to-secondary rounded-lg opacity-90" />
            )}
            <span className="relative flex items-center gap-2">
              {tab.icon}
              {tab.label}
            </span>
          </button>
        ))}
      </nav>
      
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden p-2 text-text-secondary hover:text-text-primary"
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      
      {/* Search Bar */}
      <div className="flex-1 max-w-md ml-auto">
        <div className={`
          relative group
          transition-all duration-300
          ${isSearchFocused ? 'scale-105' : ''}
        `}>
          <Search className={`
            absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200
            ${isSearchFocused ? 'text-accent' : 'text-text-muted'}
          `} size={18} />
          <input
            type="text"
            placeholder="搜索教程、系列..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className={`
              w-full pl-12 pr-4 py-2.5 bg-bg-primary border rounded-xl text-sm 
              text-text-primary placeholder:text-text-muted 
              focus:outline-none transition-all duration-200
              ${isSearchFocused 
                ? 'border-accent shadow-glow' 
                : 'border-border-primary hover:border-border-hover'
              }
            `}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 md:hidden glass-strong border-b border-border-primary animate-slide-up">
          <nav className="flex flex-col p-4 gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  onTabChange(tab.id);
                  setMobileMenuOpen(false);
                }}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all
                  ${activeTab === tab.id 
                    ? 'bg-gradient-to-r from-accent to-secondary text-white' 
                    : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                  }
                `}
              >
                {tab.icon}
                <div>
                  <span className="font-medium block">{tab.label}</span>
                  <span className="text-xs opacity-70">{tab.description}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
