# AIspire Security Architecture & Threat Model

This document outlines the security specifications, threat mitigations, and safety guarantees implemented across the AIspire platform.

---

## 1. Threat Model & Mitigations

| Threat | Attack Vector | AIspire Mitigation |
| :--- | :--- | :--- |
| **API Key Theft** | Inspecting client JavaScript bundles or network tabs for Gemini keys | **Zero Client Keys:** `GEMINI_API_KEY` exists exclusively as a Supabase Edge Function environment secret. |
| **Unauthenticated Edge Invocations** | Malicious actors querying the Edge Function directly | **Cryptographic JWT Verification:** Edge function extracts `Bearer <token>` and executes `supabase.auth.getUser()`. Unauthenticated calls yield HTTP 401. |
| **Prompt Injection / Jailbreaking** | User instructs AI to ignore safety rules or act as an offensive persona | **Multi-Tier Prompt Isolation:** Client cannot supply system prompts. Server assembles the prompt using vetted templates, strict refusal rules, and safe context. |
| **Denial of Service / Quota Exhaustion** | Automated scripts spamming the AI Mentor endpoint | **Dual-Gate Rate Limiting:** 3-second rapid fire cooldown + 10 requests/minute sliding window backed by indexed PostgreSQL timestamps in `ai_request_log`. |
| **Unauthorized Data Modification** | User attempts to update or read another student's assessment or chat history | **Row Level Security (RLS):** Every PostgreSQL table enforces `auth.uid() = user_id`. Cross-tenant data leaks are physically blocked at the database engine level. |
| **Harmful / Sexual Content** | User queries model for adult, hateful, or self-harm content | **Native Gemini Safety Filters:** Model calls configure `safetySettings` with `BLOCK_LOW_AND_ABOVE` across all harm categories. Prompt refusal pre-screening checks fast-path rejection. |
| **Input Buffer Overflow / Cost Exploits** | User sends massive prompts to consume excessive tokens | **Input Length Clamping:** Client and server enforce a hard 800-character maximum on user prompts. |

---

## 2. Edge Function Authentication Details

The authentication lifecycle in `supabase/functions/ai-mentor/index.ts`:

```typescript
// 1. Extract Authorization header
const authHeader = req.headers.get('Authorization') ?? req.headers.get('authorization');
if (!authHeader || !authHeader.startsWith('Bearer ')) {
  return new Response(
    JSON.stringify({ error: 'Unauthorized: Missing or malformed Authorization header.' }),
    { status: 401, headers: corsHeaders }
  );
}

// 2. Validate token against Supabase Auth
const token = authHeader.replace('Bearer ', '').trim();
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: { headers: { Authorization: `Bearer ${token}` } }
});

const { data: { user }, error: userError } = await supabase.auth.getUser(token);
if (userError || !user) {
  return new Response(
    JSON.stringify({ error: 'Unauthorized: Invalid or expired authentication token.' }),
    { status: 401, headers: corsHeaders }
  );
}
```

---

## 3. Database-Backed Rate Limiting

Rate limiting is enforced per authenticated user UUID:

```sql
-- Querying recent requests in the sliding 1-minute window
SELECT created_at FROM ai_request_log
WHERE user_id = $1 AND created_at > (NOW() - INTERVAL '1 minute')
ORDER BY created_at DESC;
```

1. **Cooldown Check:** If the most recent record timestamp is `< 3 seconds` ago:
   - Status: HTTP 429 Too Many Requests
   - Message: `"Please wait a moment before sending another message (3s cooldown)."`
2. **Window Check:** If the count of records within the last 60 seconds is `>= 10`:
   - Status: HTTP 429 Too Many Requests
   - Message: `"Rate limit exceeded. You can send up to 10 messages per minute. Please try again shortly."`
3. **Audit Log:** On every successful prompt processing, a record is inserted into `ai_request_log (user_id, prompt_length, model, ip_hash)`.

---

## 4. Native Gemini Safety Thresholds

The following configuration is passed to the Gemini API SDK / REST endpoint:

```json
{
  "safetySettings": [
    { "category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_LOW_AND_ABOVE" },
    { "category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_LOW_AND_ABOVE" },
    { "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_LOW_AND_ABOVE" },
    { "category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_LOW_AND_ABOVE" }
  ]
}
```

If the model response triggers a block (`candidate.finishReason === 'SAFETY'`), the Edge Function intercepts the block and returns a polite educational redirect:
> *"I am an educational career counsellor. I can only assist with academic, career planning, and skill development questions."*

---

## 5. Row Level Security Policies

PostgreSQL RLS ensures that even if an attacker knew another user's UUID, queries would return 0 rows:

```sql
-- Example: assessment_scores table
ALTER TABLE assessment_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own scores"
  ON assessment_scores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scores"
  ON assessment_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scores"
  ON assessment_scores FOR UPDATE
  USING (auth.uid() = user_id);
```

