import type { CareerRole, ChatMessage, DimensionScores, ResourceItem, UserProfile } from '../types';
import { ALL_DIMENSION_KEYS } from './careerMatcher';
import { validatePromptSafety } from './aiSafety';

export interface AskAIOptions {
  prompt: string;
  userProfile?: Partial<UserProfile>;
  studentScores?: DimensionScores;
  selectedCareer?: CareerRole;
  chatHistory?: ChatMessage[];
  currentRoadmapStep?: number;
}

/**
 * Intelligent built-in heuristic advisor that runs completely offline with zero setup.
 * Generates insightful, encouraging, and actionable guidance based on the student's scores and inquiry.
 */
function generateBuiltInAdvice(options: AskAIOptions): string {
  const { prompt, userProfile, studentScores, selectedCareer, currentRoadmapStep } = options;
  const promptLower = prompt.toLowerCase().trim();
  const studentName = userProfile?.name || 'Student';

  // Find top cognitive dimension
  const topDim = studentScores
    ? ALL_DIMENSION_KEYS.reduce((a, b) =>
        (studentScores[a] ?? 0) > (studentScores[b] ?? 0) ? a : b
      )
    : 'analytical';

  const activeStepNumber = currentRoadmapStep || 1;
  const stepData = selectedCareer?.roadmap?.[activeStepNumber - 1] || selectedCareer?.roadmap?.[0];
  const careerName = selectedCareer?.title || 'your chosen career';

  // 1. Greetings & simple check-ins
  if (/^(hi|hello|hey|greetings|good\s+(morning|afternoon|evening)|howdy)\b/i.test(promptLower)) {
    return `Hello ${studentName}! I am your AIspire Career Mentor.

I'm here to help you navigate your academic path, prepare for future opportunities, and make steady progress in **${careerName}**.

Here are a few things we can explore right now:
- **Roadmap Milestones**: Break down Step ${stepData?.stepNumber || 1} (${stepData?.title || 'Foundations'}) into manageable weekly tasks.
- **Skill Strategy**: Identify the most in-demand technical and analytical skills for your profile.
- **Project Ideas**: Brainstorm capstone projects to showcase in college applications or technical interviews.

What would you like to focus on today?`;
  }

  // 2. Specific career or roadmap step inquiry
  if (
    promptLower.includes('roadmap') ||
    promptLower.includes('step') ||
    promptLower.includes('how to start') ||
    promptLower.includes('prepare') ||
    promptLower.includes('milestone')
  ) {
    if (stepData) {
      return `Here is your targeted milestone breakdown for **${careerName}** (Step ${stepData.stepNumber}):

### Step ${stepData.stepNumber}: ${stepData.title}

*   **Primary Deliverable**: ${stepData.milestoneGoal}
*   **Estimated Cadence**: ${stepData.timeline} (~6–8 focused hours/week)
*   **Recommended Tooling & Platforms**: ${stepData.recommendedTools.join(', ')}

#### Action Checklist for This Week:
1.  **Foundational Review**: Master the core concepts specified in this module before jumping to coding or tooling.
2.  **Hands-On Artifact**: Build a minimal, functional proof-of-concept proving your understanding. Document what you learned in a markdown repository.
3.  **Leverage Your Cognitive Strength**: Your **${topDim.toUpperCase()}** dimension gives you a distinct analytical advantage—lean into rigorous problem decomposition here.

Would you like recommended tutorials or sample problem statements for this step?`;
    }
  }

  // 3. Compensation, salary, scope & market demand
  if (
    promptLower.includes('salary') ||
    promptLower.includes('compensation') ||
    promptLower.includes('scope') ||
    promptLower.includes('future') ||
    promptLower.includes('demand') ||
    promptLower.includes('growth')
  ) {
    if (selectedCareer) {
      return `### Industry Outlook & Compensation: **${selectedCareer.title}**

*   **Compensation Range**: ${selectedCareer.salaryRange}
*   **5-Year Growth Trajectory**: ${selectedCareer.growthRate} (Market Demand is currently **${selectedCareer.demandLevel}**)
*   **Core Core Competencies**: ${selectedCareer.requiredSkills.join(', ')}

#### Career Insight:
This pathway features strong global demand and durable upward mobility. As automation transforms entry-level tasks, specialists with strong conceptual fundamentals and hands-on portfolio proof command premium roles across tech, finance, and enterprise labs.`;
    }
  }

  // 4. Portfolio, capstone & project suggestions
  if (
    promptLower.includes('project') ||
    promptLower.includes('portfolio') ||
    promptLower.includes('capstone') ||
    promptLower.includes('build')
  ) {
    return `### 3 Standout Portfolio Project Ideas for **${careerName}**:

1.  **End-to-End Core Utility**
    *   *Concept*: Build an open-source tool solving a real-world bottleneck in this space with clean API documentation and test coverage.
    *   *Skills Highlighted*: Architecture, code maintainability, Git workflow.
2.  **Data & Analytics Dashboard**
    *   *Concept*: Ingest live public data, process metrics through structured pipelines, and render an interactive visualization.
    *   *Skills Highlighted*: Data manipulation, system design, domain reasoning.
3.  **Client-Ready Capstone Solution**
    *   *Concept*: A production-deployed web application featuring user auth, structured databases, and responsive UI.
    *   *Skills Highlighted*: Full product lifecycle delivery.

Which of these three angles aligns closest with your immediate interests?`;
  }

  // 5. Aptitude test insights & score breakdown
  if (
    promptLower.includes('test') ||
    promptLower.includes('score') ||
    promptLower.includes('aptitude') ||
    promptLower.includes('strength') ||
    promptLower.includes('dimension')
  ) {
    if (studentScores) {
      const scoresSummary = ALL_DIMENSION_KEYS.map(
        (d) => `*   **${d.toUpperCase()}**: ${Math.round(studentScores[d] ?? 0)}%`
      ).join('\n');

      return `### Cognitive Profile Analysis: ${studentName}

${scoresSummary}

#### Strategic Takeaway:
Your strongest asset is **${topDim.toUpperCase()}**. In high-impact careers, top performers differentiate themselves by pairing their primary strength with secondary cross-disciplinary skills (such as communication and technical documentation).

Focus on projects where your natural analytical instincts accelerate your execution speed.`;
    }
  }

  // 6. University, college & exam strategies
  if (
    promptLower.includes('college') ||
    promptLower.includes('university') ||
    promptLower.includes('major') ||
    promptLower.includes('exam') ||
    promptLower.includes('degree')
  ) {
    return `### Academic & Examination Strategy for **${careerName}**:

*   **Target Degrees & Majors**: Computer Science, Data Science, Applied Mathematics, Information Systems, or Software Engineering.
*   **Standardized Assessments**: Emphasize quantitative aptitude, algorithmic reasoning, and verbal comprehension.
*   **High-Value Certifications**: Target vendor-neutral industry standards (such as AWS Certified Cloud Practitioner, HashiCorp, or Google Cloud Associate) during your sophomore or junior year.
*   **Key Academic Advice**: University grades open initial doors, but public project repositories and competitive programming / hackathon achievements secure top-tier interviews.`;
  }

  // 7. General encouraging mentor response
  return `### AIspire Career Guidance

Hello ${studentName}! Based on your current trajectory in **${careerName}**:

*   **Milestone-Driven Execution**: Treat long-term ambitions as a series of 10 compounding steps rather than an overwhelming single leap.
*   **Current Milestone**: Focus your energy on **Step ${stepData?.stepNumber || 1}: ${stepData?.title || 'Core Foundations'}**.
*   **Structured Preparation**: Check out the **Study & Exam Hub** for past examination papers, revision formula sheets, and curated lecture playlists.

What specific challenge or question can I help you tackle next?`;
}

