import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from 'react';
import type { User } from '@supabase/supabase-js';
import type {
  CareerRole,
  ChatMessage,
  DimensionScores,
  UserProfile,
} from '../types';
import { CAREER_ROLES } from '../data/careers';
import {
  calculateDimensionScores,
  rankCareers,
} from '../services/careerMatcher';
import { askAICounsellor } from '../services/geminiService';
import {
  signInWithGoogle,
  signOutUser,
  getAuthSession,
  subscribeToAuthChanges,
} from '../services/authService';
import { fetchProfile, upsertProfile } from '../services/profileService';
import {
  fetchLatestAssessment,
  saveAssessmentProgress,
  saveAssessmentScores,
} from '../services/assessmentService';
import { fetchRoadmapProgress, saveStepProgress } from '../services/roadmapService';
import { fetchBookmarks, saveBookmark } from '../services/bookmarkService';
import { saveCareerResults } from '../services/careerService';
import {
  fetchChatHistory,
  saveChatMessage,
  clearChatHistory,
} from '../services/chatService';
import { isSupabaseConfigured } from '../services/supabase';

export type AppView =
  | 'login'
  | 'onboarding'
  | 'dashboard'
  | 'test'
  | 'results'
  | 'roadmap'
  | 'resources'
  | 'settings'
  | 'mentor';

export type AppTheme = 'dark' | 'light' | 'system';

export type SyncStatus = 'synced' | 'saving' | 'offline' | 'error';

interface AppContextType {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  authUser: User | null;
  userProfile: UserProfile | null;
  authLoading: boolean;
  authError: string | null;
  loginWithGoogle: () => Promise<void>;
  loginAsGuest: (skipOnboarding?: boolean) => void;
  logout: () => Promise<void>;
  completeProfileOnboarding: (data: {
    educationLevel: string;
    interests: string[];
    targetGoals: string;
  }) => Promise<void>;
  updateProfilePreferences: (data: {
    educationLevel: string;
    interests: string[];
    targetGoals: string;
  }) => Promise<void>;
  answers: Record<number, string>;
  currentQuestionIndex: number;
  setCurrentQuestionIndex: (idx: number) => void;
  setAnswer: (questionId: number, optionId: string, qIndex?: number) => void;
  resetAssessment: () => void;
  submitAssessment: () => Promise<void>;
  dimensionScores: DimensionScores | null;
  rankedCareers: CareerRole[];
  selectedCareer: CareerRole | null;
  selectCareer: (career: CareerRole, navigateToRoadmap?: boolean) => void;
  completedSteps: Record<string, number[]>;
  toggleStepCompletion: (careerId: string, stepNumber: number) => Promise<void>;
  bookmarks: string[];
  toggleBookmark: (resourceId: string) => Promise<void>;
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  clearLocalCache: () => void;
  isAiChatOpen: boolean;
  setIsAiChatOpen: (open: boolean) => void;
  chatMessages: ChatMessage[];
  sendChatMessage: (text: string) => Promise<void>;
  clearChat: () => Promise<void>;
  isAiTyping: boolean;
  syncStatus: SyncStatus;
  lastSyncError: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// LocalStorage cache keys
const LS_PROFILE = 'aispire_user_profile';
const LS_ANSWERS = 'aispire_test_answers';
const LS_SCORES = 'aispire_dimension_scores';
const LS_QUESTION_IDX = 'aispire_question_idx';
const LS_SELECTED_CAREER_ID = 'aispire_selected_career_id';
const LS_COMPLETED_STEPS = 'aispire_completed_steps';
const LS_BOOKMARKS = 'aispire_bookmarks';
const LS_THEME = 'aispire_theme';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // App View state
  const [currentView, setCurrentView] = useState<AppView>('login');

