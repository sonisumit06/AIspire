import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  GraduationCap,
  Target,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const INTEREST_OPTIONS = [
  'Artificial Intelligence',
  'Software & Web',
  'Data & Analytics',
  'UI/UX Design',
  'Biotechnology & Medicine',
  'Finance & Markets',
  'Business & Leadership',
  'Robotics & Hardware',
  'Content & Creative Arts',
];

export const ProfileOnboardingView: React.FC = () => {
  const { userProfile, completeProfileOnboarding } = useApp();

  const [educationLevel, setEducationLevel] = useState(
    userProfile?.educationLevel || 'High School (11th-12th Grade)'
  );
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    userProfile?.interests && userProfile.interests.length > 0
      ? userProfile.interests
      : ['Artificial Intelligence', 'Software & Web']
  );
  const [targetGoals, setTargetGoals] = useState(userProfile?.targetGoals || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await completeProfileOnboarding({
        educationLevel,
        interests: selectedInterests,
        targetGoals:
          targetGoals.trim() ||
          'Explore modern career paths, understand cognitive strengths, and complete a 10-step roadmap.',
      });
    } catch (err) {
      console.error('Error completing onboarding:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full max-w-full overflow-x-hidden flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#6B4F3A]/15 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-[#C9B79C]/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-2xl min-w-0 mx-auto space-y-8 animate-fadeIn">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-1">
            <div className="w-20 h-20 rounded-2xl bg-[#FAF7F2] p-2 shadow-xl border border-[#6B523E] flex items-center justify-center">
              <img
                src="/logo.png"
                alt="AIspire Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Google Account Verified</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#FAF7F2] tracking-tight">
            Complete Your Student Profile
          </h1>

          <p className="text-sm text-[#E2D5C3] max-w-md mx-auto leading-relaxed">
            Welcome to AIspire! Tell us about your academic stage and interests so our deterministic matching engine can tailor your career journey.
          </p>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-full min-w-0 bg-[#231A12] border border-[#6B523E] rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl uiverse-card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Authenticated Account Info Preview */}
            <div className="p-4 rounded-2xl bg-[#2B2118] border border-[#6B523E] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {userProfile?.avatarUrl ? (
                  <img
                    src={userProfile.avatarUrl}
                    alt={userProfile.name}
                    className="w-11 h-11 rounded-2xl border border-[#6B523E] object-cover"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-2xl bg-[#6B4F3A]/40 text-[#C9B79C] border border-[#C9B79C]/30 flex items-center justify-center font-bold text-sm">
                    {userProfile?.name?.charAt(0) || 'U'}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-sm text-[#FAF7F2]">
                    {userProfile?.name || 'Authenticated Student'}
                  </h4>
                  <p className="text-xs text-[#E2D5C3]">
                    {userProfile?.email}
                  </p>
                </div>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-lg bg-[#6B4F3A]/30 text-[#FAF7F2] border border-[#C9B79C]/40">
                Connected
              </span>
            </div>

            {/* Education Level Selector */}
            <div>
              <label className="block text-xs font-semibold text-[#FAF7F2] mb-1.5 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-[#C9B79C]" />
                <span>Current Academic Stage *</span>
              </label>
              <select
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#2B2118] border border-[#6B523E] rounded-xl text-sm text-[#FAF7F2] focus:outline-none focus:border-[#C9B79C] transition cursor-pointer"
              >
                <option>High School (9th-10th Grade)</option>
                <option>High School (11th-12th Grade)</option>
                <option>Undergraduate / College Student</option>
                <option>Graduate / Early Professional</option>
              </select>
            </div>

            {/* Interest Tags Selection */}
            <div>
              <label className="block text-xs font-semibold text-[#FAF7F2] mb-2 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#C9B79C]" />
                <span>What fields ignite your curiosity? (Select all that apply)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map((interest) => {
                  const isSelected = selectedInterests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-[#6B4F3A] text-[#FAF7F2] shadow-sm border border-[#C9B79C]'
                          : 'bg-[#2B2118] text-[#E2D5C3] border border-[#6B523E] hover:border-[#C9B79C] hover:text-[#FAF7F2]'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                      <span>{interest}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Goals */}
            <div>
              <label className="block text-xs font-semibold text-[#FAF7F2] mb-1.5 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-emerald-400" />
                <span>Your Dream or Long-Term Aspirations</span>
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Build machine learning systems, research medical cures, design user-centric software, or start a company..."
                value={targetGoals}
                onChange={(e) => setTargetGoals(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#2B2118] border border-[#6B523E] rounded-xl text-sm text-[#FAF7F2] placeholder-[#D8C7B0]/70 focus:outline-none focus:border-[#C9B79C] transition resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#6B4F3A] via-[#5A412F] to-[#4A3525] hover:from-[#7D5D45] hover:to-[#5A412F] text-[#FAF7F2] font-bold text-sm tracking-wide border border-[#C9B79C]/30 shadow-lg shadow-black/30 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isSubmitting ? 'Saving Profile...' : 'Save Profile & Launch AIspire'}</span>
              <ArrowRight className="w-4 h-4 text-[#C9B79C]" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
