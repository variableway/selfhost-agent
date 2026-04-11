import { useState } from 'react';
import { Header } from './components/layout/Header';
import { Terminal } from './components/terminal/Terminal';
import { Home } from './components/Home';
import { SeriesDetail } from './components/SeriesDetail';
import { TutorialDetail } from './components/TutorialDetail';
import { CreateLessonPage } from './components/lesson/CreateLessonPage';
import { LessonPreviewPage } from './components/lesson/LessonPreviewPage';
import { LessonListPage } from './components/lesson/LessonListPage';
import { useAppStore } from './store/useAppStore';

type Tab = 'home' | 'tutorials' | 'series' | 'settings';
type View =
  | { type: 'home' }
  | { type: 'series'; seriesId: string }
  | { type: 'tutorial'; tutorialId: string }
  | { type: 'create-lesson' }
  | { type: 'lesson-list' }
  | { type: 'lesson-preview'; lessonId: string };

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [currentView, setCurrentView] = useState<View>({ type: 'home' });
  const { terminalPosition, terminalVisible, setPreviewSectionIndex } = useAppStore();

  const handleSeriesClick = (seriesId: string) => {
    setCurrentView({ type: 'series', seriesId });
  };

  const handleTutorialClick = (tutorialId: string) => {
    setCurrentView({ type: 'tutorial', tutorialId });
  };

  const handleBack = () => {
    setCurrentView({ type: 'home' });
  };

  const handleImportClick = () => {
    setCurrentView({ type: 'create-lesson' });
  };

  const handleAddDirectoryClick = () => {
    setCurrentView({ type: 'create-lesson' });
  };

  const handleLessonCreated = (lessonId: string) => {
    setPreviewSectionIndex(0);
    setCurrentView({ type: 'lesson-preview', lessonId });
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    if (tab === 'series') {
      setCurrentView({ type: 'lesson-list' });
    } else if (tab === 'home') {
      setCurrentView({ type: 'home' });
    }
  };

  const renderContent = () => {
    switch (currentView.type) {
      case 'home':
        return (
          <Home
            onSeriesClick={handleSeriesClick}
            onTutorialClick={handleTutorialClick}
            onImportClick={handleImportClick}
            onAddDirectoryClick={handleAddDirectoryClick}
          />
        );
      case 'series':
        return (
          <SeriesDetail
            seriesId={currentView.seriesId}
            onBack={handleBack}
            onTutorialClick={handleTutorialClick}
          />
        );
      case 'tutorial':
        return (
          <TutorialDetail
            tutorialId={currentView.tutorialId}
            onBack={handleBack}
          />
        );
      case 'create-lesson':
        return (
          <CreateLessonPage
            onBack={handleBack}
            onLessonCreated={handleLessonCreated}
          />
        );
      case 'lesson-list':
        return (
          <LessonListPage
            onBack={handleBack}
            onCreateNew={() => setCurrentView({ type: 'create-lesson' })}
            onLessonClick={(id) => {
              setPreviewSectionIndex(0);
              setCurrentView({ type: 'lesson-preview', lessonId: id });
            }}
          />
        );
      case 'lesson-preview':
        return (
          <LessonPreviewPage
            lessonId={currentView.lessonId}
            onBack={() => setCurrentView({ type: 'lesson-list' })}
          />
        );
      default:
        return <div className="p-8 text-text-muted">页面开发中...</div>;
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-bg-primary text-text-primary overflow-hidden">
      {/* Header */}
      <Header activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Content */}
        <main className="flex-1 overflow-hidden">
          {renderContent()}
        </main>

        {/* Terminal - Right Side */}
        {terminalVisible && terminalPosition === 'right' && (
          <Terminal />
        )}
      </div>

      {/* Terminal - Bottom */}
      {terminalVisible && terminalPosition === 'bottom' && (
        <Terminal />
      )}
    </div>
  );
}

export default App;
