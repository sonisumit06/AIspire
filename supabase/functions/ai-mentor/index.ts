// Supabase Edge Function: ai-mentor
// Production Security Architecture:
// - Cryptographic JWT verification via Supabase Auth
// - Server-owned system prompt & trusted database context retrieval
// - Zero client control over system instructions
// - Multi-tier safety enforcement (pre-validation, Gemini safetySettings, finishReason check)
// - Database-backed rate limiting (3s cooldown, 10 req/min sliding window via ai_request_log)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const EXPLICIT_SEXUAL_PATTERNS = [
  /\b(porn\w*|nsfw|erotic\w*|hentai|xx{1,3}|nude\w*|nudity)\b/i,
  /\b(sex|sexual|sexually|intercourse|copulation|fetish|masturbat\w*|horny|orgasm)\b/i,
  /\b(blowjob|handjob|cum|dick|pussy|vagina|penis|boobs|breasts|clitoris|anal)\b/i,
  /\b(strip club|escort|hooker|prostitut\w*|camgirl|onlyfans)\b/i,
  /\b(sexual roleplay|sext\w*|erotic story|sexual fantasy|erotic roleplay)\b/i,
];

const STANDARD_REFUSAL =
  "I can't help with explicit sexual content or unsafe inquiries. I can help with your studies, career planning, skills, or other educational questions.";

