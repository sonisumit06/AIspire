import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv, type Plugin } from 'vite';

// Explicit sexual content patterns for server-side safety verification
const EXPLICIT_SEXUAL_PATTERNS = [
  /\b(porn|pornography|porno|nsfw|erotic|erotica|hentai|xx{1,3}|nude|nudes|nudity)\b/i,
  /\b(sex|sexual|sexually|intercourse|copulation|fetish|masturbat\w*|horny|orgasm)\b/i,
  /\b(blowjob|handjob|cum|dick|pussy|vagina|penis|boobs|breasts|clitoris|anal)\b/i,
  /\b(strip club|escort|hooker|prostitut\w*|camgirl|onlyfans)\b/i,
  /\b(sexual roleplay|sext\w*|erotic story|sexual fantasy|erotic roleplay)\b/i,
];

function buildServerSystemInstruction(careerId?: string, currentStepNumber?: number, careerTitle?: string): string {
  const target = careerTitle || (careerId ? `Target Career: ${careerId}` : 'General Career Exploration');
  const stepText = currentStepNumber ? ` (Roadmap Step ${currentStepNumber} of 10)` : '';
  return `You are AIspire's official AI Career & Academic Mentor for students.
Your mission is to provide realistic, inspiring, structured, age-appropriate, and actionable guidance.

CONTEXT:
- Target Domain: ${target}${stepText}

STRICT SAFETY AND SCOPE BOUNDARIES:
1. Purely Educational & Career Focused: Discuss career roadmaps, college/school studies, technical/soft skills, project ideas, portfolio building, and milestone execution.
2. Tone & Formatting: Warm, empathetic, encouraging, clear, and structured. Use Markdown formatting (headings, bullet points, and bold key terms) to make responses easy to read.
3. Hard Refusal: Under NO circumstances assist with sexually explicit, pornographic, erotic, NSFW, violent, or unsafe queries. If asked, respond strictly with: "I can't help with explicit sexual content or unsafe inquiries. I can help with your studies, career planning, skills, or other educational questions."
4. Scope Redirection: If asked for medical diagnoses, formal legal counsel, speculative financial trading, or romantic companionship, politely redirect the student to academic pathways.`;
}

async function handleAiMentorRequest(req: any, res: any, env: Record<string, string>) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  let body = '';
  req.on('data', (chunk: any) => {
    body += chunk;
  });

  req.on('end', async () => {
    res.setHeader('Content-Type', 'application/json');
    try {
      const data = JSON.parse(body || '{}');
      const prompt = (data.prompt || '').trim();

      if (!prompt) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'Prompt cannot be empty' }));
        return;
      }

      if (prompt.length > 1000) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'Prompt exceeds maximum length of 1000 characters' }));
        return;
      }

      // 1. Mandatory Fast-Path Safety Check
      for (const pattern of EXPLICIT_SEXUAL_PATTERNS) {
        if (pattern.test(prompt)) {
          res.statusCode = 200;
          res.end(
            JSON.stringify({
              answer:
                "I can't help with explicit sexual content or unsafe inquiries. I can help with your studies, career planning, skills, or other educational questions.",
              refused: true,
              usedGemini: false,
            })
          );
          return;
        }
      }

      // 2. Server-side API key check
      const apiKey =
        process.env.GEMINI_API_KEY ||
        env.GEMINI_API_KEY ||
        process.env.VITE_GEMINI_API_KEY ||
        env.VITE_GEMINI_API_KEY;

      if (!apiKey || apiKey.trim().length < 5) {
        res.statusCode = 503;
        res.end(
          JSON.stringify({
            error: 'GEMINI_API_KEY is not configured on the server',
            fallback: true,
          })
        );
        return;
      }

      // 3. Server-side system instruction
      const serverSystemInstruction = buildServerSystemInstruction(
        data.careerId,
        data.currentStepNumber,
        data.careerTitle
      );

      // 4. Multi-turn conversation contents
      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
      if (Array.isArray(data.chatHistory) && data.chatHistory.length > 0) {
        for (const msg of data.chatHistory.slice(-8)) {
          if (msg && typeof msg.text === 'string' && msg.text.trim()) {
            contents.push({
              role: msg.sender === 'user' ? 'user' : 'model',
              parts: [{ text: msg.text.trim() }],
            });
          }
        }
      }

      // Always ensure current prompt is the final user message
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
          parts: [{ text: serverSystemInstruction }],
        },
        contents,
        safetySettings: [
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_LOW_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_LOW_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_LOW_AND_ABOVE' },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1200,
        },
      };

      // 5. Call Gemini API with model fallback
      const modelsToTry = ['gemini-3.6-flash', 'gemini-flash-latest'];
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
            console.warn(`Gemini model ${model} failed (${res.status}):`, lastErrText);
          }
        } catch (fetchErr) {
          console.warn(`Gemini fetch error on model ${model}:`, fetchErr);
        }
      }

      if (!geminiRes) {
        res.statusCode = 502;
        res.end(
          JSON.stringify({
            error: 'Gemini upstream service unavailable',
            details: lastErrText,
            fallback: true,
          })
        );
        return;
      }

      const resData: any = await geminiRes.json();
      const candidate = resData?.candidates?.[0];

      if (candidate?.finishReason === 'SAFETY') {
        res.statusCode = 200;
        res.end(
          JSON.stringify({
            answer:
              "I can't help with explicit sexual content or unsafe inquiries. I can help with your studies, career planning, skills, or other educational questions.",
            refused: true,
            usedGemini: true,
          })
        );
        return;
      }

      // Filter out any thinking blocks and join text parts
      const textParts =
        candidate?.content?.parts
          ?.filter((p: any) => !p.thought)
          ?.map((p: any) => p.text)
          ?.filter(Boolean) || [];

      const answer = textParts.join('\n\n').trim() || candidate?.content?.parts?.[0]?.text?.trim() || '';

      if (!answer) {
        res.statusCode = 502;
        res.end(
          JSON.stringify({
            error: 'Gemini returned empty response',
            fallback: true,
          })
        );
        return;
      }

      res.statusCode = 200;
      res.end(JSON.stringify({ answer, usedGemini: true }));
    } catch (err) {
      console.error('AI Mentor middleware error:', err);
      res.statusCode = 500;
      res.end(
        JSON.stringify({
          error: 'Internal server error processing AI request',
          fallback: true,
        })
      );
    }
  });
}

function aiMentorApiPlugin(): Plugin {
  let env: Record<string, string> = {};

  return {
    name: 'ai-mentor-api',
    configResolved(config) {
      env = loadEnv(config.mode, process.cwd(), '');
    },
    configureServer(server) {
      server.middlewares.use('/api/ai-mentor', (req, res) => handleAiMentorRequest(req, res, env));
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/ai-mentor', (req, res) => handleAiMentorRequest(req, res, env));
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), aiMentorApiPlugin()],
});
