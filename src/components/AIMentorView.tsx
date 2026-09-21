import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Send,
  User,
  Award,
  MapPin,
  Trash2,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Download,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Compass,
  ArrowRight,
  BookOpen,
  Brain,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  animatePop,
  animateTypingWave,
  animateMessageIn,
  animatePromptCards,
  animateAuraSpin,
  animateCopySuccess,
} from '../utils/animations';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatInlineMarkdown(rawText: string): string {
  // 1. Escape unsafe HTML
  let text = escapeHtml(rawText);

  // 2. Markdown Links: [Title](url)
  text = text.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[#C9B79C] underline hover:text-[#FAF7F2] font-semibold transition inline-flex items-center gap-0.5">$1</a>'
  );

  // 3. Bold + Italic: ***text***
  text = text.replace(/\*\*\*(.*?)\*\*\*/g, '<strong class="font-extrabold text-[#FAF7F2] italic">$1</strong>');

  // 4. Bold: **text**
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-[#FAF7F2]">$1</strong>');

  // 5. Italic: *text* or _text_
  text = text.replace(/\*(.*?)\*/g, '<em class="italic text-[#E6DCCE]">$1</em>');
  text = text.replace(/_([^_]+)_/g, '<em class="italic text-[#E6DCCE]">$1</em>');

  // 6. Inline Code: `code`
  text = text.replace(
    /`([^`]+)`/g,
    '<code class="px-1.5 py-0.5 rounded bg-[#231A12] text-[#C9B79C] font-mono text-xs border border-[#523F30]">$1</code>'
  );

  return text;
}

/**
 * Lightweight safe Markdown renderer for structured AI mentor responses.
 */
const SafeMarkdown: React.FC<{ content: string }> = ({ content }) => {
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<number | null>(null);

  const handleCopyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIdx(idx);
    setTimeout(() => setCopiedCodeIdx(null), 2000);
  };

  // Split into code blocks and normal text blocks
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="chat-markdown space-y-3 leading-relaxed text-xs sm:text-sm text-[#FAF7F2]">
      {parts.map((part, pIdx) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const lines = part.slice(3, -3).trim().split('\n');
          const firstLine = lines[0].trim();
          const isLang = /^[a-zA-Z0-9_-]+$/.test(firstLine);
          const lang = isLang ? firstLine : '';
          const code = (isLang ? lines.slice(1) : lines).join('\n');

          return (
            <div
              key={pIdx}
              className="my-3 rounded-xl overflow-hidden border border-[#523F30] bg-[#231A12] shadow-lg"
            >
              <div className="flex items-center justify-between px-3.5 py-2 bg-[#2B2118] border-b border-[#523F30] text-[11px] text-[#C9B79C] font-mono">
                <span className="font-semibold uppercase tracking-wider">{lang || 'CODE'}</span>
                <button
                  onClick={() => handleCopyCode(code, pIdx)}
                  className="flex items-center gap-1 text-[#C9B79C] hover:text-[#FAF7F2] transition cursor-pointer"
                  title="Copy code"
                >
                  {copiedCodeIdx === pIdx ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#708E66]" />
                      <span className="text-[#708E66] font-semibold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3.5 text-xs text-[#E6DCCE] font-mono overflow-x-auto leading-relaxed bg-[#1E1610]">
                <code>{code}</code>
              </pre>
            </div>
          );
        }

        // Render normal markdown lines
        const rawLines = part.split('\n');
        return (
          <div key={pIdx} className="space-y-2">
            {rawLines.map((line, lIdx) => {
              const trimmed = line.trim();
              if (!trimmed) return <div key={lIdx} className="h-1" />;

              // Horizontal Rule
              if (/^(---|\*\*\*|___)$/.test(trimmed)) {
                return <hr key={lIdx} className="my-3 border-[#523F30]" />;
              }

              // Headings
              if (trimmed.startsWith('### ')) {
                return (
                  <h4 key={lIdx} className="text-xs sm:text-sm font-bold text-[#C9B79C] uppercase tracking-wider mt-3 mb-1">
                    {trimmed.replace(/^###\s+/, '')}
                  </h4>
                );
              }
              if (trimmed.startsWith('## ')) {
                return (
                  <h3 key={lIdx} className="text-sm sm:text-base font-bold text-[#FAF7F2] mt-3 mb-1">
                    {trimmed.replace(/^##\s+/, '')}
                  </h3>
                );
              }
              if (trimmed.startsWith('# ')) {
                return (
                  <h2 key={lIdx} className="text-base sm:text-lg font-extrabold text-[#FAF7F2] mt-4 mb-1">
                    {trimmed.replace(/^#\s+/, '')}
                  </h2>
                );
              }

              // Unordered List (- or *)
              if (/^[-*]\s+/.test(trimmed)) {
                const itemText = trimmed.replace(/^[-*]\s+/, '');
                return (
                  <div key={lIdx} className="flex items-start gap-2.5 pl-1 my-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C9B79C] mt-2 flex-shrink-0" />
                    <span
                      className="flex-1 leading-relaxed text-xs sm:text-sm text-[#FAF7F2]"
                      dangerouslySetInnerHTML={{
                        __html: formatInlineMarkdown(itemText),
                      }}
                    />
                  </div>
                );
              }

              // Ordered List (1., 2.)
              const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
              if (numMatch) {
                return (
                  <div key={lIdx} className="flex items-start gap-2 pl-1 my-1">
                    <span className="font-bold text-[#C9B79C] text-xs mt-0.5 flex-shrink-0 min-w-[1.25rem]">
                      {numMatch[1]}.
                    </span>
                    <span
                      className="flex-1 leading-relaxed text-xs sm:text-sm text-[#FAF7F2]"
                      dangerouslySetInnerHTML={{
                        __html: formatInlineMarkdown(numMatch[2]),
                      }}
                    />
                  </div>
                );
              }

              // Blockquotes (> )
              if (trimmed.startsWith('> ')) {
                return (
                  <blockquote
                    key={lIdx}
                    className="border-l-2 border-[#C9B79C] pl-3 py-1 my-2 text-[#C9B79C] italic text-xs sm:text-sm bg-[#2B2118]/50 rounded-r-lg"
                    dangerouslySetInnerHTML={{
                      __html: formatInlineMarkdown(trimmed.replace(/^>\s+/, '')),
                    }}
                  />
                );
              }

              // Standard Paragraph
              return (
                <p
                  key={lIdx}
                  className="leading-relaxed text-xs sm:text-sm text-[#FAF7F2]"
                  dangerouslySetInnerHTML={{
                    __html: formatInlineMarkdown(trimmed),
                  }}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export const AIMentorView: React.FC = () => {
  const {
    chatMessages,
    sendChatMessage,
    clearChat,
    isAiTyping,
    userProfile,
    selectedCareer,
    completedSteps,
    dimensionScores,
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return false;
  });
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const auraRef = useRef<HTMLDivElement>(null);
  const typingDotsRef = useRef<HTMLDivElement>(null);
  const promptGridRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  // Compute active roadmap step
  const activeCompleted = selectedCareer ? (completedSteps[selectedCareer.id] || []) : [];
  const currentStepNumber = activeCompleted.length < 10
    ? ([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].find((s) => !activeCompleted.includes(s)) || 1)
    : 10;
  const currentStep = selectedCareer?.roadmap?.[currentStepNumber - 1];

  // Highest cognitive dimension
  const topDimension = dimensionScores
    ? Object.entries(dimensionScores).reduce(
        (top, [dim, score]) => (score > top.score ? { dim, score } : top),
        { dim: 'analytical', score: 0 }
      )
    : null;

  // Auto-scroll to bottom of chat
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
    });
  }, []);

  // Animate aura spin on initial mount
  useEffect(() => {
    if (auraRef.current) {
      animateAuraSpin(auraRef.current);
    }
  }, []);

  // Animate typing dots wave whenever AI is typing
  useEffect(() => {
    if (isAiTyping && typingDotsRef.current) {
      const dots = typingDotsRef.current.querySelectorAll('.typing-dot');
      if (dots.length > 0) {
        animateTypingWave(dots);
      }
    }
  }, [isAiTyping]);

  // Animate prompt recommendation cards when on welcome screen
  useEffect(() => {
    if (chatMessages.length <= 1 && promptGridRef.current) {
      const cards = promptGridRef.current.querySelectorAll('.prompt-card');
      if (cards.length > 0) {
        animatePromptCards(cards);
      }
    }
  }, [chatMessages.length]);

  // Animate newly received message
  useEffect(() => {
    scrollToBottom();
    if (lastMessageRef.current) {
      animateMessageIn(lastMessageRef.current);
    }
  }, [chatMessages, scrollToBottom]);

  // Adjust textarea height on typing
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isAiTyping) return;

    const msg = inputMessage.trim();
    setInputMessage('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    await sendChatMessage(msg);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChipClick = (prompt: string, e?: React.MouseEvent) => {
    if (isAiTyping) return;
    if (e?.currentTarget) {
      animatePop(e.currentTarget);
    }
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
    sendChatMessage(prompt);
  };

  const handleCopyMessage = (msgId: string, text: string, e?: React.MouseEvent) => {
    if (e?.currentTarget) {
      animateCopySuccess(e.currentTarget);
    }
    navigator.clipboard.writeText(text);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleSpeakMessage = (msgId: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isSpeaking === msgId) {
      window.speechSynthesis.cancel();
      setIsSpeaking(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#`_>-]/g, ' ');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(null);
    utterance.onerror = () => setIsSpeaking(null);

    setIsSpeaking(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleExportChat = () => {
    const header = `# AIspire Career Counselling Session\nDate: ${new Date().toLocaleDateString()}\nStudent: ${userProfile?.name || 'Student'}\nCareer Focus: ${selectedCareer?.title || 'General'}\n\n---\n\n`;
    const body = chatMessages
      .map((m) => `### ${m.sender === 'user' ? 'You' : 'AIspire Mentor'} (${m.timestamp})\n\n${m.text}\n`)
      .join('\n---\n\n');

    const blob = new Blob([header + body], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AIspire-Mentor-Session-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleNewChat = async () => {
    setInputMessage('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(null);
    await clearChat();
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Starter recommendation cards for empty / welcome state
  const quickCards = [
    {
      icon: <Compass className="w-5 h-5 text-indigo-400" />,
      title: 'Cognitive & Aptitude Fit',
      description: `Evaluate why my ${topDimension ? `${topDimension.dim} aptitude` : 'cognitive test'} matches ${selectedCareer?.title || 'this field'}.`,
      prompt: `Based on my 7-dimensional cognitive test results, explain in detail why ${selectedCareer?.title || 'my recommended career path'} is a strong fit and where my biggest growth opportunities lie.`,
    },
    {
      icon: <MapPin className="w-5 h-5 text-cyan-400" />,
      title: `Break down Step ${currentStepNumber}`,
      description: currentStep
        ? `Concrete advice and weekly checklist for: ${currentStep.title}`
        : 'Actionable breakdown of your next roadmap milestone.',
      prompt: currentStep
        ? `Please break down Step ${currentStepNumber} ("${currentStep.title}") of my ${selectedCareer?.title} roadmap into actionable milestones, recommended practice tools, and common pitfalls to avoid.`
        : `How should I approach my next roadmap step for ${selectedCareer?.title}?`,
    },
    {
      icon: <BookOpen className="w-5 h-5 text-emerald-400" />,
      title: 'Academic & Exam Strategy',
      description: 'Which university majors, entrance exams, or certifications should I target?',
      prompt: `What university majors, standardized entrance exams, and foundational certifications are most valuable for becoming a successful ${selectedCareer?.title || 'professional in this domain'}?`,
    },
    {
      icon: <Brain className="w-5 h-5 text-amber-400" />,
      title: 'Portfolio & Capstone Projects',
      description: '3 standout project ideas to impress admission officers and recruiters.',
      prompt: `Suggest 3 distinctive, practical portfolio capstone projects for a student aiming for ${selectedCareer?.title}. Include what skills each project showcases.`,
    },
  ];

  return (
    <div id="mentor-workspace" className="mentor-workspace flex h-[calc(100vh-4rem)] w-full max-w-full bg-[#2B2118] text-[#FAF7F2] overflow-hidden relative min-w-0">
      {/* Background Ambience Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[700px] h-[500px] bg-[#6B4F3A]/15 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-[90vw] max-w-[400px] h-[400px] bg-[#C9B79C]/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Mobile Drawer Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      {/* ========================================================================= */}
      {/* LEFT SIDEBAR (ChatGPT / Gemini Style)                                     */}
      {/* ========================================================================= */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 lg:static lg:z-20 max-w-[85vw]
          border-r border-[#6B523E] bg-[#2B2118] flex flex-col transition-all duration-300
          ${
            isSidebarOpen
              ? 'w-72 sm:w-80 shadow-2xl lg:shadow-none translate-x-0'
              : 'w-0 -translate-x-full lg:translate-x-0 lg:w-0 overflow-hidden border-r-0'
          }
        `}
      >
        {/* Sidebar Header: New Chat Button */}
        <div className="p-3.5 border-b border-[#6B523E] flex items-center gap-2">
          <button
            onClick={() => {
              handleNewChat();
              if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                setIsSidebarOpen(false);
              }
            }}
            className="flex-1 py-2.5 px-3.5 rounded-xl bg-[#6B4F3A] hover:bg-[#7E5D45] text-[#FAF7F2] font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer uiverse-btn border border-[#826249]"
          >
            <Plus className="w-4 h-4" />
            <span>New Conversation</span>
          </button>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 text-[#C9B79C] hover:text-[#FAF7F2] rounded-xl hover:bg-[#362A1F] transition cursor-pointer"
            title="Collapse Sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* Student Active Context Pill */}
        <div className="p-3.5 border-b border-[#6B523E] bg-[#362A1F]/60 space-y-2">
          <div className="text-[10px] uppercase font-bold tracking-wider text-[#C9B79C] flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-[#C9B79C]" />
            <span>Student Context</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#2B2118] border border-[#6B523E] space-y-1.5 text-xs">
            <div className="font-semibold text-[#FAF7F2] truncate">
              {selectedCareer?.title || 'General Career Guidance'}
            </div>
            {topDimension && (
              <div className="text-[11px] text-[#E2D5C3] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C9B79C]" />
                <span>Top Strength: {topDimension.dim} ({Math.round(topDimension.score)}%)</span>
              </div>
            )}
            {currentStep && (
              <div className="text-[11px] text-emerald-400 flex items-center gap-1 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                <span className="truncate">Step {currentStepNumber}: {currentStep.title}</span>
              </div>
            )}
          </div>
        </div>

        {/* Recommended Discussion Starters */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          <div className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider text-[#C9B79C]">
            Guided Career Topics
          </div>

          {[
            { label: 'Aptitude & Fit Analysis', prompt: 'How does my cognitive profile align with my top career choices?' },
            { label: 'Step-by-Step Roadmap', prompt: `Walk me through the most critical phases of the ${selectedCareer?.title || 'recommended'} roadmap.` },
            { label: 'College & Major Selection', prompt: 'What university majors or specialized degrees provide the highest ROI for this career?' },
            { label: 'Industry Salary Benchmarks', prompt: `What is the entry-level to senior salary progression for ${selectedCareer?.title}?` },
            { label: 'Exam & Skill Strategies', prompt: 'What competitive exams or core technical skills should I focus on first?' },
          ].map((topic, tIdx) => (
            <button
              key={tIdx}
              onClick={(e) => handleChipClick(topic.prompt, e)}
              className="w-full text-left p-2 rounded-xl text-xs text-[#E6DCCE] hover:text-[#FAF7F2] hover:bg-[#362A1F] border border-transparent hover:border-[#6B523E] transition flex items-center justify-between group cursor-pointer"
            >
              <span className="truncate pr-2">{topic.label}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#C9B79C]/60 group-hover:text-[#FAF7F2] group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
            </button>
          ))}
        </div>

        {/* Sidebar Footer Actions */}
        <div className="p-3 border-t border-[#6B523E] bg-[#231A12] flex items-center justify-between text-xs text-[#C9B79C]">
          <button
            onClick={handleExportChat}
            className="flex items-center gap-1.5 p-2 rounded-lg hover:bg-[#362A1F] hover:text-[#FAF7F2] transition cursor-pointer"
            title="Download conversation transcript as Markdown"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="text-[11px]">Export</span>
          </button>
          <button
            onClick={handleNewChat}
            className="flex items-center gap-1.5 p-2 rounded-lg hover:bg-rose-500/10 hover:text-rose-400 transition cursor-pointer"
            title="Clear chat history"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="text-[11px]">Clear</span>
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MAIN CHAT WORKSPACE (Gemini & ChatGPT Layout)                             */}
      {/* ========================================================================= */}
      <main className="flex-1 flex flex-col h-full w-full max-w-full min-w-0 overflow-hidden relative">
        {/* Chat Workspace Utility Toolbar */}
        <div className="h-11 border-b border-[#6B523E] px-3 sm:px-6 flex items-center justify-between bg-[#231A12]/80 backdrop-blur-sm z-10 flex-shrink-0 w-full max-w-full min-w-0">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Sidebar toggle button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-[#C9B79C] hover:text-[#FAF7F2] hover:bg-[#362A1F] border border-[#6B523E] transition cursor-pointer"
              title={isSidebarOpen ? 'Collapse Topics & History' : 'Open Topics & History'}
            >
              {isSidebarOpen ? <PanelLeftClose className="w-3.5 h-3.5" /> : <PanelLeftOpen className="w-3.5 h-3.5" />}
              <span className="text-[11px] hidden sm:inline">{isSidebarOpen ? 'Hide History' : 'Topics & History'}</span>
            </button>

            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#708E66]/15 text-[#708E66] border border-[#708E66]/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#708E66]" />
              <span>Mentor Ready</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {selectedCareer && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#2B2118] border border-[#6B523E] text-[#E2D5C3] text-xs font-medium">
                <span className="text-[10px] uppercase font-bold text-[#E2D5C3]">Focus:</span>
                <span className="text-[#FAF7F2] font-semibold truncate max-w-[150px]">
                  {selectedCareer.title}
                </span>
              </div>
            )}

            <button
              onClick={handleNewChat}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#6B4F3A] hover:bg-[#7E5D45] text-[#FAF7F2] text-xs font-semibold border border-[#826249] transition cursor-pointer shadow-xs"
              title="Start a fresh conversation"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Chat</span>
            </button>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 w-full max-w-full min-w-0">
          <div className="w-full max-w-3xl mx-auto space-y-6 min-w-0">
            {/* ============================================================= */}
            {/* HERO WELCOME SCREEN (When chat has only default greeting)       */}
            {/* ============================================================= */}
            {chatMessages.length <= 1 && (
              <div className="pt-4 pb-8 text-center space-y-6 animate-fadeIn">
                <div className="relative inline-block mx-auto">
                  {/* Rotating Gradient Aura */}
                  <div
                    ref={auraRef}
                    className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-[#6B4F3A]/35 via-[#C9B79C]/30 to-[#FAF7F2]/15 blur-xl pointer-events-none"
                  />
                  <div className="relative w-20 h-20 rounded-3xl bg-[#FAF7F2] p-2.5 mx-auto shadow-2xl border border-[#6B523E] flex items-center justify-center">
                    <img src="/logo.png" alt="AIspire" className="w-full h-full object-contain" />
                  </div>
                </div>

                <div className="space-y-2 max-w-xl mx-auto">
                  <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight gemini-gradient-text">
                    Where would you like to take your career today,{' '}
                    {userProfile?.name?.split(' ')[0] || 'Student'}?
                  </h1>
                  <p className="text-xs sm:text-sm text-[#E2D5C3] leading-relaxed">
                    I am your AIspire Career Counsellor. I analyze your 7-dimensional cognitive scores, explore verified career pathways, and guide you through your 10-step roadmap.
                  </p>
                </div>

                {/* 2x2 Quick Recommendation Grid */}
                <div
                  ref={promptGridRef}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-2xl mx-auto pt-2"
                >
                  {quickCards.map((card, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => handleChipClick(card.prompt, e)}
                      className="prompt-card mentor-prompt-card p-4 text-left rounded-2xl transition-all group cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 rounded-xl bg-[#2B2118] border border-[#6B523E] group-hover:scale-110 transition-transform">
                          {card.icon}
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#E2D5C3] group-hover:text-[#FAF7F2] group-hover:translate-x-1 transition-transform" />
                      </div>
                      <div className="font-bold text-xs sm:text-sm text-[#FAF7F2] group-hover:text-white transition">
                        {card.title}
                      </div>
                      <p className="text-[11px] text-[#E2D5C3] mt-1 leading-relaxed line-clamp-2">
                        {card.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ============================================================= */}
            {/* MESSAGE THREAD (When conversation has started)               */}
            {/* ============================================================= */}
            {chatMessages.length > 1 && chatMessages.map((msg, idx) => {
              const isUser = msg.sender === 'user';
              const isLast = idx === chatMessages.length - 1;

              return (
                <div
                  key={msg.id}
                  ref={isLast ? lastMessageRef : null}
                  className={`flex gap-3 sm:gap-4 ${isUser ? 'justify-end' : 'justify-start'} w-full max-w-full min-w-0`}
                >
                  {/* AI Avatar (Gemini style) */}
                  {!isUser && (
                    <div className="w-8 h-8 rounded-xl bg-[#FAF7F2] p-1 flex items-center justify-center shadow-md border border-[#6B523E] flex-shrink-0 mt-1">
                      <img src="/logo.png" alt="AI Mentor" className="w-full h-full object-contain" />
                    </div>
                  )}

                  {/* Message Bubble & Content */}
                  <div
                    className={`flex flex-col min-w-0 ${
                      isUser ? 'items-end max-w-[85%] sm:max-w-[75%]' : 'items-start flex-1 w-full max-w-full'
                    }`}
                  >
                    <div
                      className={`leading-relaxed break-words overflow-hidden max-w-full ${
                        isUser
                          ? 'bg-[#6B4F3A] text-[#FAF7F2] shadow-md text-xs sm:text-sm border border-[#826249] rounded-2xl rounded-br-xs p-3.5 sm:p-4'
                          : 'mentor-ai-bubble w-full bg-[#362A1F] border border-[#6B523E] text-[#FAF7F2] p-4 sm:p-5 rounded-2xl shadow-sm'
                      }`}
                    >
                      {isUser ? (
                        <div className="whitespace-pre-wrap break-words">{msg.text}</div>
                      ) : (
                        <SafeMarkdown content={msg.text} />
                      )}

                      {/* Suggested prompts below AI message */}
                      {!isUser && msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
                        <div className="pt-3.5 mt-3.5 border-t border-[#6B523E] flex flex-wrap gap-2">
                          {msg.suggestedPrompts.map((p, pIdx) => (
                            <button
                              key={pIdx}
                              onClick={(e) => handleChipClick(p, e)}
                              className="text-xs bg-[#2B2118] hover:bg-[#362A1F] text-[#FAF7F2] border border-[#6B523E] hover:border-[#C9B79C]/50 px-3 py-1.5 rounded-xl text-left transition cursor-pointer uiverse-btn flex items-center gap-1.5"
                            >
                              <Sparkles className="w-3 h-3 text-[#C9B79C] flex-shrink-0" />
                              <span>{p}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action Toolbar on AI Response */}
                    {!isUser && (
                      <div className="flex items-center gap-2 mt-2 px-1 text-[#C9B79C] text-xs">
                        <button
                          onClick={(e) => handleCopyMessage(msg.id, msg.text, e)}
                          className="flex items-center gap-1 p-1 hover:text-[#FAF7F2] transition cursor-pointer rounded"
                          title="Copy response to clipboard"
                        >
                          {copiedMsgId === msg.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-[#708E66]" />
                              <span className="text-[11px] text-[#708E66] font-semibold">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span className="text-[11px]">Copy</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleSpeakMessage(msg.id, msg.text)}
                          className="flex items-center gap-1 p-1 hover:text-[#FAF7F2] transition cursor-pointer rounded"
                          title={isSpeaking === msg.id ? 'Stop audio' : 'Listen to guidance'}
                        >
                          {isSpeaking === msg.id ? (
                            <>
                              <VolumeX className="w-3.5 h-3.5 text-[#C0584D]" />
                              <span className="text-[11px] text-[#C0584D]">Stop</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5" />
                              <span className="text-[11px]">Listen</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* User Avatar */}
                  {isUser && (
                    <div className="w-8 h-8 rounded-xl bg-[#6B4F3A] border border-[#C9B79C]/40 flex items-center justify-center text-[#FAF7F2] text-xs font-bold shadow-md flex-shrink-0 mt-1">
                      {userProfile?.avatarUrl ? (
                        <img
                          src={userProfile.avatarUrl}
                          alt="User"
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* AI Typing Indicator (Sinusoidal Anime.js wave) */}
            {isAiTyping && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#FAF7F2] p-1 flex items-center justify-center shadow-md border border-[#6B523E] flex-shrink-0">
                  <img src="/logo.png" alt="AI Mentor" className="w-full h-full object-contain" />
                </div>
                <div className="mentor-typing-bubble py-3 px-4 rounded-2xl flex items-center gap-3 border border-[#6B523E]">
                  <div ref={typingDotsRef} className="flex items-center gap-1.5 h-5">
                    <span className="typing-dot w-2 h-2 rounded-full bg-[#C9B79C]" />
                    <span className="typing-dot w-2 h-2 rounded-full bg-[#FAF7F2]" />
                    <span className="typing-dot w-2 h-2 rounded-full bg-[#6B4F3A]" />
                  </div>
                  <span className="text-xs text-[#FAF7F2] font-medium">
                    Synthesizing personalized guidance...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} className="h-6" />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* FLOATING BOTTOM COMPOSER (ChatGPT / Gemini Style)                         */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-6 bg-gradient-to-t from-[#2B2118] via-[#2B2118]/95 to-transparent z-10 w-full max-w-full min-w-0">
          <div className="w-full max-w-3xl mx-auto space-y-2 min-w-0">
            {/* Quick Action Chips directly above composer */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar max-w-full">
              {[
                'Explain simply',
                `Tips for Step ${currentStepNumber}`,
                'Suggest portfolio project',
                'Recommended entrance exams',
              ].map((chip, cIdx) => (
                <button
                  key={cIdx}
                  onClick={(e) => handleChipClick(chip, e)}
                  disabled={isAiTyping}
                  className="px-2.5 py-1 rounded-full bg-[#362A1F] hover:bg-[#453527] text-[#FAF7F2] border border-[#6B523E] hover:border-[#C9B79C]/40 text-[11px] font-medium whitespace-nowrap transition cursor-pointer uiverse-btn disabled:opacity-50"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input Capsule */}
            <div className="relative rounded-2xl bg-[#362A1F]/90 border border-[#6B523E] shadow-2xl backdrop-blur-xl focus-within:border-[#C9B79C] focus-within:ring-2 focus-within:ring-[#C9B79C]/20 transition-all w-full max-w-full">
              <form onSubmit={handleSend} className="flex items-end p-2 sm:p-3 gap-2">
                <textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyDown}
                  placeholder={`Ask AI Mentor anything about ${selectedCareer?.title || 'your career'}...`}
                  disabled={isAiTyping}
                  rows={1}
                  className="mentor-input-textarea flex-1 bg-transparent border-none text-xs sm:text-sm text-[#FAF7F2] placeholder-[#D8C7B0]/70 focus:outline-none focus:ring-0 resize-none px-2 py-1.5 max-h-40 overflow-y-auto leading-relaxed shadow-none"
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    outline: 'none',
                    boxShadow: 'none',
                    color: '#FAF7F2',
                  }}
                />

                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isAiTyping}
                  className="p-2.5 bg-[#6B4F3A] hover:bg-[#7E5D45] disabled:opacity-40 disabled:hover:bg-[#6B4F3A] text-[#FAF7F2] rounded-xl transition cursor-pointer shadow-md flex-shrink-0 border border-[#826249] flex items-center justify-center uiverse-btn"
                  title="Send message (Enter)"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Minimalist Educational Notice */}
            <p className="text-[10px] text-[#E2D5C3] text-center font-medium">
              AIspire Career Mentor synthesizes educational &amp; vocational insights. Verify key academic milestones with official school and exam bodies.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
