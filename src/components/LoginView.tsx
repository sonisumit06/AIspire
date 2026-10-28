import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Brain,
  Map,
  BookOpen,
  Lock,
  ExternalLink,
  AlertCircle,
  HelpCircle,
  Loader2,
  Compass,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { isSupabaseConfigured } from '../services/supabase';
import { animateEntrance } from '../utils/animations';

export const LoginView: React.FC = () => {
  const { loginWithGoogle, loginAsGuest, authError, resetDemoState } = useApp();

  const [isLoading, setIsLoading] = useState(false);
  const [showConfigHelp, setShowConfigHelp] = useState(!isSupabaseConfigured());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      animateEntrance('.login-animate-item', {
        stagger: 90,
        translateY: [24, 0],
        duration: 700,
      });
    }
  }, []);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
    } finally {
      // In OAuth redirect flows, window navigates, but reset loader if error or cancelled
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full max-w-full overflow-x-hidden flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-[#6B4F3A]/15 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-[#C9B79C]/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div ref={containerRef} className="w-full max-w-4xl min-w-0 mx-auto space-y-10">
        {/* Hero Section */}
        <div className="login-animate-item text-center space-y-4 max-w-3xl mx-auto">
          {/* Official AIspire Logo */}
          <div className="flex justify-center mb-2">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-[#FAF7F2] p-2.5 shadow-2xl border border-[#6B523E] flex items-center justify-center hover:scale-105 transition-transform duration-300">
              <img
                src="/logo.png"
                alt="AIspire - Discover a Brighter You"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#6B4F3A]/25 border border-[#C9B79C]/30 text-[#C9B79C] text-xs font-semibold shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-[#C9B79C]" />
            <span>Production Cloud Career Guidance Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#FAF7F2] leading-tight">
            Discover Your True Calling.{' '}
            <span className="bg-gradient-to-r from-[#FAF7F2] via-[#C9B79C] to-[#FAF7F2] bg-clip-text text-transparent">
              Master the 10-Step Roadmap.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-[#E2D5C3] max-w-2xl mx-auto leading-relaxed">
            AIspire pairs a 20-question cognitive aptitude assessment with transparent mathematical matching, customized 10-step career roadmaps, and an intelligent study &amp; exam resource search engine.
          </p>
        </div>

        {/* Authentication Card */}
        <div className="login-animate-item w-full max-w-md min-w-0 mx-auto uiverse-card bg-[#231A12] border border-[#6B523E] p-6 sm:p-8 space-y-6 rounded-3xl shadow-2xl">
          <div className="text-center space-y-1.5">
            <div className="w-12 h-12 rounded-2xl bg-white p-1.5 mx-auto mb-3 shadow-md border border-[#6B523E] flex items-center justify-center">
              <img src="/logo.png" alt="AIspire" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-xl font-bold text-[#FAF7F2]">Student Access</h2>
            <p className="text-xs text-[#E2D5C3]">
              Sign in with Google for cloud synchronization, or continue as a guest instantly.
            </p>
          </div>

          {/* Error Alert if any */}
          {authError && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs space-y-2.5">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <div className="font-bold text-rose-300">Connection or Configuration Notice</div>
              </div>
              <p className="text-[11px] leading-relaxed text-[#E2D5C3] pl-6.5">
                {authError}
              </p>
              <div className="pl-6.5 pt-1">
                <button
                  type="button"
                  onClick={() => loginAsGuest(false)}
                  className="inline-flex items-center gap-1.5 text-xs text-cyan-300 hover:text-cyan-200 font-bold underline cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Launch Instant Guest Mode (No Cloud Setup Needed) &rarr;</span>
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Google OAuth Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="uiverse-btn w-full py-3.5 px-5 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm tracking-wide shadow-xl flex items-center justify-center gap-3 cursor-pointer border border-slate-200 disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                  <span>Connecting to Google...</span>
                </>
              ) : (
                <>
                  {/* Official Google G Logo */}
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.98 0 12s.45 3.84 1.24 5.42l4.04-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            {/* Visual Divider */}
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-[#6B523E]" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#E2D5C3]">or</span>
              <div className="flex-1 h-px bg-[#6B523E]" />
            </div>

            {/* Instant Guest Access Button */}
            <button
              type="button"
              onClick={() => loginAsGuest(false)}
              className="uiverse-btn w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-[#362A1F] to-[#2B2118] hover:from-[#433527] hover:to-[#362A1F] text-[#FAF7F2] font-semibold text-xs sm:text-sm tracking-wide border border-[#6B523E] hover:border-[#C9B79C] shadow-lg flex items-center justify-between transition-all cursor-pointer group"
            >
              <span className="flex items-center gap-2.5">
                <Compass className="w-4 h-4 text-[#C9B79C] group-hover:rotate-45 transition-transform duration-300" />
                <span>Continue as Guest (Instant Access)</span>
              </span>
              <ArrowRight className="w-4 h-4 text-[#C9B79C] group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Fresh Assessment Demo Launcher */}
            <button
              type="button"
              onClick={() => loginAsGuest(false, true)}
              className="uiverse-btn w-full py-2.5 px-4 rounded-xl bg-[#2B2118] hover:bg-[#382B20] text-[#E2D5C3] hover:text-[#FAF7F2] font-medium text-xs border border-[#6B523E] hover:border-[#C9B79C] flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Start Fresh Assessment from Question 1</span>
            </button>
          </div>

          {/* Quick Demo Reset Trigger */}
          <div className="pt-1 text-center">
            <button
              type="button"
              onClick={async () => {
                await resetDemoState();
                window.location.reload();
              }}
              className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold underline inline-flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Erase all saved demo data &amp; clean browser cache</span>
            </button>
          </div>

          {/* Privacy & RLS Guarantee */}
          <div className="pt-2 text-center text-[11px] text-[#E2D5C3] space-y-1.5">
            <div className="flex items-center justify-center gap-1 text-[#FAF7F2] font-semibold">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Row-Level Encrypted Identity &amp; Local Persistence</span>
            </div>
            <p className="text-[#E2D5C3]">
              Your assessment and roadmap records are automatically preserved offline in local storage and synced to Supabase when authenticated.
            </p>
          </div>

          {/* Setup / Configuration Help Toggle */}
          <div className="pt-2 border-t border-[#6B523E]">
            <button
              type="button"
              onClick={() => setShowConfigHelp((prev) => !prev)}
              className="w-full flex items-center justify-between text-xs text-amber-400 hover:text-amber-300 font-semibold p-1 cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Supabase Configuration &amp; DNS Guide</span>
              </span>
              <span className="text-[10px] uppercase font-bold">
                {showConfigHelp ? 'Hide' : 'Setup Guide'}
              </span>
            </button>

            {showConfigHelp && (
              <div className="mt-3 p-3.5 rounded-2xl bg-[#2B2118] border border-amber-500/30 text-xs text-[#FAF7F2] space-y-2 leading-relaxed">
                <p className="font-bold text-amber-300">
                  Supabase Backend &amp; DNS Setup:
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-[#E2D5C3]">
                  <li>
                    Create or verify your project at{' '}
                    <a
                      href="https://supabase.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 underline inline-flex items-center gap-0.5"
                    >
                      supabase.com <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </li>
                  <li>
                    Verify that your project status in the Supabase Dashboard is <strong>Active</strong> (not paused or deleted).
                  </li>
                  <li>
                    Execute the database schema in{' '}
                    <code className="text-amber-200">supabase/schema.sql</code> in the SQL Editor.
                  </li>
                  <li>
                    Enable Google Auth under <strong>Authentication &gt; Providers &gt; Google</strong> with your Client ID &amp; Secret.
                  </li>
                  <li>
                    Check your <code className="text-amber-200">.env</code> file: ensure <code className="text-amber-200">VITE_SUPABASE_URL</code> matches your active project ID exactly without typos.
                  </li>
                </ol>
              </div>
            )}
          </div>
        </div>

        {/* Value Pillars Footer */}
        <div className="login-animate-item grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="uiverse-card bg-[#231A12] border border-[#6B523E] p-4 text-center">
            <Brain className="w-5 h-5 text-[#C9B79C] mx-auto mb-2" />
            <div className="font-semibold text-xs text-[#FAF7F2]">20-Question Aptitude</div>
            <p className="text-[11px] text-[#E2D5C3] mt-1">Multi-dimensional cognitive analysis</p>
          </div>
          <div className="uiverse-card bg-[#231A12] border border-[#6B523E] p-4 text-center">
            <ShieldCheck className="w-5 h-5 text-[#C9B79C] mx-auto mb-2" />
            <div className="font-semibold text-xs text-[#FAF7F2]">Google OAuth 2.0</div>
            <p className="text-[11px] text-[#E2D5C3] mt-1">Verified user ID security</p>
          </div>
          <div className="uiverse-card bg-[#231A12] border border-[#6B523E] p-4 text-center">
            <Map className="w-5 h-5 text-[#C9B79C] mx-auto mb-2" />
            <div className="font-semibold text-xs text-[#FAF7F2]">10-Step Roadmaps</div>
            <p className="text-[11px] text-[#E2D5C3] mt-1">Cloud synchronized progress</p>
          </div>
          <div className="uiverse-card bg-[#231A12] border border-[#6B523E] p-4 text-center">
            <BookOpen className="w-5 h-5 text-[#C9B79C] mx-auto mb-2" />
            <div className="font-semibold text-xs text-[#FAF7F2]">Study &amp; Exam Hub</div>
            <p className="text-[11px] text-[#E2D5C3] mt-1">Google, Notes &amp; YouTube links</p>
          </div>
        </div>
      </div>
    </div>
  );
};
