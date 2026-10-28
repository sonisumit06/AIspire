# AIspire — AI-Powered Student Career Guidance & Execution Platform

[![React](https://img.shields.io/badge/React-19.0-61dafb.svg?logo=react&style=flat-square)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6.svg?logo=typescript&style=flat-square)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646cff.svg?logo=vite&style=flat-square)](https://vite.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend%20%26%20Auth-3ecf8e.svg?logo=supabase&style=flat-square)](https://supabase.com/)
[![Google Gemini](https://img.shields.io/badge/Gemini-2.5--Flash-4285f4.svg?logo=google&style=flat-square)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38b2ac.svg?logo=tailwind-css&style=flat-square)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

> **AIspire** is an intelligent, privacy-first career guidance and roadmap execution platform designed for high school and university students. It translates innate problem-solving abilities and interests into actionable career paths through **explainable mathematical aptitude matching (85/15 ratio)**, **10-step interactive roadmaps**, an interactive **Journey Showcase**, a **curated examination & study hub**, and an **enterprise-secured, multi-tier AI Career Mentor**.

---

## 📑 Table of Contents

- [Problem Statement & Solution](#-problem-statement--solution)
- [System Architecture](#-system-architecture)
- [Key Features & Innovations](#-key-features--innovations)
  - [1. 20-Question 7D Cognitive Aptitude Engine](#1-20-question-7d-cognitive-aptitude-engine)
  - [2. Explainable Mathematical Matching (85/15 Formula)](#2-explainable-mathematical-matching-8515-formula)
  - [3. Interactive 10-Step Roadmaps & Journey Showcase](#3-interactive-10-step-roadmaps--journey-showcase)
  - [4. Curated Study & Examination Resource Hub](#4-curated-study--examination-resource-hub)
  - [5. Zero-Trust Multi-Tier AI Career Mentor](#5-zero-trust-multi-tier-ai-career-mentor)
  - [6. Instant Guest Mode & Offline Resiliency](#6-instant-guest-mode--offline-resiliency)
  - [7. Client-Side PDF Career Dossier Generation](#7-client-side-pdf-career-dossier-generation)
- [Security & Multi-Tier AI Safety Architecture](#-security--multi-tier-ai-safety-architecture)
- [Technology Stack](#-technology-stack)
- [Quickstart Guide for Hackathon Judges & Reviewers](#-quickstart-guide-for-hackathon-judges--reviewers)
- [Automated Verification & Mathematical Proofs](#-automated-verification--mathematical-proofs)
- [Repository Structure](#-repository-structure)
- [Privacy, Ethics & Student Safety](#-privacy-ethics--student-safety)
- [License](#-license)

---

## 💡 Problem Statement & Solution

### The Challenge
1. **Opaque & Hallucinatory Career Advice:** Generic personality quizzes assign arbitrary job titles without mathematical grounding, while raw AI chatbots generate inconsistent, hallucinated suggestions that cannot explain *why* a career matches a student.
2. **The "Now What?" Execution Gap:** Choosing a career is only step zero. Students lack structured, sequenced milestones and credible learning resources to turn an aspiration into an industry-ready portfolio.
3. **Privacy & Credential Exposure:** Educational apps often expose third-party API keys directly in client bundles or leak student telemetry to public LLM training datasets.

### The AIspire Solution
* **Deterministic Psychometrics:** 20 scenario-based questions assess cognitive strengths across 7 distinct dimensions. Recommendations use a transparent formula ($85\%$ Aptitude + $15\%$ Expressed Interest) that outputs auditable "Strength Evidence" and constructive "Growth Area" feedback.
* **10 Compounding Milestones:** Every career pathway features a 10-step curriculum (Foundations $\rightarrow$ Specialization $\rightarrow$ Capstone Launch) complete with deliverables, checklists, recommended tools, and the interactive **Journey Showcase**.
* **Zero-Trust AI Gateway:** All mentoring queries run through an authenticated Supabase Edge Function (`ai-mentor`) enforcing cryptographic JWT verification, database rate-limiting, and server-managed system prompts without exposing API keys to the browser.
* **Instant Evaluation Access:** Evaluators and students can test the entire platform instantly using **Instant Guest Mode**, with full offline support and seamless cloud synchronization upon sign-in.

---

## 🏛 System Architecture

AIspire implements a zero-trust architecture treating the browser as an untrusted frontend:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Client (Browser)                              │
│       React 19 + TypeScript + Vite + Tailwind CSS v4 + Anime.js v4      │
│     (State: Offline Local Storage Cache + Instant Guest Session)        │
└────────────┬──────────────────────────────────────────────┬─────────────┘
             │ 1. Supabase OAuth (Google)                   │ 4. Prompt + Context
             │    JWT Bearer Token Exchange                 │    (Zero Client Keys/Prompts)
             ▼                                              ▼
┌────────────────────────────┐             ┌──────────────────────────────┐
│       Supabase Auth        │             │    Supabase Edge Function    │
│  Issues signed ES256 JWT   │             │         (`ai-mentor`)        │
└────────────┬───────────────┘             └──────────────┬───────────────┘
             │                                            │
             │ Authenticated queries                      │ 5. Verify Bearer JWT
             │ with Row Level Security (RLS)              │ 6. Enforce Rate Limits (10 req/min)
             ▼                                            │ 7. Query Verified Profile & Scores
┌────────────────────────────────────────┐                │ 8. Enforce Student Safety Policies
│        Supabase PostgreSQL Database    │◄───────────────┤ 9. Construct Server-Owned Prompt
│                                        │                │
│  • profiles        • assessments       │                ▼
│  • roadmaps        • assessment_scores │         ┌──────────────────────┐
│  • bookmarks       • ai_chat_history   │         │   Google Gemini API  │
│  • ai_request_log                      │         │  (gemini-2.5-flash)  │
│                                        │         │  Safety: BLOCK_LOW+  │
└────────────────────────────────────────┘         └──────────────────────┘
```

---

## 🚀 Key Features & Innovations

### 1. 20-Question 7D Cognitive Aptitude Engine
Evaluates instinctive problem-solving across seven cognitive dimensions:

| Cognitive Dimension | Focus & Problem-Solving Trait | Target Career Pathways |
| :--- | :--- | :--- |
| **Analytical & Logic** | Algorithmic logic, pattern recognition, quantitative reasoning | Data Scientist, Quant Trader |
| **Creative & Design** | Aesthetic judgment, spatial intuition, lateral thinking | Product Designer, Creative Technologist |
| **Technical & Engineering** | Architecture, debugging, systems thinking, digital tools | AI & ML Engineer, Cybersecurity Architect |
| **Social & Healthcare** | Empathy, human factors, patient well-being, biology | Physician, Clinical Innovator, Counselor |
| **Leadership & Strategy** | Risk mitigation, team delegation, vision execution | Tech Entrepreneur, Product Manager |
| **Research & Science** | Scientific method, empirical testing, exploratory literature | Biotech Scientist, AI Researcher |
| **Communication & Media** | Articulate synthesis, persuasion, storytelling, narrative | Policy Strategist, Tech Evangelist |

### 2. Explainable Mathematical Matching (85/15 Formula)
Recommendations are computed deterministically without black-box bias:
1. **Normalized Dimension Score:**
   $$\text{StudentScore}[d] = \frac{\text{EarnedWeight}[d]}{\text{MaxPossibleWeight}[d]} \times 100 \quad \in [0, 100]$$
2. **Aptitude Compatibility Score:**
   $$\text{AptitudeMatch} = \frac{\sum_{d} \left(\text{StudentScore}[d] \times \text{CareerWeight}[d]\right)}{\sum_{d} \text{CareerWeight}[d]}$$
3. **Interest Alignment Score:** Computed by evaluating overlap between student-declared interests/goals and career tags ($0 \le \text{InterestAlignment} \le 100$).
4. **Composite Recommendation Score:**
   $$\text{FinalMatch} = \text{Round}\left(0.85 \times \text{AptitudeMatch} + 0.15 \times \text{InterestAlignment}\right)$$

### 3. Interactive 10-Step Roadmaps & Journey Showcase
* **Three-Phase Progression:** Foundations (Steps 1–3) $\rightarrow$ Specialization & Projects (Steps 4–7) $\rightarrow$ Capstone & Industry Placement (Steps 8–10).
* **Journey Showcase Component:** An interactive, canvas-animated route map giving students an intuitive visual representation of where they stand and what milestone to tackle next.
* **Interactive Checklists & Tools:** Each step details milestone deliverables, recommended industry software/frameworks, and concrete action items.

### 4. Curated Study & Examination Resource Hub
* **Multi-Domain Categorization:** Covers entrance exams (SAT, ACT, GRE, GMAT, JEE, NEET, MCAT, GATE, UPSC) and academic disciplines.
* **Pre-Indexed & Live Search:** Direct links to official syllabi, university lecture notes (MIT OCW, Stanford), past question papers, and curated YouTube video courses.
* **Personalized Bookmarks:** Save and organize key revision materials with instant cloud and local persistence.

### 5. Zero-Trust Multi-Tier AI Career Mentor
* **Server-Grounded Context:** Prompts receive verified profile data, assessment results, and active roadmap milestones queried directly by the backend Edge Function.
* **Educational Guardrails:** Strictly redirects high-stakes legal, medical, or explicit adult content back to constructive academic exploration.
* **Multi-Turn History:** Conversations sync with the database and can be cleared at any time with one click.

### 6. Instant Guest Mode & Offline Resiliency
* **Zero Barrier for Evaluators:** Launch the app and click **"Continue as Guest"** to immediately test all features without entering credentials.
* **Offline-First Storage:** Automatically preserves scores, answers, and roadmaps in local storage; smoothly syncs with Supabase once authenticated.
* **Failsafe Startup Protection:** Built-in connection timeouts and parallel data hydration prevent the app from hanging even on slow or restricted networks.

### 7. Client-Side PDF Career Dossier Generation
* One-click generation of a multi-page, publication-grade career report powered by `jspdf`.
* Includes the 7D radar breakdown, top 3 recommended pathways, personalized strength evidence, growth focus areas, and milestone progress.

---

## 🛡 Security & Multi-Tier AI Safety Architecture

```
[User Input]
     │
     ▼
[Layer 1: Client Validation]
  • Input capped at 1,000 characters
  • Sanitization against control-character injections
     │
     ▼
[Layer 2: Edge Function Gateway]
  • Strict HTTP Bearer JWT validation via Supabase Auth
  • Rejection of invalid tokens with 401 Unauthorized
     │
     ▼
[Layer 3: Abuse Prevention & Rate Limiting]
  • Database-backed audit log (`ai_request_log`)
  • 3-second rapid-fire cooldown
  • 10 requests / minute sliding window
     │
     ▼
[Layer 4: Server-Side Context Isolation]
  • Client cannot supply system prompts
  • Edge function retrieves verified scores from Supabase
  • Injects immutable educational mentor persona
     │
     ▼
[Layer 5: Upstream AI Safety Thresholds]
  • Gemini API safety settings configured to BLOCK_LOW_AND_ABOVE
  • Finish-reason inspection handles content filtering gracefully
     │
     ▼
[Sanitized Guidance Returned to User]
```

### PostgreSQL Row Level Security (RLS)
All database tables enforce strict tenant isolation (`auth.uid() = user_id`):
* `profiles` · `assessments` · `assessment_scores` · `career_results` · `roadmap_progress` · `bookmarks` · `ai_chat_history` · `ai_request_log`

---

## 💻 Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19 | UI rendering and reactive component state |
| **Language** | TypeScript 5.7+ | Strict static typing and compile-time verification |
| **Build & Dev Tool** | Vite 8.3 | Ultra-fast HMR and optimized production bundling |
| **Styling** | Tailwind CSS v4 | Semantic utility tokens and responsive design |
| **Motion & Dynamics** | Anime.js v4.5.0 | Physics-based spring curves and choreographed timelines |
| **Icons** | Lucide React | Semantic interface iconography |
| **Backend & Auth** | Supabase Cloud | Google OAuth 2.0, PostgreSQL database with RLS |
| **Serverless Compute** | Supabase Edge Functions | Deno-powered authenticated AI gateway |
| **AI Engine** | Google Gemini 2.5 Flash | High-speed, context-grounded student mentoring |
| **Report Generation** | jsPDF | In-browser multi-page PDF career dossier generation |
| **Code Quality** | Oxlint & TypeScript | Zero-warning linting and static analysis |

---

## ⚡ Quickstart Guide & Setup Instructions

You can run AIspire locally in under **2 minutes**:

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **Package Manager**: `npm` (bundled with Node.js), `pnpm`, or `yarn`
- **Modern Web Browser**: Chrome, Edge, Firefox, or Safari

### 2. Clone & Install
```bash
# Clone the repository
git clone https://github.com/sonisumit06/AIspire.git

# Enter the project directory
cd AIspire

# Install dependencies
npm install
```

---

### 3. Choose Your Execution Mode

AIspire supports **three operational modes** tailored for evaluation, local experimentation, or full production:

#### 🟢 Mode 1: Instant Evaluation / Zero-Configuration Mode (Recommended for Quick Review)
*No `.env` file or cloud configuration required!*
```bash
npm run dev
```
1. Open **[http://localhost:5173](http://localhost:5173)** in your browser.
2. On the welcome screen, click **"Continue as Guest (Instant Access)"**.
3. Fill in your name and interests, take the 20-question cognitive assessment, inspect the dynamic 7D radar visualization, explore 10-step milestone roadmaps & Journey Showcase, and export a multi-page PDF career report.
4. An intelligent offline heuristic mentor is built-in with zero external setup needed.

---

#### 🟡 Mode 2: Local AI Mentoring with Google Gemini API
Enable live AI career mentoring directly through Vite's local dev server proxy without exposing your API key to the client browser:
1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and add your Google Gemini API key:
   ```ini
   # Server-side dev proxy only — never leaked to the client bundle
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. All AI Chat requests to `/api/ai-mentor` are proxied securely to Gemini models (`gemini-2.5-flash`, `gemini-2.0-flash`, `gemini-1.5-flash`) with educational safety guardrails.

---

#### 🔵 Mode 3: Full Production Setup with Supabase Cloud & Google OAuth
To enable Google OAuth login, PostgreSQL database persistence, and authenticated serverless Edge Functions:

1. **Create a Supabase Project**:
   - Create a free project at [supabase.com](https://supabase.com).
   - Retrieve your **Project URL** and **Anon Key** from *Project Settings > API*.

2. **Execute Database Migrations**:
   - Go to your Supabase Dashboard > **SQL Editor**.
   - Copy the contents of [`supabase/schema.sql`](supabase/schema.sql) and click **Run**.
   - All tables (`profiles`, `assessments`, `assessment_scores`, `career_results`, `roadmap_progress`, `bookmarks`, `ai_chat_history`, `ai_request_log`) and Row-Level Security (RLS) policies will be created automatically.

3. **Configure Google OAuth Provider**:
   - In [Google Cloud Console](https://console.cloud.google.com/apis/credentials), create an **OAuth 2.0 Client ID (Web Application)**.
   - Authorized JavaScript origins: `http://localhost:5173` (and your production domain).
   - Authorized redirect URI: `https://<your-project-ref>.supabase.co/auth/v1/callback`.
   - In Supabase Dashboard > **Authentication > Providers > Google**, enable Google, paste your Client ID and Client Secret, and save.
   - Under **Authentication > URL Configuration**, set Site URL to `http://localhost:5173` (or your production domain).

4. **Update `.env`**:
   ```ini
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   GEMINI_API_KEY=your-gemini-api-key-here
   VITE_FEEDBACK_FORM_URL=https://forms.gle/your-feedback-form-id
   ```

5. **Deploy the `ai-mentor` Edge Function**:
   ```bash
   # Install Supabase CLI if not already installed
   npm install -g supabase

   # Log in and link your project
   supabase login
   supabase link --project-ref your-project-ref

   # Set server-side secret
   supabase secrets set GEMINI_API_KEY=your-gemini-api-key-here

   # Deploy the edge function
   supabase functions deploy ai-mentor --no-verify-jwt
   ```

---

### 4. Environment Variables Reference

| Variable | Description | Required? | Exposed to Browser? |
| :--- | :--- | :---: | :---: |
| `VITE_SUPABASE_URL` | Supabase project URL (`https://<project>.supabase.co`) | Optional (Mode 3) | Yes (public endpoint) |
| `VITE_SUPABASE_ANON_KEY` | Supabase public anonymous API key | Optional (Mode 3) | Yes (secured via PostgreSQL RLS) |
| `GEMINI_API_KEY` | Google Gemini API Key for AI mentoring | Optional (Modes 2 & 3) | **NO** (Server / Edge only) |
| `VITE_FEEDBACK_FORM_URL` | Optional Google Feedback Form / survey URL | Optional | Yes (public link in Settings & Footer) |

---

## 🧪 Automated Verification & Mathematical Proofs

AIspire includes **4 comprehensive automated verification test suites** ensuring mathematical precision, security boundaries, PDF generation, and AI mentor relevance:

```bash
npm test
```

### Verified Test Assertions (4/4 Suites Passing):

```text
🧪 Suite 1: Mathematical Proofs for AIspire Career Matcher
✅ Test 1: Empty Answers Dimension Normalization (Clamped to 0, No NaN)
✅ Test 2: Full 20-Question Mapping & Boundary Clamping
✅ Test 3: Exact Aptitude Arithmetic Proof (Floating Point Precision)
✅ Test 4: Interest Alignment Score Bounds [0, 100]
✅ Test 5: Composite 85/15 Formula Verification
✅ Test 6: Dynamic Strength Evidence Ranking
✅ Test 7: Growth Area Prioritization Calculation
✅ Test 8: Descending FinalMatch Career Sorting
✅ Test 9: Boundary Conditions (All 0s & All 100s)
✅ Test 10: Graceful Handling of Undefined Profile Data
🎉 ALL 10 CAREER MATCHER MATHEMATICAL PROOFS PASSED!

🛡️ Suite 2: Security, Safety, Rate-Limit & Persistence Verification
✅ Test 1: Explicit Adult Content Refusal (Zero-Tolerance)
✅ Test 2: High-Stakes Legal/Medical Scope Redirections
✅ Test 3: Zero Client System Instruction Trust
✅ Test 4: 3-Second Cooldown & 10 req/min Rate Limiting
✅ Test 5: Assessment Session Resumption Across Renders
✅ Test 6: Complete User Data Isolation on Logout
🎉 ALL SECURITY, SAFETY, RATE-LIMIT & PERSISTENCE TESTS PASSED!

📄 Suite 3: Client-Side PDF Career Report Generator
✅ PDF Career Report generation test passed (4 pages successfully rendered with tables, radar, and roadmaps)!

🤖 Suite 4: AI Advisor Relevance & Direct-Response Suite
✅ Test 1: Recursion Concept Query (Direct explanation with base cases)
✅ Test 2: Python Technology Query (Core language role in AI/ML ecosystems)
✅ Test 3: Study Techniques Query (Active recall & spaced repetition strategies)
✅ Test 4: Resume & Career Query (STAR method & portfolio building)
✅ Test 5: Linear Algebra Math Query (Vectors, matrices, and transformations in ML)
✅ Test 6: Data Structure Query (Array memory layouts and access complexities)
✅ Test 7: General Science Query (Foundational concepts explained clearly)
✅ Test 8: Greeting Query (Welcoming student persona initialization)
✅ Test 9: Explicit Safety Refusal (Enforces safe educational boundaries)
🎉 ALL AI ADVISOR RELEVANCE TESTS PASSED SUCCESSFULLY!
```

### Static Analysis & Production Build
```bash
# Type-check with TypeScript compiler
npx tsc -b

# High-speed static analysis with Oxlint
npm run lint

# Production Vite build
npm run build
```
*Compiles in ~1.3s with zero TypeScript errors.*

---

## 📁 Repository Structure

```
AIspire/
├── AIspire demo.mp4             # Full platform walkthrough demo video
├── .env.example                 # Environment variable template
├── .gitignore                   # Excludes node_modules, dist, and secrets
├── LICENSE                      # MIT Open Source License
├── README.md                    # Project documentation & Hackathon showcase
├── SECURITY.md                  # Security policies and vulnerability reporting
├── CONTRIBUTING.md              # Guidelines for code contributions
├── PRIVACY.md                   # Student privacy policies
├── TERMS.md                     # Platform terms of service
├── index.html                   # Application HTML shell
├── package.json                 # Dependency specifications & verification scripts
├── tsconfig.json                # TypeScript compiler configuration
├── vite.config.ts               # Vite configuration with built-in AI dev proxy
│
├── docs/                        # In-depth engineering specifications
│   ├── architecture.md          # Comprehensive architectural specs
│   ├── security.md              # Threat model & safety thresholds
│   ├── database.md              # PostgreSQL schema & RLS policies
│   ├── deployment.md            # Production deployment & operations guide
│   ├── career-matching.md       # Mathematical formulas and weighting logic
│   ├── ai-safety.md             # AI boundary enforcement & prompt guards
│   └── feedback-form.md         # Beta survey guide & 16-question specification
│
├── scripts/                     # Operational automation scripts
│   └── create-feedback-form.gs  # Google Apps Script for 1-click feedback form generation
│
├── Logo/                        # Official high-resolution brand assets
├── public/                      # Static web assets & favicons
│
├── src/                         # Application source code
│   ├── main.tsx                 # Mounting entry point with ErrorBoundary
│   ├── App.tsx                  # Root state orchestration & view management
│   ├── App.css                  # Semantic design tokens & responsive styles
│   │
│   ├── components/              # Modular UI view components
│   │   ├── Navbar.tsx           # Global navigation, demo reset & sync status
│   │   ├── LoginView.tsx        # Authentication & instant guest access
│   │   ├── ProfileOnboardingView.tsx # Student background, name & aspirations
│   │   ├── DashboardView.tsx    # Command center & next milestone highlight
│   │   ├── AptitudeTestView.tsx # 20-question cognitive assessment
│   │   ├── ResultsView.tsx      # Explainable match breakdown & growth areas
│   │   ├── RoadmapView.tsx      # 10-step career progression tracker
│   │   ├── JourneyShowcase.tsx  # Animated visual learning route showcase
│   │   ├── ResourcesView.tsx    # Curated study links & exam prep hub
│   │   ├── SettingsView.tsx     # Theme, account, data reset & safety info
│   │   ├── AIChatDrawer.tsx     # Sliding contextual AI mentor chat drawer
│   │   ├── InteractiveRadarSignature.tsx # Animated SVG 7D cognitive radar
│   │   ├── InteractiveParticles.tsx # Ambient physics-based canvas background
│   │   └── ErrorBoundary.tsx    # Crash-resilient error recovery component
│   │
│   ├── context/
│   │   └── AppContext.tsx       # Global application state & cloud sync
│   │
│   ├── services/                # Business logic, math & cloud services
│   │   ├── careerMatcher.ts     # Deterministic 7D scoring & ranking math
│   │   ├── geminiService.ts     # Client invoker for Edge Function & local proxy
│   │   ├── pdfReportService.ts  # Multi-page PDF career dossier generator
│   │   ├── authService.ts       # Supabase Google OAuth provider integration
│   │   ├── chatService.ts       # Chat persistence & session invalidation
│   │   ├── assessmentService.ts # Assessment state resumption & reset logic
│   │   ├── roadmapService.ts    # Milestone progress tracking
│   │   ├── bookmarkService.ts   # Resource bookmark persistence
│   │   ├── supabase.ts          # Sanitized Supabase client initialization
│   │   │
│   │   ├── verify-matcher.ts    # Suite 1: Mathematical proofs verification
│   │   ├── verify-security-persistence.ts # Suite 2: Security & persistence verification
│   │   ├── verify-pdf-report.ts # Suite 3: PDF report generation verification
│   │   └── verify-ai-advisor.ts # Suite 4: AI advisor relevance verification
│   │
│   ├── data/                    # Educational seed data
│   │   ├── questions.ts         # 20 scenario-based aptitude questions
│   │   ├── careers.ts           # 8 core career paths & 10-step roadmaps
│   │   └── resources.ts         # Pre-indexed study materials & exam guides
│   │
│   └── utils/                   # Animation & motion utilities
│       ├── motion.ts            # Anime.js v4 easing, springs & choreography
│       └── animations.ts        # Reusable entrance & transition helpers
│
└── supabase/                    # Backend database & serverless compute
    ├── schema.sql               # PostgreSQL schema with full RLS policies
    └── functions/
        └── ai-mentor/           # Deno Edge Function with JWT auth & Gemini
            └── index.ts
```

---

## 🔒 Privacy, Ethics & Student Safety

* **Zero Public Model Training:** Student responses and messages are processed via transient API calls and are **never** utilized to train public machine learning models.
* **COPPA & FERPA Mindful:** No sensitive PII (Social Security numbers, birthdates, phone numbers, or physical addresses) is ever requested or stored.
* **Complete Student Ownership:** One-click controls in Settings allow students to clear their AI conversation history or reset their local cache immediately.

---

## 📄 License

AIspire is open-source software licensed under the [MIT License](LICENSE).

&copy; 2026 AIspire Team. Built with dedication for the future of education.
