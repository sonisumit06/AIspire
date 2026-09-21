import { generateCareerReportPdf } from './pdfReportService';
import { CAREER_ROLES } from '../data/careers';
import type { UserProfile, DimensionScores } from '../types';

async function testPdfGeneration() {
  console.log('📄 Testing PDF Career Report Generator...');

  const mockProfile: UserProfile = {
    id: 'test-user-uuid-1234',
    name: 'Aarav Sharma',
    email: 'aarav@example.com',
    educationLevel: 'Undergraduate Computer Science',
    interests: ['Artificial Intelligence', 'Software Architecture', 'Robotics'],
    targetGoals: 'Become a Senior AI Research Engineer',
    joinedDate: '2026-09-01',
    isProfileComplete: true,
  };

  const mockScores: DimensionScores = {
    analytical: 92,
    creative: 68,
    technical: 95,
    socialHealthcare: 44,
    management: 70,
    research: 88,
    communication: 74,
  };

  const mockRanked = CAREER_ROLES.map((c, i) => ({
    ...c,
    matchScore: 92 - i * 4,
    aptitudeMatch: 94 - i * 3,
    interestAlignment: 85 - i * 5,
    whyThisCareer: [
      `High Technical & Engineering aptitude aligns directly with the requirements of ${c.title}.`,
      `Strong Analytical skills support complex problem decomposition and algorithmic thinking.`,
    ],
    growthArea: {
      dimension: 'socialHealthcare' as const,
      dimensionLabel: 'Social & Healthcare',
      constructiveAdvice: 'Focus on interdisciplinary collaboration and cross-functional stakeholder communication.',
      priorityScore: 28,
    },
  }));

  const mockCompletedSteps: Record<string, number[]> = {
    'ai-engineer': [1, 2, 3],
  };

  const doc = await generateCareerReportPdf({
    userProfile: mockProfile,
    dimensionScores: mockScores,
    rankedCareers: mockRanked,
    selectedCareer: mockRanked[0],
    completedSteps: mockCompletedSteps,
  });

  const pageCount = doc.getNumberOfPages();
  console.log(`Generated Document has ${pageCount} pages.`);

  if (pageCount < 3) {
    throw new Error(`Expected at least 3 pages in report, but got ${pageCount}`);
  }

  console.log('✅ PDF Career Report generation test passed successfully!\n');
}

testPdfGeneration().catch((err) => {
  console.error('❌ PDF Test Failed:', err);
  throw err;
});
