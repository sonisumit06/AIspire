import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  User,
  Award,
  Loader2,
  MapPin,
  Trash2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { animateEntrance, animatePop } from '../utils/animations';

export const AIChatDrawer: React.FC = () => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const {
    isAiChatOpen,
    setIsAiChatOpen,
    chatMessages,
    sendChatMessage,
    clearChat,
    isAiTyping,
    userProfile,
    selectedCareer,
    completedSteps,
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeCompleted = selectedCareer ? (completedSteps[selectedCareer.id] || []) : [];
  const currentStepNumber = activeCompleted.length < 10
    ? ([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].find((s) => !activeCompleted.includes(s)) || 1)
    : 10;
  const currentStep = selectedCareer?.roadmap?.[currentStepNumber - 1];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isAiChatOpen) {
      scrollToBottom();
      if (drawerRef.current) {
        animateEntrance(drawerRef.current, {
          translateY: [0, 0],
          opacity: [0.3, 1],
          duration: 300,
        });
      }
    }
  }, [chatMessages, isAiChatOpen, isAiTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isAiTyping) return;

    const msg = inputMessage.trim();
    setInputMessage('');
    await sendChatMessage(msg);
  };

  const handleChipClick = (prompt: string, event?: React.MouseEvent) => {
    if (isAiTyping) return;
    if (event?.currentTarget) {
      animatePop(event.currentTarget);
    }
    sendChatMessage(prompt);
  };

  if (!isAiChatOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity animate-fadeIn"
        onClick={() => setIsAiChatOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          ref={drawerRef}
          className="w-screen max-w-md bg-[#231A12] border-l border-[#6B523E] shadow-2xl flex flex-col justify-between"
        >
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-[#6B523E] bg-[#2B2118] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white p-1 flex items-center justify-center flex-shrink-0 shadow-sm border border-[#6B523E]">
                <img src="/logo.png" alt="AIspire AI Mentor" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-[#FAF7F2]">
                    AI Mentor
                  </h3>
                  <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uiverse-badge-glow">
                    Active
                  </span>
                </div>
                <p className="text-xs text-[#E2D5C3]">
                  Career, Academic &amp; Roadmap Guidance
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                className="p-1.5 text-[#E2D5C3] hover:text-rose-400 rounded-xl hover:bg-[#362A1F] transition cursor-pointer uiverse-btn"
                title="Clear conversation history"
                aria-label="Clear conversation history"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsAiChatOpen(false)}
                className="p-1.5 text-[#E2D5C3] hover:text-white rounded-xl hover:bg-[#362A1F] transition cursor-pointer uiverse-btn"
                title="Close AI Mentor"
                aria-label="Close AI Mentor"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Contextual Student Info Banner */}
          <div className="px-4 py-2.5 bg-[#2B2118] border-b border-[#6B523E] text-xs text-[#E2D5C3] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[#FAF7F2] font-medium truncate max-w-[200px] flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-[#C9B79C] flex-shrink-0" />
                <span>Career: {selectedCareer?.title || 'General Advising'}</span>
              </span>
              <span className="text-[11px] text-[#E2D5C3]">
                {userProfile?.educationLevel ? userProfile.educationLevel.split(' ')[0] : 'Student'}
              </span>
            </div>
            {currentStep && (
              <div className="flex items-center gap-1.5 text-[11px] text-[#E2D5C3] truncate">
                <MapPin className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                <span className="truncate">
                  Current roadmap step: Step {currentStepNumber} · {currentStep.title}
                </span>
              </div>
            )}
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {chatMessages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${
                    isUser ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 overflow-hidden ${
                      isUser
                        ? 'bg-[#6B4F3A] text-white'
                        : 'bg-white p-0.5 border border-[#6B523E] shadow-xs'
                    }`}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <img src="/logo.png" alt="AI Mentor" className="w-full h-full object-contain" />}
                  </div>

                  <div
                    className={`max-w-[85%] rounded-xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-[#6B4F3A] text-[#FAF7F2]'
                        : 'bg-[#2B2118] border border-[#6B523E] text-[#FAF7F2] space-y-2'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.text}</div>

                    {/* Suggested Prompts */}
                    {msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
                      <div className="pt-2 border-t border-[#6B523E] flex flex-wrap gap-1.5 mt-2">
                        {msg.suggestedPrompts.map((p, pIdx) => (
                          <button
                            key={pIdx}
                            onClick={(e) => handleChipClick(p, e)}
                            className="text-[11px] bg-[#362A1F] hover:bg-[#453527] text-[#FAF7F2] border border-[#6B523E] px-2.5 py-1 rounded-lg text-left transition cursor-pointer uiverse-btn"
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* AI Typing Indicator */}
            {isAiTyping && (
              <div className="flex items-center gap-2 text-[#E2D5C3] text-xs p-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#C9B79C]" />
                <span>Synthesizing guidance...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3.5 border-t border-[#6B523E] bg-[#2B2118]">
            <form onSubmit={handleSend} className="flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about careers, roadmaps, exams, or skills..."
                disabled={isAiTyping}
                className="flex-1 bg-[#362A1F] border border-[#6B523E] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#FAF7F2] placeholder-[#D8C7B0]/70 focus:outline-none focus:border-[#C9B79C] transition disabled:opacity-50"
              />

              <button
                type="submit"
                disabled={!inputMessage.trim() || isAiTyping}
                className="p-2.5 bg-[#6B4F3A] hover:bg-[#7E5D45] disabled:opacity-40 text-white rounded-xl transition cursor-pointer shadow-sm flex-shrink-0 uiverse-btn"
                title="Send Question"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <p className="text-[10px] text-[#E2D5C3] text-center mt-2 font-medium">
              AIspire AI Mentor provides academic &amp; career guidance. All advice is educational.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
