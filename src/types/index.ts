export type DimensionKey =
  | 'analytical'
  | 'creative'
  | 'technical'
  | 'socialHealthcare'
  | 'management'
  | 'research'
  | 'communication';

export interface DimensionInfo {
  key: DimensionKey;
  label: string;
  shortDesc: string;
  color: string;
  iconName: string;
}

export type DimensionScores = Record<DimensionKey, number>;

export type DimensionProfile = Record<DimensionKey, number>;

export interface UserProfile {
  id: string; // Authenticated Supabase User ID (UUID)
  name: string;
  email: string;
  avatarUrl?: string;
  educationLevel: string;
  interests: string[];
  targetGoals: string;
  joinedDate?: string;
  isProfileComplete?: boolean;
}

export interface AptitudeOption {
  id: string;
  text: string;
  dimensionWeights: Partial<Record<DimensionKey, number>>;
  icon?: string;
}

export interface AptitudeQuestion {
  id: number; // 1 through 20
  title: string;
  scenario: string;
  category: string;
  primaryDimension: DimensionKey;
  options: AptitudeOption[];
}

export interface RoadmapStep {
  stepNumber: number; // 1 through 10
  phase: string;
  title: string;
  timeline: string;
  description: string;
  milestoneGoal: string;
  keySkills: string[];
  recommendedTools: string[];
  actionItems: string[];
  relevantDimension?: DimensionKey;
}

export interface GrowthAreaInfo {
  dimension: DimensionKey;
  dimensionLabel: string;
  constructiveAdvice: string;
  priorityScore: number;
}

export interface CareerRole {
  id: string;
  title: string;
  category: string;
  description: string;
  salaryRange: string;
  growthRate: string;
  demandLevel: 'Very High' | 'High' | 'Moderate';
  tags: string[];
  requiredSkills: string[];
  dimensions: DimensionProfile;
  roadmap: RoadmapStep[];
  // Calculated dynamically
  matchScore?: number;
  aptitudeMatch?: number;
  interestAlignment?: number;
  whyThisCareer?: string[];
  growthArea?: GrowthAreaInfo;
}

export interface ExamOrSubjectCategory {
  id: string;
  name: string;
  icon: string;
  type: 'exam' | 'subject';
  description: string;
}

export interface ResourceItem {
  id: string;
  title: string;
  type: 'google' | 'notes' | 'youtube';
  category: string;
  examOrSubjectId: string;
  description: string;
  url: string;
  tags: string[];
  authorOrSource?: string;
  badge?: string;
  notesContent?: string;
  youtubeVideoId?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  suggestedPrompts?: string[];
}

export interface AssessmentResult {
  completedAt: string;
  dimensionScores: DimensionScores;
  answers: Record<number, string>; // questionId -> optionId
  highestDimensions: DimensionKey[];
  topCareerMatches: CareerRole[];
}

// Database Record Interfaces for Supabase
export interface DbProfile {
  id: string; // auth.users.id
  name: string;
  email: string;
  avatar_url?: string | null;
  education_level: string;
  interests: string[];
  target_goals: string;
  created_at?: string;
  updated_at?: string;
}

export interface DbAssessment {
  id?: string;
  user_id: string;
  answers: Record<number, string>;
  current_question: number;
  completed: boolean;
  completed_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DbAssessmentScores {
  id?: string;
  user_id: string;
  assessment_id?: string;
  analytical: number;
  creative: number;
  technical: number;
  social_healthcare: number;
  management: number;
  research: number;
  communication: number;
  created_at?: string;
  updated_at?: string;
}

export interface DbCareerResult {
  id?: string;
  user_id: string;
  career_id: string;
  match_score: number;
  created_at?: string;
}

export interface DbRoadmapProgress {
  id?: string;
  user_id: string;
  career_id: string;
  step_id: number;
  completed: boolean;
  completed_at?: string;
  updated_at?: string;
}

export interface DbBookmark {
  id?: string;
  user_id: string;
  resource_id: string;
  created_at?: string;
}
