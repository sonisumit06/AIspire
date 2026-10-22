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

## 🎥 Walkthrough & Demo Video

Watch the complete platform walkthrough demonstrating student onboarding, the 20-question cognitive assessment, dynamic 7D radar visualization, explainable recommendations, 10-step milestone roadmaps, resource discovery, and AI mentoring:

👉 **[Download / Watch Walkthrough Video (AIspire demo.mp4)](./AIspire%20demo.mp4)**

https://github.com/user-attachments/assets/AIspire%20demo.mp4

*Direct link to the video file stored in the repository root: [`./AIspire demo.mp4`](./AIspire%20demo.mp4)*

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

## ⚡ Quickstart Guide for Hackathon Judges & Reviewers

You can run AIspire locally in under **2 minutes**:

### 1. Clone & Install
```bash
git clone https://github.com/sonisumit06/AIspire.git
cd AIspire
npm install
```

### 2. Launch Local Dev Server
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

> 💡 **Instant Evaluation Tip:** On the welcome screen, click **"Continue as Guest (Instant Access)"**. You can immediately take the 20-question test, inspect the 7D Cognitive Radar, explore the 10-step roadmaps & Journey Showcase, and download a PDF report—no cloud configuration required!

### 3. Optional: Cloud Sync & Edge Function Setup
To enable Google OAuth and cloud synchronization:
1. Create a free project at [supabase.com](https://supabase.com).
2. Execute [`supabase/schema.sql`](supabase/schema.sql) in your Supabase SQL Editor.
3. Add your Supabase URL and Anon Key in `.env`:
   ```ini
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
4. Deploy the Edge Function with your Gemini API key:
   ```bash
   npx supabase secrets set GEMINI_API_KEY=your-key
   npx supabase functions deploy ai-mentor --no-verify-jwt
   ```

---

## 🧪 Automated Verification & Mathematical Proofs

AIspire includes automated test suites verifying mathematical accuracy, safety guards, and PDF rendering:

```bash
npm test
```

### Verified Test Assertions:
```text
🧪 Starting Comprehensive Verification Suite for AIspire Career Matcher...
✅ Test 1: Empty Answers Dimension Normalization (No NaN)
✅ Test 2: Full 20-Question Mapping & Boundary Clamping
✅ Test 3: Exact Aptitude Arithmetic Proof
✅ Test 4: Interest Alignment Score Bounds [0, 100]
✅ Test 5: Composite 85/15 Formula Verification
✅ Test 6: Dynamic Strength Evidence Ranking
✅ Test 7: Growth Area Prioritization Calculation
✅ Test 8: Descending FinalMatch Career Sorting
✅ Test 9: Boundary Conditions (All 0s & All 100s)
✅ Test 10: Graceful Handling of Undefined Profile Data
🎉 ALL 10 CAREER MATCHER MATHEMATICAL PROOFS PASSED PERFECTLY!

🛡️ Starting Security, Safety, Rate-Limit & Persistence Verification Suite...
✅ Test 1: Explicit Adult Content Refusal
✅ Test 2: High-Stakes Legal/Medical Scope Redirections
✅ Test 3: Zero Client System Instruction Trust
✅ Test 4: 3-Second Cooldown & 10 req/min Rate Limiting
✅ Test 5: Assessment Session Resumption
✅ Test 6: Complete User Data Isolation on Logout
🎉 ALL SECURITY, SAFETY, RATE-LIMIT & PERSISTENCE TESTS PASSED!

📄 Testing PDF Career Report Generator...
✅ PDF Career Report generation test passed (4 pages generated)!
```

### Production Build Verification
```bash
npm run build
```
*Compiles with zero TypeScript errors or linter warnings.*

---

## 📁 Repository Structure

```
AIspire/
├── AIspire demo.mp4             # Full platform walkthrough video
├── .env.example                 # Environment variable template
├── .gitignore                   # Excludes node_modules, dist, and secrets
├── LICENSE                      # MIT Open Source License
├── README.md                    # Project documentation & Hackathon showcase
├── SECURITY.md                  # Security policies and vulnerability reporting
├── CONTRIBUTING.md              # Guidelines for code contributions
├── PRIVACY.md                   # Student privacy policies
├── TERMS.md                     # Platform terms of service
├── index.html                   # Application HTML shell
├── package.json                 # Dependency specifications & scripts
├── tsconfig.json                # TypeScript compiler configuration
├── vite.config.ts               # Vite configuration
│
├── docs/                        # In-depth engineering specifications
│   ├── architecture.md          # Comprehensive architectural specs
│   ├── security.md              # Threat model & safety thresholds
│   ├── database.md              # PostgreSQL schema & RLS policies
│   └── deployment.md            # Production deployment guide
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
│   │   ├── Navbar.tsx           # Global navigation with cloud sync status
│   │   ├── LoginView.tsx        # Authentication & instant guest access
│   │   ├── ProfileOnboardingView.tsx # Student background & aspirations
│   │   ├── DashboardView.tsx    # Command center & next milestone highlight
│   │   ├── AptitudeTestView.tsx # 20-question cognitive assessment
│   │   ├── ResultsView.tsx      # Explainable match breakdown & growth areas
│   │   ├── RoadmapView.tsx      # 10-step career progression tracker
│   │   ├── JourneyShowcase.tsx  # Animated visual learning route showcase
│   │   ├── ResourcesView.tsx    # Curated study links & exam prep hub
│   │   ├── SettingsView.tsx     # Theme, account, sync status & safety info
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
│   │   ├── geminiService.ts     # Client invoker for Edge Function
│   │   ├── pdfReportService.ts  # Multi-page PDF career dossier generator
│   │   ├── authService.ts       # Supabase OAuth with connection pre-flight
│   │   ├── chatService.ts       # Chat persistence & session invalidation
│   │   ├── assessmentService.ts # Assessment state resumption
│   │   ├── roadmapService.ts    # Milestone progress tracking
│   │   └── bookmarkService.ts   # Resource bookmark persistence
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
