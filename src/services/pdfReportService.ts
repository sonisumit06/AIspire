import { jsPDF } from 'jspdf';
import { DIMENSIONS } from '../data/questions';
import { CAREER_ROLES } from '../data/careers';
import type {
  UserProfile,
  DimensionScores,
  CareerRole,
  DimensionKey,
} from '../types';

export interface GenerateReportOptions {
  userProfile: UserProfile | null;
  dimensionScores: DimensionScores | null;
  rankedCareers: CareerRole[];
  selectedCareer: CareerRole | null;
  completedSteps: Record<string, number[]>;
}

const DIMENSION_LABELS: Record<DimensionKey, string> = {
  analytical: 'Analytical & Logic',
  creative: 'Creative & Design',
  technical: 'Technical & Engineering',
  socialHealthcare: 'Social & Healthcare',
  management: 'Management & Leadership',
  research: 'Research & Science',
  communication: 'Communication & Linguistics',
};

function getProficiencyLevel(score: number): { label: string; color: [number, number, number] } {
  if (score >= 80) return { label: 'Mastery / Exceptional', color: [16, 185, 129] };
  if (score >= 65) return { label: 'Advanced Competence', color: [99, 102, 241] };
  if (score >= 50) return { label: 'Proficient', color: [14, 165, 233] };
  return { label: 'Developing / Foundational', color: [148, 163, 184] };
}

/**
 * Generates and downloads a publication-grade, multi-page PDF Career Report for the student.
 */
