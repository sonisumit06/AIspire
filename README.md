# React + TypeScript + Vite
# AIspire — AI-Powered Student Career Counselling Platform

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg?logo=react&style=flat-square)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6.svg?logo=typescript&style=flat-square)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646cff.svg?logo=vite&style=flat-square)](https://vite.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend%20%26%20Auth-3ecf8e.svg?logo=supabase&style=flat-square)](https://supabase.com/)
[![Google Gemini](https://img.shields.io/badge/Gemini-2.5--Flash-4285f4.svg?logo=google&style=flat-square)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38b2ac.svg?logo=tailwind-css&style=flat-square)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

Currently, two official plugins are available:
> **AIspire** is an intelligent, privacy-first career counselling platform engineered for high school and university students. It translates student problem-solving traits into actionable career paths through **explainable mathematical aptitude matching**, **10-step execution roadmaps**, **vetted educational resource discovery**, and an **enterprise-secured multi-tier AI Career Mentor**.

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)
---

## React Compiler
## 📑 Table of Contents

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).
- [Executive Summary](#-executive-summary)
- [System Architecture](#-system-architecture)
- [Core Capabilities](#-core-capabilities)
  - [1. Deterministic & Explainable Career Matching](#1-deterministic--explainable-career-matching)
  - [2. 10-Step Interactive Career Roadmaps](#2-10-step-interactive-career-roadmaps)
  - [3. Curated Resource Discovery Engine](#3-curated-resource-discovery-engine)
  - [4. Multi-Tier Secure AI Career Mentor](#4-multi-tier-secure-ai-career-mentor)
  - [5. Google Cloud Auth & Supabase State Persistence](#5-google-cloud-auth--supabase-state-persistence)
  - [6. High-Contrast Accessible Design System](#6-high-contrast-accessible-design-system)
- [Security Architecture & Multi-Tier AI Safety](#-security-architecture--multi-tier-ai-safety)
- [Technology Stack](#-technology-stack)
- [Local Development Quickstart](#-local-development-quickstart)
- [Supabase Database & Edge Function Setup](#-supabase-database--edge-function-setup)
- [Verification & Testing](#-verification--testing)
- [Repository Structure](#-repository-structure)
- [Student Privacy & Compliance](#-student-privacy--compliance)
- [Contributing](#-contributing)
- [License](#-license)

## Expanding the Oxlint configuration
---

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:
## 🌟 Executive Summary

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
Traditional career counselling relies either on generic, unverified questionnaires or opaque AI chatbots that hallucinate recommendations without justification. **AIspire bridges the gap between psychometric rigor and generative guidance:**

1. **Rigor Over Guesswork:** Assessment responses map deterministically to 7 cognitive dimensions with normalized scoring \([0, 100]\). Career recommendations use a weighted formula (\(85\%\) Aptitude + \(15\%\) Expressed Interest), producing auditable "Why This Career" evidence and constructive growth areas.
2. **Zero-Trust AI Architecture:** Students never interface directly with AI models. All prompts pass through an authenticated Supabase Edge Function (`ai-mentor`) that verifies JWT bearer tokens, injects server-verified student profile data, enforces strict safety filters, and executes against Gemini 2.5 Flash without exposing credentials to the browser.
3. **Action-Oriented Milestones:** Identifying a career path is only step zero. AIspire provides structured 10-step milestone roadmaps with tracking checklists, resource links, and interactive AI mentor support for every individual step.

---

## 🏛 System Architecture

AIspire implements a zero-trust client architecture where the browser is treated as an untrusted frontend.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Client (Browser)                              │
│  React 19 + TypeScript + Vite + Tailwind CSS + Lucide Icons             │
└────────────┬──────────────────────────────────────────────┬─────────────┘
             │ 1. Supabase OAuth (Google)                   │ 4. Prompt + Context
             │    Session & Token Exchange                  │    (No API keys or system prompts)
             ▼                                              ▼
┌────────────────────────────┐             ┌──────────────────────────────┐
│       Supabase Auth        │             │    Supabase Edge Function    │
│  Issues signed ES256 JWT   │             │         (`ai-mentor`)        │
└────────────┬───────────────┘             └──────────────┬───────────────┘
             │                                            │
             │ Authenticated queries                      │ 5. Verify Bearer JWT
             │ with Row Level Security (RLS)              │ 6. Rate Limit (10 req/min, 3s cooldown)
             ▼                                            │ 7. Query trusted profile & scores
┌────────────────────────────────────────┐                │ 8. Enforce safety & input limits (<800 chars)
│        Supabase PostgreSQL Database    │◄───────────────┤ 9. Construct server-owned prompt
│                                        │                │
│  • profiles        • assessments       │                ▼
│  • roadmaps        • assessment_scores │         ┌──────────────────────┐
│  • bookmarks       • ai_chat_history   │         │   Google Gemini API  │
│  • ai_request_log                      │         │  (gemini-2.5-flash)  │
└────────────────────────────────────────┘         │  Safety: BLOCK_LOW+  │
                                                   └──────────────────────┘
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
---

## 🚀 Core Capabilities

### 1. Deterministic & Explainable Career Matching

The aptitude assessment evaluates **20 realistic scenario-based questions** spanning seven distinct cognitive domains:

| Cognitive Dimension | Description | Typical Associated Fields |
| :--- | :--- | :--- |
| **Analytical & Logic** | Pattern recognition, computational reasoning, deductive deduction | Data Science, Quantitative Finance |
| **Creative & Design** | Visual aesthetics, lateral ideation, design empathy | UI/UX Design, Creative Technology |
| **Technical & Engineering** | Systems architecture, debugging, algorithmic efficiency | AI/ML Engineering, Cyber Defense |
| **Social & Healthcare** | Patient advocacy, biological systems, empathy | Clinical Medicine, Biotechnology |
| **Management & Leadership**| Roadmapping, risk delegation, cross-functional vision | Product Management, Tech Founder |
| **Research & Science** | Scientific method, empirical hypothesis testing, literature review | Genetics, Deep Tech Research |
| **Communication & Media** | Rhetoric, stakeholder alignment, narrative storytelling | Product Marketing, Strategy |

#### Mathematical Matching Engine
- **Normalization:** Raw score per dimension normalized to \([0, 100]\):
- **Aptitude Match:** Weighted compatibility score across the 7 cognitive dimensions:
  $$\text{AptitudeMatch} = \frac{\sum_{d} \left(\text{StudentScore}[d] \times \text{CareerWeight}[d]\right)}{\sum_{d} \text{CareerWeight}[d]}$$
- **Interest Alignment:** Explicit alignment between student declared interests/goals and career tags (\(0 \le \text{InterestAlignment} \le 100\)).
- **Final Score:** Deterministic composite ensuring cognitive aptitude remains paramount:
  $$\text{FinalMatch} = \text{Round}\left(0.85 \times \text{AptitudeMatch} + 0.15 \times \text{InterestAlignment}\right)$$

### 2. 10-Step Interactive Career Roadmaps

Every career pathway includes a comprehensive 10-step curriculum divided into three evolutionary phases:
1. **Foundations (Steps 1–3):** Fundamental theory, core languages/tools, and academic prerequisites.
2. **Specialization (Steps 4–7):** Intermediate domain frameworks, portfolio projects, and technical certifications.
3. **Mastery & Industry Launch (Steps 8–10):** Capstone production systems, open-source leadership, interview prep, and industry placement.

Students can toggle completion checkboxes per step, track aggregate percentage progress in real-time, and launch targeted AI Mentor queries contextualized to their exact step.

### 3. Curated Resource Discovery Engine

The resources module provides pre-indexed, verified study materials alongside live external web search queries:
- **Google Search Integration:** Pre-configured academic search queries for syllabi, documentation, and textbooks.
- **Notes & Cheatsheets:** Quick-reference cheat sheets, cheat sheets from MIT OpenCourseWare, Stanford Online, and developer docs.
- **YouTube Playlists:** Verified lecture series from renowned educators (3Blue1Brown, freeCodeCamp, MIT OCW, StatQuest).
- **Domain Whitelisting:** Highlights high-credibility educational domains while flagging user-bookmarked items for rapid access.

### 4. Multi-Tier Secure AI Career Mentor

The embedded AI Mentor provides contextual assistance across any view in the platform:
- **Zero Hallucination of Student Context:** The client sends only the user query, active career ID, and current roadmap step. The server Edge Function queries the student's authentic assessment scores and target role from Supabase to provide customized mentoring.
- **Multi-Turn Chat History:** Chat conversations persist securely in the user's `ai_chat_history` database table, synchronized across devices, with one-click clearing controls in both the drawer and Settings.

### 5. Google Cloud Auth & Supabase State Persistence

- **Identity:** Seamless Google OAuth login powered by Supabase Auth.
- **Deterministic ID Management:** Profiles, assessments, and roadmaps are keyed to the immutable Supabase `user.id` UUID—never to volatile display names or emails.
- **Sync Status Indicator:** Real-time visual indicator in the top navigation displays connection status (`Synced`, `Saving...`, `Offline`, `Sync Error`).
- **Offline Resiliency:** When disconnected from the cloud, changes cache gracefully in local browser storage, syncing automatically upon reconnection.

### 6. High-Contrast Accessible Design System

- **Dual-Theme Token Engine:** Full support for dark mode (canvas `#0b0f19`) and light mode (canvas `#f8fafc`).
- **WCAG AAA/AA Contrast Compliance:** High-contrast text palettes (`text-slate-900` on light cards, `text-slate-100` on dark cards).
- **Solid CTA Protection:** Action buttons retain bright, readable text across both color themes without styling inversions.
- **Interactive Particle Canvas:** Ambient, physics-driven particle canvas responds subtly to cursor movement, creating an immersive educational environment.

---

## 🛡 Security Architecture & Multi-Tier AI Safety

AIspire adheres to defense-in-depth security best practices:

```
[Student Request]
       │
       ▼
[Layer 1: Frontend Input Sanitation]
  • Max length capped at 800 characters
  • Client validation against malicious injection
       │
       ▼
[Layer 2: Edge Function Gateway Authentication]
  • Strict HTTP Bearer JWT header validation via `supabase.auth.getUser()`
  • Rejection of missing/invalid tokens with 401 Unauthorized
       │
       ▼
[Layer 3: Abuse Prevention & Rate Limiting]
  • DB-backed request audit log (`ai_request_log`)
  • 3-second rapid-fire cooldown
  • 10 requests / minute sliding window limit
       │
       ▼
[Layer 4: Server-Side Context Isolation]
  • Client CANNOT provide system instructions
  • Edge function retrieves verified profile from Supabase
  • Construct immutable educational persona prompt
       │
       ▼
[Layer 5: Native AI Safety Thresholds]
  • Gemini API `safetySettings` set to `BLOCK_LOW_AND_ABOVE`:
    - HARM_CATEGORY_HATE_SPEECH
    - HARM_CATEGORY_HARASSMENT
    - HARM_CATEGORY_SEXUALLY_EXPLICIT
    - HARM_CATEGORY_DANGEROUS_CONTENT
  • Explicit handling of `finishReason === 'SAFETY'`
       │
       ▼
[Sanitized Response Delivered to Client]
```

### PostgreSQL Row Level Security (RLS)

All database tables implement granular PostgreSQL RLS policies enforcing tenant isolation:
- `profiles`: Users can select/insert/update only their own row (`auth.uid() = id`).
- `assessments`: Users can manage only their own assessments (`auth.uid() = user_id`).
- `career_results`: Users can manage only their own career match rankings (`auth.uid() = user_id`).
- `roadmap_progress`: Users can manage only their own milestone progress (`auth.uid() = user_id`).
- `bookmarks`: Users can manage only their own saved resources (`auth.uid() = user_id`).
- `ai_chat_history`: Users can read, write, and delete only their own messages (`auth.uid() = user_id`).
- `ai_request_log`: Insertable and readable only by the request owner for rate calculations (`auth.uid() = user_id`).

---

## 💻 Technology Stack

| Domain | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React | 19.0.0 | Component rendering & reactive application state |
| **Language** | TypeScript | 5.7.2 | End-to-end static typing & compile-time correctness |
| **Build Tooling** | Vite | 8.3.0 | Hot Module Replacement (HMR) & production asset bundling |
| **Styling** | Tailwind CSS | 4.0.0 | Utility-first design tokens & responsive UI styling |
| **Icons** | Lucide React | 1.16.0 | Semantic, accessible SVG interface iconography |
| **Backend & Auth** | Supabase Cloud | 2.49.1 | Google OAuth authentication, PostgreSQL database, RLS |
| **Serverless Compute** | Supabase Edge Functions | Deno | Authenticated server-side API & Gemini mediator |
| **AI Model** | Google Gemini | 2.5-flash | High-speed, context-aware student career mentoring |
| **Testing** | tsx / Custom Test Runner | 4.19.3 | Verification of deterministic matching algorithms |

---

## ⚡ Local Development Quickstart

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Supabase Account**: [https://supabase.com](https://supabase.com) (Free Tier)
- **Google Cloud Console**: For OAuth 2.0 Client Credentials
- **Google AI Studio Key**: For Gemini 2.5 Flash

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-org/aispire.git
cd aispire
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your environment values:
```ini
# Supabase Public Configuration (Safe for client bundle)
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...

# Local Dev AI Fallback (Optional — Edge Function is used in production)
# In production, GEMINI_API_KEY is stored ONLY in Supabase Edge Function Secrets!
GEMINI_API_KEY=AIzaSy...
```

### 3. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🗄 Supabase Database & Edge Function Setup

### 1. Run Database Migrations
1. Open your Supabase Project Dashboard.
2. Navigate to the **SQL Editor**.
3. Paste and run the entire contents of [`supabase/schema.sql`](supabase/schema.sql).
   - This creates all 7 tables with foreign keys, composite indexes, and strict Row Level Security policies.

### 2. Configure Google OAuth in Supabase
1. In the Supabase Dashboard, navigate to **Authentication > Providers > Google**.
2. Enable the Google provider.
3. Add your **Client ID** and **Client Secret** obtained from Google Cloud Console.
4. Copy the Supabase **Callback URL** (e.g. `https://<ref>.supabase.co/auth/v1/callback`) and add it to Authorized Redirect URIs in your Google Cloud Console project.

### 3. Deploy the AI Mentor Edge Function
Using the Supabase CLI:
```bash
# Log in to Supabase CLI
npx supabase login

# Link to your Supabase project
npx supabase link --project-ref your-project-ref

# Set Gemini API Key as a server-side secret (NEVER exposed to frontend)
npx supabase secrets set GEMINI_API_KEY=your_gemini_api_key_here

# Deploy the edge function
npx supabase functions deploy ai-mentor --no-verify-jwt
```
> **Note:** The `--no-verify-jwt` flag allows our Edge Function code to handle JWT verification directly with `supabase.auth.getUser()`, giving granular control over error responses and CORS preflight requests.

---

## 🧪 Verification & Testing

AIspire includes automated test suites and static analysis verification:

### Mathematical Matching Verification
Verify that the 7-dimensional scoring normalization, weighting formula, strength evidence generation, and career ranking math behave deterministically:
```bash
npm test
```
*Expected Output:*
```
🧪 Starting Verification Tests for AIspire Career Matcher...
✅ Test 1 Passed: Empty answers correctly normalized to [0, 100] without NaN.
✅ Test 2 Passed: 20-question answers normalized and clamped properly.
✅ Test 3-5 Passed: Exact weighting formula (85% aptitude + 15% interest) functioning.
✅ Test 6 Passed: Dynamic strength evidence generated successfully.
✅ Test 7 Passed: Growth area calculated constructively based on GrowthPriority formula.
✅ Test 8 Passed: Careers strictly ranked by descending FinalMatch.
🎉 ALL CAREER MATCHER MATHEMATICAL TESTS PASSED SUCCESSFULLY!
```

### Production Build & Type Check
Verify that all TypeScript declarations, JSX modules, and Vite bundles compile without warnings or errors:
```bash
npm run build
```

---

## 📁 Repository Structure

```
AIspire/
├── .env.example                 # Clean environment variable blueprint
├── .gitignore                   # Excludes node_modules, dist, and local .env
├── LICENSE                      # MIT Open Source License
├── README.md                    # Platform documentation (this file)
├── SECURITY.md                  # Vulnerability disclosure & security policy
├── CONTRIBUTING.md              # Contribution guidelines & code standards
├── PRIVACY.md                   # Student privacy policy & data practices
├── TERMS.md                     # Platform terms of service
├── index.html                   # HTML entry point with metadata & favicon
├── package.json                 # Project dependencies and script definitions
├── tsconfig.json                # TypeScript root configuration
├── vite.config.ts               # Vite configuration with local AI dev proxy
│
├── docs/                        # In-depth architectural documentation
│   ├── architecture.md          # End-to-end system architecture & flows
│   ├── security.md              # Threat model & multi-tier safety specs
│   ├── database.md              # PostgreSQL schema, ERD, and RLS specs
│   └── deployment.md            # Production deployment & CI/CD guide
│
├── Logo/                        # Brand design assets
│   └── App Logo.png             # Official AIspire high-resolution logo
│
├── public/                      # Static assets distributed with bundle
│   └── logo.png                 # Browser favicon & navigation icon
│
├── src/                         # Application source code
│   ├── main.tsx                 # React application mounting entry
│   ├── App.tsx                  # Root state orchestration & view router
│   ├── App.css                  # Semantic tokens & high-contrast styling
│   ├── index.css                # Base Tailwind imports & scrollbar styles
│   │
│   ├── types/                   # TypeScript interface definitions
│   │   ├── index.ts             # Profile, Questions, Careers, Roadmaps
│   │   └── database.ts          # Supabase table definitions
│   │
│   ├── context/                 # Application state management
│   │   └── AppContext.tsx       # Global user profile, sync status & auth
│   │
│   ├── services/                # Business logic & API communication
│   │   ├── supabaseClient.ts    # Initialized Supabase client instance
│   │   ├── geminiService.ts     # Client invoker for Edge Function
│   │   ├── careerMatcher.ts     # Deterministic 7D scoring & ranking engine
│   │   ├── assessmentService.ts # Persistence for assessment responses & scores
│   │   ├── roadmapService.ts    # Persistence for 10-step progress
│   │   ├── bookmarkService.ts   # Persistence for resource bookmarks
│   │   ├── chatService.ts       # Persistence for multi-turn AI chat history
│   │   └── verify-matcher.ts    # Mathematical verification test runner
│   │
│   ├── data/                    # Seed data & educational curricula
│   │   ├── questions.ts         # 20 scenario-based aptitude questions
│   │   ├── careers.ts           # 8 core career paths with benchmarks & roadmaps
│   │   └── resources.ts         # Curated directory of study links
│   │
│   └── components/              # Modular UI components
│       ├── Navbar.tsx           # Global navigation with theme & sync indicators
│       ├── LoginView.tsx        # Google OAuth sign-in & educational value prop
│       ├── ProfileOnboardingView.tsx # Student background & target interests
│       ├── DashboardView.tsx    # Home hub showing assessment status & progress
│       ├── AptitudeTestView.tsx # Interactive 20-question step assessment
│       ├── ResultsView.tsx      # Explainable match breakdown & growth areas
│       ├── RoadmapView.tsx      # 10-step career progression with checklist
│       ├── ResourcesView.tsx    # Curated study resources & internet search
│       ├── SettingsView.tsx     # Theme, account, sync status & about info
│       ├── AIChatDrawer.tsx     # Sliding contextual AI mentor chat panel
│       └── InteractiveParticles.tsx # Ambient physics-based canvas background
│
└── supabase/                    # Supabase backend definitions
    ├── schema.sql               # Complete PostgreSQL schema with RLS & indexes
    └── functions/               # Supabase Deno Edge Functions
        └── ai-mentor/           # Enterprise AI mentor gateway
            └── index.ts         # JWT auth, rate limits, safety & Gemini call
```

---

## 🔒 Student Privacy & Compliance

AIspire is built from the ground up to respect student data privacy:
- **No Direct Model Training:** Student assessment responses and conversational messages are processed through transient API calls and are **never** used to train public machine learning models.
- **COPPA & FERPA Mindful Design:** AIspire stores only minimal required profile metadata (display name, education level, field of interest). No sensitive PII (Social Security numbers, birthdates, financial records, or home addresses) is ever collected or stored.
- **User Ownership:** Students have unconditional access to clear their AI chat history or delete their entire account directly from the Settings screen.

---

## 🤝 Contributing

Contributions to AIspire are welcomed. Please review our [Contributing Guidelines](CONTRIBUTING.md) and [Code of Conduct](SECURITY.md) before submitting pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Verify tests pass (`npm test && npm run build`)
5. Push to the branch (`git push origin feature/AmazingFeature`)
6. Open a Pull Request

---

## 📄 License

AIspire is open-source software licensed under the [MIT License](LICENSE).

&copy; 2026 AIspire Team. Built with dedication for the future of education.
