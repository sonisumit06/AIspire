import type {
  AptitudeQuestion,
  CareerRole,
  DimensionKey,
  DimensionProfile,
  DimensionScores,
  GrowthAreaInfo,
  UserProfile,
} from '../types';
import { APTITUDE_QUESTIONS, DIMENSIONS } from '../data/questions';

export const ALL_DIMENSION_KEYS: DimensionKey[] = [
  'analytical',
  'creative',
  'technical',
  'socialHealthcare',
  'management',
  'research',
  'communication',
];

/**
 * 1. Calculate normalized Dimension Scores (0 - 100)
 * StudentScore[d] = (EarnedWeight[d] / MaximumPossibleWeight[d]) * 100
 * Clamped strictly between 0 and 100.
 */
export function calculateDimensionScores(
  answers: Record<number, string>, // questionId -> optionId
  questions: AptitudeQuestion[] = APTITUDE_QUESTIONS
): DimensionScores {
  // 1. Calculate MaximumPossibleWeight for each dimension across all questions
  const maxPossibleWeights: Record<DimensionKey, number> = {
    analytical: 0,
    creative: 0,
    technical: 0,
    socialHealthcare: 0,
    management: 0,
    research: 0,
    communication: 0,
  };

  for (const q of questions) {
    // Find the max weight in this question for each dimension
    const questionMax: Partial<Record<DimensionKey, number>> = {};
    for (const opt of q.options) {
      for (const dim of ALL_DIMENSION_KEYS) {
        const weight = opt.dimensionWeights[dim] ?? 0;
        if (weight > (questionMax[dim] ?? 0)) {
          questionMax[dim] = weight;
        }
      }
    }

    for (const dim of ALL_DIMENSION_KEYS) {
      maxPossibleWeights[dim] += questionMax[dim] ?? 0;
    }
  }

  // 2. Calculate EarnedWeight for each dimension based on selected answers
  const earnedWeights: Record<DimensionKey, number> = {
    analytical: 0,
    creative: 0,
    technical: 0,
    socialHealthcare: 0,
    management: 0,
    research: 0,
    communication: 0,
  };

  for (const q of questions) {
    const selectedOptionId = answers[q.id];
    if (!selectedOptionId) continue;

    const chosenOption = q.options.find((opt) => opt.id === selectedOptionId);
    if (!chosenOption) continue;

    for (const dim of ALL_DIMENSION_KEYS) {
      earnedWeights[dim] += chosenOption.dimensionWeights[dim] ?? 0;
    }
  }

  // 3. Normalize into 0-100 score
  const scores: DimensionScores = {
    analytical: 0,
    creative: 0,
    technical: 0,
    socialHealthcare: 0,
    management: 0,
    research: 0,
    communication: 0,
  };

  for (const dim of ALL_DIMENSION_KEYS) {
    const maxWeight = maxPossibleWeights[dim];
    const earned = earnedWeights[dim];

    if (maxWeight <= 0) {
      scores[dim] = 0;
    } else {
      const normalized = (earned / maxWeight) * 100;
      // Clamp between 0 and 100 and format cleanly
      scores[dim] = Math.max(0, Math.min(100, Math.round(normalized * 10) / 10));
    }
  }

  return scores;
}

/**
 * 2. Calculate Aptitude Match
 * AptitudeMatch = Σ(StudentScore[d] × CareerWeight[d]) / Σ(CareerWeight[d])
 * Produces 0 - 100.
 */
export function calculateAptitudeMatch(
  studentScores: DimensionScores,
  careerProfile: DimensionProfile
): number {
  let weightedSum = 0;
  let totalCareerWeight = 0;

  for (const dim of ALL_DIMENSION_KEYS) {
    const score = studentScores[dim] ?? 0;
    const weight = careerProfile[dim] ?? 0;

    weightedSum += score * weight;
    totalCareerWeight += weight;
  }

  if (totalCareerWeight <= 0) {
    return 0;
  }

  const result = weightedSum / totalCareerWeight;
  return Math.max(0, Math.min(100, result));
}

/**
 * 3. Calculate Interest Alignment
 * InterestAlignment ∈ [0, 100]
 * Compares declared student interests and target goals against career category, tags, and title.
 */