export async function generateCareerReportPdf(options: GenerateReportOptions): Promise<jsPDF> {
  const {
    userProfile,
    dimensionScores,
    rankedCareers,
    selectedCareer: activeSelectedCareer,
    completedSteps,
  } = options;

  const career = activeSelectedCareer || rankedCareers[0] || CAREER_ROLES[0];
  const activeCompleted = completedSteps[career.id] || [];
  const progressPercent = Math.round((activeCompleted.length / 10) * 100);

  const studentName = userProfile?.name?.trim() || 'Student';
  const sanitizedFilename = studentName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const reportRef = `AIS-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  // Create document in portrait A4 (width: 595.28 pt, height: 841.89 pt)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2; // 515.28 pt

  let currentY = margin;

  // Helper to check page break
  const checkPageBreak = (neededHeight: number): boolean => {
    if (currentY + neededHeight > pageHeight - 50) {
      doc.addPage();
      currentY = 50;
      return true;
    }
    return false;
  };

  // ============================================================================
  // PAGE 1: HEADER BANNER, STUDENT PROFILE & 7D COGNITIVE APTITUDE
  // ============================================================================

  // 1. Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.roundedRect(margin, currentY, contentWidth, 76, 6, 6, 'F');

  // Badge inside banner
  doc.setFillColor(30, 41, 59); // slate-800
  doc.roundedRect(margin + 16, currentY + 14, 168, 14, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(52, 211, 153); // emerald-400
  doc.text('AISPIRE • CAREER & APTITUDE REPORT', margin + 22, currentY + 24);

  // Title inside banner
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('Cognitive Profile & Career Blueprint', margin + 16, currentY + 48);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('Deterministic Aptitude Evaluation & 10-Step Execution Roadmap', margin + 16, currentY + 62);

  // Metadata block (right aligned)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`Report ID: ${reportRef}`, pageWidth - margin - 16, currentY + 26, { align: 'right' });
  doc.text(`Generated: ${dateStr}`, pageWidth - margin - 16, currentY + 40, { align: 'right' });
  doc.text('Engine: Deterministic 7D', pageWidth - margin - 16, currentY + 54, { align: 'right' });

  currentY += 90;

  // 2. Student Profile Summary Card
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(1);
  doc.roundedRect(margin, currentY, contentWidth, 54, 6, 6, 'FD');

  const colWidth = contentWidth / 4;
  
  // Col 1: Student Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('STUDENT NAME', margin + 12, currentY + 18);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  const truncatedName = doc.splitTextToSize(studentName, colWidth - 20)[0] || studentName;
  doc.text(truncatedName, margin + 12, currentY + 34);

  // Col 2: Education Stage
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('EDUCATION STAGE', margin + colWidth + 8, currentY + 18);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  const education = userProfile?.educationLevel || 'High School / College';
  doc.text(doc.splitTextToSize(education, colWidth - 16)[0] || education, margin + colWidth + 8, currentY + 34);

  // Col 3: Interests
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('INTEREST FOCUS', margin + colWidth * 2 + 8, currentY + 18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  const interests = (userProfile?.interests && userProfile.interests.length > 0)
    ? userProfile.interests.slice(0, 2).join(', ')
    : 'Technology, Science';
  doc.text(doc.splitTextToSize(interests, colWidth - 16)[0] || interests, margin + colWidth * 2 + 8, currentY + 34);

  // Col 4: Primary Goal
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('TARGET GOAL', margin + colWidth * 3 + 8, currentY + 18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  const goals = userProfile?.targetGoals || 'Career Discovery & Growth';
  doc.text(doc.splitTextToSize(goals, colWidth - 16)[0] || goals, margin + colWidth * 3 + 8, currentY + 34);

  currentY += 68;

  // 3. 7-Dimensional Cognitive Aptitude Breakdown
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('7-Dimensional Cognitive Aptitude Breakdown', margin, currentY + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'Normalized percentile scores computed from 20 situational judgment scenarios across cognitive domains.',
    margin,
    currentY + 22
  );

  currentY += 32;

  // Dimension Bars Table
  const sortedDimensions = [...DIMENSIONS].map((d) => {
    const rawScore = dimensionScores ? dimensionScores[d.key] ?? 50 : 50;
    return {
      key: d.key,
      label: DIMENSION_LABELS[d.key] || d.label,
      score: Math.round(rawScore),
    };
  }).sort((a, b) => b.score - a.score);

  // Render each dimension bar row
  for (const item of sortedDimensions) {
    const proficiency = getProficiencyLevel(item.score);

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(241, 245, 249);
    doc.setLineWidth(1);
    doc.roundedRect(margin, currentY, contentWidth, 26, 4, 4, 'FD');

    // Label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text(item.label, margin + 12, currentY + 16);

    // Progress Bar Track
    const barX = margin + 175;
    const barWidth = 180;
    const barHeight = 8;
    const barY = currentY + 9;

    doc.setFillColor(226, 232, 240); // empty track
    doc.roundedRect(barX, barY, barWidth, barHeight, 3, 3, 'F');

    // Filled progress
    const fillWidth = Math.max(6, Math.min(barWidth, (item.score / 100) * barWidth));
    doc.setFillColor(proficiency.color[0], proficiency.color[1], proficiency.color[2]);
    doc.roundedRect(barX, barY, fillWidth, barHeight, 3, 3, 'F');

    // Score Text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(`${item.score}%`, barX + barWidth + 14, currentY + 16);

    // Proficiency Badge
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(proficiency.color[0], proficiency.color[1], proficiency.color[2]);
    doc.text(proficiency.label, pageWidth - margin - 12, currentY + 16, { align: 'right' });

    currentY += 31;
  }

  // 4. Cognitive Strengths Summary Box
  currentY += 8;
  doc.setFillColor(240, 253, 250); // teal-50
  doc.setDrawColor(153, 246, 228); // teal-200
  doc.setLineWidth(1);
  doc.roundedRect(margin, currentY, contentWidth, 54, 6, 6, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(13, 148, 136); // teal-600
  doc.text('PRIMARY COGNITIVE ADVANTAGES', margin + 14, currentY + 18);

  const top3 = sortedDimensions.slice(0, 3);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  const strengthsText = `Your leading strengths are ${top3.map((s) => `${s.label} (${s.score}%)`).join(', ')}. These dimensions establish your intellectual baseline and indicate strong natural capability in analytical formulation, systematic execution, and disciplined problem solving.`;
  const wrappedStrengths = doc.splitTextToSize(strengthsText, contentWidth - 28);
  doc.text(wrappedStrengths, margin + 14, currentY + 31);

  // ============================================================================
  // PAGE 2: CAREER SPECTRUM & SELECTED CAREER IN-DEPTH PROFILE
  // ============================================================================
  doc.addPage();
  currentY = 50;

  // Section Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('Career Recommendation Spectrum', margin, currentY + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'Deterministic Compatibility: Final Match = (Aptitude Match x 85%) + (Interest Alignment x 15%)',
    margin,
    currentY + 22
  );

  currentY += 34;

  // Ranked Careers Table Header
  doc.setFillColor(241, 245, 249); // slate-100
  doc.roundedRect(margin, currentY, contentWidth, 20, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('RANK', margin + 10, currentY + 13);
  doc.text('CAREER ROLE', margin + 50, currentY + 13);
  doc.text('DOMAIN', margin + 240, currentY + 13);
  doc.text('APTITUDE', margin + 340, currentY + 13);
  doc.text('INTEREST', margin + 410, currentY + 13);
  doc.text('FINAL MATCH', pageWidth - margin - 10, currentY + 13, { align: 'right' });

  currentY += 24;

  // Table Rows (top 6 careers)
  const displayCareers = rankedCareers.length > 0 ? rankedCareers.slice(0, 6) : CAREER_ROLES.slice(0, 6);
  displayCareers.forEach((cr, idx) => {
    const isPrimary = idx === 0 || cr.id === career.id;
    if (isPrimary) {
      doc.setFillColor(238, 242, 255); // indigo-50
      doc.setDrawColor(199, 210, 254);
      doc.roundedRect(margin, currentY, contentWidth, 22, 3, 3, 'FD');
    } else {
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(241, 245, 249);
      doc.roundedRect(margin, currentY, contentWidth, 22, 3, 3, 'FD');
    }

    // Rank
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(isPrimary ? 79 : 100, isPrimary ? 70 : 116, isPrimary ? 229 : 139);
    doc.text(`#${idx + 1}`, margin + 12, currentY + 14);

    // Career Title
    doc.setFont('helvetica', isPrimary ? 'bold' : 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(doc.splitTextToSize(cr.title, 180)[0] || cr.title, margin + 50, currentY + 14);

    // Category
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(cr.category, margin + 240, currentY + 14);

    // Aptitude %
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text(`${cr.aptitudeMatch ?? 70}%`, margin + 348, currentY + 14);

    // Interest %
    doc.text(`${cr.interestAlignment ?? 65}%`, margin + 418, currentY + 14);

    // Final Match %
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(isPrimary ? 67 : 15, isPrimary ? 56 : 23, isPrimary ? 202 : 42);
    doc.text(`${cr.matchScore ?? 70}%`, pageWidth - margin - 12, currentY + 14, { align: 'right' });

    currentY += 26;
  });

  currentY += 12;

  // Selected Career Detailed Blueprint Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(1);
  doc.roundedRect(margin, currentY, contentWidth, 180, 6, 6, 'FD');

  // Title header inside box
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(67, 56, 202); // indigo-700
  doc.text(`SELECTED FOCUS: ${career.title.toUpperCase()}`, margin + 14, currentY + 20);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(16, 185, 129);
  doc.text(
    `Overall Compatibility: ${career.matchScore ?? 75}%  •  Category: ${career.category}`,
    margin + 14,
    currentY + 34
  );

  // Description
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  const descLines = doc.splitTextToSize(career.description, contentWidth - 28);
  doc.text(descLines.slice(0, 2), margin + 14, currentY + 48);

  // Market Metrics Bar
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin + 14, currentY + 68, contentWidth - 28, 24, 4, 4, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Salary Band: ${career.salaryRange}`, margin + 24, currentY + 83);
  doc.text(`Market Growth: ${career.growthRate}`, margin + 180, currentY + 83);
  doc.text(`Talent Demand: ${career.demandLevel}`, margin + 340, currentY + 83);

  // Why this career fits you (Alignment Evidence)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text('Key Strength Alignment Evidence:', margin + 14, currentY + 106);

  const evidence = career.whyThisCareer && career.whyThisCareer.length > 0
    ? career.whyThisCareer.slice(0, 2)
    : [
        `High technical and analytical dimension scores align with the cognitive demands of this role.`,
        `Solid problem-solving aptitude supports structured execution along the roadmap milestones.`,
      ];

  let evY = currentY + 118;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  for (const ev of evidence) {
    const bulletText = `• ${ev}`;
    const wrapped = doc.splitTextToSize(bulletText, contentWidth - 28);
    doc.text(wrapped[0] || bulletText, margin + 14, evY);
    evY += 12;
  }

  // Growth area advice
  if (career.growthArea) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(180, 83, 9); // amber-700
    doc.text(`Recommended Growth Area (${career.growthArea.dimensionLabel}):`, margin + 14, evY + 4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    const adviceText = doc.splitTextToSize(career.growthArea.constructiveAdvice, contentWidth - 28);
    doc.text(adviceText[0] || career.growthArea.constructiveAdvice, margin + 14, evY + 16);
  }

  // ============================================================================
  // PAGES 3 & 4: 10-STEP ACTIONABLE CAREER ROADMAP
  // ============================================================================
  doc.addPage();
  currentY = 50;

  // Roadmap Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(`10-Step Execution Roadmap: ${career.title}`, margin, currentY + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Sequential milestone blueprint. Current Status: ${activeCompleted.length} of 10 steps completed (${progressPercent}%).`,
    margin,
    currentY + 22
  );

  // Overall Progress Bar
  const progY = currentY + 30;
  doc.setFillColor(226, 232, 240);
  doc.roundedRect(margin, progY, contentWidth, 8, 3, 3, 'F');
  const progFill = Math.max(4, (progressPercent / 100) * contentWidth);
  doc.setFillColor(16, 185, 129);
  doc.roundedRect(margin, progY, progFill, 8, 3, 3, 'F');

  currentY += 48;

  // Render 10 Steps with automated pagination
  for (const step of career.roadmap) {
    const isCompleted = activeCompleted.includes(step.stepNumber);
    const stepCardHeight = 62;

    checkPageBreak(stepCardHeight + 10);

    // Step Card
    doc.setFillColor(isCompleted ? 240 : 255, isCompleted ? 253 : 255, isCompleted ? 250 : 255);
    doc.setDrawColor(isCompleted ? 167 : 226, isCompleted ? 243 : 232, isCompleted ? 208 : 240);
    doc.setLineWidth(1);
    doc.roundedRect(margin, currentY, contentWidth, stepCardHeight, 5, 5, 'FD');

    // Step Number Badge
    doc.setFillColor(isCompleted ? 16 : 99, isCompleted ? 185 : 102, isCompleted ? 129 : 241);
    doc.roundedRect(margin + 10, currentY + 10, 22, 16, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(String(step.stepNumber), margin + 17, currentY + 21);

    // Title & Phase
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(step.title, margin + 40, currentY + 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`${step.phase}  •  Timeline: ${step.timeline}`, margin + 40, currentY + 29);

    // Status Badge
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    if (isCompleted) {
      doc.setTextColor(16, 185, 129);
      doc.text('[ COMPLETED ]', pageWidth - margin - 12, currentY + 18, { align: 'right' });
    } else {
      doc.setTextColor(148, 163, 184);
      doc.text('[ IN PROGRESS ]', pageWidth - margin - 12, currentY + 18, { align: 'right' });
    }

    // Milestone Goal
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text('Key Milestone:', margin + 12, currentY + 44);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    const goalText = doc.splitTextToSize(step.milestoneGoal, contentWidth - 100);
    doc.text(goalText[0] || step.milestoneGoal, margin + 78, currentY + 44);

    // Key Skills / Tools
    const skillList = step.keySkills.slice(0, 4).join(', ');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text('Skills & Tools:', margin + 12, currentY + 56);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(skillList, margin + 78, currentY + 56);

    currentY += stepCardHeight + 8;
  }

  // ============================================================================
  // GLOBAL PAGE HEADERS AND FOOTERS (APPLIED TO ALL PAGES)
  // ============================================================================
  const totalPages = doc.getNumberOfPages();

  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);

    // Running Header (pages 2+)
    if (p > 1) {
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(margin, 36, pageWidth - margin, 36);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text('AISPIRE CAREER PLATFORM', margin, 30);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text(`Student: ${studentName}  |  Ref: ${reportRef}`, pageWidth - margin, 30, { align: 'right' });
    }

    // Running Footer (all pages)
    const footerY = pageHeight - 26;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(margin, footerY - 8, pageWidth - margin, footerY - 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text('Confidential & Prepared exclusively via AIspire Platform • Deterministic Guidance Engine', margin, footerY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(`Page ${p} of ${totalPages}`, pageWidth - margin, footerY, { align: 'right' });
  }

  // If running in browser, trigger save
  if (typeof window !== 'undefined') {
    doc.save(`AIspire_Career_Report_${sanitizedFilename}.pdf`);
  }

  return doc;
}

