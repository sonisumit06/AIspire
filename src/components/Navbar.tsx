import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard,
  ClipboardCheck,
  Award,
  Map,
  BookOpen,
  Sparkles,
  Settings,
  LogOut,
  User,
  ChevronDown,
  Menu,
  X,
  Compass,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { AppView } from '../context/AppContext';

export const Navbar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    userProfile,
    logout,
    syncStatus,
  } = useApp();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile drawer when navigating
  const handleNavClick = (viewId: AppView) => {
    setCurrentView(viewId);
    setIsMobileMenuOpen(false);
  };

  const navItems: { id: AppView; label: string; icon: React.ReactNode }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'test',
      label: 'Aptitude Test',
      icon: <ClipboardCheck className="w-4 h-4" />,
    },
    {
      id: 'results',
      label: 'Career Matches',
      icon: <Award className="w-4 h-4" />,
    },
    {
      id: 'roadmap',
      label: '10-Step Roadmap',
      icon: <Map className="w-4 h-4" />,
    },
    {
      id: 'resources',
      label: 'Study & Exam Hub',
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      id: 'mentor',
      label: 'AI Mentor',
      icon: <Sparkles className="w-4 h-4 text-[#C9B79C]" />,
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full h-16 max-h-16 border-b border-[#6B523E] bg-[#2B2118]/95 backdrop-blur-md flex-shrink-0 select-none">
      <div className="w-full max-w-7xl min-w-0 mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* ================================================================= */}
        {/* BRAND LOGO                                                        */}
        {/* ================================================================= */}
        <button
          onClick={() => currentView !== 'onboarding' && handleNavClick('dashboard')}
          className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none flex-shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] p-1 flex items-center justify-center shadow-md overflow-hidden border border-[#6B523E] group-hover:border-[#C9B79C] transition">
            <img
              src="/logo.png"
              alt="AIspire Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-[#FAF7F2]">
                AIspire
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#362A1F] text-[#C9B79C] border border-[#6B523E]">
                Career
              </span>
            </div>
          </div>
        </button>

        {/* ================================================================= */}
        {/* DESKTOP CENTER NAVIGATION SEGMENTED BAR (Stable, no width jumps)  */}
        {/* ================================================================= */}
        {userProfile && currentView !== 'onboarding' && (
          <nav className="hidden lg:flex items-center gap-1 bg-[#362A1F]/90 p-1.5 rounded-2xl border border-[#6B523E] shadow-sm flex-shrink-0">
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-[#6B4F3A] text-[#FAF7F2] border border-[#C9B79C]/40 shadow-sm'
                      : 'text-[#E2D5C3] hover:text-[#FAF7F2] hover:bg-[#453527]/70 border border-transparent'
                  }`}
                >
                  {item.icon}
                  <span className="whitespace-nowrap">{item.label}</span>
                </button>
              );
            })}
          </nav>
        )}

        {/* ================================================================= */}
        {/* RIGHT CONTROLS: Sync status, User Menu & Mobile Hamburger         */}
        {/* ================================================================= */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Subtle Cloud Sync Status Indicator */}
          {userProfile && (
            <div
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#362A1F] border border-[#6B523E] text-[11px] font-medium"
              title={
                syncStatus === 'synced'
                  ? 'Changes saved to Supabase cloud'
                  : syncStatus === 'saving'
                  ? 'Saving changes...'
                  : syncStatus === 'offline'
                  ? 'Operating offline in local cache'
                  : 'Sync notice'
              }
            >
              <div
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  syncStatus === 'synced'
                    ? 'bg-[#708E66]'
                    : syncStatus === 'saving'
                    ? 'bg-[#D99D55] animate-pulse'
                    : syncStatus === 'offline'
                    ? 'bg-[#C9B79C]'
                    : 'bg-[#C0584D]'
                }`}
              />
              <span className="text-[#E2D5C3] w-12 text-left truncate font-medium">
                {syncStatus === 'synced' && 'Synced'}
                {syncStatus === 'saving' && 'Saving...'}
                {syncStatus === 'offline' && 'Offline'}
                {syncStatus === 'error' && 'Notice'}
              </span>
            </div>
          )}

          {/* User Account / Profile Dropdown */}
          {userProfile ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 pl-2 rounded-xl hover:bg-[#362A1F] border border-transparent hover:border-[#6B523E] transition cursor-pointer focus:outline-none"
              >
                {userProfile.avatarUrl ? (
                  <img
                    src={userProfile.avatarUrl}
                    alt={userProfile.name}
                    className="w-8 h-8 rounded-full border border-[#6B523E] object-cover ring-1 ring-[#C9B79C]/50"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#362A1F] border border-[#6B523E] flex items-center justify-center text-[#C9B79C] text-xs font-bold ring-1 ring-[#C9B79C]/30">
                    {userProfile.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold text-[#FAF7F2] truncate max-w-[100px]">
                    {userProfile.name.split(' ')[0]}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#E2D5C3] hidden sm:block" />
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[#362A1F] border border-[#6B523E] rounded-2xl shadow-2xl py-2 z-50 text-xs animate-fadeIn">
                  <div className="px-3.5 py-2 border-b border-[#6B523E]">
                    <p className="font-bold text-[#FAF7F2] truncate">{userProfile.name}</p>
                    <p className="text-[11px] text-[#E2D5C3] truncate">{userProfile.email}</p>
                    {userProfile.educationLevel && (
                      <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-md bg-[#2B2118] text-[#E2D5C3] font-medium border border-[#6B523E] truncate max-w-full">
                        {userProfile.educationLevel}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      handleNavClick('settings');
                      setIsUserMenuOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 flex items-center gap-2.5 transition cursor-pointer ${
                      currentView === 'settings'
                        ? 'bg-[#6B4F3A] text-[#FAF7F2] font-semibold'
                        : 'text-[#E2D5C3] hover:bg-[#453527] hover:text-[#FAF7F2]'
                    }`}
                  >
                    <Settings className="w-4 h-4 text-[#C9B79C]" />
                    <span>Settings &amp; Profile</span>
                  </button>

                  <div className="my-1 border-t border-[#6B523E]" />

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-3.5 py-2.5 flex items-center gap-2.5 text-[#C0584D] hover:bg-[#C0584D]/10 transition cursor-pointer font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => handleNavClick('login')}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#6B4F3A] hover:bg-[#7E5D45] text-[#FAF7F2] rounded-xl text-xs font-semibold transition cursor-pointer shadow-md border border-[#826249]"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* Mobile Hamburger Toggle Button (lg:hidden) */}
          {userProfile && currentView !== 'onboarding' && (
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-[#362A1F] hover:bg-[#453527] text-[#FAF7F2] border border-[#6B523E] transition cursor-pointer"
              title={isMobileMenuOpen ? 'Close Menu' : 'Open Menu'}
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* MOBILE EXPANDABLE DRAWER (Full Clean Route List)                      */}
      {/* ===================================================================== */}
      {isMobileMenuOpen && userProfile && currentView !== 'onboarding' && (
        <div className="lg:hidden border-t border-[#6B523E] bg-[#2B2118]/98 px-4 py-4 space-y-2 shadow-2xl animate-fadeIn">
          {/* Student Profile Quick Summary */}
          <div className="p-3 rounded-xl bg-[#362A1F] border border-[#6B523E] mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5 truncate">
              {userProfile.avatarUrl ? (
                <img
                  src={userProfile.avatarUrl}
                  alt={userProfile.name}
                  className="w-8 h-8 rounded-full border border-[#6B523E] object-cover ring-1 ring-[#C9B79C]"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#2B2118] border border-[#6B523E] flex items-center justify-center text-[#C9B79C] text-xs font-bold">
                  {userProfile.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="truncate">
                <p className="text-xs font-bold text-[#FAF7F2] truncate">{userProfile.name}</p>
                <p className="text-[10px] text-[#E2D5C3] truncate">{userProfile.email}</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#708E66]/20 text-[#708E66] border border-[#708E66]/30">
              Active
            </span>
          </div>

          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                    isActive
                      ? 'bg-[#6B4F3A] text-[#FAF7F2] font-semibold border border-[#C9B79C]/40'
                      : 'text-[#E2D5C3] hover:bg-[#362A1F] hover:text-[#FAF7F2]'
                  }`}
                >
                  {item.icon}
                  <span className="text-xs">{item.label}</span>
                </button>
              );
            })}

            <button
              onClick={() => handleNavClick('settings')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                currentView === 'settings'
                  ? 'bg-[#6B4F3A] text-[#FAF7F2] font-semibold border border-[#C9B79C]/40'
                  : 'text-[#E2D5C3] hover:bg-[#362A1F] hover:text-[#FAF7F2]'
              }`}
            >
              <Settings className="w-4 h-4 text-[#C9B79C]" />
              <span>Settings &amp; Preferences</span>
            </button>
          </div>

          <div className="pt-2 border-t border-[#6B523E]">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                logout();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-[#C0584D] hover:bg-[#C0584D]/10 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MOBILE BOTTOM 5-ICON DOCK (Zero text crowding, instant touch targets) */}
      {/* ===================================================================== */}
      {userProfile && currentView !== 'onboarding' && (
        <div className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[#6B523E] bg-[#2B2118]/98 backdrop-blur-md px-3 py-2 items-center justify-around shadow-2xl ${currentView === 'mentor' ? 'hidden' : 'flex'}`}>
          <button
            onClick={() => handleNavClick('dashboard')}
            className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition ${
              currentView === 'dashboard' ? 'text-[#FAF7F2] font-bold' : 'text-[#E2D5C3] hover:text-[#FAF7F2]'
            }`}
            title="Dashboard"
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px]">Home</span>
          </button>

          <button
            onClick={() => handleNavClick('test')}
            className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition ${
              currentView === 'test' ? 'text-[#FAF7F2] font-bold' : 'text-[#E2D5C3] hover:text-[#FAF7F2]'
            }`}
            title="Aptitude Test"
          >
            <ClipboardCheck className="w-5 h-5" />
            <span className="text-[10px]">Test</span>
          </button>

          <button
            onClick={() => handleNavClick('roadmap')}
            className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition ${
              currentView === 'roadmap' ? 'text-[#FAF7F2] font-bold' : 'text-[#E2D5C3] hover:text-[#FAF7F2]'
            }`}
            title="10-Step Roadmap"
          >
            <Map className="w-5 h-5" />
            <span className="text-[10px]">Roadmap</span>
          </button>

          <button
            onClick={() => handleNavClick('mentor')}
            className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition ${
              currentView === 'mentor' ? 'text-[#FAF7F2] font-bold' : 'text-[#E2D5C3] hover:text-[#FAF7F2]'
            }`}
            title="AI Mentor"
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-[10px]">Mentor</span>
          </button>

          <button
            onClick={() => handleNavClick('settings')}
            className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition ${
              isMobileMenuOpen || currentView === 'settings' ? 'text-[#FAF7F2] font-bold' : 'text-[#E2D5C3] hover:text-[#FAF7F2]'
            }`}
            title="Settings & More"
          >
            <Compass className="w-5 h-5" />
            <span className="text-[10px]">More</span>
          </button>
        </div>
      )}
    </header>
  );
};
