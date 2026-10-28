/**
 * AIspire Content Safety and Educational Guidance Validation Layer
 *
 * Enforces strict student safety rules:
 * 1. Blocks sexually explicit, pornographic, erotic, or sexual content with educational redirection.
 * 2. Steers off-topic queries (medical diagnosis, legal counsel, financial speculation, romance) back to career and academic guidance.
 */

export interface SafetyCheckResult {
  isSafe: boolean;
  refusalReason?: 'explicit_sexual' | 'harmful' | 'off_topic_redirect';
  message?: string;
  suggestedEducationalTopics?: string[];
}

// Patterns for sexually explicit, pornographic, erotic, or NSFW queries
const EXPLICIT_SEXUAL_PATTERNS = [
  /\b(porn\w*|nsfw|erotic\w*|hentai|xx{1,3}|nude\w*|nudity)\b/i,
  /\b(sex|sexual|sexually|intercourse|copulation|fetish|masturbat\w*|horny|orgasm)\b/i,
  /\b(blowjob|handjob|cum|dick|pussy|vagina|penis|boobs|breasts|clitoris|anal)\b/i,
  /\b(strip club|escort|hooker|prostitut\w*|camgirl|onlyfans)\b/i,
  /\b(sexual roleplay|sext\w*|erotic story|sexual fantasy|erotic roleplay)\b/i,
];

// Patterns for off-topic professional advice (medical, legal, gambling)
const OFF_TOPIC_PATTERNS: { pattern: RegExp; topic: string; careerRedirect: string }[] = [
  {
    pattern: /\b(diagnose me|what disease do i have|prescribe medicine|dosage for|medical symptoms of)\b/i,
    topic: 'medical diagnosis',
    careerRedirect: 'I am a career counsellor and cannot provide medical diagnoses or medical advice. If you are passionate about health and medicine, I would love to help you explore career pathways in Medicine, Nursing, Biomedical Engineering, or Healthcare Innovation!',
  },
  {
    pattern: /\b(legal advice|sue my|file a lawsuit|represent me in court|draft a contract for)\b/i,
    topic: 'legal counsel',
    careerRedirect: 'I am an educational and career mentor, not an attorney, and cannot give legal advice. If you are intrigued by law, policy, or ethics, we can explore educational roadmaps for Pre-Law, Corporate Law, or Public Policy!',
  },
  {
    pattern: /\b(buy this stock|penny stock|trade on margin|stock pick|crypto trading signal|forex pump|lottery numbers|gamble on|day trade|investment advice)\b/i,
    topic: 'financial speculation',
    careerRedirect: 'I am an academic mentor and cannot provide personal financial or investment advice. If financial systems fascinate you, we can look at the Quantitative Analyst, FinTech Engineer, or Corporate Finance roadmaps in AIspire!',
  },
  {
    pattern: /\b(be my.*girlfriend|be my.*boyfriend|date me|do you love me|marry me|romantic|lover|crush on you)\b/i,
    topic: 'romantic companionship',
    careerRedirect: 'I am here solely as your AIspire academic and career mentor! Let’s stay focused on your learning goals, assessment results, or upcoming milestones.',
  },
];

/**
 * Validates whether a student's prompt complies with AIspire safety and educational policies.
 */
export function validatePromptSafety(prompt: string): SafetyCheckResult {
  const trimmed = prompt.trim();
  if (!trimmed) {
    return { isSafe: true };
  }

  // 1. Mandatory Explicit/Sexual Content Refusal
  for (const pattern of EXPLICIT_SEXUAL_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        isSafe: false,
        refusalReason: 'explicit_sexual',
        message:
          "I can't help with explicit sexual content. I can help with your studies, career planning, skills, or other educational questions.",
        suggestedEducationalTopics: [
          'Which career fits my aptitude test results?',
          'Help me prepare for upcoming college or school exams',
          'Explain the next step of my career roadmap',
          'How can I build a competitive project portfolio?',
        ],
      };
    }
  }

  // 2. Off-Topic Guidance Redirection
  for (const item of OFF_TOPIC_PATTERNS) {
    if (item.pattern.test(trimmed)) {
      return {
        isSafe: true, // Handled with gentle redirection text
        refusalReason: 'off_topic_redirect',
        message: item.careerRedirect,
        suggestedEducationalTopics: [
          'What skills are in demand for modern careers?',
          'How do I balance exam prep with hands-on projects?',
          'Review my strongest cognitive dimensions',
        ],
      };
    }
  }

  return { isSafe: true };
}