  // User Profile
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(LS_PROFILE);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Assessment State
  const [answers, setAnswers] = useState<Record<number, string>>(() => {
    try {
      const saved = localStorage.getItem(LS_ANSWERS);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [currentQuestionIndex, setCurrentQuestionIndexState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(LS_QUESTION_IDX);
      return saved ? Number(saved) : 0;
    } catch {
      return 0;
    }
  });

  const [dimensionScores, setDimensionScores] = useState<DimensionScores | null>(() => {
    try {
      const saved = localStorage.getItem(LS_SCORES);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Roadmap State
  const [completedSteps, setCompletedSteps] = useState<Record<string, number[]>>(() => {
    try {
      const saved = localStorage.getItem(LS_COMPLETED_STEPS);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Bookmarks State
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(LS_BOOKMARKS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Active Career Selection
  const [selectedCareerId, setSelectedCareerId] = useState<string>(() => {
    try {
      return localStorage.getItem(LS_SELECTED_CAREER_ID) || CAREER_ROLES[0].id;
    } catch {
      return CAREER_ROLES[0].id;
    }
  });

  // Appearance Theme State
  const [theme, setThemeState] = useState<AppTheme>(() => {
    try {
      const saved = localStorage.getItem(LS_THEME);
      if (saved === 'dark' || saved === 'light' || saved === 'system') return saved;
      return 'dark';
    } catch {
      return 'dark';
    }
  });

  const applyTheme = useCallback((t: AppTheme) => {
    const root = document.documentElement;
    const isLight =
      t === 'light' ||
      (t === 'system' && window.matchMedia('(prefers-color-scheme: light)').matches);
    if (isLight) {
      root.classList.add('light-mode');
      root.classList.remove('dark');
    } else {
      root.classList.remove('light-mode');
      root.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
    localStorage.setItem(LS_THEME, newTheme);
    applyTheme(newTheme);
  };

  // Cloud Synchronization Status State
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(() =>
    isSupabaseConfigured() ? 'synced' : 'offline'
  );
  const [lastSyncError, setLastSyncError] = useState<string | null>(null);

  // Chat State
  const DEFAULT_WELCOME_MESSAGE: ChatMessage = {
    id: 'welcome-msg',
    sender: 'ai',
    text: 'Hello! I am your AIspire Career Counsellor. I can guide you through career discovery, explain why specific roles match your strengths, and help you work through your 10-step roadmaps. How can I support your journey today?',
    timestamp: 'Just now',
    suggestedPrompts: [
      'Which career fits my aptitude test best?',
      'How should I prepare for high school/college entrance exams?',
      'Explain Step 1 of my active roadmap',
      'How can I improve my communication skills?',
    ],
  };

  const [isAiChatOpen, setIsAiChatOpenState] = useState(false);

  const setIsAiChatOpen = useCallback((open: boolean) => {
    setIsAiChatOpenState(open);
    if (open) {
      setCurrentView('mentor');
    }
  }, []);

  const [isAiTyping, setIsAiTyping] = useState(false);
  const activeChatSessionRef = useRef<number>(Date.now());
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    DEFAULT_WELCOME_MESSAGE,
  ]);

  // Load cloud data for authenticated user
  const loadCloudUserData = useCallback(async (user: User) => {
    try {
      // 1. Fetch Profile
      const profile = await fetchProfile(user.id);
      if (!profile || !profile.education_level) {
        // Needs onboarding
        const initialProfile: UserProfile = {
          id: user.id,
          name:
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split('@')[0] ||
            'Student',
          email: user.email || '',
          avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture,
          educationLevel: '',
          interests: [],
          targetGoals: '',
          isProfileComplete: false,
        };
        setUserProfile(initialProfile);
        setCurrentView('onboarding');
        return;
      }

      // Existing complete profile
      const loadedProfile: UserProfile = {
        id: user.id,
        name: profile.name,
        email: profile.email,
        avatarUrl: profile.avatar_url || user.user_metadata?.avatar_url,
        educationLevel: profile.education_level,
        interests: profile.interests || [],
        targetGoals: profile.target_goals || '',
        isProfileComplete: true,
      };

      setUserProfile(loadedProfile);
      localStorage.setItem(LS_PROFILE, JSON.stringify(loadedProfile));

      // 2. Fetch Latest Assessment & Scores
      const { assessment, scores } = await fetchLatestAssessment(user.id);
      if (assessment) {
        setAnswers(assessment.answers || {});
        localStorage.setItem(LS_ANSWERS, JSON.stringify(assessment.answers || {}));
        setCurrentQuestionIndexState(assessment.current_question || 0);
        localStorage.setItem(LS_QUESTION_IDX, String(assessment.current_question || 0));

        if (scores) {
          setDimensionScores(scores);
          localStorage.setItem(LS_SCORES, JSON.stringify(scores));
        }
      }

      // 3. Fetch Roadmap Progress
      const { progress: roadmaps } = await fetchRoadmapProgress(user.id);
      setCompletedSteps(roadmaps);
      localStorage.setItem(LS_COMPLETED_STEPS, JSON.stringify(roadmaps));

      // 4. Fetch Bookmarks
      const { bookmarks: bmarks } = await fetchBookmarks(user.id);
      setBookmarks(bmarks);
      localStorage.setItem(LS_BOOKMARKS, JSON.stringify(bmarks));

      // 5. Fetch Chat History (only if not explicitly cleared in this browser session)
      const isClearedInSession = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('aispire_chat_cleared_turn');
      if (!isClearedInSession) {
        const { messages: historyMessages } = await fetchChatHistory(user.id);
        if (historyMessages && historyMessages.length > 0) {
          setChatMessages(historyMessages);
        }
      }

      setSyncStatus('synced');
      setLastSyncError(null);

      // Direct returning user to Dashboard
      setCurrentView('dashboard');
    } catch (err) {
      console.warn('Error loading cloud user data:', err);
      setSyncStatus('error');
      setLastSyncError('Failed to load cloud profile data');
      setCurrentView('dashboard');
    }
  }, []);

  // Initialize Auth & Subscribe to Supabase Auth State Changes
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      setAuthLoading(true);
      try {
        const { user } = await getAuthSession();
        if (isMounted) {
          setAuthUser(user);
          if (user) {
            await loadCloudUserData(user);
          } else {
            setCurrentView('login');
          }
        }
      } catch (err) {
        console.warn('Auth initialization error:', err);
      } finally {
        if (isMounted) setAuthLoading(false);
      }
    }

    initAuth();

    const { unsubscribe } = subscribeToAuthChanges((_session, user) => {
      if (isMounted) {
        setAuthUser(user);
        if (user) {
          loadCloudUserData(user);
        } else {
          setUserProfile(null);
          setCurrentView('login');
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [loadCloudUserData]);

  // Google Login action
  const loginWithGoogle = async () => {
    setAuthError(null);
    const { error } = await signInWithGoogle();
    if (error) {
      setAuthError(error.message);
    }
  };

  // Instant Guest / Offline access
  const loginAsGuest = (skipOnboarding = true) => {
    setAuthError(null);
    const existing = localStorage.getItem(LS_PROFILE);
    if (existing) {
      try {
        const parsed = JSON.parse(existing);
        if (parsed && typeof parsed === 'object') {
          setUserProfile(parsed);
          setSyncStatus('offline');
          setLastSyncError(null);
          setCurrentView('dashboard');
          return;
        }
      } catch {
        // proceed to create clean guest profile
      }
    }

    const defaultGuest: UserProfile = {
      id: 'guest-' + Math.random().toString(36).substring(2, 9),
      name: 'Student Explorer',
      email: 'guest@aispire.local',
      educationLevel: 'High School / Pre-University (Grade 10-12)',
      interests: ['Technology', 'Engineering & Robotics', 'Design & Creative Arts'],
      targetGoals: 'Explore high-demand career paths, aptitude matching, and 10-step roadmaps.',
      isProfileComplete: skipOnboarding,
    };

    setUserProfile(defaultGuest);
    localStorage.setItem(LS_PROFILE, JSON.stringify(defaultGuest));
    setSyncStatus('offline');
    setLastSyncError(null);

    if (skipOnboarding) {
      setCurrentView('dashboard');
    } else {
      setCurrentView('onboarding');
    }
  };

  // Sign out action
  const logout = async () => {
    await signOutUser();
    setAuthUser(null);
    setUserProfile(null);
    setAnswers({});
    setDimensionScores(null);
    setCurrentQuestionIndexState(0);
    setCompletedSteps({});
    setBookmarks([]);
    activeChatSessionRef.current = Date.now();
    setIsAiTyping(false);
    setChatMessages([DEFAULT_WELCOME_MESSAGE]);

    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('aispire_chat_cleared_turn');
      }
      localStorage.removeItem(LS_PROFILE);
      localStorage.removeItem(LS_ANSWERS);
      localStorage.removeItem(LS_SCORES);
      localStorage.removeItem(LS_QUESTION_IDX);
      localStorage.removeItem(LS_SELECTED_CAREER_ID);
      localStorage.removeItem(LS_COMPLETED_STEPS);
      localStorage.removeItem(LS_BOOKMARKS);
    } catch (e) {
      console.error(e);
    }

    setCurrentView('login');
  };

  // Complete profile onboarding
  const completeProfileOnboarding = async (data: {
    educationLevel: string;
    interests: string[];
    targetGoals: string;
  }) => {
    const profileId = authUser?.id || userProfile?.id || 'guest-student';

    const updatedProfile: UserProfile = {
      id: profileId,
      name:
        userProfile?.name ||
        authUser?.user_metadata?.full_name ||
        authUser?.email?.split('@')[0] ||
        'Student Explorer',
      email: authUser?.email || userProfile?.email || 'guest@aispire.local',
      avatarUrl: authUser?.user_metadata?.avatar_url || userProfile?.avatarUrl,
      educationLevel: data.educationLevel,
      interests: data.interests,
      targetGoals: data.targetGoals,
      isProfileComplete: true,
    };

    // Save to local state and storage
    setUserProfile(updatedProfile);
    localStorage.setItem(LS_PROFILE, JSON.stringify(updatedProfile));

    // Save to Supabase if authenticated
    if (authUser) {
      setSyncStatus('saving');
      const { error } = await upsertProfile({
        id: authUser.id,
        name: updatedProfile.name,
        email: updatedProfile.email,
        avatar_url: updatedProfile.avatarUrl || null,
        education_level: updatedProfile.educationLevel,
        interests: updatedProfile.interests,
        target_goals: updatedProfile.targetGoals,
      });

      if (error) {
        setSyncStatus('error');
        setLastSyncError(error.message);
      } else {
        setSyncStatus('synced');
        setLastSyncError(null);
      }
    } else {
      setSyncStatus('offline');
      setLastSyncError(null);
    }

    setCurrentView('dashboard');
  };

  // Set answer with cloud synchronization
  const setAnswer = (questionId: number, optionId: string, qIndex?: number) => {
    const nextAnswers = { ...answers, [questionId]: optionId };
    setAnswers(nextAnswers);
    localStorage.setItem(LS_ANSWERS, JSON.stringify(nextAnswers));

    const nextIndex = qIndex !== undefined ? qIndex : currentQuestionIndex;
    if (qIndex !== undefined) {
      setCurrentQuestionIndexState(qIndex);
      localStorage.setItem(LS_QUESTION_IDX, String(qIndex));
    }

    // Persist in-progress state to Supabase
    if (authUser) {
      saveAssessmentProgress(authUser.id, nextAnswers, nextIndex, false);
    }
  };

  const setCurrentQuestionIndex = (idx: number) => {
    setCurrentQuestionIndexState(idx);
    localStorage.setItem(LS_QUESTION_IDX, String(idx));
    if (authUser) {
      saveAssessmentProgress(authUser.id, answers, idx, false);
    }
  };

  const resetAssessment = () => {
    setAnswers({});
    setDimensionScores(null);
    setCurrentQuestionIndexState(0);
    localStorage.removeItem(LS_ANSWERS);
    localStorage.removeItem(LS_SCORES);
    localStorage.removeItem(LS_QUESTION_IDX);

    if (authUser) {
      saveAssessmentProgress(authUser.id, {}, 0, false);
    }
    setCurrentView('test');
  };

  // Compute Ranked Careers deterministically
  const rankedCareers = useMemo(() => {
    const effectiveScores: DimensionScores = dimensionScores || {
      analytical: 50,
      creative: 50,
      technical: 50,
      socialHealthcare: 50,
      management: 50,
      research: 50,
      communication: 50,
    };

    return rankCareers(CAREER_ROLES, effectiveScores, userProfile || undefined);
  }, [dimensionScores, userProfile]);

  // Submit Assessment with deterministic scores & cloud persistence
  const submitAssessment = async () => {
    const calculatedScores = calculateDimensionScores(answers);
    setDimensionScores(calculatedScores);
    localStorage.setItem(LS_SCORES, JSON.stringify(calculatedScores));

    if (authUser) {
      setSyncStatus('saving');
      const { id: assessmentId, error: pErr } = await saveAssessmentProgress(
        authUser.id,
        answers,
        20,
        true
      );
      const { error: sErr } = await saveAssessmentScores(authUser.id, assessmentId, calculatedScores);

      // Save top career results to Supabase
      const topCareers = rankCareers(CAREER_ROLES, calculatedScores, userProfile || undefined);
      const { error: cErr } = await saveCareerResults(
        authUser.id,
        topCareers.map((c) => ({
          career_id: c.id,
          match_score: c.matchScore ?? 0,
        }))
      );

      if (pErr || sErr || cErr) {
        setSyncStatus('error');
        setLastSyncError(
          pErr?.message || sErr?.message || cErr?.message || 'Failed to sync assessment results'
        );
      } else {
        setSyncStatus('synced');
        setLastSyncError(null);
      }
    }

    setCurrentView('results');
  };

  // Active Selected Career
  const selectedCareer = useMemo(() => {
    const found = rankedCareers.find((c) => c.id === selectedCareerId);
    return found || rankedCareers[0] || CAREER_ROLES[0];
  }, [rankedCareers, selectedCareerId]);

  const selectCareer = (career: CareerRole, navigateToRoadmap = false) => {
    setSelectedCareerId(career.id);
    localStorage.setItem(LS_SELECTED_CAREER_ID, career.id);
    if (navigateToRoadmap) {
      setCurrentView('roadmap');
    }
  };

  // Toggle step completion with Supabase persistence
  const toggleStepCompletion = async (careerId: string, stepNumber: number) => {
    const current = completedSteps[careerId] || [];
    const isNowCompleted = !current.includes(stepNumber);
    const updated = isNowCompleted
      ? [...current, stepNumber].sort((a, b) => a - b)
      : current.filter((s) => s !== stepNumber);

    const nextState = { ...completedSteps, [careerId]: updated };
    setCompletedSteps(nextState);
    localStorage.setItem(LS_COMPLETED_STEPS, JSON.stringify(nextState));

    if (authUser) {
      setSyncStatus('saving');
      const { error } = await saveStepProgress(authUser.id, careerId, stepNumber, isNowCompleted);
      if (error) {
        setSyncStatus('error');
        setLastSyncError(error.message);
      } else {
        setSyncStatus('synced');
        setLastSyncError(null);
      }
    }
  };

  // Toggle bookmark with Supabase persistence
  const toggleBookmark = async (resourceId: string) => {
    const isBookmarked = bookmarks.includes(resourceId);
    const nextBookmarks = isBookmarked
      ? bookmarks.filter((id) => id !== resourceId)
      : [...bookmarks, resourceId];

    setBookmarks(nextBookmarks);
    localStorage.setItem(LS_BOOKMARKS, JSON.stringify(nextBookmarks));

    if (authUser) {
      setSyncStatus('saving');
      const { error } = await saveBookmark(authUser.id, resourceId, !isBookmarked);
      if (error) {
        setSyncStatus('error');
        setLastSyncError(error.message);
      } else {
        setSyncStatus('synced');
        setLastSyncError(null);
      }
    }
  };

  // Update Profile & Career Preferences (persisting to Supabase)
  const updateProfilePreferences = async (data: {
    educationLevel: string;
    interests: string[];
    targetGoals: string;
  }) => {
    if (!userProfile) return;

    const updatedProfile: UserProfile = {
      ...userProfile,
      educationLevel: data.educationLevel,
      interests: data.interests,
      targetGoals: data.targetGoals,
      isProfileComplete: true,
    };

    setUserProfile(updatedProfile);
    localStorage.setItem(LS_PROFILE, JSON.stringify(updatedProfile));

    if (authUser) {
      setSyncStatus('saving');
      const { error } = await upsertProfile({
        id: authUser.id,
        name: updatedProfile.name,
        email: updatedProfile.email,
        avatar_url: updatedProfile.avatarUrl,
        education_level: data.educationLevel,
        interests: data.interests,
        target_goals: data.targetGoals,
      });
      if (error) {
        setSyncStatus('error');
        setLastSyncError(error.message);
      } else {
        setSyncStatus('synced');
        setLastSyncError(null);
      }
    }
  };

  // Clear local cache without deleting cloud database records
  const clearLocalCache = () => {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('aispire_chat_cleared_turn');
    }
    localStorage.removeItem(LS_PROFILE);
    localStorage.removeItem(LS_ANSWERS);
    localStorage.removeItem(LS_QUESTION_IDX);
    localStorage.removeItem(LS_SCORES);
    localStorage.removeItem(LS_COMPLETED_STEPS);
    localStorage.removeItem(LS_BOOKMARKS);
    localStorage.removeItem(LS_SELECTED_CAREER_ID);
    window.location.reload();
  };

  // Send AI Mentor chat message with Cloud Persistence
  const sendChatMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    // Reset explicit clearance marker since student is initiating a conversation
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('aispire_chat_cleared_turn');
    }

    const turnSession = activeChatSessionRef.current;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: 'Just now',
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsAiTyping(true);

    if (authUser && !authUser.id.startsWith('guest-')) {
      saveChatMessage(authUser.id, 'user', trimmed).catch((err) =>
        console.warn('Could not persist user message:', err)
      );
    }

    try {
      const activeCompleted = selectedCareer ? completedSteps[selectedCareer.id] || [] : [];
      const currentRoadmapStep = activeCompleted.length < 10 ? activeCompleted.length + 1 : 10;

      const { answer } = await askAICounsellor({
        prompt: trimmed,
        userProfile: userProfile || undefined,
        studentScores: dimensionScores || undefined,
        selectedCareer,
        chatHistory: chatMessages,
        currentRoadmapStep,
      });

      // If user clicked "New Chat" while this response was generating, discard it!
      if (activeChatSessionRef.current !== turnSession) {
        return;
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: answer,
        timestamp: 'Just now',
      };

      setChatMessages((prev) => [...prev, aiMsg]);

      if (authUser && !authUser.id.startsWith('guest-')) {
        saveChatMessage(authUser.id, 'ai', answer).catch((err) =>
          console.warn('Could not persist AI message:', err)
        );
      }
    } catch (err) {
      if (activeChatSessionRef.current !== turnSession) {
        return;
      }
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: 'I apologize, but I encountered a momentary connection issue. Please try your question again.',
        timestamp: 'Just now',
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      if (activeChatSessionRef.current === turnSession) {
        setIsAiTyping(false);
      }
    }
  };

  // Clear conversation history from Supabase & reset UI immediately
  const clearChat = async () => {
    // 1. Invalidate any in-flight response immediately
    activeChatSessionRef.current = Date.now();
    setIsAiTyping(false);

    // 2. Synchronously and optimistically reset message thread
    setChatMessages([DEFAULT_WELCOME_MESSAGE]);

    // 3. Mark in sessionStorage that chat was explicitly cleared in this browser session
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('aispire_chat_cleared_turn', String(Date.now()));
    }

    // 4. Delete from Supabase for authenticated non-guest users
    if (authUser && !authUser.id.startsWith('guest-')) {
      setSyncStatus('saving');
      const { error } = await clearChatHistory(authUser.id);
      if (error) {
        setSyncStatus('error');
        setLastSyncError(error.message);
      } else {
        setSyncStatus('synced');
        setLastSyncError(null);
      }
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        authUser,
        userProfile,
        authLoading,
        authError,
        loginWithGoogle,
        loginAsGuest,
        logout,
        completeProfileOnboarding,
        updateProfilePreferences,
        answers,
        currentQuestionIndex,
        setCurrentQuestionIndex,
        setAnswer,
        resetAssessment,
        submitAssessment,
        dimensionScores,
        rankedCareers,
        selectedCareer,
        selectCareer,
        completedSteps,
        toggleStepCompletion,
        bookmarks,
        toggleBookmark,
        theme,
        setTheme,
        clearLocalCache,
        isAiChatOpen,
        setIsAiChatOpen,
        chatMessages,
        sendChatMessage,
        clearChat,
        isAiTyping,
        syncStatus,
        lastSyncError,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// oxlint-disable-next-line react/only-export-components
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