export function calculateInterestAlignment(
  userProfile: Partial<UserProfile> | undefined,
  career: CareerRole
): number {
  if (!userProfile) return 50;

  const interests = userProfile.interests ?? [];
  const targetGoals = (userProfile.targetGoals ?? '').toLowerCase();
  const careerCategory = career.category.toLowerCase();
  const careerTitle = career.title.toLowerCase();
  const careerTags = career.tags.map((t) => t.toLowerCase());

  let totalPoints = 0;

  if (interests.length === 0 && !targetGoals) {
    // If no interests or goals are set yet, provide a neutral score
    return 65;
  }

  // Check interests overlap with career tags and category
  let matchedInterests = 0;
  for (const interest of interests) {
    const interestLower = interest.toLowerCase();
    const tagMatch = careerTags.some(
      (t) => t.includes(interestLower) || interestLower.includes(t)
    );
    const catMatch =
      careerCategory.includes(interestLower) || interestLower.includes(careerCategory);
    const titleMatch =
      careerTitle.includes(interestLower) || interestLower.includes(careerTitle);

    if (tagMatch || catMatch || titleMatch) {
      matchedInterests++;
    }
  }

  const interestScore =
    interests.length > 0 ? (matchedInterests / interests.length) * 70 : 40;

  // Check targetGoals keyword occurrences
  let goalScore = 0;
  if (targetGoals.length > 0) {
    let goalMatches = 0;
    const goalTokens = targetGoals.split(/\s+/).filter((w) => w.length > 3);
    for (const token of goalTokens) {
      if (
        careerTitle.includes(token) ||
        careerCategory.includes(token) ||
        careerTags.some((t) => t.includes(token))
      ) {
        goalMatches++;
      }
    }
    goalScore = Math.min(30, goalMatches * 15);
  } else {
    goalScore = 20;
  }

  totalPoints = interestScore + goalScore;
  return Math.max(10, Math.min(100, Math.round(totalPoints)));
}

/**
 * 4. Calculate Final Match for a single career
 * FinalMatch = (AptitudeMatch × 0.85) + (InterestAlignment × 0.15)
 * matchScore = Math.round(FinalMatch)
 */
export function calculateCareerMatch(
  studentScores: DimensionScores,
  userProfile: Partial<UserProfile> | undefined,
  career: CareerRole
): { matchScore: number; aptitudeMatch: number; interestAlignment: number } {
  const aptitudeMatch = calculateAptitudeMatch(studentScores, career.dimensions);
  const interestAlignment = calculateInterestAlignment(userProfile, career);

  const finalMatch = aptitudeMatch * 0.85 + interestAlignment * 0.15;
  const matchScore = Math.max(0, Math.min(100, Math.round(finalMatch)));

  return {
    matchScore,
    aptitudeMatch: Math.round(aptitudeMatch * 10) / 10,
    interestAlignment: Math.round(interestAlignment * 10) / 10,
  };
}

/**
 * 5. "Why This Career?" Strength Evidence
 * StrengthEvidence[d] = StudentScore[d] × CareerWeight[d]
 * Generates dynamic, data-driven explanations based on student's actual performance.
 */
export function getCareerStrengths(
  studentScores: DimensionScores,
  career: CareerRole
): string[] {
  const dimensionEvidences = ALL_DIMENSION_KEYS.map((dim) => {
    const score = studentScores[dim] ?? 0;
    const weight = career.dimensions[dim] ?? 0;
    const evidence = score * weight;
    const meta = DIMENSIONS.find((d) => d.key === dim);
    return {
      dim,
      label: meta?.label ?? dim,
      score,
      weight,
      evidence,
    };
  });

  // Sort by evidence descending
  dimensionEvidences.sort((a, b) => b.evidence - a.evidence);

  const statements: string[] = [];

  // Top dimension
  const top1 = dimensionEvidences[0];
  if (top1 && top1.score >= 40) {
    if (top1.weight >= 0.8) {
      statements.push(
        `High ${top1.label} (Score: ${Math.round(top1.score)}%) is the foundational pillar for ${career.title}.`
      );
    } else {
      statements.push(
        `Strong ${top1.label} (Score: ${Math.round(top1.score)}%) gives you a distinctive competitive edge in this role.`
      );
    }
  }

  // Second dimension
  const top2 = dimensionEvidences[1];
  if (top2 && top2.score >= 35 && top2.weight >= 0.5) {
    statements.push(
      `Strong alignment in ${top2.label} (Score: ${Math.round(top2.score)}%) directly supports day-to-day role demands.`
    );
  }

  // Third dimension if relevant
  const top3 = dimensionEvidences[2];
  if (top3 && top3.score >= 30 && top3.weight >= 0.5) {
    statements.push(
      `Solid ${top3.label} aptitude complements your problem-solving approach in this domain.`
    );
  }

  if (statements.length === 0) {
    statements.push(`Your balanced cognitive profile provides a versatile foundation for ${career.title}.`);
  }

  return statements;
}

