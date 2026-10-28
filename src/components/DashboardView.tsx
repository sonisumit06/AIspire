import React, { useEffect, useRef, useState } from 'react';
import {
  ClipboardCheck,
  Award,
  Map,
  ArrowRight,
  Clock,
  Target,
  MessageSquare,
  Bookmark,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { animateCounter } from '../utils/animations';
import { animateHeroSequence } from '../utils/motion';
import { useCardTilt, useButtonMotion } from '../hooks/useMotion';
import { InteractiveRadarSignature } from './InteractiveRadarSignature';
import type { DimensionKey } from '../types';

export const DashboardView: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroHeaderRef = useRef<HTMLDivElement>(null);
  const matchScoreRef = useRef<HTMLDivElement>(null);
  const milestoneCardRef = useCardTilt<HTMLDivElement>({ maxTilt: 4, spotlight: true });
  const [highlightedDimension, setHighlightedDimension] = useState<DimensionKey | null>(null);
  const { handlePress } = useButtonMotion();

  const {
    userProfile,
    setCurrentView,
    dimensionScores,
    rankedCareers,
    selectedCareer,
    selectCareer,
    completedSteps,
    bookmarks,
    answers,
    currentQuestionIndex,
    setIsAiChatOpen,
    sendChatMessage,
  } = useApp();

  const answeredCount = Object.keys(answers).length;
  const isTestCompleted = !!dimensionScores && answeredCount >= 20;
  const topCareer = rankedCareers[0] || selectedCareer;

  // Active career & roadmap progress
  const activeCareer = selectedCareer || topCareer;
  const activeCompletedSteps = activeCareer
    ? completedSteps[activeCareer.id] || []
    : [];
  const roadmapProgressPercent = Math.round(
    (activeCompletedSteps.length / 10) * 100
  );

  // Next actionable step on active roadmap
  const nextStepNumber = activeCompletedSteps.length < 10
    ? ([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].find(s => !activeCompletedSteps.includes(s)) || 1)
    : 10;
  const nextStep = activeCareer?.roadmap?.find(s => s.stepNumber === nextStepNumber) || activeCareer?.roadmap?.[0];

  const firstName = userProfile?.name?.split(' ')[0] || 'Student';

  // Hero entrance sequence with character split-text
  useEffect(() => {
    if (heroHeaderRef.current) {
      const { revert } = animateHeroSequence(heroHeaderRef.current, {
        headingSelector: 'h1',
        badgeSelector: '.hero-badge',
        subtitleSelector: 'p',
        cardsSelector: '.dashboard-indicator-card',
      });
      return () => revert();
    }
  }, []);

  useEffect(() => {
    if (dimensionScores && topCareer?.matchScore !== undefined && matchScoreRef.current) {
      animateCounter(matchScoreRef.current, topCareer.matchScore, { suffix: '% Match' });
    }
  }, [dimensionScores, topCareer?.matchScore]);

  return (
    <div ref={containerRef} className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-w-0">
      {/* Welcome Header with Split-Text Choreography */}
      <div
        ref={heroHeaderRef}
        className="dashboard-section flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#6B523E] pb-6"
      >
        <div>
          <div className="flex items-center gap-2 mb-1.5 hero-badge">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#4A3728] text-[#FAF7F2] border border-[#C9B79C]/50 flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#FAF7F2]" />
              <span>Personalized Command Center</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#FAF7F2] tracking-tight">
            Welcome back, {firstName}
          </h1>
          <p className="text-sm text-[#E2D5C3] font-medium mt-1">
            Continue where you left off in your academic &amp; career discovery.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-[#FAF7F2] bg-[#231A12] px-3.5 py-1.5 rounded-xl border border-[#6B523E] shadow-sm">
            {userProfile?.educationLevel || 'Student'}
          </span>
          {userProfile?.targetGoals && (
            <span className="text-xs font-semibold text-[#FAF7F2] bg-[#4A3728] px-3.5 py-1.5 rounded-xl border border-[#C9B79C]/40 max-w-xs truncate hidden sm:inline-block shadow-sm">
              Goal: {userProfile.targetGoals}
            </span>
          )}
        </div>
      </div>

      {/* Continue Learning Hero Card (Next Actionable Milestone) with 3D Tilt */}
      <div
        ref={milestoneCardRef}
        className="dashboard-section bg-[#231A12] border border-[#6B523E] rounded-2xl p-6 sm:p-7 shadow-2xl uiverse-card relative overflow-hidden transition-all duration-300"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div
          className="absolute -top-16 -right-16 w-56 h-56 bg-[#6B4F3A]/20 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        {isTestCompleted && nextStep ? (
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-[#4A3728] text-[#FAF7F2] border border-[#C9B79C]/40 shadow-xs">
                  Active Milestone
                </span>
                <span className="text-xs font-bold text-[#FAF7F2]">
                  {activeCareer.title}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#FAF7F2]">
                Continue your {activeCareer.title} roadmap
              </h2>
              <p className="text-xs sm:text-sm text-[#E2D5C3] leading-relaxed">
                <span className="font-bold text-[#FAF7F2]">
                  Step {nextStep.stepNumber} · {nextStep.title}
                </span>{' '}
                — {nextStep.description}
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-[#E2D5C3]">
                <span className="flex items-center gap-1.5 font-medium">
                  <Clock className="w-4 h-4 text-[#FAF7F2]" />
                  <span>{nextStep.timeline}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Target className="w-4 h-4 text-[#FAF7F2]" />
                  <span>Deliverable: <strong className="text-[#FAF7F2]">{nextStep.milestoneGoal}</strong></span>
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end gap-3 flex-shrink-0">
              <button
                onClick={(e) => {
                  handlePress(e);
                  setCurrentView('roadmap');
                }}
                className="px-6 py-3 bg-[#6B4F3A] hover:bg-[#7E5D45] text-[#FAF7F2] rounded-xl text-xs sm:text-sm font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer border border-[#C9B79C]/50 uiverse-btn"
              >
                <span>Continue Roadmap</span>
                <ArrowRight className="w-4 h-4 text-[#FAF7F2]" />
              </button>
              <button
                onClick={(e) => {
                  handlePress(e);
                  setIsAiChatOpen(true);
                  sendChatMessage(`How do I successfully complete Step ${nextStep.stepNumber} (${nextStep.title}) for my ${activeCareer.title} roadmap?`);
                }}
                className="px-4 py-2 bg-[#2B2118] hover:bg-[#382B20] text-[#FAF7F2] border border-[#6B523E] rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer uiverse-btn"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#FAF7F2]" />
                <span>Ask AI Mentor about Step {nextStep.stepNumber}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-[#4A3728] text-[#FAF7F2] border border-[#C9B79C]/40">
                Recommended Action
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#FAF7F2]">
                Discover your cognitive strengths
              </h2>
              <p className="text-xs sm:text-sm text-[#E2D5C3] leading-relaxed">
                Complete the 20-question scenario assessment to unlock your normalized 7-dimensional cognitive profile, deterministic career rankings, and customized 10-step roadmaps.
              </p>
            </div>

            <button
              onClick={(e) => {
                handlePress(e);
                setCurrentView('test');
              }}
              className="px-6 py-3 bg-[#6B4F3A] hover:bg-[#7E5D45] text-[#FAF7F2] rounded-xl text-xs sm:text-sm font-bold shadow-md transition flex items-center justify-center gap-2 flex-shrink-0 cursor-pointer border border-[#C9B79C]/50 uiverse-btn"
            >
              <span>{answeredCount > 0 ? `Resume Test (Q${currentQuestionIndex + 1})` : 'Start Aptitude Test'}</span>
              <ArrowRight className="w-4 h-4 text-[#FAF7F2]" />
            </button>
          </div>
        )}
      </div>

      {/* Progress Overview Grid (4 Core Indicators) with High-Contrast Text */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Assessment Progress */}
        <div className="dashboard-indicator-card bg-[#231A12] border border-[#6B523E] rounded-xl p-5 space-y-3 flex flex-col justify-between uiverse-card shadow-lg transition-all duration-300 hover:border-[#85654B]">
          <div>
            <div className="flex items-center justify-between text-xs text-[#E2D5C3] mb-2">
              <span className="font-bold uppercase tracking-wider text-[11px] text-[#FAF7F2]">Aptitude Test</span>
              <ClipboardCheck className="w-4 h-4 text-[#FAF7F2]" />
            </div>
            <div className="text-2xl font-extrabold text-[#FAF7F2]">
              {isTestCompleted ? '20 / 20' : `${answeredCount} / 20`}
            </div>
            <p className="text-xs text-[#E2D5C3] font-medium mt-1">
              {isTestCompleted ? 'Assessment completed' : 'Questions answered'}
            </p>
          </div>

          <button
            onClick={(e) => {
              handlePress(e);
              setCurrentView('test');
            }}
            className="text-xs font-bold text-[#FAF7F2] hover:text-[#C9B79C] flex items-center gap-1 transition pt-2 border-t border-[#6B523E] cursor-pointer uiverse-btn"
          >
            <span>{isTestCompleted ? 'Retake assessment' : 'Continue test'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 2. Career Matches */}
        <div className="dashboard-indicator-card bg-[#231A12] border border-[#6B523E] rounded-xl p-5 space-y-3 flex flex-col justify-between uiverse-card shadow-lg transition-all duration-300 hover:border-[#85654B]">
          <div>
            <div className="flex items-center justify-between text-xs text-[#E2D5C3] mb-2">
              <span className="font-bold uppercase tracking-wider text-[11px] text-[#FAF7F2]">Career Exploration</span>
              <Award className="w-4 h-4 text-[#FAF7F2]" />
            </div>
            <div ref={matchScoreRef} className="text-2xl font-extrabold text-[#FAF7F2] truncate">
              {dimensionScores && topCareer?.matchScore !== undefined
                ? `${topCareer.matchScore}% Match`
                : 'Pending Assessment'}
            </div>
            <p className="text-xs text-[#E2D5C3] font-medium mt-1 truncate">
              {dimensionScores && topCareer
                ? topCareer.title
                : 'Take 20-question test to unlock matches'}
            </p>
          </div>

          <button
            onClick={(e) => {
              handlePress(e);
              setCurrentView('results');
            }}
            className="text-xs font-bold text-[#FAF7F2] hover:text-[#C9B79C] flex items-center gap-1 transition pt-2 border-t border-[#6B523E] cursor-pointer uiverse-btn"
          >
            <span>{dimensionScores ? 'View all 8 recommendations' : 'Explore career catalog'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3. Roadmap Progress */}
        <div className="dashboard-indicator-card bg-[#231A12] border border-[#6B523E] rounded-xl p-5 space-y-3 flex flex-col justify-between uiverse-card shadow-lg transition-all duration-300 hover:border-[#85654B]">
          <div>
            <div className="flex items-center justify-between text-xs text-[#E2D5C3] mb-2">
              <span className="font-bold uppercase tracking-wider text-[11px] text-[#FAF7F2]">Milestone Roadmap</span>
              <Map className="w-4 h-4 text-[#FAF7F2]" />
            </div>
            <div className="text-2xl font-extrabold text-[#FAF7F2]">
              {activeCompletedSteps.length} of 10 Steps
            </div>
            <div className="w-full bg-[#1E1610] rounded-full h-2 mt-2 overflow-hidden border border-[#6B523E]">
              <div
                className="bg-gradient-to-r from-[#6B4F3A] to-[#C9B79C] h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.max(5, roadmapProgressPercent)}%` }}
              />
            </div>
          </div>

          <button
            onClick={(e) => {
              handlePress(e);
              setCurrentView('roadmap');
            }}
            className="text-xs font-bold text-[#FAF7F2] hover:text-[#C9B79C] flex items-center gap-1 transition pt-2 border-t border-[#6B523E] cursor-pointer uiverse-btn"
          >
            <span>Track milestone progress</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4. Saved Resources */}
        <div className="dashboard-indicator-card bg-[#231A12] border border-[#6B523E] rounded-xl p-5 space-y-3 flex flex-col justify-between uiverse-card shadow-lg transition-all duration-300 hover:border-[#85654B]">
          <div>
            <div className="flex items-center justify-between text-xs text-[#E2D5C3] mb-2">
              <span className="font-bold uppercase tracking-wider text-[11px] text-[#FAF7F2]">Saved Resources</span>
              <Bookmark className="w-4 h-4 text-[#FAF7F2]" />
            </div>
            <div className="text-2xl font-extrabold text-[#FAF7F2]">
              {bookmarks.length} {bookmarks.length === 1 ? 'Resource' : 'Resources'}
            </div>
            <p className="text-xs text-[#E2D5C3] font-medium mt-1">
              Curated notes &amp; exam links
            </p>
          </div>

          <button
            onClick={(e) => {
              handlePress(e);
              setCurrentView('resources');
            }}
            className="text-xs font-bold text-[#FAF7F2] hover:text-[#C9B79C] flex items-center gap-1 transition pt-2 border-t border-[#6B523E] cursor-pointer uiverse-btn"
          >
            <span>Browse study hub</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Feature Layout: Interactive Radar Centerpiece + Career Roles */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full max-w-full min-w-0">
        {/* Left 7 Cols: Top Recommended Careers */}
        <div className="lg:col-span-7 bg-[#231A12] border border-[#6B523E] rounded-2xl p-4 sm:p-6 space-y-5 uiverse-card shadow-2xl w-full max-w-full min-w-0">
          <div className="flex items-center justify-between border-b border-[#6B523E] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#FAF7F2]" />
                <h2 className="text-base font-bold text-[#FAF7F2]">
                  Recommended Career Roles
                </h2>
              </div>
              <p className="text-xs text-[#E2D5C3] font-medium mt-0.5">
                Deterministic compatibility (85% Aptitude + 15% Interest)
              </p>
            </div>

            <button
              onClick={(e) => {
                handlePress(e);
                setCurrentView('results');
              }}
              className="text-xs text-[#FAF7F2] hover:text-[#C9B79C] font-bold flex items-center gap-1 cursor-pointer uiverse-btn"
            >
              <span>See all 8</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {rankedCareers.slice(0, 3).map((career, idx) => {
              const isSelected = activeCareer?.id === career.id;
              const matchesHighlighted = highlightedDimension && career.dimensions[highlightedDimension] > 0.6;

              return (
                <div
                  key={career.id}
                  className={`p-4 sm:p-5 rounded-xl border transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isSelected
                      ? 'bg-[#2E2219] border-[#C9B79C] shadow-lg ring-1 ring-[#C9B79C]/50'
                      : matchesHighlighted
                      ? 'bg-[#2E2219]/90 border-[#C9B79C]/60 ring-1 ring-[#C9B79C]/40'
                      : 'bg-[#281D15] border-[#6B523E] hover:border-[#85654B]'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-extrabold text-[#FAF7F2]">#{idx + 1}</span>
                      <h3 className="text-sm font-bold text-[#FAF7F2]">
                        {career.title}
                      </h3>
                      {career.matchScore !== undefined ? (
                        <span className="text-xs font-extrabold px-2.5 py-0.5 rounded bg-[#4A3728] text-[#FAF7F2] border border-[#C9B79C]/40 shadow-xs">
                          {career.matchScore}% Match
                        </span>
                      ) : (
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-[#3A2C21] text-[#E2D5C3] border border-[#6B523E]/50">
                          Assessment Pending
                        </span>
                      )}
                      {matchesHighlighted && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#C9B79C]/30 text-[#FAF7F2] border border-[#C9B79C]/50 animate-pulse">
                          High in {highlightedDimension}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#E2D5C3] leading-relaxed line-clamp-2">
                      {career.description}
                    </p>
                    <div className="flex items-center gap-2 pt-1 text-xs text-[#D8C7B0] font-medium">
                      <span>{career.salaryRange}</span>
                      <span>•</span>
                      <span>Growth: {career.growthRate}</span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      handlePress(e);
                      selectCareer(career, true);
                    }}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex-shrink-0 cursor-pointer uiverse-btn ${
                      isSelected
                        ? 'bg-[#6B4F3A] text-[#FAF7F2] border border-[#C9B79C]/60 shadow-sm'
                        : 'bg-[#231A12] text-[#FAF7F2] hover:bg-[#382B20] hover:text-[#C9B79C] border border-[#6B523E]'
                    }`}
                  >
                    View Roadmap
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 5 Cols: Centerpiece 7D Interactive Cognitive Radar */}
        <div className="lg:col-span-5 space-y-4 w-full max-w-full min-w-0">
          <InteractiveRadarSignature
            scores={dimensionScores}
            onSelectDimension={(dim) => setHighlightedDimension(dim)}
            compact={true}
          />

          <div className="p-4 rounded-2xl bg-[#231A12] border border-[#6B523E] flex items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2 text-xs font-medium text-[#E2D5C3]">
              <MessageSquare className="w-4 h-4 text-[#FAF7F2]" />
              <span>Questions about your cognitive fit?</span>
            </div>
            <button
              onClick={(e) => {
                handlePress(e);
                setIsAiChatOpen(true);
              }}
              className="px-3.5 py-1.5 bg-[#2B2118] hover:bg-[#382B20] text-[#FAF7F2] border border-[#6B523E] rounded-xl text-xs font-bold transition cursor-pointer uiverse-btn flex-shrink-0"
            >
              Ask AI Mentor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
