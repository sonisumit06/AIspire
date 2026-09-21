import React, { useState, useEffect, useRef } from 'react';
import {
  Award,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Brain,
  ChevronDown,
  ChevronUp,
  Target,
  RefreshCw,
  AlertCircle,
  FileDown,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DIMENSIONS } from '../data/questions';
import { generateCareerReportPdf } from '../services/pdfReportService';
import { animateEntrance } from '../utils/animations';
import { useButtonMotion } from '../hooks/useMotion';
import { InteractiveRadarSignature } from './InteractiveRadarSignature';
import type { DimensionKey } from '../types';

export const ResultsView: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedRadarDim, setSelectedRadarDim] = useState<DimensionKey | null>(null);
  const { handlePress } = useButtonMotion();

  const {
    dimensionScores,
    rankedCareers,
    selectedCareer,
    userProfile,
    completedSteps,
    selectCareer,
    setCurrentView,
  } = useApp();

  const [showFormulaDetails, setShowFormulaDetails] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  useEffect(() => {
    if (containerRef.current) {
      animateEntrance(containerRef.current.querySelectorAll('.results-section'), {
        stagger: 60,
        translateY: [16, 0],
        duration: 650,
      });
    }
  }, []);

  const handleExportPdf = async () => {
    try {
      setIsExportingPdf(true);
      await generateCareerReportPdf({
        userProfile,
        dimensionScores,
        rankedCareers,
        selectedCareer,
        completedSteps,
      });
    } catch (err) {
      console.error('Failed to export PDF report:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const categories = [
    'all',
    ...Array.from(new Set(rankedCareers.map((c) => c.category))),
  ];

  const filteredCareers =
    filterCategory === 'all'
      ? rankedCareers
      : rankedCareers.filter((c) => c.category === filterCategory);

  // Compute highest strength dimensions
  const sortedDimensions = [...DIMENSIONS].sort((a, b) => {
    const scoreA = dimensionScores ? dimensionScores[a.key] ?? 50 : 50;
    const scoreB = dimensionScores ? dimensionScores[b.key] ?? 50 : 50;
    return scoreB - scoreA;
  });

  const topStrengths = sortedDimensions.slice(0, 3);

  return (
    <div ref={containerRef} className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 min-w-0">
      {/* Top Banner */}
      <div className="results-section bg-[#231A12] border border-[#6B523E] rounded-2xl p-6 sm:p-7 shadow-2xl space-y-4 uiverse-card relative overflow-hidden">
        <div
          className="absolute -top-20 -right-20 w-60 h-60 bg-[#6B4F3A]/20 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FAF7F2] bg-[#4A3728] px-3 py-1 rounded-full border border-[#C9B79C]/40 inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#FAF7F2]" />
              <span>Deterministic Compatibility Engine</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#FAF7F2] tracking-tight">
              Cognitive Profile &amp; Career Recommendations
            </h1>
            <p className="text-xs sm:text-sm text-[#E2D5C3] font-medium max-w-2xl leading-relaxed">
              Based on your responses across all 20 scenarios, here is your 7-dimensional cognitive evaluation and matched career paths. Select any role to view its actionable 10-step preparation roadmap.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
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
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-3.5 h-3.5 text-[#FAF7F2]" />
                  <span>Export Career Report</span>
                </>
              )}
            </button>

            <button
              onClick={(e) => {
                handlePress(e);
                setCurrentView('test');
              }}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#2B2118] hover:bg-[#382B20] text-[#FAF7F2] border border-[#6B523E] text-xs font-bold transition cursor-pointer uiverse-btn"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#FAF7F2]" />
              <span>Retake Test</span>
            </button>
          </div>
        </div>
      </div>

      {/* 7-Dimensional Cognitive Profile Showcase: Interactive Radar + Highlights */}
      <div className="results-section bg-[#231A12] border border-[#6B523E] rounded-2xl p-6 sm:p-7 shadow-2xl space-y-6 uiverse-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#6B523E]">
          <div>
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-[#FAF7F2]" />
              <h2 className="text-base sm:text-lg font-bold text-[#FAF7F2]">
                Your 7 Cognitive &amp; Professional Dimensions
              </h2>
            </div>
            <p className="text-xs text-[#E2D5C3] font-medium mt-0.5">
              Normalized scores (0–100) calculated from your scenario choices
            </p>
          </div>

          {/* Top Strengths Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-[#FAF7F2] font-bold">
              Top Strengths:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {topStrengths.map((st) => (
                <span
                  key={st.key}
                  className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#4A3728] text-[#FAF7F2] border border-[#C9B79C]/50 flex items-center gap-1 shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#FAF7F2]" />
                  <span>{st.label.split(' ')[0]} ({Math.round(dimensionScores ? dimensionScores[st.key] ?? 50 : 50)}%)</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Centerpiece Radar Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full max-w-full min-w-0">
          <div className="lg:col-span-6 flex justify-center w-full max-w-full min-w-0">
            <InteractiveRadarSignature
              scores={dimensionScores}
              onSelectDimension={(dim) => setSelectedRadarDim(dim)}
              compact={false}
              className="w-full max-w-lg"
            />
          </div>

          {/* 7 Dimension Cards List */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full max-w-full min-w-0">
            {DIMENSIONS.map((dim) => {
              const score = Math.round(
                dimensionScores ? dimensionScores[dim.key] ?? 50 : 50
              );
              const isTopStrength = topStrengths.some((s) => s.key === dim.key);
              const isRadarSelected = selectedRadarDim === dim.key;

              return (
                <div
                  key={dim.key}
                  onClick={() => setSelectedRadarDim(dim.key)}
                  className={`p-4 rounded-xl border transition-all duration-300 space-y-2 cursor-pointer uiverse-card ${
                    isRadarSelected
                      ? 'bg-[#2E2219] border-[#C9B79C] shadow-lg ring-1 ring-[#C9B79C]/60'
                      : isTopStrength
                      ? 'bg-[#281D15] border-[#85654B] shadow-sm'
                      : 'bg-[#241A13] border-[#6B523E] hover:border-[#85654B]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#FAF7F2]">
                      {dim.label}
                    </span>
                    <span className="text-sm font-extrabold text-[#FAF7F2]">
                      {score}%
                    </span>
                  </div>

                  <div className="w-full h-1.5 bg-[#1E1610] rounded-full overflow-hidden border border-[#6B523E]">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r from-[#6B4F3A] to-[#C9B79C]"
                      style={{
                        width: `${Math.max(6, score)}%`,
                      }}
                    />
                  </div>

                  <p className="text-xs text-[#E2D5C3] leading-relaxed line-clamp-2">
                    {dim.shortDesc}
                  </p>

                  {isTopStrength && (
                    <span className="inline-block text-[10px] uppercase tracking-wider font-extrabold text-[#FAF7F2] bg-[#4A3728] px-2 py-0.5 rounded border border-[#C9B79C]/40">
                      Key Strength
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Mathematical Transparency Accordion */}
        <div className="pt-2 border-t border-[#6B523E]">
          <button
            onClick={() => setShowFormulaDetails((prev) => !prev)}
            className="flex items-center gap-1.5 text-xs font-bold text-[#FAF7F2] hover:text-[#C9B79C] transition cursor-pointer"
          >
            <span>How AIspire calculates your career match scores mathematically</span>
            {showFormulaDetails ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {showFormulaDetails && (
            <div className="mt-3 p-4 rounded-xl bg-[#281D15] border border-[#6B523E] text-xs text-[#FAF7F2] space-y-2 leading-relaxed">
              <p className="font-semibold text-[#FAF7F2]">
                Recommendations are calculated deterministically using a transparent formula:
              </p>
              <ul className="list-disc list-inside space-y-1 text-[#E2D5C3]">
                <li>
                  <strong className="text-[#FAF7F2]">Student Dimension Score</strong>: Earned weights divided by maximum possible weights normalized to 0–100.
                </li>
                <li>
                  <strong className="text-[#FAF7F2]">Aptitude Match</strong>: Weighted sum of student scores multiplied by career dimension importance weights.
                </li>
                <li>
                  <strong className="text-[#FAF7F2]">Interest Alignment</strong>: Evaluated based on your declared interests and target goals (15% weight).
                </li>
                <li>
                  <strong className="text-[#FAF7F2]">Final Match Score</strong>: Round(AptitudeMatch &times; 0.85 + InterestAlignment &times; 0.15).
                </li>
              </ul>
              <p className="text-xs text-[#D8C7B0] font-medium pt-1">
                Careers are ordered strictly by descending Final Match. The AI does not invent or alter scores.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recommended Careers Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#FAF7F2] flex items-center gap-2">
              <Award className="w-5 h-5 text-[#FAF7F2]" />
              <span>Recommended Career Roles</span>
            </h2>
            <p className="text-xs text-[#E2D5C3] font-medium mt-0.5">
              Select any career to immediately explore its 10-step preparation roadmap
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={(e) => {
                  handlePress(e);
                  setFilterCategory(cat);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer uiverse-btn ${
                  filterCategory === cat
                    ? 'bg-[#6B4F3A] text-[#FAF7F2] shadow-sm border border-[#C9B79C]/50'
                    : 'bg-[#231A12] text-[#E2D5C3] border border-[#6B523E] hover:text-[#FAF7F2]'
                }`}
              >
                {cat === 'all' ? 'All Disciplines' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Career Cards List */}
        <div className="space-y-5">
          {filteredCareers.map((career, index) => {
            const matchScore = career.matchScore ?? 80;
            const isHighest = index === 0 && filterCategory === 'all';
            const matchesRadarDim = selectedRadarDim && career.dimensions[selectedRadarDim] > 0.6;

            return (
              <div
                key={career.id}
                className={`results-section rounded-2xl bg-[#231A12] border transition-all duration-300 p-6 space-y-5 shadow-2xl uiverse-card ${
                  matchesRadarDim
                    ? 'border-[#C9B79C] ring-1 ring-[#C9B79C]/60 shadow-2xl'
                    : isHighest
                    ? 'border-[#C9B79C]/60 shadow-2xl'
                    : 'border-[#6B523E] hover:border-[#85654B]'
                }`}
              >
                {/* Top Row: Title, Match % & Description */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-[#281D15] text-[#FAF7F2] border border-[#6B523E]">
                        {career.category}
                      </span>
                      {isHighest && (
                        <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-[#4A3728] text-[#FAF7F2] border border-[#C9B79C]/50 shadow-xs">
                          Highest Compatibility
                        </span>
                      )}
                      {matchesRadarDim && (
                        <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#C9B79C]/30 text-[#FAF7F2] border border-[#C9B79C]/50 animate-pulse">
                          High {selectedRadarDim} Fit
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-[#FAF7F2]">
                      {career.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-[#E2D5C3] leading-relaxed max-w-3xl">
                      {career.description}
                    </p>
                  </div>

                  {/* Match Percentage Indicator */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start flex-shrink-0 bg-[#281D15] px-4 py-2.5 rounded-xl border border-[#6B523E]">
                    <span className="text-[10px] uppercase font-bold text-[#FAF7F2] tracking-wider">
                      Match Score
                    </span>
                    <span className="text-2xl sm:text-3xl font-extrabold text-[#FAF7F2] mt-0.5">
                      {matchScore}%
                    </span>
                    <span className="text-xs text-[#D8C7B0] font-medium hidden sm:block">
                      {matchScore >= 75 ? 'Strong Match' : 'Moderate Match'}
                    </span>
                  </div>
                </div>

                {/* Compensation & Growth Info */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-[#281D15] border border-[#6B523E] text-xs">
                  <div>
                    <span className="text-[#D8C7B0] text-xs font-medium block">
                      Compensation Benchmark
                    </span>
                    <span className="font-bold text-[#FAF7F2] mt-0.5 block">
                      {career.salaryRange}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#D8C7B0] text-xs font-medium block">
                      5-Year Growth Outlook
                    </span>
                    <span className="font-bold text-[#FAF7F2] mt-0.5 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-[#FAF7F2]" />
                      {career.growthRate}
                    </span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-[#D8C7B0] text-xs font-medium block">
                      Market Demand
                    </span>
                    <span className="font-bold text-[#FAF7F2] mt-0.5 block">
                      {career.demandLevel} Demand
                    </span>
                  </div>
                </div>

                {/* Evidence & Growth Area Columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Why this career matches */}
                  <div className="p-4 rounded-xl bg-[#281D15] border border-[#6B523E] space-y-2">
                    <span className="font-bold text-[#FAF7F2] flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-[#FAF7F2]" />
                      <span>Your strengths align strongly with:</span>
                    </span>
                    <ul className="space-y-1.5 text-[#E2D5C3] leading-relaxed">
                      {(career.whyThisCareer || []).map((evidence, eIdx) => (
                        <li key={eIdx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#FAF7F2] flex-shrink-0 mt-0.5" />
                          <span>{evidence}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Growth Area & Advice */}
                  {career.growthArea ? (
                    <div className="p-4 rounded-xl bg-[#281D15] border border-[#6B523E] space-y-2">
                      <span className="font-bold text-[#FAF7F2] flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-[#FAF7F2]" />
                        <span>Potential Growth Area:</span>
                      </span>
                      <p className="text-[#FAF7F2] font-bold">
                        {career.growthArea.dimensionLabel}
                      </p>
                      <p className="text-[#E2D5C3] text-xs leading-relaxed">
                        {career.growthArea.constructiveAdvice}
                      </p>
                    </div>
                  ) : null}
                </div>

                {/* Skills & Action Footer */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-[#6B523E]">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs text-[#D8C7B0] font-bold mr-1">Key skills:</span>
                    {career.requiredSkills.slice(0, 5).map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="text-xs font-semibold px-2 py-0.5 rounded bg-[#281D15] border border-[#6B523E] text-[#FAF7F2]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={(e) => {
                      handlePress(e);
                      selectCareer(career, true);
                    }}
                    className="px-5 py-2.5 bg-[#6B4F3A] hover:bg-[#7E5D45] text-[#FAF7F2] rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer flex-shrink-0 border border-[#C9B79C]/50 uiverse-btn"
                  >
                    <span>View 10-Step Roadmap</span>
                    <ArrowRight className="w-4 h-4 text-[#FAF7F2]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
