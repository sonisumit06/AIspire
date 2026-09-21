# AIspire Deployment & Production Operations Guide

This guide describes how to deploy the AIspire frontend and Supabase backend services to production environments (Vercel, Netlify, Cloudflare Pages, Supabase Cloud).

---

## 1. Production Architecture Overview

- **Static Frontend Hosting:** Vercel, Netlify, AWS Amplify, or Cloudflare Pages hosting the pre-rendered Vite bundle (`dist/`).
- **Identity & Database:** Supabase Cloud managed PostgreSQL instance with Row Level Security.
- **AI Gateway Function:** Supabase Edge Function (`ai-mentor`) hosted globally on Deno Deploy infrastructure.
- **AI Engine:** Google AI Studio / Vertex AI Gemini 2.5 Flash API.

---

## 2. Supabase Backend Setup

### A. Create a Supabase Project
1. Go to [https://database.new](https://database.new) and create a new project.
2. Note your **Project Reference ID**, **Project URL**, and **Anon Key** from the Project Settings.

### B. Run SQL Schema Migrations
1. In the Supabase Dashboard, click **SQL Editor**.
2. Open [`supabase/schema.sql`](../supabase/schema.sql) in your code editor.
3. Paste the complete SQL script and click **Run**.
4. Confirm all tables and policies appear under the **Database** and **Authentication > Policies** tabs.

### C. Configure Google OAuth Provider
1. In Google Cloud Console:
   - Create an OAuth 2.0 Client ID for a Web Application.
   - Add Authorized JavaScript Origins (e.g. `https://your-domain.com`, `http://localhost:5173`).
   - Add Authorized Redirect URIs: `https://<your-project-ref>.supabase.co/auth/v1/callback`.
2. In Supabase Dashboard:
   - Navigate to **Authentication > Providers > Google**.
   - Enable Google, enter your Client ID and Client Secret, and save.

### D. Deploy the `ai-mentor` Edge Function
Install the Supabase CLI:
```bash
npm install -g supabase
```

Log in and link your project:
```bash
supabase login
supabase link --project-ref your-project-ref
```

Configure your server-side secret (this secret is NEVER exposed to the frontend):
```bash
supabase secrets set GEMINI_API_KEY=your_production_gemini_api_key
```

Deploy the function:
```bash
supabase functions deploy ai-mentor --no-verify-jwt
```

---

## 3. Frontend Deployment (e.g. Vercel)

### A. Environment Variables
Configure the following environment variables in your hosting provider's dashboard:

| Variable | Description | Safe for Client? |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | Your Supabase Project URL (`https://<ref>.supabase.co`) | Yes |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase public anonymous API key | Yes |

> **Note:** Do NOT set `GEMINI_API_KEY` on your frontend deployment! The frontend communicates with Gemini solely through the Supabase Edge Function.

### B. Build Configuration
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Node Version:** 18.x or 20.x

### C. Single Page App (SPA) Rewrites
Ensure all routes rewrite to `/index.html`.
For Vercel, a `vercel.json` file can be configured:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 4. Post-Deployment Verification Checklist

1. [ ] **Authentication:** Test Google Sign-In on production domain.
2. [ ] **Profile Onboarding:** Complete profile onboarding and verify record is stored in `profiles`.
3. [ ] **Aptitude Assessment:** Take the 20-question test; verify score upsert into `assessment_scores`.
4. [ ] **Roadmap Progress:** Toggle a milestone checkbox; verify real-time sync indicator reflects `Synced`.
5. [ ] **AI Mentor:** Send a question in the AI Chat Drawer; verify valid response, absence of client keys in Network tab, and rate limiting after 10 quick requests.
6. [ ] **Theme Persistence:** Toggle between Dark and Light mode; verify text contrast and button visibility.