import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Main AI counsellor function:
 * 1. Checks prompt safety and educational relevance.
 * 2. Primary Production Path: Supabase Edge Function with authenticated JWT (zero client system prompt).
 * 3. Local Development / Server-Side API Call (/api/ai-mentor middleware).
 * 4. Client-Side Gemini Fallback (if VITE_GEMINI_API_KEY is configured).
 * 5. Deterministic offline heuristic advisor.
 */
export async function askAICounsellor(options: AskAIOptions): Promise<{ answer: string; usedGemini: boolean }> {
  const { prompt, selectedCareer, currentRoadmapStep, chatHistory } = options;

  // 1. Safety & Relevance Validation
  const safetyCheck = validatePromptSafety(prompt);
  if (!safetyCheck.isSafe && safetyCheck.message) {
    return {
      answer: safetyCheck.message,
      usedGemini: false,
    };
  }

  if (safetyCheck.refusalReason === 'off_topic_redirect' && safetyCheck.message) {
    return {
      answer: safetyCheck.message,
      usedGemini: false,
    };
  }

  const payload = {
    prompt,
    careerId: selectedCareer?.id,
    careerTitle: selectedCareer?.title,
    currentStepNumber: currentRoadmapStep,
    chatHistory: chatHistory?.slice(-8).map((m) => ({
      sender: m.sender,
      text: m.text,
    })),
  };

  // 2. Primary Production Path: Supabase Edge Function
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.functions.invoke('ai-mentor', {
        body: payload,
      });

      if (!error && data?.answer) {
        return { answer: data.answer, usedGemini: !!data.usedGemini };
      }

      if (data?.error && data?.rateLimited) {
        return { answer: `⚠️ ${data.error}`, usedGemini: false };
      }

      if (error) {
        let errorMsg = error.message || '';
        if ('context' in error && (error as any).context) {
          try {
            const body = await (error as any).context.clone().json();
            if (body?.error) {
              errorMsg = body.error;
            }
          } catch {
            // Ignore json parse error
          }
        }
        if (
          errorMsg &&
          (errorMsg.includes('Rate limit') ||
            errorMsg.includes('cooldown') ||
            errorMsg.includes('wait a moment') ||
            errorMsg.includes('Too Many Requests'))
        ) {
          return { answer: `⚠️ ${errorMsg}`, usedGemini: false };
        }
        console.warn('Supabase Edge Function returned error, falling back:', errorMsg);
      }
    } catch (edgeErr) {
      console.warn('Supabase Edge Function invocation failed, falling back:', edgeErr);
    }
  }

  // 3. Development / Server-Side API Call (/api/ai-mentor middleware)
  try {
    const response = await fetch('/api/ai-mentor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.answer) {
        return { answer: data.answer, usedGemini: !!data.usedGemini };
      }
    }
  } catch (err) {
    console.warn('Development AI Mentor middleware call failed:', err);
  }

  // 4. Client-Side Direct Gemini Call (Resilient fallback if frontend API key is configured)
  const clientApiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (clientApiKey && typeof clientApiKey === 'string' && clientApiKey.length > 5) {
    try {
      const models = ['gemini-3.6-flash', 'gemini-flash-latest'];
      const targetCareerTitle = selectedCareer?.title || 'General Career Exploration';

      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
      if (chatHistory && chatHistory.length > 0) {
        for (const msg of chatHistory.slice(-8)) {
          contents.push({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }],
          });
        }
      }
      if (contents.length === 0 || contents[contents.length - 1].parts[0].text !== prompt) {
        contents.push({
          role: 'user',
          parts: [{ text: prompt }],
        });
      }

      for (const model of models) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${clientApiKey.trim()}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: {
              parts: [
                {
                  text: `You are AIspire's official AI Career & Academic Mentor for students. You provide realistic, inspiring, structured, age-appropriate guidance for ${targetCareerTitle} (Roadmap Step ${currentRoadmapStep || 1} of 10). Use Markdown formatting with headings, bullet points, and bold terms.`,
                },
              ],
            },
            contents,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1200,
            },
          }),
        });

        if (res.ok) {
          const resData = await res.json();
          const candidate = resData?.candidates?.[0];
          const textParts =
            candidate?.content?.parts
              ?.filter((p: any) => !p.thought)
              ?.map((p: any) => p.text)
              ?.filter(Boolean) || [];

          const answer =
            textParts.join('\n\n').trim() || candidate?.content?.parts?.[0]?.text?.trim() || '';

          if (answer) {
            return { answer, usedGemini: true };
          }
        }
      }
    } catch (clientErr) {
      console.warn('Client-side direct Gemini call failed:', clientErr);
    }
  }

  // 5. Deterministic offline heuristic advisor
  const fallbackAnswer = generateBuiltInAdvice(options);
  return { answer: fallbackAnswer, usedGemini: false };
}

