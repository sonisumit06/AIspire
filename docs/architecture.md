# AIspire System Architecture

This document provides a deep technical architectural overview of AIspire, detailing data flow, zero-trust boundary isolation, component boundaries, and state synchronization.

---

## 1. High-Level Architectural Diagram

```
+-------------------------------------------------------------------------+
|                           CLIENT TIER (Browser)                         |
|                                                                         |
|  +-------------------------------------------------------------------+  |
|  |                React 19 Core Application (SPA)                    |  |
|  |                                                                   |  |
|  |  [Router / Views]                                                 |  |
|  |  • LoginView               • ProfileOnboardingView                |  |
|  |  • DashboardView           • AptitudeTestView                     |  |
|  |  • ResultsView             • RoadmapView                          |  |
|  |  • ResourcesView           • SettingsView                         |  |
|  |                                                                   |  |
|  |  [Global State / Context]                                         |  |
|  |  • AppContext (User Session, Active View, Cloud Sync Status)      |  |
|  |                                                                   |  |
|  |  [Presentation & Ambient Layer]                                  |  |
|  |  • Navbar, AIChatDrawer, InteractiveParticles Canvas              |  |
|  +-----------------------------------+-------------------------------+  |
|                                      |                                  |
|                                      | Service Abstraction Layer        |
|                                      v                                  |
|  +-------------------------------------------------------------------+  |
|  |                          Services Layer                           |  |
|  |  • supabase.ts             • geminiService.ts                     |  |
|  |  • careerMatcher.ts        • assessmentService.ts                 |  |
|  |  • roadmapService.ts       • bookmarkService.ts                   |  |
|  |  • chatService.ts                                                 |  |
|  +-------------------+-------------------------------+---------------+  |
+----------------------|-------------------------------|------------------+
                       |                               |
       HTTPS + Bearer  |               HTTPS + Bearer  |
       Supabase Auth   |               Supabase JWT    |
       Session Tokens  |                               |
                       v                               v
+------------------------------+     +------------------------------------+
|        SUPABASE AUTH         |     |       SUPABASE EDGE FUNCTION       |
|  • Google OAuth Provider     |     |            (`ai-mentor`)           |
|  • Issues ES256 Signed JWTs  |     |  • Deno Runtime Environment        |
|  • Manages session refresh   |     |  • Bearer Token Authentication     |
+--------------+---------------+     |  • Rate Limiting (10 req/min)      |
               |                     |  • Server-Side Profile Retrieval   |
               | Direct Client RLS   |  • 800-char Prompt Sanitization    |
               | Operations          |  • Server-Constructed System Prompt|
               v                     +-----------------+------------------+
+------------------------------------+                 |
|       POSTGRESQL DATABASE          |                 | Server-to-Server
|                                    |<----------------+ Gemini Call
|  • profiles (RLS: uid = id)        |  Trusted User   |
|  • assessments (RLS)               |  Profile &      v
|  • assessment_scores (RLS, UNIQUE) |  Scores Query + +------------------+
|  • roadmaps (RLS)                  |  Audit Logging  |  GOOGLE GEMINI   |
|  • bookmarks (RLS)                 |                 |  2.5-FLASH API   |
|  • ai_chat_history (RLS)           |                 |  Safety: BLOCK_  |
|  • ai_request_log (RLS, Indexed)   |                 |  LOW_AND_ABOVE   |
+------------------------------------+                 +------------------+
```

---

## 2. Zero-Trust AI Boundary

A key tenet of AIspire's architecture is that **the browser client is never trusted to configure AI behavior**:

### The Vulnerability in Traditional Apps
In typical AI applications, the frontend sends:
```json
{
  "systemInstruction": "You are a friendly counsellor...",
  "userProfile": { "gpa": 4.0, "scores": { "math": 100 } },
  "prompt": "What career fits me?"
}
```
This is vulnerable to:
- Prompt injection (client overwriting the system instruction).
- Profile spoofing (client asserting false assessment results).
- Key leakage (exposing developer API keys in the client bundle).

### AIspire's Hardened Edge Gateway
In AIspire, the client sends strictly:
```json
{
  "prompt": "What programming language should I learn first?",
  "careerId": "full-stack-ai-engineer",
  "currentStepNumber": 2
}
```
The `ai-mentor` Edge Function:
1. Validates the client's `Authorization: Bearer <JWT>` header via `supabase.auth.getUser()`.
2. Extracts the verified `user.id`.
3. Checks the `ai_request_log` table for rate limiting (rejects if within 3s cooldown or >10 req/min).
4. Queries Supabase directly using the verified `user.id` to retrieve the student's authentic assessment scores and profile.
5. Constructs an immutable system instruction specifying the counsellor persona, safety rules, student cognitive profile, and career context.
6. Calls Gemini 2.5 Flash using the server's private `GEMINI_API_KEY` secret.
7. Logs the transaction to `ai_request_log` and returns the sanitized text response.

---

## 3. Data Flow Sequences

### A. Assessment & Deterministic Matching Flow
1. User completes the 20-question scenario assessment in `AptitudeTestView.tsx`.
2. Answers are evaluated deterministically in `careerMatcher.ts`:
   - Raw question responses are normalized to 7 dimension scores \([0, 100]\).
   - Weighted Euclidean distance computes `AptitudeMatch` per career.
   - Blended formula calculates `FinalMatch` (\(0.85 \times \text{Aptitude} + 0.15 \times \text{Interest}\)).
3. `assessmentService.ts` persists the assessment to the `assessments` table and uses an idempotent `.upsert()` with `ON CONFLICT (user_id, assessment_id)` to save normalized scores into `assessment_scores`.
4. `ResultsView.tsx` renders explainable matching evidence and priority growth areas.

### B. Roadmap & Checklist Flow
1. User selects a recommended career role.
2. `RoadmapView.tsx` displays the 10 sequential milestone steps.
3. Checking milestone boxes updates the local state and asynchronously syncs to the `roadmaps` table via `roadmapService.ts`.
4. If the cloud is momentarily unavailable, the update is preserved locally, and the `Navbar` sync indicator reflects the status (`Saving...` or `Offline`).

### C. Multi-Turn AI Mentoring Flow
1. User opens `AIChatDrawer.tsx` and types a query.
2. `geminiService.ts` calls `supabase.functions.invoke('ai-mentor', { body: { prompt, careerId, currentStepNumber } })`.
3. Supabase JS automatically attaches the active session's Bearer JWT.
4. The Edge Function processes and returns the response.
5. `chatService.ts` persists both the user query and assistant response into the `ai_chat_history` table.
6. When the user logs in from another browser or device, `fetchChatHistory()` hydrates previous turns seamlessly.

---

## 4. State Management & Offline Resiliency

Global state is managed by `AppContext.tsx`:
- `userProfile`: Active student profile and settings.
- `currentView`: Navigation view router (`login`, `onboarding`, `dashboard`, `test`, `results`, `roadmap`, `resources`, `settings`).
- `syncStatus`: Cloud state machine:
  - `'synced'`: Database mutations verified and in parity.
  - `'saving'`: Active mutation in-flight.
  - `'offline'`: Network disconnected or Supabase unreachable.
  - `'error'`: Last cloud mutation encountered a recoverable error.
- `lastSyncError`: Descriptive error message surfaced in Settings and debug logs.

