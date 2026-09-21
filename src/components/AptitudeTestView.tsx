import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  RotateCcw,
  Check,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { APTITUDE_QUESTIONS } from '../data/questions';
import { animateSlideTransition, animatePop } from '../utils/animations';
import { useButtonMotion } from '../hooks/useMotion';

export const AptitudeTestView: React.FC = () => {
  const {
    answers,
    setAnswer,
    submitAssessment,
    resetAssessment,
    currentQuestionIndex,
    setCurrentQuestionIndex,
  } = useApp();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const questionCardRef = useRef<HTMLDivElement>(null);
  const previousIndexRef = useRef(currentQuestionIndex);
  const { handlePress } = useButtonMotion();

  const totalQuestions = APTITUDE_QUESTIONS.length;
  const currentIndex = Math.max(0, Math.min(totalQuestions - 1, currentQuestionIndex));
  const currentQuestion = APTITUDE_QUESTIONS[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  const selectedOptionId = answers[currentQuestion.id];

  useEffect(() => {
    if (questionCardRef.current && previousIndexRef.current !== currentIndex) {
      const direction = currentIndex >= previousIndexRef.current ? 'left' : 'right';
      animateSlideTransition(questionCardRef.current, direction, 340);
      previousIndexRef.current = currentIndex;
    }
  }, [currentIndex]);

  const handleSelectOption = useCallback(
    (optionId: string, event?: React.MouseEvent) => {
      if (event?.currentTarget) {
        animatePop(event.currentTarget);
      }
      setAnswer(currentQuestion.id, optionId, currentIndex);
    },
    [currentQuestion.id, currentIndex, setAnswer]
  );

  const handleNext = useCallback(() => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentIndex + 1);
    }
  }, [currentIndex, totalQuestions, setCurrentQuestionIndex]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentQuestionIndex(currentIndex - 1);
    }
  }, [currentIndex, setCurrentQuestionIndex]);

  const handleSubmit = async (e: React.MouseEvent<HTMLElement>) => {
    handlePress(e);
    setIsSubmitting(true);

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#C9B79C', '#6B4F3A', '#FAF7F2'],
      });
    } catch {
      // Confetti fallback
    }

    await submitAssessment();
    setIsSubmitting(false);
  };

  // Keyboard navigation support: 1-4, A-D, Left/Right arrows
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (['1', '2', '3', '4'].includes(e.key)) {
        const optIndex = parseInt(e.key, 10) - 1;
        if (currentQuestion.options[optIndex]) {
          handleSelectOption(currentQuestion.options[optIndex].id);
        }
      } else if (['a', 'b', 'c', 'd', 'A', 'B', 'C', 'D'].includes(e.key)) {
        const optIndex = e.key.toLowerCase().charCodeAt(0) - 97;
        if (currentQuestion.options[optIndex]) {
          handleSelectOption(currentQuestion.options[optIndex].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext, handleSelectOption, currentQuestion]);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 min-w-0">
      {/* Header & Progress Indicator */}
      <div className="bg-[#231A12] border border-[#6B523E] rounded-2xl p-5 sm:p-6 shadow-xl space-y-4 uiverse-card relative overflow-hidden w-full max-w-full min-w-0">
        <div
          className="absolute -top-16 -right-16 w-48 h-48 bg-[#6B4F3A]/20 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#C9B79C]">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="font-semibold text-[#FAF7F2]">
                Cognitive Aptitude Assessment
              </span>
              <span>•</span>
              <span className="text-[#E2D5C3]">Question {currentIndex + 1} of {totalQuestions}</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-[#FAF7F2] mt-1">
              {currentQuestion.category}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs text-[#E2D5C3] block">Progress</span>
              <span className="text-xs sm:text-sm font-bold text-[#FAF7F2]">
                {answeredCount} of {totalQuestions} ({progressPercent}%)
              </span>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Reset all answers? Your saved answers will be cleared.')) {
                  resetAssessment();
                  setCurrentQuestionIndex(0);
                }
              }}
              className="p-2 text-[#E2D5C3] hover:text-[#FAF7F2] hover:bg-[#2B2118] rounded-xl transition cursor-pointer border border-[#6B523E]/50 hover:border-[#6B523E] uiverse-btn"
              title="Reset Assessment"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Clean Progress Track */}
        <div className="w-full h-1.5 bg-[#2B2118] rounded-full overflow-hidden border border-[#6B523E]">
          <div
            className="h-full bg-gradient-to-r from-[#6B4F3A] to-[#C9B79C] rounded-full transition-all duration-300"
            style={{ width: `${Math.max(5, progressPercent)}%` }}
          />
        </div>

        {/* 20-Question Indicator Palette */}
        <div className="flex items-center gap-1.5 pt-1 overflow-x-auto pb-1 scrollbar-none">
          {APTITUDE_QUESTIONS.map((q, idx) => {
            const isAnswered = !!answers[q.id];
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={q.id}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 rounded-lg text-xs font-semibold transition flex items-center justify-center cursor-pointer uiverse-btn ${
                  isCurrent
                    ? 'bg-[#6B4F3A] text-[#FAF7F2] font-bold border border-[#C9B79C] shadow-sm'
                    : isAnswered
                    ? 'bg-[#2B2118] text-[#FAF7F2] font-semibold border border-[#8C6D53]'
                    : 'bg-[#2B2118] text-[#E2D5C3] border border-[#6B523E] hover:text-[#FAF7F2] hover:border-[#C9B79C]'
                }`}
                title={`Question ${q.id}: ${isAnswered ? 'Answered' : 'Unanswered'}`}
              >
                {q.id}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Question & Scenario Card */}
      <div
        ref={questionCardRef}
        className="bg-[#231A12] border border-[#6B523E] rounded-2xl p-5 sm:p-7 shadow-xl space-y-6 uiverse-card relative overflow-hidden w-full max-w-full min-w-0"
      >
        <div className="space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#C9B79C] block">
            Scenario #{currentQuestion.id}
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-[#FAF7F2] leading-snug">
            {currentQuestion.title}
          </h2>
          <div className="text-sm sm:text-base text-[#FAF7F2] leading-relaxed bg-[#2B2118] p-4 rounded-xl border border-[#6B523E] shadow-inner">
            {currentQuestion.scenario}
          </div>
        </div>

        {/* Answer Choices */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-[#FAF7F2] block">
            Select the response that most closely reflects how you instinctively approach this challenge:
          </label>

          <div className="space-y-2.5">
            {currentQuestion.options.map((option, optIdx) => {
              const letter = String.fromCharCode(65 + optIdx);
              const isSelected = selectedOptionId === option.id;

              return (
                <button
                  key={option.id}
                  onClick={(e) => handleSelectOption(option.id, e)}
                  className={`w-full p-4 rounded-xl text-left transition-all duration-200 flex items-start gap-3.5 cursor-pointer border ${
                    isSelected
                      ? 'bg-[#2B2118] border-[#C9B79C] text-[#FAF7F2] shadow-md ring-1 ring-[#C9B79C]/40'
                      : 'bg-[#2B2118] border-[#6B523E] text-[#FAF7F2] hover:border-[#C9B79C] hover:bg-[#362A1F]'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5 transition ${
                      isSelected
                        ? 'bg-[#6B4F3A] text-[#FAF7F2] border border-[#C9B79C]'
                        : 'bg-[#231A12] border border-[#6B523E] text-[#FAF7F2]'
                    }`}
                  >
                    {letter}
                  </div>

                  <div className="flex-1 text-xs sm:text-sm leading-relaxed">
                    {option.text}
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-[#C9B79C] flex-shrink-0 mt-1 stroke-[3]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-[#6B523E]">
          <button
            onClick={(e) => {
              handlePress(e);
              handlePrev();
            }}
            disabled={currentIndex === 0}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition uiverse-btn ${
              currentIndex === 0
                ? 'opacity-40 cursor-not-allowed text-[#C9B79C]'
                : 'text-[#FAF7F2] hover:bg-[#2B2118] border border-[#6B523E]/50 hover:border-[#6B523E] cursor-pointer'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <span className="text-[11px] text-[#E2D5C3] hidden sm:inline font-medium">
            Press keys 1–4 or A–D to select · Arrow keys to navigate
          </span>

          <div className="flex items-center gap-2">
            {currentIndex < totalQuestions - 1 ? (
              <button
                onClick={(e) => {
                  handlePress(e);
                  handleNext();
                }}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#6B4F3A] hover:bg-[#7E5D45] text-[#FAF7F2] text-xs font-semibold shadow-md transition cursor-pointer border border-[#C9B79C]/40 uiverse-btn"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={answeredCount < 10 || isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold shadow-md transition cursor-pointer border border-[#C9B79C]/40 bg-[#6B4F3A] hover:bg-[#7E5D45] text-[#FAF7F2] uiverse-btn"
              >
                <CheckCircle2 className="w-4 h-4 text-[#C9B79C]" />
                <span>{isSubmitting ? 'Calculating...' : 'Submit Assessment'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
