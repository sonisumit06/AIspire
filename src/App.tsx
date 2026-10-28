import React, { useEffect, useRef } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { LoginView } from './components/LoginView';
import { ProfileOnboardingView } from './components/ProfileOnboardingView';
import { DashboardView } from './components/DashboardView';
import { AptitudeTestView } from './components/AptitudeTestView';
import { ResultsView } from './components/ResultsView';
import { RoadmapView } from './components/RoadmapView';
import { ResourcesView } from './components/ResourcesView';
import { SettingsView } from './components/SettingsView';
import { AIMentorView } from './components/AIMentorView';
import { InteractiveParticles } from './components/InteractiveParticles';
import { Sparkles } from 'lucide-react';
import { animatePageTransition } from './utils/motion';
import './App.css';

const MainContent: React.FC = () => {
  const { currentView, setCurrentView, userProfile, authLoading } = useApp();
  const viewContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewContainerRef.current) {
      animatePageTransition(viewContainerRef.current);
    }
  }, [currentView]);

  if (authLoading && !userProfile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#2B2118] text-[#FAF7F2] p-4 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#FAF7F2] p-2 shadow-2xl flex items-center justify-center animate-pulse border border-[#6B523E]">
            <img src="/logo.png" alt="AIspire" className="w-full h-full object-contain" />
          </div>
          <div className="w-6 h-6 rounded-full border-2 border-[#6B4F3A] border-t-[#C9B79C] animate-spin" />
          <div className="flex items-center gap-2 text-xs text-[#C9B79C] font-medium">
            <span>Connecting to AIspire...</span>
          </div>
        </div>
      </div>
    );
  }

  const renderView = () => {
    if (!userProfile) {
      return <LoginView />;
    }

    switch (currentView) {
      case 'login':
        return <LoginView />;
      case 'onboarding':
        return <ProfileOnboardingView />;
      case 'dashboard':
        return <DashboardView />;
      case 'test':
        return <AptitudeTestView />;
      case 'results':
        return <ResultsView />;
      case 'roadmap':
        return <RoadmapView />;
      case 'resources':
        return <ResourcesView />;
      case 'settings':
        return <SettingsView />;
      case 'mentor':
        return <AIMentorView />;
      default:
        return <DashboardView />;
    }
  };

  const isFullPageMentor = currentView === 'mentor';

  return (
    <div className="min-h-screen flex flex-col bg-[#2B2118] text-[#FAF7F2] selection:bg-[#6B4F3A] selection:text-[#FAF7F2] relative w-full max-w-full overflow-x-hidden">
      <InteractiveParticles />
      <Navbar />

      <main className={`flex-1 w-full max-w-full min-w-0 relative z-10 ${isFullPageMentor ? 'overflow-hidden' : 'overflow-x-hidden pb-20 lg:pb-16'}`}>
        <div ref={viewContainerRef} className="h-full w-full max-w-full min-w-0">
          {renderView()}
        </div>
      </main>

      {/* Floating AI Mentor Quick Launcher (Shown on desktop when not on mentor view) */}
      {userProfile && currentView !== 'onboarding' && !isFullPageMentor && (
        <button
          onClick={() => setCurrentView('mentor')}
          className="hidden lg:flex fixed bottom-6 right-6 z-30 items-center gap-2 px-4 py-2.5 bg-[#6B4F3A] hover:bg-[#7E5D45] text-[#FAF7F2] rounded-full shadow-2xl font-bold text-xs transition cursor-pointer border border-[#C9B79C]/50 uiverse-btn uiverse-pulse-glow"
          title="Open Full-Screen AI Career Mentor"
        >
          <Sparkles className="w-4 h-4 text-[#C9B79C] animate-pulse" />
          <span>AI Mentor</span>
        </button>
      )}

      {/* Standard Footer (Hidden on full-page AI Mentor) */}
      {!isFullPageMentor && (
        <footer className="border-t border-[#6B523E] bg-[#231A12] py-8 px-4 text-center text-xs text-[#FAF7F2] space-y-2 mb-16 lg:mb-0">
          <div className="flex items-center justify-center gap-2 text-[#FAF7F2] font-semibold">
            <img src="/logo.png" alt="AIspire" className="w-5 h-5 rounded bg-[#FAF7F2] p-0.5 object-contain shadow-xs border border-[#6B523E]" />
            <span>AIspire • Student Career Guidance Platform</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-[#E2D5C3]">
            <span>Deterministic 7D Cognitive Matching • 10-Step Sequential Roadmaps • Curated Study &amp; Examination Portals</span>
            <span className="hidden sm:inline">•</span>
            <a
              href={import.meta.env.VITE_FEEDBACK_FORM_URL || "https://forms.gle/YOUR_GOOGLE_FORM_ID"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#C9B79C] hover:text-[#FAF7F2] underline underline-offset-4 transition"
            >
              Give Beta Feedback
            </a>
          </div>
        </footer>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
