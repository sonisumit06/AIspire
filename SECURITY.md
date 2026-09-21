# Security Policy & Vulnerability Disclosure

AIspire takes the security and safety of student data and AI interactions with the utmost seriousness. This document outlines our security policies, responsible disclosure process, and threat mitigation architecture.

---

## 🛡 Supported Versions

Security updates and patches are actively applied to the following versions of AIspire:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

---

## 🔒 Security Architecture Summary

AIspire employs a defense-in-depth security model:

1. **Zero Client Secrets:**
   - No Gemini API keys or service role secrets are ever bundled into the client distribution or exposed via frontend environment variables.
   - All Gemini invocations must traverse the serverless Supabase Edge Function gateway.

2. **Bearer JWT Identity Verification:**
   - Every request to the `ai-mentor` Edge Function must include an `Authorization: Bearer <JWT>` header issued by Supabase Auth.
   - The token is cryptographically verified server-side via `supabase.auth.getUser()`.
   - Requests with missing, expired, or tampered tokens are rejected with HTTP 401.

3. **Multi-Tier AI Safety & Prompt Injection Defense:**
   - Client prompts are strictly capped at 800 characters.
   - The client cannot supply system prompts or role personas; system prompts are assembled immutably on the server.
   - User profile metadata and assessment scores are queried from trusted database records using the verified caller's ID.
   - All Gemini API calls enforce native Google safety filters set to `BLOCK_LOW_AND_ABOVE` for hate speech, harassment, sexually explicit content, and dangerous content.

4. **Abuse Prevention & Rate Limiting:**
   - Rapid-fire cooldown: 3 seconds between consecutive requests.
   - Sliding-window limit: maximum 10 requests per minute per user, backed by the PostgreSQL `ai_request_log` audit table.

5. **Tenant Isolation via PostgreSQL RLS:**
   - Every table enforces strict Row Level Security (RLS). Users can only view, mutate, or delete their own authenticated rows (`auth.uid() = user_id`).

---

## 🚨 Reporting a Vulnerability

If you believe you have discovered a security vulnerability in AIspire, please help us protect our users by following responsible disclosure practices:

1. **Do NOT open a public GitHub issue.**
2. Email your findings directly to the security team at: **security@aispire.app** (or contact the repository maintainers privately).
3. Include the following information in your report:
   - Type of issue (e.g. prompt injection, unauthorized data access, rate limit bypass)
   - Step-by-step instructions or proof-of-concept to reproduce the vulnerability
   - Potential impact of the issue
   - Affected files, endpoints, or components
4. You will receive an acknowledgment within **24 hours**.
5. We will keep you updated as we triage, validate, and remediate the issue.

---

## 🏆 Bug Bounty & Recognition

While AIspire does not currently operate a monetary bug bounty program, verified vulnerabilities will be credited in our release notes and Hall of Fame (unless anonymity is requested).

Thank you for helping keep AIspire safe and trustworthy for students worldwide.