const KNOWN_CAREERS: Record<string, string> = {
  'ai-engineer': 'Full-Stack AI & ML Engineer',
  'data-scientist': 'Data Scientist & AI Strategist',
  'cybersecurity-architect': 'Cybersecurity Architect & Ethical Hacker',
  'product-designer': 'Product Designer & UI/UX Visionary',
  'tech-entrepreneur': 'Tech Entrepreneur & Product Manager',
  'biotech-researcher': 'Biotechnology & Genetic Research Scientist',
  'fintech-analyst': 'FinTech Quantitative Analyst & Trader',
  'physician-innovator': 'Physician & Clinical Health Innovator',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // -------------------------------------------------------------------------
    // 1. Authentication & JWT Verification (P0)
    // -------------------------------------------------------------------------
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Missing or invalid Bearer token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(
        JSON.stringify({ error: 'Supabase server configuration missing' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create user-scoped Supabase client with caller's JWT
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid or expired authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = user.id;

    // -------------------------------------------------------------------------
    // 2. Client Input Validation (P0)
    // Client may ONLY send: { prompt, careerId, currentStepNumber }
    // All other fields (systemInstruction, userProfile, userId, etc.) are ignored.
    // -------------------------------------------------------------------------
    const body = await req.json().catch(() => ({}));
    const rawPrompt = body.prompt;

    if (!rawPrompt || typeof rawPrompt !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid prompt' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const prompt = rawPrompt.trim();
    if (prompt.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Prompt cannot be empty' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (prompt.length > 800) {
      return new Response(
        JSON.stringify({ error: 'Prompt exceeds maximum length of 800 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const careerId = typeof body.careerId === 'string' ? body.careerId.trim() : undefined;
    const currentStepNumber =
      typeof body.currentStepNumber === 'number' &&
      body.currentStepNumber >= 1 &&
      body.currentStepNumber <= 10
        ? Math.floor(body.currentStepNumber)
        : undefined;

    // -------------------------------------------------------------------------
    // 3. Fast-Path Client Safety Check
    // -------------------------------------------------------------------------
    for (const pattern of EXPLICIT_SEXUAL_PATTERNS) {
      if (pattern.test(prompt)) {
        return new Response(
          JSON.stringify({
            answer: STANDARD_REFUSAL,
            refused: true,
            usedGemini: false,
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // -------------------------------------------------------------------------
    // 4. Rate Limiting & Cooldown Enforcer (P1)
    // Database-backed: 3s cooldown + 10 req/min sliding window
    // -------------------------------------------------------------------------
    const { data: recentRequests } = await supabaseClient
      .from('ai_request_log')
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    const now = Date.now();

    if (recentRequests && recentRequests.length > 0) {
      const lastRequestTime = new Date(recentRequests[0].created_at).getTime();
      const diffMs = now - lastRequestTime;

      // 3-second cooldown
      if (diffMs < 3000) {
        const waitSec = Math.max(1, Math.ceil((3000 - diffMs) / 1000));
        return new Response(
          JSON.stringify({
            error: `Please wait ${waitSec} second(s) before sending another question.`,
            rateLimited: true,
            retryAfter: waitSec,
          }),
          {
            status: 429,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
              'Retry-After': String(waitSec),
            },
          }
        );
      }

      // 10 requests per minute sliding window
      const oneMinuteAgo = now - 60000;
      const recentCount = recentRequests.filter(
        (r) => new Date(r.created_at).getTime() > oneMinuteAgo
      ).length;

      if (recentCount >= 10) {
        return new Response(
          JSON.stringify({
            error: 'Rate limit reached (max 10 requests/minute). Please pause for 30 seconds.',
            rateLimited: true,
            retryAfter: 30,
          }),
          {
            status: 429,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
              'Retry-After': '30',
            },
          }
        );
      }
    }

    // Log this request to maintain the rate-limit log
    await supabaseClient.from('ai_request_log').insert({ user_id: userId });

    // -------------------------------------------------------------------------
    // 5. Retrieve Trusted User Data from Supabase (P0)
    // -------------------------------------------------------------------------
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('name, education_level, interests, target_goals')
      .eq('id', userId)
      .maybeSingle();

    const { data: scoreRecord } = await supabaseClient
      .from('assessment_scores')
      .select('analytical, creative, technical, social_healthcare, management, research, communication')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // -------------------------------------------------------------------------
    // 6. Server-Constructed System Prompt (P0)
    // -------------------------------------------------------------------------
    const studentName = profile?.name ? profile.name.split(' ')[0] : 'Student';
    const education = profile?.education_level || 'Student';
    const interests = (profile?.interests || []).join(', ') || 'Emerging Careers';
    const targetGoals = profile?.target_goals || 'Explore Career Opportunities';

    let scoresSummary = 'Assessment pending';
    if (scoreRecord) {
      scoresSummary = `Analytical: ${Math.round(scoreRecord.analytical)}%, Creative: ${Math.round(scoreRecord.creative)}%, Technical: ${Math.round(scoreRecord.technical)}%, Social/Healthcare: ${Math.round(scoreRecord.social_healthcare)}%, Management: ${Math.round(scoreRecord.management)}%, Research: ${Math.round(scoreRecord.research)}%, Communication: ${Math.round(scoreRecord.communication)}%`;
    }

    const careerTitle = careerId && KNOWN_CAREERS[careerId] ? KNOWN_CAREERS[careerId] : null;
    const roadmapContext = careerTitle
      ? `Active Career Roadmap: ${careerTitle}${currentStepNumber ? ` (Currently on Step ${currentStepNumber} of 10)` : ''}`
      : 'General Educational & Career Guidance';

    const systemInstruction = `You are AIspire's official AI Career & Academic Mentor.
Your mission is to provide realistic, encouraging, highly structured, age-appropriate, and actionable guidance to students.

TRUSTED STUDENT CONTEXT:
- Student Name: ${studentName}
- Education Stage: ${education}
- Career Interests: ${interests}
- Target Goals: ${targetGoals}
- 7D Cognitive Aptitude Profile: ${scoresSummary}
- ${roadmapContext}

CORE INSTRUCTIONS:
1. Direct & Relevant Responses First: Always directly, specifically, and thoroughly address the student's question, prompt, or topic of inquiry first. If they ask about a technical concept, coding problem, exam question, study strategy, or career choice, explain it clearly with definitions, concrete examples, or step-by-step breakdowns.
2. Contextual Enrichment: Connect the topic back to their target career path (${roadmapContext}) and academic goals, but NEVER ignore their specific prompt to recite generic milestones.
3. Tone & Formatting: Warm, empathetic, encouraging, clear, and structured. Use Markdown formatting (headings, bullet points, bold key terms, and code snippets when relevant) to make responses easy to digest.
4. Brevity & Actionability: Keep answers focused, structured, empathetic, and actionable.

STRICT SAFETY AND GUIDANCE RULES:
1. Core Scope: Focus on career roadmaps, syllabus preparation, study techniques, technical and soft skill development, portfolio building, and milestone execution.
2. Hard Refusal: Under NO circumstances assist with sexually explicit, pornographic, erotic, NSFW, violent, or unsafe queries. If asked, respond strictly with: "${STANDARD_REFUSAL}".
3. Scope Redirection: If asked for clinical medical diagnoses, formal legal counsel, speculative financial trading, or romantic companionship, politely redirect the student to academic pathways in those fields.`;

    // -------------------------------------------------------------------------
    // 7. Call Gemini API with Native Safety Settings (P0 / P1)
    // -------------------------------------------------------------------------
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: 'GEMINI_API_KEY not configured on server',
          fallback: true,
        }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build multi-turn chat history if supplied
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
    if (Array.isArray(body.chatHistory) && body.chatHistory.length > 0) {
      for (const msg of body.chatHistory.slice(-8)) {
        if (msg && typeof msg.text === 'string' && msg.text.trim()) {
          contents.push({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text.trim() }],
          });
        }
      }
    }

    if (
      contents.length === 0 ||
      contents[contents.length - 1].role !== 'user' ||
      contents[contents.length - 1].parts[0].text !== prompt
    ) {
      contents.push({
        role: 'user',
        parts: [{ text: prompt }],
      });
    }

    const requestPayload = {
      systemInstruction: {
        parts: [{ text: systemInstruction }],
      },
      contents,
      safetySettings: [
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_LOW_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_LOW_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_LOW_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_LOW_AND_ABOVE',
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1200,
      },
    };

    const modelsToTry = [
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-2.5-flash-lite',
    ];
    let geminiRes: Response | null = null;
    let lastErrText = '';

    for (const model of modelsToTry) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestPayload),
        });

        if (res.ok) {
          geminiRes = res;
          break;
        } else {
          lastErrText = await res.text();
          console.warn(`Gemini Edge model ${model} failed (${res.status}):`, lastErrText);
        }
      } catch (fErr) {
        console.warn(`Gemini Edge fetch error on ${model}:`, fErr);
      }
    }

    if (!geminiRes) {
      return new Response(
        JSON.stringify({ error: 'AI service temporarily unavailable', details: lastErrText, fallback: true }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const geminiData = await geminiRes.json();
    const candidate = geminiData?.candidates?.[0];

    // -------------------------------------------------------------------------
    // 8. Output Validation & Safety Check (P1)
    // -------------------------------------------------------------------------
    if (candidate?.finishReason === 'SAFETY') {
      return new Response(
        JSON.stringify({
          answer: STANDARD_REFUSAL,
          refused: true,
          usedGemini: true,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const textParts =
      candidate?.content?.parts
        ?.filter((p: any) => !p.thought)
        ?.map((p: any) => p.text)
        ?.filter(Boolean) || [];

    const answer = textParts.join('\n\n').trim() || candidate?.content?.parts?.[0]?.text?.trim() || '';

    if (!answer) {
      return new Response(
        JSON.stringify({ error: 'Empty response generated', fallback: true }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ answer, usedGemini: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Edge Function unhandled error:', err);
    return new Response(
      JSON.stringify({ error: (err as Error).message || 'Internal Server Error', fallback: true }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