/**
 * Dynamic Internet & Study Resource Generator for any search query
 */
export async function generateDynamicResources(
  query: string
): Promise<{ googleResources: ResourceItem[]; notesResources: ResourceItem[]; youtubeResources: ResourceItem[] }> {
  const cleanedQuery = query.trim();
  const encodedQuery = encodeURIComponent(cleanedQuery);

  const googleResources: ResourceItem[] = [
    {
      id: `dyn-g-1-${Date.now()}`,
      title: `${cleanedQuery} - Official Syllabus & Examination Guide`,
      type: 'google',
      category: 'Web Search',
      examOrSubjectId: 'custom-search',
      description: `Targeted search query for official academic curriculum, candidate requirements, and guidelines for ${cleanedQuery}.`,
      url: `https://www.google.com/search?q=${encodedQuery}+official+syllabus+curriculum+guide`,
      tags: ['Google Search', 'Official', cleanedQuery],
      authorOrSource: 'Official Educational Portal',
      badge: 'Official Syllabus',
    },
    {
      id: `dyn-g-2-${Date.now()}`,
      title: `${cleanedQuery} - Academic Notes & Revision Sheets (PDF Search)`,
      type: 'google',
      category: 'Web Search',
      examOrSubjectId: 'custom-search',
      description: `Direct search for downloadable revision formula sheets, cheat sheets, and university lecture slides for ${cleanedQuery}.`,
      url: `https://www.google.com/search?q=${encodedQuery}+lecture+notes+summary+cheat+sheet+filetype:pdf`,
      tags: ['PDF Search', 'Cheat Sheet', 'Lecture Slides'],
      authorOrSource: 'Academic Open Web',
      badge: 'Study Resource',
    },
    {
      id: `dyn-g-3-${Date.now()}`,
      title: `${cleanedQuery} - Past Question Papers & Practice Bank`,
      type: 'google',
      category: 'Web Search',
      examOrSubjectId: 'custom-search',
      description: `Targeted search indexing previous year question papers, model tests, and solved solutions with answer keys.`,
      url: `https://www.google.com/search?q=${encodedQuery}+past+question+papers+solved+answers+mcq`,
      tags: ['PYQ', 'Practice Questions', 'Answer Keys'],
      authorOrSource: 'Practice Repository',
      badge: 'Practice Bank',
    },
  ];

  const notesResources: ResourceItem[] = [
    {
      id: `dyn-n-1-${Date.now()}`,
      title: `${cleanedQuery} - High-Yield Conceptual Summary & Formula Guide`,
      type: 'notes',
      category: 'Study Notes',
      examOrSubjectId: 'custom-search',
      description: `Structured revision overview covering core principles, high-yield traps, and memory formulas for ${cleanedQuery}.`,
      url: `#notes-${encodedQuery}`,
      tags: ['Revision Notes', 'High Yield', 'Core Concepts'],
      authorOrSource: 'AIspire Academic Library',
      badge: 'Study Notes',
      notesContent: `
# High-Yield Revision Guide: ${cleanedQuery}

## 1. Executive Summary & Core Concept
- **Primary Objective**: Master the foundational principles and core problem-solving models for **${cleanedQuery}**.
- **First Principles**: Break problems into primary components before attempting multi-variable problems.
- **Common Trap**: Pay close attention to definitions, unit conversions, and boundary conditions.

## 2. Recommended Study Cadence
1. **Active Recall**: Dedicate 60% of your prep time to solving problems and 40% to reading theory.
2. **Formula & Terminology Vault**: Keep a clean 1-page formula sheet updated after every study block.
3. **Spaced Intervals**: Re-test yourself at 1 day, 7 days, and 30 days to cement retention.

## 3. Action Checklist
- [ ] Read through official syllabus topics.
- [ ] Solve 25+ past exam questions on this topic.
- [ ] Explain the concept out loud in plain language to test your understanding.
      `,
    },
  ];

  const youtubeResources: ResourceItem[] = [
    {
      id: `dyn-y-1-${Date.now()}`,
      title: `${cleanedQuery} - Comprehensive Video Masterclass & Full Course`,
      type: 'youtube',
      category: 'Video Lectures',
      examOrSubjectId: 'custom-search',
      description: `Curated YouTube search query finding top-rated full lectures, animated breakdowns, and tutorials for ${cleanedQuery}.`,
      url: `https://www.youtube.com/results?search_query=${encodedQuery}+full+course+lecture`,
      tags: ['YouTube', 'Video Course', 'Lectures'],
      authorOrSource: 'YouTube Learning',
      badge: 'Video Course',
      youtubeVideoId: '8mAITcNt710',
    },
    {
      id: `dyn-y-2-${Date.now()}`,
      title: `${cleanedQuery} - Rapid Revision Crash Course (Under 1 Hour)`,
      type: 'youtube',
      category: 'Video Lectures',
      examOrSubjectId: 'custom-search',
      description: `Find condensed crash courses and one-shot revision sessions perfect for quick exam preparation.`,
      url: `https://www.youtube.com/results?search_query=${encodedQuery}+one+shot+revision+crash+course`,
      tags: ['Crash Course', 'One Shot', 'Quick Review'],
      authorOrSource: 'YouTube Learning',
      badge: 'Video Course',
    },
  ];

  return { googleResources, notesResources, youtubeResources };
}
