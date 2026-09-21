# Contributing to AIspire

Thank you for your interest in contributing to AIspire! We welcome contributions from developers, educators, designers, and career counselors who want to make high-quality, explainable career guidance accessible to all students.

---

## 🧭 Code of Conduct

All contributors and maintainers are expected to uphold a welcoming, respectful, and inclusive community environment. Harassment or discriminatory behavior in any form will not be tolerated.

---

## 🛠 Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Git**

### 2. Fork and Clone
```bash
git clone https://github.com/your-username/aispire.git
cd aispire
npm install
```

### 3. Environment Setup
Copy the blueprint:
```bash
cp .env.example .env
```
Provide valid development values according to the instructions in `.env.example`.

### 4. Running the Dev Server
```bash
npm run dev
```

---

## 🧪 Testing Guidelines

Before opening a pull request, you MUST verify that your changes do not break any existing functionality or mathematical algorithms:

1. **Deterministic Matcher Tests:**
   ```bash
   npm test
   ```
   All 8 verification tests must pass with exit code 0.

2. **TypeScript Compilation & Build:**
   ```bash
   npm run build
   ```
   Must succeed with zero TypeScript or bundler errors.

---

## 📐 Architecture & Coding Conventions

- **Clean Architectural Separation:**
  - Components (`src/components/`) handle UI rendering only.
  - Services (`src/services/`) handle data fetching, persistence, and external APIs.
  - Context (`src/context/`) manages global session state and synchronization.
  - Types (`src/types/`) contain all TypeScript definitions.
- **Explainability Over Black Boxes:**
  - Career recommendations must remain deterministic and mathematical (85% aptitude, 15% interest across the 7 dimensions). Never replace algorithmic matching with arbitrary AI percentages.
- **Zero Client Secrets:**
  - Never import or expose server keys (such as `GEMINI_API_KEY` or Supabase service role keys) in client code.
- **Accessibility (a11y):**
  - Maintain WCAG AA contrast compliance in both light and dark modes.
  - All interactive elements must have semantic HTML tags and accessible labels (`title`, `aria-label`).

---

## 📤 Submitting a Pull Request (PR)

1. Create a descriptive feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make concise, well-documented commits.
3. Push your branch:
   ```bash
   git push origin feature/your-feature-name
   ```
4. Open a Pull Request against `main`. In your PR description, outline:
   - What problem this solves
   - Steps taken to verify and test the change
   - Relevant screenshots or recordings for UI updates

Thank you for helping empower the next generation of students!

