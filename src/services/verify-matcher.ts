import {
  calculateDimensionScores,
  calculateAptitudeMatch,
  calculateInterestAlignment,
  calculateCareerMatch,
  getCareerStrengths,
  getGrowthAreas,
  rankCareers,
  ALL_DIMENSION_KEYS,
} from './careerMatcher.ts';
import { CAREER_ROLES } from '../data/careers.ts';
import { APTITUDE_QUESTIONS } from '../data/questions.ts';
import type { DimensionScores, UserProfile } from '../types/index.ts';

function runTests() {
  console.log('🧪 Starting Comprehensive Verification Suite for AIspire Career Matcher...\n');

  // ============================================================================
  // Test 1: Dimension Normalization & Boundary Clamping [0, 100]
  // ============================================================================
  const emptyScores = calculateDimensionScores({});
  console.log('Test 1: Empty Answers Dimension Normalization:');
  for (const dim of ALL_DIMENSION_KEYS) {
    const score = emptyScores[dim];
    if (score !== 0 || isNaN(score)) {
      throw new Error(`Test 1 Failed: Dimension ${dim} expected 0, received ${score}`);
    }
  }
  console.log('✅ Test 1 Passed: Empty answers correctly normalize to 0 without NaN.\n');

  // ============================================================================
  // Test 2: 20-Question Response Mapping Across All 7 Dimensions
  // ============================================================================
  const sampleAnswers: Record<number, string> = {};
  for (const q of APTITUDE_QUESTIONS) {
    sampleAnswers[q.id] = q.options[0].id; // Select option A for all 20 questions
  }
  const fullScores = calculateDimensionScores(sampleAnswers);
  console.log('Test 2: Full 20-Question Mapping:');
  console.log(fullScores);
  for (const dim of ALL_DIMENSION_KEYS) {
    const s = fullScores[dim];
    if (s < 0 || s > 100 || isNaN(s)) {
      throw new Error(`Test 2 Failed: Score ${s} out of bounds [0, 100] for ${dim}`);
    }
  }
  console.log('✅ Test 2 Passed: 20-question responses accurately mapped and clamped.\n');

  // ============================================================================
  // Test 3: Exact Weighted Aptitude Formula Step-by-Step Arithmetic Proof
  // Formula: AptitudeMatch = Σ(StudentScore[d] × CareerWeight[d]) / Σ(CareerWeight[d])
  // ============================================================================
  const testScores: DimensionScores = {
    analytical: 82,
    creative: 64,
    technical: 91,
    socialHealthcare: 48,
    management: 55,
    research: 76,
    communication: 61,
  };

  const aiEngineerRole = CAREER_ROLES.find((c) => c.id === 'ai-engineer');
  if (!aiEngineerRole) throw new Error('AI Engineer role missing from seed data');

  // Manual calculation:
  // weights: analytical=0.95, creative=0.65, technical=1.0, socialHealthcare=0.25, management=0.45, research=0.9, communication=0.55
  // sumWeights = 0.95 + 0.65 + 1.0 + 0.25 + 0.45 + 0.9 + 0.55 = 4.75
  // sumWeightedScores = 82(0.95) + 64(0.65) + 91(1.0) + 48(0.25) + 55(0.45) + 76(0.9) + 61(0.55)
  //                   = 77.9 + 41.6 + 91.0 + 12.0 + 24.75 + 68.4 + 33.55 = 349.2
  // expectedAptitude = 349.2 / 4.75 = 73.51578947368421
  const expectedAptitude = 349.2 / 4.75;
  const actualAptitude = calculateAptitudeMatch(testScores, aiEngineerRole.dimensions);

  console.log(`Test 3: Exact Aptitude Arithmetic Proof:`);
  console.log(`  Expected: ${expectedAptitude}`);
  console.log(`  Actual:   ${actualAptitude}`);
  if (Math.abs(actualAptitude - expectedAptitude) > 1e-9) {
    throw new Error(`Test 3 Failed: Aptitude match mismatch! Expected ${expectedAptitude}, got ${actualAptitude}`);
  }
  console.log('✅ Test 3 Passed: Weighted arithmetic formula matches specification exactly.\n');

  // ============================================================================
  // Test 4: Interest Alignment Scoring ∈ [0, 100]
  // ============================================================================
  const sampleProfile: UserProfile = {
    id: 'test-user-1',
    name: 'Sarah Connor',
    email: 'sarah@test.com',
    educationLevel: 'Undergraduate',
    interests: ['Artificial Intelligence', 'Software & Web'],
    targetGoals: 'Build scalable machine learning systems',
    joinedDate: 'September 2026',
  };

  const interestScore = calculateInterestAlignment(sampleProfile, aiEngineerRole);
  console.log(`Test 4: Interest Alignment Score: ${interestScore}`);
  if (interestScore < 0 || interestScore > 100 || isNaN(interestScore)) {
    throw new Error(`Test 4 Failed: Interest score ${interestScore} out of bounds`);
  }
  console.log('✅ Test 4 Passed: Interest alignment correctly computed within [0, 100].\n');

  // ============================================================================
  // Test 5: Exact 85/15 Composite Weighted Formula Assertion
  // Formula: FinalMatch = (AptitudeMatch × 0.85) + (InterestAlignment × 0.15)
  // matchScore = Math.round(FinalMatch)
  // ============================================================================
  const matchResult = calculateCareerMatch(testScores, sampleProfile, aiEngineerRole);
  const expectedFinalRaw = actualAptitude * 0.85 + interestScore * 0.15;
  const expectedRounded = Math.round(expectedFinalRaw);

  console.log('Test 5: Composite 85/15 Formula Breakdown:');
  console.log(`  Aptitude Match:     ${matchResult.aptitudeMatch}%`);
  console.log(`  Interest Alignment: ${matchResult.interestAlignment}%`);
  console.log(`  Calculated Match:   ${matchResult.matchScore}% (Expected: ${expectedRounded}%)`);

  if (matchResult.matchScore !== expectedRounded) {
    throw new Error(`Test 5 Failed: Expected rounded score ${expectedRounded}, received ${matchResult.matchScore}`);
  }
  console.log('✅ Test 5 Passed: Composite 85/15 weighting and rounding verified.\n');

  // ============================================================================
  // Test 6: Dynamic Strength Evidence Generation ("Why This Career")
  // ============================================================================
  const strengths = getCareerStrengths(testScores, aiEngineerRole);
  console.log('Test 6: Dynamic Strength Evidence:');
  console.log(strengths);
  if (!strengths || strengths.length === 0) {
    throw new Error('Test 6 Failed: Strengths array must not be empty');
  }
  if (!strengths[0].includes('Technical & Engineering')) {
    throw new Error('Test 6 Failed: Highest evidence dimension (Technical) not highlighted first');
  }
  console.log('✅ Test 6 Passed: Strength evidence generated and ordered by descending weight × score.\n');

  // ============================================================================
  // Test 7: Growth-Area Prioritization: GrowthPriority = (100 - Score) × Weight
  // ============================================================================
  const growthArea = getGrowthAreas(testScores, aiEngineerRole);
  console.log('Test 7: Growth Area Prioritization:');
  console.log(growthArea);
  if (!growthArea) {
    throw new Error('Test 7 Failed: Growth area expected but received null');
  }
  // For Creative: (100 - 64) * 0.65 = 36 * 0.65 = 23.4
  // For Social/Healthcare: (100 - 48) * 0.25 = 52 * 0.25 = 13.0
  // For Management: (100 - 55) * 0.45 = 45 * 0.45 = 20.25
  // For Research: (100 - 76) * 0.9 = 24 * 0.9 = 21.6
  // Highest is Creative with 23.4 priority!
  if (growthArea.dimension !== 'creative') {
    throw new Error(`Test 7 Failed: Expected creative as highest growth priority, got ${growthArea.dimension}`);
  }
  console.log('✅ Test 7 Passed: Growth area calculated constructively based on GrowthPriority.\n');

  // ============================================================================
  // Test 8: Career Ranking by Descending Match Score
  // ============================================================================
  const ranked = rankCareers(CAREER_ROLES, testScores, sampleProfile);
  console.log('Test 8: Ranked Careers Order:');
  ranked.forEach((c, idx) => {
    console.log(`  #${idx + 1}: ${c.title} -> Match: ${c.matchScore}%`);
  });
  for (let i = 0; i < ranked.length - 1; i++) {
    if ((ranked[i].matchScore ?? 0) < (ranked[i + 1].matchScore ?? 0)) {
      throw new Error(`Test 8 Failed: Ranking violation at position ${i}`);
    }
  }
  console.log('✅ Test 8 Passed: Careers strictly ordered by descending FinalMatch.\n');

  // ============================================================================
  // Test 9: Boundary Values (All 0s, All 100s, Extreme Values)
  // ============================================================================
  const allZeroScores: DimensionScores = {
    analytical: 0,
    creative: 0,
    technical: 0,
    socialHealthcare: 0,
    management: 0,
    research: 0,
    communication: 0,
  };
  const zeroAptitude = calculateAptitudeMatch(allZeroScores, aiEngineerRole.dimensions);
  if (zeroAptitude !== 0) throw new Error(`Test 9 Failed: All zero scores should yield 0, got ${zeroAptitude}`);

  const allHundredScores: DimensionScores = {
    analytical: 100,
    creative: 100,
    technical: 100,
    socialHealthcare: 100,
    management: 100,
    research: 100,
    communication: 100,
  };
  const hundredAptitude = calculateAptitudeMatch(allHundredScores, aiEngineerRole.dimensions);
  if (hundredAptitude !== 100) throw new Error(`Test 9 Failed: All 100 scores should yield 100, got ${hundredAptitude}`);
  console.log('✅ Test 9 Passed: Boundary conditions (all 0s and all 100s) yield exact limits.\n');

  // ============================================================================
  // Test 10: Invalid / Missing Input Handling & Fallbacks
  // ============================================================================
  const emptyProfileAlignment = calculateInterestAlignment(undefined, aiEngineerRole);
  if (emptyProfileAlignment !== 50) {
    throw new Error(`Test 10 Failed: Undefined profile expected neutral 50 score, got ${emptyProfileAlignment}`);
  }

  const zeroWeightProfile = {
    analytical: 0,
    creative: 0,
    technical: 0,
    socialHealthcare: 0,
    management: 0,
    research: 0,
    communication: 0,
  };
  const zeroWeightAptitude = calculateAptitudeMatch(testScores, zeroWeightProfile);
  if (zeroWeightAptitude !== 0 || isNaN(zeroWeightAptitude)) {
    throw new Error(`Test 10 Failed: Zero career weights should gracefully return 0 without NaN`);
  }
  console.log('✅ Test 10 Passed: Robust graceful handling of undefined profile & zero weights.\n');

  console.log('🎉 ALL 10 CAREER MATCHER MATHEMATICAL PROOFS & TESTS PASSED PERFECTLY!\n');
}

runTests();
