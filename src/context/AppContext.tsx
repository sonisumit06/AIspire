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
  deleteUserAssessmentData,
} from '../services/assessmentService';
import {
  fetchRoadmapProgress,
  saveStepProgress,
  deleteUserRoadmapProgress,
} from '../services/roadmapService';
import {
  fetchBookmarks,
  saveBookmark,
  deleteUserBookmarks,
} from '../services/bookmarkService';
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
  loginAsGuest: (skipOnboarding?: boolean, forceFresh?: boolean) => void;
  logout: () => Promise<void>;
  resetDemoState: (options?: { clearCloud?: boolean }) => Promise<void>;
  completeProfileOnboarding: (data: {
    name?: string;
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

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Fresh start URL detection (?reset=true or ?fresh=1 or ?demo=fresh)
  if (typeof window !== 'undefined') {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (
        urlParams.get('reset') === 'true' ||
        urlParams.get('fresh') === '1' ||
        urlParams.get('fresh') === 'true' ||
        urlParams.get('demo') === 'fresh'
      ) {
        localStorage.clear();
        sessionStorage.clear();
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch {
      // ignore
    }
  }

  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // User Profile
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(LS_PROFILE);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // App View state: automatically resume dashboard or onboarding if profile exists
  const [currentView, setCurrentView] = useState<AppView>(() => {
    try {
      const saved = localStorage.getItem(LS_PROFILE);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.isProfileComplete) return 'dashboard';
        if (parsed) return 'onboarding';
      }
    } catch {
      // fallback
    }
    return 'login';
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
  const [isAiChatOpen, setIsAiChatOpenState] = useState(false);

  const setIsAiChatOpen = useCallback((open: boolean) => {
    setIsAiChatOpenState(open);
    if (open) {
      setCurrentView('mentor');
    }
  }, []);

  const [isAiTyping, setIsAiTyping] = useState(false);
  const activeChatSessionRef = useRef<number>(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    DEFAULT_WELCOME_MESSAGE,
  ]);

  // Load cloud data for authenticated user (Parallelized & Timeout Protected)
  const loadCloudUserData = useCallback(async (user: User) => {
    try {
      // 4-second timeout race prevents app from hanging if network stalls
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Cloud load timeout')), 4000)
      );

      const fetchAllPromise = (async () => {
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
              '',
            email: user.email || '',
            avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture,
            educationLevel: '',
            interests: [],
            targetGoals: '',
            isProfileComplete: false,
          };
          setUserProfile(initialProfile);
          setAnswers({});
          setDimensionScores(null);
          setCurrentQuestionIndexState(0);
          setCompletedSteps({});
          setBookmarks([]);
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

        // 2-5. Parallel fetch remaining cloud data for sub-second startup
        const isClearedInSession =
          typeof sessionStorage !== 'undefined' &&
          sessionStorage.getItem('aispire_chat_cleared_turn');

        const [assessmentRes, roadmapsRes, bookmarksRes, chatRes] = await Promise.allSettled([
          fetchLatestAssessment(user.id),
          fetchRoadmapProgress(user.id),
          fetchBookmarks(user.id),
          !isClearedInSession ? fetchChatHistory(user.id) : Promise.resolve({ messages: [] }),
        ]);

        if (assessmentRes.status === 'fulfilled' && assessmentRes.value.assessment) {
          const { assessment, scores } = assessmentRes.value;
          setAnswers(assessment.answers || {});
          localStorage.setItem(LS_ANSWERS, JSON.stringify(assessment.answers || {}));
          setCurrentQuestionIndexState(assessment.current_question || 0);
          localStorage.setItem(LS_QUESTION_IDX, String(assessment.current_question || 0));

          if (scores) {
            setDimensionScores(scores);
            localStorage.setItem(LS_SCORES, JSON.stringify(scores));
          }
        }

        if (roadmapsRes.status === 'fulfilled') {
          setCompletedSteps(roadmapsRes.value.progress);
          localStorage.setItem(LS_COMPLETED_STEPS, JSON.stringify(roadmapsRes.value.progress));
        }

        if (bookmarksRes.status === 'fulfilled') {
          setBookmarks(bookmarksRes.value.bookmarks);
          localStorage.setItem(LS_BOOKMARKS, JSON.stringify(bookmarksRes.value.bookmarks));
        }

        if (chatRes.status === 'fulfilled' && chatRes.value.messages && chatRes.value.messages.length > 0) {
          setChatMessages(chatRes.value.messages);
        }

        setSyncStatus('synced');
        setLastSyncError(null);
        setCurrentView('dashboard');
      })();

      await Promise.race([fetchAllPromise, timeoutPromise]);
    } catch (err) {
      console.warn('Notice loading cloud user data (falling back to local cache):', err);
      setSyncStatus('offline');
      setLastSyncError('Operating in local cache mode');

      const savedProfile = localStorage.getItem(LS_PROFILE);
      let parsedProfile: UserProfile | null = null;
      if (savedProfile) {
        try {
          parsedProfile = JSON.parse(savedProfile);
        } catch {
          parsedProfile = null;
        }
      }

      if (parsedProfile && parsedProfile.id === user.id && parsedProfile.isProfileComplete) {
        setUserProfile(parsedProfile);
        setCurrentView('dashboard');
      } else {
        const freshProfile: UserProfile = {
          id: user.id,
          name:
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split('@')[0] ||
            '',
          email: user.email || '',
          avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture,
          educationLevel: '',
          interests: [],
          targetGoals: '',
          isProfileComplete: false,
        };
        setUserProfile(freshProfile);
        setCurrentView('onboarding');
      }
    }
  }, []);

  // Initialize Auth & Subscribe to Supabase Auth State Changes with Failsafe Timeout
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      setAuthLoading(true);
      try {
        // Enforce 3-second timeout for session check so app never hangs
        const sessionPromise = getAuthSession();
        const timeoutPromise = new Promise<{ session: null; user: null }>((resolve) =>
          setTimeout(() => resolve({ session: null, user: null }), 3000)
        );
        const { user } = await Promise.race([sessionPromise, timeoutPromise]);

        if (isMounted) {
          setAuthUser(user);
          if (user) {
            await loadCloudUserData(user);
          } else {
            // Check if we have an existing guest/local profile in localStorage
            const savedProfile = localStorage.getItem(LS_PROFILE);
            if (savedProfile) {
              try {
                const parsed = JSON.parse(savedProfile);
                if (parsed && typeof parsed === 'object') {
                  setUserProfile(parsed);
                  setSyncStatus('offline');
                  setLastSyncError(null);
                  setCurrentView(parsed.isProfileComplete ? 'dashboard' : 'onboarding');
                  return;
                }
              } catch {
                // proceed to login
              }
            }
            setCurrentView('login');
          }
        }
      } catch (err) {
        console.warn('Auth initialization notice:', err);
        const savedProfile = localStorage.getItem(LS_PROFILE);
        if (savedProfile) {
          try {
            const parsed = JSON.parse(savedProfile);
            if (parsed && typeof parsed === 'object') {
              setUserProfile(parsed);
              setCurrentView(parsed.isProfileComplete ? 'dashboard' : 'onboarding');
            }
          } catch {
            setCurrentView('login');
          }
        } else {
          setCurrentView('login');
        }
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
          // Do NOT wipe userProfile if it is a local guest session
          const saved = localStorage.getItem(LS_PROFILE);
          let isGuest = false;
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              if (parsed?.id && typeof parsed.id === 'string' && parsed.id.startsWith('guest-')) {
                isGuest = true;
              }
            } catch {
              // ignore
            }
          }

          if (!isGuest) {
            setUserProfile(null);
            setCurrentView('login');
          }
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
  const loginAsGuest = (skipOnboarding = false, forceFresh = false) => {
    setAuthError(null);

    if (forceFresh) {
      try {
        localStorage.removeItem(LS_PROFILE);
        localStorage.removeItem(LS_ANSWERS);
        localStorage.removeItem(LS_SCORES);
        localStorage.removeItem(LS_QUESTION_IDX);
        localStorage.removeItem(LS_COMPLETED_STEPS);
        localStorage.removeItem(LS_BOOKMARKS);
        localStorage.removeItem(LS_SELECTED_CAREER_ID);
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.clear();
        }
      } catch {
        // ignore
      }
      setAnswers({});
      setDimensionScores(null);
      setCurrentQuestionIndexState(0);
      setCompletedSteps({});
      setBookmarks([]);
      setSelectedCareerId(CAREER_ROLES[0].id);
      setChatMessages([DEFAULT_WELCOME_MESSAGE]);
    } else {
      const existing = localStorage.getItem(LS_PROFILE);
      if (existing) {
        try {
          const parsed = JSON.parse(existing);
          if (parsed && typeof parsed === 'object') {
            setUserProfile(parsed);
            setSyncStatus('offline');
            setLastSyncError(null);
            setCurrentView(parsed.isProfileComplete && skipOnboarding ? 'dashboard' : 'onboarding');
            return;
          }
        } catch {
          // proceed to create clean guest profile
        }
      }
    }

    const defaultGuest: UserProfile = {
      id: 'guest-' + Math.random().toString(36).substring(2, 9),
      name: '',
      email: 'guest@aispire.local',
      educationLevel: '',
      interests: [],
      targetGoals: '',
      isProfileComplete: false,
    };

    setUserProfile(defaultGuest);
    localStorage.setItem(LS_PROFILE, JSON.stringify(defaultGuest));
    setSyncStatus('offline');
    setLastSyncError(null);

    if (skipOnboarding && defaultGuest.isProfileComplete) {
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
    name?: string;
    educationLevel: string;
    interests: string[];
    targetGoals: string;
  }) => {
    const profileId = authUser?.id || userProfile?.id || 'guest-' + Math.random().toString(36).substring(2, 9);

    const updatedProfile: UserProfile = {
      id: profileId,
      name:
        data.name?.trim() ||
        userProfile?.name?.trim() ||
        authUser?.user_metadata?.full_name ||
        authUser?.email?.split('@')[0] ||
        'Student',
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
    if (!dimensionScores) {
      return CAREER_ROLES.map((c) => ({
        ...c,
        matchScore: undefined,
        aptitudeMatch: undefined,
        interestAlignment: undefined,
        whyThisCareer: undefined,
        growthArea: undefined,
      }));
    }

    return rankCareers(CAREER_ROLES, dimensionScores, userProfile || undefined);
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

  // Complete demo reset action: wipes local storage, session storage, resets React states, and cleans cloud records if authenticated
  const resetDemoState = useCallback(async (options?: { clearCloud?: boolean }) => {
    const currentUserId = authUser?.id;
    if (
      options?.clearCloud !== false &&
      currentUserId &&
      !currentUserId.startsWith('guest-') &&
      isSupabaseConfigured()
    ) {
      try {
        await Promise.allSettled([
          deleteUserAssessmentData(currentUserId),
          deleteUserRoadmapProgress(currentUserId),
          deleteUserBookmarks(currentUserId),
          clearChatHistory(currentUserId),
        ]);
      } catch (err) {
        console.warn('Could not reset cloud records in Supabase:', err);
      }
    }

    try {
      await signOutUser();
    } catch (err) {
      console.warn('Sign out error:', err);
    }

    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.clear();
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.clear();
      }
    } catch (e) {
      console.warn('Storage purge error:', e);
    }

    setAuthUser(null);
    setUserProfile(null);
    setAnswers({});
    setDimensionScores(null);
    setCurrentQuestionIndexState(0);
    setCompletedSteps({});
    setBookmarks([]);
    setSelectedCareerId(CAREER_ROLES[0].id);
    activeChatSessionRef.current = Date.now();
    setIsAiTyping(false);
    setChatMessages([DEFAULT_WELCOME_MESSAGE]);
    setSyncStatus('offline');
    setLastSyncError(null);
    setCurrentView('login');
  }, [authUser]);

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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).aispireResetDemo = resetDemoState;
    }
  }, [resetDemoState]);

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
        resetDemoState,
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