/**
 * 6. Potential Growth Area
 * GrowthPriority[d] = CareerWeight[d] × (100 - StudentScore[d])
 * Chooses the dimension with highest GrowthPriority where CareerWeight >= 0.4.
 * Constructive, encouraging phrasing.
 */
export function getGrowthAreas(
  studentScores: DimensionScores,
  career: CareerRole
): GrowthAreaInfo | undefined {
  const priorities = ALL_DIMENSION_KEYS.map((dim) => {
    const score = studentScores[dim] ?? 0;
    const weight = career.dimensions[dim] ?? 0;
    const priority = weight * (100 - score);
    const meta = DIMENSIONS.find((d) => d.key === dim);
    return {
      dimension: dim,
      dimensionLabel: meta?.label ?? dim,
      score,
      weight,
      priorityScore: priority,
    };
  })
    // Only consider dimensions that are actually meaningful to this career
    .filter((item) => item.weight >= 0.4 && item.score < 85);

  if (priorities.length === 0) {
    return undefined;
  }

  priorities.sort((a, b) => b.priorityScore - a.priorityScore);
  const primaryGrowth = priorities[0];

  // Tailored constructive advice templates
  const adviceTemplates: Record<DimensionKey, string> = {
    communication:
      `Developing your technical storytelling and stakeholder communication skills will enable you to explain complex solutions clearly and elevate your impact in ${career.title}.`,
    technical:
      `Hands-on coding labs, system architecture practice, and tooling familiarity will make your transition into ${career.title} much faster and more confident.`,
    analytical:
      `Sharpening your quantitative modeling, algorithmic logic, and data analysis will strengthen your core problem-solving efficiency in this field.`,
    creative:
      `Exploring user experience intuition, design thinking, and visual presentation will help make your work stand out aesthetically.`,
    management:
      `Practicing project scoping, delegation, and strategic prioritization will prepare you for high-impact leadership positions in this career.`,
    research:
      `Honing your ability to digest research papers, formulate hypotheses, and validate data will give you a deeper scientific foundation.`,
    socialHealthcare:
      `Cultivating active listening and user empathy will ensure your solutions remain profoundly student- and human-centric.`,
  };

  return {
    dimension: primaryGrowth.dimension,
    dimensionLabel: primaryGrowth.dimensionLabel,
    constructiveAdvice:
      adviceTemplates[primaryGrowth.dimension] ??
      `Strengthening your ${primaryGrowth.dimensionLabel} will unlock additional upside and leadership potential in ${career.title}.`,
    priorityScore: Math.round(primaryGrowth.priorityScore),
  };
}

/**
 * 7. Rank all careers dynamically and deterministically
 * Sorts in descending order of FinalMatch.
 * Injects matchScore, aptitudeMatch, interestAlignment, whyThisCareer, and growthArea.
 */
export function rankCareers(
  careers: CareerRole[],
  studentScores: DimensionScores,
  userProfile: Partial<UserProfile> | undefined
): CareerRole[] {
  if (!careers || careers.length === 0) return [];

  const evaluated = careers.map((career) => {
    const match = calculateCareerMatch(studentScores, userProfile, career);
    const whyThisCareer = getCareerStrengths(studentScores, career);
    const growthArea = getGrowthAreas(studentScores, career);

    return {
      ...career,
      matchScore: match.matchScore,
      aptitudeMatch: match.aptitudeMatch,
      interestAlignment: match.interestAlignment,
      whyThisCareer,
      growthArea,
    };
  });

  // Sort descending: Highest FinalMatch -> Lowest FinalMatch
  evaluated.sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));

  return evaluated;
}
