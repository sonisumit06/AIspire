import React, { useState } from 'react';
import {
  User,
  Shield,
  Palette,
  CheckCircle2,
  Trash2,
  LogOut,
  GraduationCap,
  Copy,
  Check,
  Moon,
  Sun,
  Laptop,
  Database,
  Info,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { AppTheme } from '../context/AppContext';
import { useButtonMotion } from '../hooks/useMotion';

const EDUCATION_OPTIONS = [
  'High School (9th - 10th Grade)',
  'High School (11th - 12th Grade)',
  'Undergraduate / College Student',
  'Graduate / Master’s Student',
  'Early Career / Transitioning Professional',
];

const INTEREST_OPTIONS = [
  'Artificial Intelligence',
  'Software & Web Development',
  'Data Science & Analytics',
  'UI/UX & Product Design',
  'Biotechnology & Medicine',
  'Finance & Quantitative Trading',
  'Business & Leadership',
  'Robotics & Hardware',
  'Content & Creative Arts',
];

export const SettingsView: React.FC = () => {
  const { handlePress } = useButtonMotion();
  const {
    userProfile,
    authUser,
    logout,
    updateProfilePreferences,
    theme,
    setTheme,
    clearLocalCache,
    clearChat,
    syncStatus,
    lastSyncError,
  } = useApp();

  // Profile preferences state
  const [educationLevel, setEducationLevel] = useState(
    userProfile?.educationLevel || EDUCATION_OPTIONS[2]
  );
  const [interests, setInterests] = useState<string[]>(
    userProfile?.interests || []
  );
  const [targetGoals, setTargetGoals] = useState(
    userProfile?.targetGoals || ''
  );

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const toggleInterest = (item: string) => {
    setInterests((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfilePreferences({
        educationLevel,
        interests,
        targetGoals,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update preferences:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const copyUserId = () => {
    if (!authUser?.id) return;
    navigator.clipboard.writeText(authUser.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-w-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#FAF7F2] tracking-tight">
          Account &amp; Platform Settings
        </h1>
        <p className="text-sm text-[#C9B79C] mt-1">
          Manage your student identity, educational background, platform appearance, and privacy.
        </p>
      </div>

      {/* 1. Account Section */}
      <section className="bg-[#231A12] border border-[#6B523E] rounded-2xl p-5 sm:p-7 shadow-xl space-y-6 uiverse-card w-full max-w-full min-w-0">
        <div className="flex items-center gap-3 border-b border-[#6B523E] pb-4">
          <div className="w-9 h-9 rounded-xl bg-[#6B4F3A]/40 text-[#C9B79C] flex items-center justify-center border border-[#C9B79C]/30">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#FAF7F2]">
              Student Account
            </h2>
            <p className="text-xs text-[#E2D5C3]">
              Google Account details authenticated via Supabase
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          {userProfile?.avatarUrl ? (
            <img
              src={userProfile.avatarUrl}
              alt={userProfile.name}
              className="w-16 h-16 rounded-full border-2 border-[#6B523E] object-cover ring-2 ring-[#6B4F3A]/40"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-[#2B2118] border border-[#6B523E] flex items-center justify-center text-[#C9B79C] text-xl font-bold">
              {(userProfile?.name || 'S').charAt(0).toUpperCase()}
            </div>
          )}

          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-[#FAF7F2]">
                {userProfile?.name || 'Student'}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#6B4F3A]/40 text-[#C9B79C] border border-[#C9B79C]/30">
                Verified
              </span>
            </div>
            <p className="text-xs text-[#E2D5C3]">
              {userProfile?.email || 'No email associated'}
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] text-[#E2D5C3] font-mono">
                Student ID: {authUser?.id ? `${authUser.id.slice(0, 8)}...${authUser.id.slice(-6)}` : 'Local Session'}
              </span>
              {authUser?.id && (
                <button
                  type="button"
                  onClick={copyUserId}
                  className="text-[11px] text-[#C9B79C] hover:text-[#FAF7F2] flex items-center gap-1 transition cursor-pointer"
                  title="Copy full User ID"
                >
                  {copiedId ? <Check className="w-3 h-3 text-[#C9B79C]" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedId ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Profile & Career Preferences */}
      <section className="bg-[#231A12] border border-[#6B523E] rounded-2xl p-5 sm:p-7 shadow-xl space-y-6 uiverse-card w-full max-w-full min-w-0">
        <div className="flex items-center gap-3 border-b border-[#6B523E] pb-4">
          <div className="w-9 h-9 rounded-xl bg-[#6B4F3A]/40 text-[#C9B79C] flex items-center justify-center border border-[#C9B79C]/30">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#FAF7F2]">
              Profile &amp; Career Preferences
            </h2>
            <p className="text-xs text-[#E2D5C3]">
              These factors directly influence your Interest Alignment score (15%) in career recommendations
            </p>
          </div>
        </div>

        <form onSubmit={handleSavePreferences} className="space-y-5">
          {/* Education Level */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#FAF7F2] block">
              Education Stage
            </label>
            <select
              value={educationLevel}
              onChange={(e) => setEducationLevel(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#2B2118] border border-[#6B523E] rounded-xl text-xs sm:text-sm text-[#FAF7F2] focus:outline-none focus:border-[#C9B79C] transition cursor-pointer"
            >
              {EDUCATION_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Interests */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#FAF7F2] block">
              Primary Academic &amp; Professional Interests
            </label>
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map((item) => {
                const isSelected = interests.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleInterest(item)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer border uiverse-btn ${
                      isSelected
                        ? 'bg-[#6B4F3A] text-[#FAF7F2] border-[#C9B79C]/60 shadow-sm'
                        : 'bg-[#2B2118] text-[#E2D5C3] border-[#6B523E] hover:border-[#C9B79C] hover:text-[#FAF7F2]'
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target Goals */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#FAF7F2] block">
              Target Career Goals &amp; Aspirations
            </label>
            <textarea
              value={targetGoals}
              onChange={(e) => setTargetGoals(e.target.value)}
              rows={3}
              placeholder="e.g. Build machine learning systems, launch a medical device startup, or crack software engineering interviews."
              className="w-full px-3.5 py-2.5 bg-[#2B2118] border border-[#6B523E] rounded-xl text-xs sm:text-sm text-[#FAF7F2] placeholder-[#D8C7B0]/70 focus:outline-none focus:border-[#C9B79C] transition resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {saveSuccess ? (
              <span className="text-xs text-[#C9B79C] flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-4 h-4" /> Preferences saved and synced!
              </span>
            ) : (
              <span className="text-[11px] text-[#E2D5C3]">
                Changes persist to your secure cloud profile.
              </span>
            )}

            <button
              type="submit"
              disabled={isSaving}
              onClick={(e) => handlePress(e)}
              className="px-5 py-2.5 bg-[#6B4F3A] hover:bg-[#7E5D45] disabled:opacity-50 text-[#FAF7F2] rounded-xl text-xs font-semibold shadow-md transition cursor-pointer border border-[#C9B79C]/40 uiverse-btn"
            >
              {isSaving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </form>
      </section>

      {/* 3. Appearance */}
      <section className="bg-[#231A12] border border-[#6B523E] rounded-2xl p-5 sm:p-7 shadow-xl space-y-6 uiverse-card w-full max-w-full min-w-0">
        <div className="flex items-center gap-3 border-b border-[#6B523E] pb-4">
          <div className="w-9 h-9 rounded-xl bg-[#6B4F3A]/40 text-[#C9B79C] flex items-center justify-center border border-[#C9B79C]/30">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#FAF7F2]">
              Appearance
            </h2>
            <p className="text-xs text-[#E2D5C3]">
              Customize how AIspire looks on this device
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(
            [
              { id: 'dark', label: 'Dark Mode', icon: Moon, desc: 'Deep espresso & mocha palette' },
              { id: 'light', label: 'Light Mode', icon: Sun, desc: 'Warm alabaster & cream interface' },
              { id: 'system', label: 'System', icon: Laptop, desc: 'Match operating system' },
            ] as const
          ).map((item) => {
            const isSelected = theme === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTheme(item.id as AppTheme)}
                className={`p-4 rounded-xl border text-left transition cursor-pointer uiverse-btn ${
                  isSelected
                    ? 'bg-[#2B2118] border-[#C9B79C] text-[#FAF7F2] shadow-md ring-1 ring-[#C9B79C]/40'
                    : 'bg-[#2B2118] border-[#6B523E] hover:border-[#8C6D53] text-[#E2D5C3]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-[#C9B79C]' : 'text-[#E2D5C3]'}`} />
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#C9B79C]" />}
                </div>
                <div className="text-xs font-semibold text-[#FAF7F2]">{item.label}</div>
                <div className="text-[11px] text-[#E2D5C3] mt-0.5">{item.desc}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. AI Mentor Informational Section */}
      <section className="bg-[#231A12] border border-[#6B523E] rounded-2xl p-6 sm:p-7 shadow-xl space-y-4 uiverse-card w-full max-w-full min-w-0">
        <div className="flex items-center gap-3 border-b border-[#6B523E] pb-4">
          <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] p-1 flex items-center justify-center shadow-sm border border-[#6B523E]">
            <img src="/logo.png" alt="AIspire Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#FAF7F2]">
              AI Career Mentor Service
            </h2>
            <p className="text-xs text-[#E2D5C3]">
              Managed application-level guidance and safety controls
            </p>
          </div>
        </div>

        <div className="bg-[#2B2118] border border-[#6B523E] rounded-xl p-4 text-xs text-[#FAF7F2] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-[#C9B79C] font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>AI Mentor Engine: Active &amp; Server-Managed</span>
              </div>
              <p className="leading-relaxed text-[#E2D5C3] mt-1">
                Responses are synthesized using your profile information, 7-dimensional assessment scores, and active career roadmap.
              </p>
            </div>

            <button
              type="button"
              onClick={async () => {
                if (window.confirm('Clear your AI Career Mentor chat history? This will delete saved conversations from the cloud.')) {
                  await clearChat();
                }
              }}
              className="px-3.5 py-2 bg-[#231A12] hover:bg-[#382B20] text-[#FAF7F2] border border-[#6B523E] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition flex-shrink-0 cursor-pointer shadow-xs uiverse-btn"
            >
              <Trash2 className="w-3.5 h-3.5 text-[#C9B79C]" />
              <span>Clear Chat History</span>
            </button>
          </div>

          <div className="flex items-start gap-2 text-[11px] text-[#E2D5C3] pt-2 border-t border-[#6B523E]">
            <Info className="w-3.5 h-3.5 text-[#C9B79C] flex-shrink-0 mt-0.5" />
            <span>
              AIspire enforces strict student safety controls. Queries regarding sexually explicit material, medical diagnoses, legal representations, or financial speculations are filtered to maintain an authentic educational environment.
            </span>
          </div>
        </div>
      </section>

      {/* 5. Data & Privacy */}
      <section className="bg-[#231A12] border border-[#6B523E] rounded-2xl p-6 sm:p-7 shadow-xl space-y-6 uiverse-card w-full max-w-full min-w-0">
        <div className="flex items-center gap-3 border-b border-[#6B523E] pb-4">
          <div className="w-9 h-9 rounded-xl bg-[#6B4F3A]/40 text-[#C9B79C] flex items-center justify-center border border-[#C9B79C]/30">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#FAF7F2]">
              Data, Security &amp; Privacy
            </h2>
            <p className="text-xs text-[#E2D5C3]">
              Transparent review of your data and cloud synchronization
            </p>
          </div>
        </div>

        {/* Live Cloud Sync Indicator */}
        <div className="p-4 bg-[#2B2118] rounded-xl border border-[#6B523E] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 min-w-0">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full flex-shrink-0 ${
                syncStatus === 'synced'
                  ? 'bg-[#C9B79C] shadow-sm shadow-[#C9B79C]/50'
                  : syncStatus === 'saving'
                  ? 'bg-amber-400 animate-pulse'
                  : syncStatus === 'offline'
                  ? 'bg-[#C9B79C]'
                  : 'bg-rose-400'
              }`}
            />
            <div>
              <span className="text-xs font-semibold text-[#FAF7F2] block">
                {syncStatus === 'synced' && 'Cloud Sync Status: Active & Synced'}
                {syncStatus === 'saving' && 'Cloud Sync Status: Synchronizing changes...'}
                {syncStatus === 'offline' && 'Cloud Sync Status: Local / Offline Mode'}
                {syncStatus === 'error' && 'Cloud Sync Status: Sync Error Detected'}
              </span>
              <span className="text-[11px] text-[#E2D5C3] block">
                {syncStatus === 'synced' && 'All assessment progress, roadmap steps, bookmarks, and chats are safely persisted in Supabase.'}
                {syncStatus === 'saving' && 'Persisting your latest interactions to your cloud account...'}
                {syncStatus === 'offline' && 'Changes are saved to your local browser storage. Connect to internet & Supabase for cloud sync.'}
                {syncStatus === 'error' && (lastSyncError || 'A cloud mutation could not be completed. Local offline state is retained.')}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-xs text-[#FAF7F2] font-semibold">
            Data associated with your authenticated Google Account:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#E2D5C3]">
            <div className="flex items-center gap-2 bg-[#2B2118] p-2.5 rounded-xl border border-[#6B523E]">
              <Database className="w-3.5 h-3.5 text-[#C9B79C]" />
              <span>Profile &amp; Education Level</span>
            </div>
            <div className="flex items-center gap-2 bg-[#2B2118] p-2.5 rounded-xl border border-[#6B523E]">
              <Database className="w-3.5 h-3.5 text-[#C9B79C]" />
              <span>20-Question Aptitude Progress</span>
            </div>
            <div className="flex items-center gap-2 bg-[#2B2118] p-2.5 rounded-xl border border-[#6B523E]">
              <Database className="w-3.5 h-3.5 text-[#C9B79C]" />
              <span>7D Cognitive Normalized Scores</span>
            </div>
            <div className="flex items-center gap-2 bg-[#2B2118] p-2.5 rounded-xl border border-[#6B523E]">
              <Database className="w-3.5 h-3.5 text-[#C9B79C]" />
              <span>10-Step Roadmap Completion</span>
            </div>
            <div className="flex items-center gap-2 bg-[#2B2118] p-2.5 rounded-xl border border-[#6B523E]">
              <Database className="w-3.5 h-3.5 text-[#C9B79C]" />
              <span>Bookmarked Study Resources</span>
            </div>
            <div className="flex items-center gap-2 bg-[#2B2118] p-2.5 rounded-xl border border-[#6B523E]">
              <Database className="w-3.5 h-3.5 text-[#C9B79C]" />
              <span>AI Career Mentor Conversations</span>
            </div>
          </div>
          <p className="text-[11px] text-[#E2D5C3] leading-relaxed pt-1">
            All tables in Supabase enforce Row Level Security (<code className="text-[#C9B79C]">auth.uid() = user_id</code>). No other student or third party can access your records.
          </p>
        </div>

        {/* Data Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-[#6B523E]">
          <div>
            <span className="text-xs font-semibold text-[#FAF7F2] block">
              Clear Local Browser Cache
            </span>
            <span className="text-[11px] text-[#E2D5C3] block">
              Clears local offline storage on this machine. Your cloud records remain safely saved in Supabase.
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              if (window.confirm('Reset local offline cache? Your cloud records in Supabase will not be affected.')) {
                clearLocalCache();
              }
            }}
            className="px-4 py-2 bg-[#2B2118] hover:bg-[#382B20] text-[#FAF7F2] border border-[#6B523E] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition flex-shrink-0 cursor-pointer uiverse-btn"
          >
            <Trash2 className="w-3.5 h-3.5 text-[#C9B79C]" />
            <span>Reset Local Cache</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-[#6B523E]">
          <div>
            <span className="text-xs font-semibold text-[#FAF7F2] block">
              Sign Out of AIspire
            </span>
            <span className="text-[11px] text-[#E2D5C3] block">
              End your active Google authentication session.
            </span>
          </div>

          <button
            type="button"
            onClick={logout}
            className="px-4 py-2 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition flex-shrink-0 cursor-pointer uiverse-btn"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </section>

      {/* 6. About AIspire */}
      <section className="bg-[#231A12] border border-[#6B523E] rounded-2xl p-6 sm:p-7 shadow-xl space-y-4 uiverse-card w-full max-w-full min-w-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#FAF7F2]">About AIspire</h2>
            <p className="text-xs text-[#E2D5C3]">
              AI-Powered Career Guidance &amp; 10-Step Roadmap Platform
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#6B4F3A]/40 text-[#C9B79C] border border-[#C9B79C]/30">
            v1.0.0 Production
          </span>
        </div>

        <div className="text-xs text-[#FAF7F2] space-y-2 leading-relaxed">
          <p>
            AIspire pairs a 20-question cognitive assessment with transparent mathematical matching (85% aptitude + 15% interest alignment), customized 10-step career roadmaps, and an integrated study and examination resource library.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-[11px]">
            <div className="p-2.5 bg-[#2B2118] rounded-xl border border-[#6B523E]">
              <span className="text-[#FAF7F2] font-semibold block">7D Cognitive Engine</span>
              <span className="text-[#E2D5C3]">Deterministic scoring across 7 dimensions</span>
            </div>
            <div className="p-2.5 bg-[#2B2118] rounded-xl border border-[#6B523E]">
              <span className="text-[#FAF7F2] font-semibold block">Edge Function AI</span>
              <span className="text-[#E2D5C3]">Authenticated server-side Gemini 2.5 Flash</span>
            </div>
            <div className="p-2.5 bg-[#2B2118] rounded-xl border border-[#6B523E]">
              <span className="text-[#FAF7F2] font-semibold block">Row Level Security</span>
              <span className="text-[#E2D5C3]">Zero client keys &amp; encrypted user isolation</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
