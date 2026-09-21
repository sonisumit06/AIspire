# Privacy Policy

**Effective Date:** September 11, 2026

AIspire ("we", "us", "our") is dedicated to safeguarding the privacy and personal data of students, educators, and mentors using our career counselling platform. This Privacy Policy details how we collect, use, and protect your information.

---

## 1. Information We Collect

### A. Account Information
When you sign in via Google OAuth through Supabase Auth, we collect:
- Your authenticated Google User ID (immutable UUID)
- Your email address (used solely for identity verification and account recovery)
- Your display name and profile picture URL (for in-app UI display only)

### B. Educational & Career Preferences
During onboarding and use, you may provide:
- Education level (e.g. High School, Undergraduate)
- Primary interest area and career aspiration goals
- Responses to the 20-question aptitude assessment
- Saved roadmap milestone progress and bookmarked resources

### C. Conversational Interactions
- Questions and prompts submitted to the AI Career Mentor are temporarily processed to generate relevant educational responses and are stored in your encrypted personal chat history table (`ai_chat_history`).

---

## 2. What We Do NOT Collect
- We **never** collect Social Security numbers, government identification numbers, financial records, home addresses, or phone numbers.
- We **never** track your activity outside of AIspire or sell your personal data to advertisers or third-party brokers.

---

## 3. How We Use Your Information
- To calculate deterministic career matches using our 7-dimensional cognitive model.
- To persist your 10-step career roadmaps and educational bookmarks across your devices.
- To contextualize AI Mentor guidance to your actual assessment results and active roadmap milestones.
- To detect and prevent abusive automated requests via sliding-window rate limiting.

---

## 4. AI Processing & Third-Party APIs
- Mentoring interactions utilize Google's Gemini API via a secure backend serverless function.
- Prompts sent to Gemini are governed by Google's Cloud API terms: **your private inputs and student data are NOT used to train public foundation models**.

---

## 5. Data Retention & Student Rights
- **Data Erasure:** You can clear your AI chat history at any time with a single click from the Settings view or the AI Chat Drawer.
- **Account Deletion:** You have the right to permanently delete your account and all associated profile, assessment, roadmap, and chat records.

---

## 6. Contact Us
For questions regarding this policy or data privacy inquiries, contact us at: **privacy@aispire.app**.

