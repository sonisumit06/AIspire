# AIspire — Beta Feedback Form & Survey Guide

This document contains the complete specification and automation script for the **AIspire User Experience & Beta Feedback** form.

---

## ⚡ Method 1: Instant 1-Click Generation via Google Apps Script (Recommended)

You don''t need to manually click and type 16 questions in Google Forms. An automated Google Apps Script is provided at [`scripts/create-feedback-form.gs`](../scripts/create-feedback-form.gs).

### Steps:
1. Open your browser and go to [**script.new**](https://script.new).
2. Replace all existing text in the editor (`Code.gs`) with the contents of [`scripts/create-feedback-form.gs`](../scripts/create-feedback-form.gs).
3. Click the **Save** floppy icon (or press `Ctrl+S` / `Cmd+S`).
4. Ensure the function dropdown at the top is set to `createAIspireFeedbackForm`.
5. Click **Run** ▶️.
6. When Google asks for authorization:
   - Click **Review Permissions**
   - Select your Google account
   - Click **Advanced** &rarr; **Go to Untitled project (unsafe)**
   - Click **Allow**
7. Check the **Execution log** at the bottom:
   - 🔗 **Public Responder URL** (e.g., `https://docs.google.com/forms/d/.../viewform`)
   - ✏️ **Edit URL** (to adjust theme colors, headers, etc.)
   - 📊 **Linked Google Sheet URL** (automatically connected live response spreadsheet)
8. Copy the public short link and add it to your `.env`:
   ```bash
   VITE_FEEDBACK_FORM_URL=https://forms.gle/your-form-id
   ```

---

## 📋 Method 2: Manual Setup on Google Forms

If you prefer building it manually on [forms.google.com](https://forms.google.com):

### Header & Description
- **Form Title**: `AIspire — User Experience & Beta Feedback`
- **Form Description**:
  > Thank you for trying **AIspire**! We are building an intelligent, explainable career guidance and roadmap execution platform for students.  
  >  
  > Your feedback helps us refine our 7D cognitive assessment, career matching accuracy, milestone roadmaps, and AI mentor guidance. This survey takes approximately **3–5 minutes**.

### Global Settings
- **Collect email addresses**: *Responder input* (optional)
- **Allow response editing**: *Enabled*
- **Limit to 1 response**: *Disabled* (allows repeated submissions across multiple testing sessions)
- **Show progress bar**: *Enabled*
- **Confirmation message**:
  > *"Thank you for your valuable feedback! Your insights directly help us improve AIspire for students worldwide."*

---

### Questions by Section

#### Section 1: Tester Profile & Context
1. **What best describes your current role?** (Multiple Choice, Required, with 'Other' option)
   - High School Student (Grade 9–12)
   - College / Undergraduate Student
   - Graduate / Early Career Professional
   - Educator / Career Counselor
   - Hackathon Judge / Technical Reviewer
   - Other
2. **How did you access AIspire?** (Multiple Choice)
   - Google Account (Cloud Sync)
   - Instant Guest Mode
3. **What device and browser did you test on?** (Multiple Choice)
   - Desktop / Laptop (Chrome / Edge / Brave)
   - Desktop / Laptop (Safari / Firefox)
   - Mobile / Tablet (iOS)
   - Mobile / Tablet (Android)

#### Section 2: 20-Question 7D Cognitive Assessment & Radar
*(Help text: Evaluates psychometric engagement and visual clarity)*
4. **How engaging and realistic did you find the 20 scenario-based questions?** (Linear scale: 1 = Very generic / boring to 5 = Highly realistic & engaging)
5. **Did the 7D Cognitive Radar chart accurately reflect your natural problem-solving strengths?** (Multiple Choice)
   - Yes, accurately captured my strengths
   - Mostly accurate with slight variance
   - Neutral / Not sure
   - Inaccurate compared to how I work
   *(Description: Analytical, Creative, Technical, Healthcare/Social, Leadership, Research, Communication)*
6. **Feedback on the assessment experience:** (Paragraph, Optional)
   *(Help text: Were questions clear? Did keyboard navigation [1–4 / A–D] work smoothly?)*

#### Section 3: Career Recommendations & Matching Accuracy
*(Help text: Tests the core 85% Aptitude + 15% Interest matching engine)*
7. **How relevant and fitting were your Top 3 recommended career pathways?** (Linear scale: 1 = Irrelevant to 5 = Exceptionally well-aligned)
8. **Did you find the "Why This Career" evidence and "Growth Areas" clear and constructive?** (Multiple Choice)
   - Very clear and actionable
   - Clear, but wanted more detailed advice
   - Neutral
   - Unclear or contradictory

#### Section 4: 10-Step Roadmaps, Journey Showcase & Resources
*(Help text: Tests the execution and preparation features)*
9. **How helpful is the 10-Step Career Roadmap in breaking down your path into actionable milestones?** (Linear scale: 1 = Not helpful to 5 = Extremely practical & clear)
10. **How was your experience with the visual Journey Showcase route?** (Multiple Choice)
    - Great visual overview of milestones
    - Nice to have, but preferred the list view
    - Needs improvement / distracting
    - Did not view
11. **Did you try the Curated Study & Exam Hub?** (Checkboxes)
    - Searched for syllabus & past papers
    - Viewed lecture playlists / video courses
    - Bookmarked resources for later
    - Did not use the Study Hub
12. **Did you generate and download the PDF Career Dossier?** (Multiple Choice)
    - Yes — downloaded smoothly and looked publication-ready
    - Yes — but noticed formatting or styling issues
    - No — did not test the PDF download

#### Section 5: AI Career Mentor & Platform Experience
*(Help text: Tests the AI counsellor and general UI/performance)*
13. **How would you rate your interactions with the AI Career Mentor?** (Linear scale: 1 = Generic / Unhelpful to 5 = Contextual, inspiring & actionable)
14. **How would you rate the overall UI design, theme aesthetics, and responsiveness?** (Linear scale: 1 = Poor / Cluttered to 5 = Premium, smooth & cohesive)
15. **Did you encounter any bugs, display glitches, or slow performance?** (Paragraph, Optional)
    *(Help text: Please mention device/screen size and what occurred)*
16. **What is the #1 feature you would like to see added to AIspire next?** (Paragraph, Optional)

---

## 🔗 In-App Integration
The feedback link is already wired into the AIspire frontend:
1. **Settings View**: Located at the bottom of the "About AIspire" card in [`src/components/SettingsView.tsx`](../src/components/SettingsView.tsx).
2. **Global Footer**: Visible across all main application views in [`src/App.tsx`](../src/App.tsx).