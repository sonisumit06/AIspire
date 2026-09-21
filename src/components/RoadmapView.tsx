import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Map,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  Target,
  Wrench,
  BookOpen,
  MessageSquare,
  Check,
  FileDown,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CAREER_ROLES } from '../data/careers';
import { generateCareerReportPdf } from '../services/pdfReportService';
import type { RoadmapStep } from '../types';
import { animateEntrance } from '../utils/animations';
import { useButtonMotion } from '../hooks/useMotion';

export const RoadmapView: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { handlePress } = useButtonMotion();
  const {
    selectedCareer,
    selectCareer,
    completedSteps,
    toggleStepCompletion,
    setIsAiChatOpen,
    sendChatMessage,
    userProfile,
    dimensionScores,
    rankedCareers,
  } = useApp();

  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [expandedStep, setExpandedStep] = useState<number | null>(1);

  const career = selectedCareer || CAREER_ROLES[0];
  const activeCompleted = completedSteps[career.id] || [];
  const progressPercent = Math.round((activeCompleted.length / 10) * 100);

  useEffect(() => {
    if (containerRef.current) {
      animateEntrance(containerRef.current.querySelectorAll('.roadmap-section'), {
        stagger: 45,
        translateY: [16, 0],
        duration: 650,
      });
    }
  }, [career.id]);

  // Identify next unfinished step ("Where am I / What should I do next?")
  const currentActiveStepNumber = activeCompleted.length < 10
    ? ([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].find((s) => !activeCompleted.includes(s)) || 1)
    : 10;

  const handleToggleStep = (stepNumber: number, event?: React.MouseEvent<HTMLElement>) => {
    if (event) handlePress(event);
    toggleStepCompletion(career.id, stepNumber);

    if (!activeCompleted.includes(stepNumber)) {
      try {
        confetti({
          particleCount: 35,
          spread: 45,
          origin: { y: 0.7 },
          colors: ['#C9B79C', '#6B4F3A', '#FAF7F2'],
        });
      } catch {
        // Confetti fallback
      }
    }
  };

  const handleAskAiAboutStep = (step: RoadmapStep) => {
    setIsAiChatOpen(true);
    sendChatMessage(
      `Please provide tailored advice, best practices, and learning resources for Step ${step.stepNumber}: "${step.title}" of the ${career.title} roadmap.`
    );
  };

  const handleExportPdf = async () => {
    try {
      setIsExportingPdf(true);
      await generateCareerReportPdf({
        userProfile,
        dimensionScores,
        rankedCareers,
        selectedCareer: career,
        completedSteps,
      });
    } catch (err) {
      console.error('Failed to export PDF report:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div ref={containerRef} className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-w-0">
      {/* Header Banner & Career Selector */}
      <div className="roadmap-section bg-[#231A12] border border-[#6B523E] rounded-2xl p-6 sm:p-7 shadow-2xl space-y-6 uiverse-card relative overflow-hidden w-full max-w-full min-w-0">
        <div
          className="absolute -top-20 -right-20 w-60 h-60 bg-[#6B4F3A]/20 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10 w-full max-w-full min-w-0">
          <div className="space-y-1.5 max-w-2xl min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-[#281D15] text-[#FAF7F2] border border-[#6B523E]">
                {career.category}
              </span>
              {career.matchScore && (
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-[#4A3728] text-[#FAF7F2] border border-[#C9B79C]/40 flex items-center gap-1 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#FAF7F2]" />
                  <span>{career.matchScore}% Match</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#FAF7F2] tracking-tight">
              10-Step Roadmap: {career.title}
            </h1>

            <p className="text-xs sm:text-sm text-[#E2D5C3] font-medium leading-relaxed">
              {career.description}
            </p>
          </div>

          {/* Switch Career Dropdown & Export PDF */}
          <div className="flex items-center gap-2.5 flex-shrink-0 flex-wrap max-w-full">
            <select
              value={career.id}
              onChange={(e) => {
                const target = CAREER_ROLES.find((c) => c.id === e.target.value);
                if (target) selectCareer(target, false);
              }}
              className="px-3.5 py-2.5 bg-[#281D15] border border-[#6B523E] rounded-xl text-xs font-bold text-[#FAF7F2] focus:outline-none focus:border-[#C9B79C] transition cursor-pointer max-w-full"
            >
              {CAREER_ROLES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>

            <button
              onClick={(e) => {
                handlePress(e);
                handleExportPdf();
              }}
              disabled={isExportingPdf}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#6B4F3A] hover:bg-[#7E5D45] disabled:opacity-50 text-[#FAF7F2] text-xs font-bold shadow-md transition cursor-pointer border border-[#C9B79C]/50 uiverse-btn"
              title="Download publication-grade Career & Aptitude PDF Report"
            >
              {isExportingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FAF7F2]" />
                  <span className="hidden sm:inline">Generating PDF...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-3.5 h-3.5 text-[#FAF7F2]" />
                  <span className="hidden sm:inline">Export Report</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Milestone Tracker Status Bar */}
        <div className="p-4 rounded-xl bg-[#281D15] border border-[#6B523E] space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#FAF7F2] font-bold flex items-center gap-1.5">
              <Map className="w-4 h-4 text-[#FAF7F2]" />
              <span>Progress: {activeCompleted.length} of 10 Milestones Completed</span>
            </span>
            <span className="font-extrabold text-[#FAF7F2]">
              {progressPercent}%
            </span>
          </div>

          <div className="w-full h-2 bg-[#1E1610] rounded-full overflow-hidden border border-[#6B523E]">
            <div
              className="h-full bg-gradient-to-r from-[#6B4F3A] to-[#C9B79C] rounded-full transition-all duration-700 ease-out"
              style={{ width: `${Math.max(5, progressPercent)}%` }}
            />
          </div>

          <div className="text-xs text-[#E2D5C3] font-medium pt-0.5 flex items-center justify-between">
            <span>
              Current focus:{' '}
              <strong className="text-[#FAF7F2]">
                Step {currentActiveStepNumber} · {career.roadmap[currentActiveStepNumber - 1]?.title}
              </strong>
            </span>
            <span className="text-[#D8C7B0]">
              {10 - activeCompleted.length} steps remaining
            </span>
          </div>
        </div>
      </div>

      {/* Structured Vertical Timeline with Animated Connecting Spine */}
      <div className="relative space-y-4">
        {career.roadmap.map((step) => {
          const isCompleted = activeCompleted.includes(step.stepNumber);
          const isCurrentActive = step.stepNumber === currentActiveStepNumber && !isCompleted;
          const isExpanded = expandedStep === step.stepNumber;

          return (
            <div
              key={step.stepNumber}
              className={`roadmap-section rounded-2xl border transition-all duration-300 bg-[#231A12] overflow-hidden shadow-2xl uiverse-card ${
                isCurrentActive
                  ? 'border-[#C9B79C] ring-1 ring-[#C9B79C]/50 shadow-2xl'
                  : isCompleted
                  ? 'border-[#6B523E] opacity-90'
                  : 'border-[#6B523E] hover:border-[#85654B]'
              }`}
            >
              {/* Step Summary Header */}
              <div
                onClick={() => setExpandedStep(isExpanded ? null : step.stepNumber)}
                className="p-5 flex items-start sm:items-center justify-between gap-4 cursor-pointer select-none"
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  {/* Step Completion Toggle Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleStep(step.stepNumber, e);
                    }}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 flex-shrink-0 cursor-pointer border uiverse-btn ${
                      isCompleted
                        ? 'bg-[#6B4F3A] border-[#C9B79C] text-[#FAF7F2] shadow-sm'
                        : isCurrentActive
                        ? 'bg-[#4A3728] border-[#C9B79C] text-[#FAF7F2] ring-1 ring-[#C9B79C]/50'
                        : 'bg-[#281D15] border-[#6B523E] text-[#E2D5C3] hover:border-[#C9B79C]/60 hover:text-[#FAF7F2]'
                    }`}
                    title={isCompleted ? 'Mark step as incomplete' : 'Mark step as completed'}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4 text-[#FAF7F2] stroke-[3]" />
                    ) : (
                      <span className="text-xs font-bold">{step.stepNumber}</span>
                    )}
                  </button>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#281D15] text-[#FAF7F2] border border-[#6B523E]">
                        {step.phase}
                      </span>
                      {isCurrentActive && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#4A3728] text-[#FAF7F2] border border-[#C9B79C]/50 shadow-xs">
                          Up Next
                        </span>
                      )}
                      {isCompleted && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#4A3728] text-[#FAF7F2] border border-[#C9B79C]/40">
                          Completed
                        </span>
                      )}
                    </div>

                    <h3
                      className={`text-base font-bold transition ${
                        isCompleted
                          ? 'text-[#A69580] line-through decoration-[#6B4F3A]'
                          : 'text-[#FAF7F2]'
                      }`}
                    >
                      Step {step.stepNumber}: {step.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0 text-[#E2D5C3]">
                  <span className="text-xs hidden sm:flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-[#FAF7F2]" />
                    <span>{step.timeline}</span>
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-[#FAF7F2]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#FAF7F2]" />
                  )}
                </div>
              </div>

              {/* Expanded Step Details */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-1 border-t border-[#6B523E] space-y-4 text-xs text-[#E2D5C3]">
                  <p className="text-[#E2D5C3] leading-relaxed text-xs sm:text-sm">
                    {step.description}
                  </p>

                  {/* Milestone Goal Callout */}
                  <div className="p-4 rounded-xl bg-[#281D15] border border-[#6B523E] flex items-start gap-3 shadow-inner">
                    <Target className="w-4 h-4 text-[#FAF7F2] flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#FAF7F2] block">
                        Milestone Deliverable
                      </span>
                      <span className="text-xs font-semibold text-[#FAF7F2]">
                        {step.milestoneGoal}
                      </span>
                    </div>
                  </div>

                  {/* Skills & Recommended Tools */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3.5 rounded-xl bg-[#281D15] border border-[#6B523E] space-y-2">
                      <span className="font-bold text-[#FAF7F2] flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-[#FAF7F2]" />
                        <span>Core Competencies</span>
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {step.keySkills.map((sk, skIdx) => (
                          <span
                            key={skIdx}
                            className="text-xs font-medium px-2 py-0.5 rounded bg-[#231A12] text-[#FAF7F2] border border-[#6B523E]"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#281D15] border border-[#6B523E] space-y-2">
                      <span className="font-bold text-[#FAF7F2] flex items-center gap-1.5">
                        <Wrench className="w-3.5 h-3.5 text-[#FAF7F2]" />
                        <span>Recommended Tools</span>
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {step.recommendedTools.map((tl, tlIdx) => (
                          <span
                            key={tlIdx}
                            className="text-xs font-medium px-2 py-0.5 rounded bg-[#231A12] text-[#FAF7F2] border border-[#6B523E]"
                          >
                            {tl}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action Items Checklist */}
                  <div className="space-y-2 pt-1">
                    <span className="font-bold text-[#FAF7F2] block">
                      Key Milestone Tasks
                    </span>
                    <div className="space-y-1.5">
                      {step.actionItems.map((act, actIdx) => (
                        <div
                          key={actIdx}
                          className="flex items-start gap-2 text-xs font-medium text-[#E2D5C3]"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FAF7F2] flex-shrink-0 mt-1.5" />
                          <span>{act}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Step Action Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#6B523E]">
                    <button
                      type="button"
                      onClick={(e) => {
                        handlePress(e);
                        handleToggleStep(step.stepNumber, e);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer uiverse-btn ${
                        isCompleted
                          ? 'bg-[#281D15] hover:bg-[#382B20] text-[#FAF7F2] border border-[#6B523E]'
                          : 'bg-[#6B4F3A] hover:bg-[#7E5D45] text-[#FAF7F2] border border-[#C9B79C]/50 shadow-sm'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isCompleted ? 'Mark Incomplete' : 'Complete Step'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        handlePress(e);
                        handleAskAiAboutStep(step);
                      }}
                      className="px-3.5 py-2 bg-[#281D15] hover:bg-[#382B20] text-[#FAF7F2] border border-[#6B523E] rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer uiverse-btn"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#FAF7F2]" />
                      <span>Ask AI Mentor about this step</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
