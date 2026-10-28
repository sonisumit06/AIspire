import type { CareerRole, ChatMessage, DimensionScores, ResourceItem, UserProfile } from '../types';
import { ALL_DIMENSION_KEYS } from './careerMatcher';
import { validatePromptSafety } from './aiSafety';

export interface AskAIOptions {
  prompt: string;
  userProfile?: Partial<UserProfile>;
  studentScores?: DimensionScores;
  selectedCareer?: CareerRole;
  chatHistory?: ChatMessage[];
  currentRoadmapStep?: number;
}

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'cannot', 'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for',
  'from', 'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him',
  'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'me', 'more',
  'most', 'my', 'myself', 'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once', 'only', 'or', 'other',
  'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should', 'so', 'some',
  'such', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these',
  'they', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were',
  'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your',
  'yours', 'yourself', 'yourselves', 'tell', 'give', 'help', 'please', 'want', 'know', 'like', 'explain',
]);

function extractSubject(prompt: string): string {
  return prompt
    .replace(
      /^(what\s+is|what\s+are|explain|tell\s+me\s+about|can\s+you\s+explain|how\s+does|how\s+do|why\s+is|why\s+are|define|give\s+me\s+an\s+overview\s+of|teach\s+me\s+about|describe)\b/i,
      ''
    )
    .replace(/[?!.]+$/, '')
    .trim();
}

/**
 * Intelligent built-in heuristic advisor that runs completely offline with zero setup.
 * Generates insightful, encouraging, and actionable guidance based on the student's scores and inquiry.
 */
function generateBuiltInAdvice(options: AskAIOptions): string {
  const { prompt, userProfile, studentScores, selectedCareer, currentRoadmapStep } = options;
  const promptLower = prompt.toLowerCase().trim();
  const studentName = userProfile?.name || 'Student';

  // Find top cognitive dimension
  const topDim = studentScores
    ? ALL_DIMENSION_KEYS.reduce((a, b) =>
        (studentScores[a] ?? 0) > (studentScores[b] ?? 0) ? a : b
      )
    : 'analytical';

  const activeStepNumber = currentRoadmapStep || 1;
  const stepData = selectedCareer?.roadmap?.[activeStepNumber - 1] || selectedCareer?.roadmap?.[0];
  const careerName = selectedCareer?.title || 'your chosen career';

  // 1. Greetings & simple check-ins
  if (/^(hi|hello|hey|greetings|good\s+(morning|afternoon|evening)|howdy)\b/i.test(promptLower)) {
    return `Hello ${studentName}! I am your AIspire Career Mentor.

I'm here to help you navigate your academic path, master technical and foundational subjects, and make steady progress toward **${careerName}**.

Here are a few things we can explore right now:
- **Concept Deep Dives**: Ask me to explain any topic, programming language, algorithm, or theory (e.g., "What is recursion?", "Explain backpropagation").
- **Roadmap Milestones**: Break down Step ${stepData?.stepNumber || 1} (${stepData?.title || 'Foundations'}) into manageable weekly deliverables.
- **Study & Exam Strategy**: Optimize your revision with active recall, spaced repetition, and exam-taking methods.
- **Project & Portfolio Guidance**: Brainstorm hands-on capstone projects tailored to high-tier college or job applications.

What specific question or topic would you like to tackle today?`;
  }

  // 2. Specific Technical & Domain Concepts
  // 2a. Python
  if (promptLower.includes('python')) {
    return `### Python: Core Fundamentals & Practical Application in ${careerName}

**Python** is a high-level, interpreted programming language renowned for its expressive syntax, readable structure, and vast open-source ecosystem. In modern technology, Python is the premier language for Artificial Intelligence, Machine Learning, Data Science, and backend scripting.

#### Core Strengths & Key Concepts:
* **Clean Syntax & Productivity**: Minimal boilerplate allows you to focus on computational logic, algorithmic thinking, and rapid prototyping.
* **Essential Scientific & AI Libraries**:
  * **NumPy**: Vectorized n-dimensional arrays and high-performance linear algebra.
  * **Pandas**: Structured data frames, time-series processing, and dataset cleaning.
  * **PyTorch / Scikit-Learn**: Machine learning model architecture, training loops, and inference.
* **Versatility**: Powers everything from lightweight command-line utilities to enterprise REST APIs (FastAPI/Flask).

#### Recommended 3-Step Mastery Plan:
1. **Master Idiomatic Python**: Focus on list/dict comprehensions, generator expressions, decorators, and context managers (\`with\` statements).
2. **Data Manipulation Drill**: Ingest a public CSV dataset using Pandas, clean null values, and compute summary statistics.
3. **Build an Applied Project**: Develop a script or API that takes input data, executes a predictive or analytical function, and returns structured JSON.

Would you like a sample coding challenge or curated resource recommendations for Python?`;
  }

  // 2b. JavaScript & TypeScript
  if (promptLower.includes('javascript') || promptLower.includes('typescript') || promptLower.includes('node.js') || promptLower.includes('nodejs')) {
    return `### JavaScript & TypeScript: Full-Stack Web & System Fundamentals

**JavaScript** is the foundational language of the modern web, executing natively in web browsers and across server environments via runtimes like Node.js and Bun. **TypeScript** adds compile-time static type safety, making large-scale codebases reliable and self-documenting.

#### Core Principles to Master:
* **The Event Loop & Asynchronous Architecture**: Single-threaded concurrency powered by microtask and macrotask queues, Promises, and \`async/await\`.
* **TypeScript Type System**: Generics, union/intersection types, interfaces, utility types (\`Partial\`, \`Pick\`, \`Record\`), and type narrowing.
* **Full-Stack Relevance to ${careerName}**: Whether building interactive dashboards, AI user interfaces, or high-throughput microservices, TypeScript ensures robust API contracts and minimal runtime errors.

#### Next Action Step:
Build a strongly-typed API client in TypeScript that fetches data from a public endpoint, validates the schema, and renders the result in a clean terminal or browser interface.`;
  }

  // 2c. React & Frontend Engineering
  if (promptLower.includes('react') || promptLower.includes('frontend') || promptLower.includes('css') || promptLower.includes('html')) {
    return `### Modern Frontend Engineering & React Architecture

Frontend development bridges algorithmic software engineering with human-centered design. In modern application development, **React** is the industry standard for building component-driven, stateful user interfaces.

#### Core Architectural Concepts:
* **Declarative Component Model**: UI is a pure function of state (\`UI = f(state)\`). Breaking interfaces into reusable, decoupled components.
* **State Management & Hooks**: Master \`useState\`, \`useEffect\`, \`useMemo\`, \`useCallback\`, and modern Context APIs.
* **Modern CSS & Layout**: Flexbox, CSS Grid, container queries, and utility systems like Tailwind CSS for responsive, mobile-first design.
* **Performance & Accessibility (A11y)**: Semantic HTML, ARIA landmarks, keyboard navigation, and Core Web Vitals (LCP, INP).

#### Practical Recommendation:
Implement a responsive data visualization or interactive tool that allows users to filter, sort, and search records with zero page reloads.`;
  }

  // 2d. Data Structures & Algorithms (DSA), Recursion, Sorting, Binary Search
  if (
    promptLower.includes('algorithm') ||
    promptLower.includes('data structure') ||
    promptLower.includes('dsa') ||
    promptLower.includes('recursion') ||
    promptLower.includes('binary search') ||
    promptLower.includes('sorting') ||
    promptLower.includes('array') ||
    promptLower.includes('linked list') ||
    promptLower.includes('tree') ||
    promptLower.includes('graph') ||
    promptLower.includes('dynamic programming') ||
    promptLower.includes('big o')
  ) {
    return `### Data Structures & Algorithms (DSA): Problem-Solving Architecture

Data Structures and Algorithms form the computational foundation of software engineering, system optimization, and technical interview assessments.

#### 1. Core Primitives & Time Complexity (Big-O):
* **Arrays & Hash Maps**: Constant-time $O(1)$ lookups via hash keys; contiguous memory allocation in arrays.
* **Trees & Graphs**: Hierarchical and networked representations (Binary Search Trees, Tries, Adjacency Lists). Traversed via BFS (queues) and DFS (stacks/recursion).
* **Recursion & Dynamic Programming**: Decomposing large problems into self-similar sub-problems with base cases. DP optimizes recursive solutions by caching sub-problem results (memoization/tabulation).

#### 2. How to Practice Effectively:
1. **Master the Patterns (Not Memorization)**: Focus on universal patterns such as Two Pointers, Sliding Window, Fast & Slow Pointers, and Breadth-First Search.
2. **Analyze Constraints**: Read input bounds before writing code. If $N \\le 10^5$, an $O(N \\log N)$ algorithm will pass, while $O(N^2)$ will trigger Time Limit Exceeded.
3. **Dry Run on Edge Cases**: Test empty inputs, single elements, duplicates, and extreme boundary values.

What specific data structure or algorithmic problem are you working on right now?`;
  }

  // 2e. Mathematics & Analytical Foundations (Linear Algebra, Calculus, Probability, Stats)
  if (
    promptLower.includes('linear algebra') ||
    promptLower.includes('calculus') ||
    promptLower.includes('statistics') ||
    promptLower.includes('probability') ||
    promptLower.includes('math')
  ) {
    return `### Mathematical Foundations for Technology & Engineering

Rigorous mathematics provides the theoretical framework behind modern algorithms, computer graphics, optimization, and AI models.

#### Key Disciplines & Applications:
* **Linear Algebra**: Vectors, matrices, eigenvalues, and dot products represent data transformations and form the mathematical bedrock of machine learning and 3D graphics.
* **Calculus & Optimization**: Derivatives, partial gradients, and the chain rule power backpropagation and gradient descent in neural networks.
* **Probability & Statistics**: Hypothesis testing, Bayesian inference, probability distributions, and variance metrics govern data analysis and decision under uncertainty.

#### Strategic Advice:
Pair mathematical concepts with executable code. Instead of solving matrix multiplications only on paper, write a small Python function that computes dot products and visualizes vector transformations.`;
  }

  // 2f. Machine Learning, AI & Neural Networks
  if (
    promptLower.includes('machine learning') ||
    promptLower.includes('deep learning') ||
    promptLower.includes('neural network') ||
    promptLower.includes('artificial intelligence') ||
    promptLower.includes('llm') ||
    promptLower.includes('nlp') ||
    promptLower.includes('computer vision')
  ) {
    return `### Artificial Intelligence & Machine Learning Architecture

Machine Learning enables computational systems to learn patterns directly from empirical data to perform predictive inference, classification, and generative reasoning.

#### Core Architectural Taxonomy:
* **Supervised Learning**: Mapping inputs $X$ to labeled ground-truth $Y$ (Regression, Classification via Random Forests, Gradient Boosting, Linear Models).
* **Unsupervised Learning**: Discovering latent structures and clusters without explicit labels (K-Means, PCA dimensionality reduction, embeddings).
* **Deep Neural Networks**: Hierarchical feature representations using backpropagation and gradient descent. Transformers have revolutionized Natural Language Processing and Computer Vision through self-attention mechanisms.

#### The End-to-End ML Pipeline:
1. **Data Ingestion & Cleaning**: Handling missing values, categorical encoding, feature scaling, and train/validation/test splits.
2. **Model Training & Loss Minimization**: Optimizing loss functions using algorithms like Adam or SGD with learning rate scheduling.
3. **Rigorous Evaluation**: Beyond raw accuracy—evaluating Precision, Recall, F1-Score, ROC-AUC, and latency during inference.

#### Recommended Next Step for ${careerName}:
Train a baseline classification or regression model on a Kaggle dataset, track metrics, and deploy it behind a FastAPI endpoint with interactive documentation.`;
  }

  // 2f. SQL & Databases
  if (
    promptLower.includes('sql') ||
    promptLower.includes('database') ||
    promptLower.includes('postgres') ||
    promptLower.includes('mongodb') ||
    promptLower.includes('nosql') ||
    promptLower.includes('schema')
  ) {
    return `### Database Systems & SQL: Data Architecture Essentials

Databases form the persistent memory of software systems. Choosing and structuring the right database paradigm is essential for data integrity, throughput, and scalability.

#### 1. Relational (SQL) vs. Non-Relational (NoSQL):
* **Relational (PostgreSQL, MySQL, SQLite)**: Structured tables with rigid schemas, foreign keys, and ACID guarantees (Atomicity, Consistency, Isolation, Durability). Ideal for transactional systems, finance, and relational models.
* **Document & Key-Value (MongoDB, Redis)**: Flexible, schema-less JSON documents or in-memory key-value pairs. Ideal for high-velocity caching, user sessions, and semi-structured payloads.

#### 2. High-Yield SQL Competencies:
* **Multi-Table Joins**: Master \`INNER JOIN\`, \`LEFT JOIN\`, and self-joins for relational normalization.
* **Aggregations & Grouping**: \`GROUP BY\`, \`HAVING\`, \`COUNT()\`, \`SUM()\`, and Window Functions (\`ROW_NUMBER()\`, \`RANK() OVER()\`).
* **Indexing & Performance**: Understanding B-Tree indexes, composite keys, and how \`EXPLAIN ANALYZE\` identifies sequential scans.

Try writing a normalized schema for a student enrollment system with tables for Students, Courses, and Enrollments.`;
  }

  // 2g. Git, GitHub & Version Control
  if (promptLower.includes('git') || promptLower.includes('github') || promptLower.includes('version control')) {
    return `### Git & Version Control: The Collaboration Standard

**Git** is a distributed version control system that tracks source code revisions, facilitates branch-based collaboration, and protects against data loss. A strong GitHub presence serves as living portfolio proof for admissions and industry hiring.

#### Essential Git Workflows:
* **Branching Strategy**: Keep \`main\` production-ready. Create isolated feature branches (\`git checkout -b feature/module-name\`) for new deliverables.
* **Atomic Commits**: Write clear, imperative commit messages (e.g., "Add user authentication middleware" rather than "updates").
* **Pull Requests & Code Reviews**: Practice peer reviews, resolving merge conflicts, and automated CI/CD checks before merging.

#### Portfolio Tip for ${careerName}:
Ensure your top repositories feature a polished \`README.md\` containing an overview banner, architecture diagram, installation commands, and a live demonstration link.`;
  }

  // 2h. Cybersecurity & Networking
  if (
    promptLower.includes('cybersecurity') ||
    promptLower.includes('security') ||
    promptLower.includes('hacker') ||
    promptLower.includes('network') ||
    promptLower.includes('firewall') ||
    promptLower.includes('encryption')
  ) {
    return `### Cybersecurity & Systems Architecture

Cybersecurity safeguards digital assets, networks, and identities against unauthorized access, data compromise, and adversarial exploits.

#### 1. Foundational Security Principles:
* **The CIA Triad**:
  * **Confidentiality**: Ensuring data is accessible solely to authorized principals (AES-256 encryption, access control).
  * **Integrity**: Verifying data is authentic and unmodified (cryptographic hashing, digital signatures).
  * **Availability**: Guaranteeing reliable, resilient system uptime (DDoS mitigation, redundancy).
* **Zero Trust Architecture**: "Never trust, always verify"—strict verification of every user and service request regardless of network perimeter.

#### 2. Practical Skill Building:
* Study the **OWASP Top 10** web application security risks (SQL injection, XSS, Broken Object Level Authorization).
* Practice defensive labs on platforms like TryHackMe or OverTheWire.`;
  }

  // 3. Study Strategy, Exam Preparation, Focus & Productivity
  if (
    promptLower.includes('study') ||
    promptLower.includes('exam') ||
    promptLower.includes('revision') ||
    promptLower.includes('prepare') ||
    promptLower.includes('memorize') ||
    promptLower.includes('focus') ||
    promptLower.includes('routine') ||
    promptLower.includes('schedule') ||
    promptLower.includes('time management') ||
    promptLower.includes('pomodoro') ||
    promptLower.includes('notes') ||
    promptLower.includes('marks') ||
    promptLower.includes('grades')
  ) {
    return `### High-Yield Study & Examination Strategy for ${studentName}

Effective academic performance is driven by deliberate, cognitive study systems rather than passive hours spent rereading textbooks.

#### 1. Core Evidence-Based Study Frameworks:
* **Active Recall**: Test yourself using flashcards or blank-sheet retrieval before reviewing notes. Active retrieval produces significantly higher memory retention than passive rereading.
* **Spaced Repetition**: Review challenging topics across scheduled intervals (Day 1, Day 3, Day 7, Day 21) to counteract the Ebbinghaus forgetting curve.
* **The Feynman Technique**: Explain complex topics out loud in simple, jargon-free language. Any point where you hesitate indicates a conceptual gap that requires review.

#### 2. Focused Daily Execution (The 50/10 Cadence):
* **50-Minute Sprint**: Single-task focus with all browser notifications and phones silenced.
* **10-Minute Cognitive Break**: Physical movement, hydration, and eye rest (no social media scrolling).
* **The Error Notebook**: Maintain a running log of every question you get wrong on practice exams, noting the root cause (conceptual error vs. calculation error).

#### 3. Leveraging Your Cognitive Profile:
Your strongest aptitude dimension is **${topDim.toUpperCase()}**. In your prep sessions, lean into structured problem decomposition, concept mapping, and analytical derivations.

Would you like a customizable weekly revision timetable or past examination strategies for your target subjects?`;
  }

  // 5. Specific career or roadmap step inquiry
  if (
    promptLower.includes('roadmap') ||
    promptLower.includes('step') ||
    promptLower.includes('how to start') ||
    promptLower.includes('where to start') ||
    promptLower.includes('milestone') ||
    promptLower.includes('next step')
  ) {
    if (stepData) {
      return `### Targeted Milestone Breakdown: **${careerName}** (Step ${stepData.stepNumber})

Here is your actionable guidance for **Step ${stepData.stepNumber}: ${stepData.title}**:

*   **Primary Deliverable**: ${stepData.milestoneGoal}
*   **Estimated Cadence**: ${stepData.timeline} (~6–8 focused hours/week)
*   **Recommended Tooling & Platforms**: ${stepData.recommendedTools.join(', ')}

#### Action Checklist for This Week:
1.  **Foundational Mastery**: Master the core principles of this module before jumping to complex implementations.
2.  **Hands-On Artifact**: Build a minimal, functional proof-of-concept demonstrating your grasp of the topic. Document your progress in a clean repository or study log.
3.  **Harness Your Strengths**: Your high **${topDim.toUpperCase()}** dimension provides an analytical advantage—use it to break down difficult assignments methodically.

Would you like recommended tutorials or sample problem statements for this step?`;
    }
  }

  // 6. Resume, Interviews, Internships & Job Search
  if (
    promptLower.includes('interview') ||
    promptLower.includes('resume') ||
    promptLower.includes('cv') ||
    promptLower.includes('internship') ||
    promptLower.includes('job') ||
    promptLower.includes('hire') ||
    promptLower.includes('hiring') ||
    promptLower.includes('apply') ||
    promptLower.includes('linkedin')
  ) {
    return `### Professional Launch Strategy: Internships & Interviews for **${careerName}**

Landing competitive internships and early-career opportunities requires converting your academic aptitude into verifiable portfolio proof.

#### 1. High-Impact Resume Architecture:
* **1-Page Standard**: Keep your resume concise, well-spaced, and clean. Use standard fonts and reverse chronological order.
* **Quantified Impact (Google XYZ Formula)**: Phrase achievements as: *"Accomplished [X], as measured by [Y], by doing [Z]"* (e.g., "Optimized database query latency by 42% through PostgreSQL B-Tree indexing").
* **Featured Projects First**: Highlight 2–3 capstone repositories with live deployment links and GitHub source code.

#### 2. Technical & Behavioral Interview Preparation:
* **The STAR Method for Behavioral Questions**:
  * **Situation**: Set the context of a team or academic challenge.
  * **Task**: Define your exact responsibility.
  * **Action**: Explain the concrete steps you personally initiated.
  * **Result**: Share the measurable outcome and what you learned.
* **Technical Communication**: In coding or design rounds, always clarify requirements, explain your thought process out loud, and discuss edge cases before writing code.

Would you like to conduct a mock interview question or review resume bullet points?`;
  }

  // 7. Compensation, salary, scope & market demand
  if (
    promptLower.includes('salary') ||
    promptLower.includes('compensation') ||
    promptLower.includes('scope') ||
    promptLower.includes('future') ||
    promptLower.includes('demand') ||
    promptLower.includes('growth') ||
    promptLower.includes('pay')
  ) {
    if (selectedCareer) {
      return `### Industry Outlook & Compensation: **${selectedCareer.title}**

*   **Compensation Range**: ${selectedCareer.salaryRange}
*   **5-Year Growth Trajectory**: ${selectedCareer.growthRate} (Current Market Demand: **${selectedCareer.demandLevel}**)
*   **Core High-Demand Competencies**: ${selectedCareer.requiredSkills.join(', ')}

#### Career Dynamics & Upward Mobility:
This pathway features robust global demand and strong career resilience. Organizations reward specialists who pair deep conceptual fundamentals with hands-on systems delivery. High-performing individuals quickly advance from junior contributors to architectural and strategic leadership roles.`;
    }
  }

  // 8. Portfolio, capstone & project suggestions
  if (
    promptLower.includes('project') ||
    promptLower.includes('portfolio') ||
    promptLower.includes('capstone') ||
    promptLower.includes('build') ||
    promptLower.includes('idea')
  ) {
    return `### 3 Standout Portfolio Project Ideas for **${careerName}**:

1.  **Production-Grade Core Utility**
    *   *Concept*: Build an open-source tool solving a tangible developer or workflow bottleneck with clean API documentation and automated tests.
    *   *Skills Highlighted*: Clean code architecture, documentation, continuous integration.
2.  **Data & Analytics Intelligence Pipeline**
    *   *Concept*: Ingest live public data, process metrics through structured pipelines, and present findings in an interactive dashboard.
    *   *Skills Highlighted*: Data manipulation, system design, domain reasoning.
3.  **Client-Ready Full-Stack Capstone**
    *   *Concept*: A production-deployed web application featuring user authentication, structured databases, and responsive UI.
    *   *Skills Highlighted*: End-to-end product delivery and cloud deployment.

Which of these three project directions interests you most?`;
  }

  // 9. Aptitude test insights & score breakdown
  if (
    promptLower.includes('test') ||
    promptLower.includes('score') ||
    promptLower.includes('aptitude') ||
    promptLower.includes('strength') ||
    promptLower.includes('dimension') ||
    promptLower.includes('radar')
  ) {
    if (studentScores) {
      const scoresSummary = ALL_DIMENSION_KEYS.map(
        (d) => `*   **${d.toUpperCase()}**: ${Math.round(studentScores[d] ?? 0)}%`
      ).join('\n');

      return `### Cognitive Profile Analysis: ${studentName}

${scoresSummary}

#### Strategic Takeaway:
Your primary cognitive pillar is **${topDim.toUpperCase()}**. In competitive fields, top performers distinguish themselves by pairing their primary strength with secondary cross-disciplinary skills (such as technical writing and clear verbal communication).

Focus on projects and coursework where your natural analytical instincts give you an execution advantage.`;
    }
  }

  // 10. University, college & exam strategies
  if (
    promptLower.includes('college') ||
    promptLower.includes('university') ||
    promptLower.includes('major') ||
    promptLower.includes('degree') ||
    promptLower.includes('school')
  ) {
    return `### Academic & Examination Strategy for **${careerName}**:

*   **Target Majors & Degrees**: Computer Science, Data Science, Applied Mathematics, Information Systems, or Engineering.
*   **Standardized Assessments**: Emphasize quantitative aptitude, algorithmic reasoning, and verbal comprehension.
*   **High-Value Certifications**: Target vendor-neutral industry standards (such as AWS Certified Cloud Practitioner, HashiCorp, or Google Cloud Associate) during your sophomore or junior year.
*   **Key Academic Advice**: University grades open doors for initial screening, but public project repositories, internships, and hackathon achievements secure top-tier placements.`;
  }

  // 10. Dynamic Concept Inquiries ("What is X?", "Explain X", "How does X work?", "Define X")
  const isConceptQuestion =
    /^(what\s+(is|are)\b|explain\b|how\s+does\b|why\s+is\b|define\b|tell\s+me\s+about\b|meaning\s+of\b)/i.test(
      promptLower
    );
  if (isConceptQuestion) {
    const rawSubject = extractSubject(prompt);
    // Ignore subjects that are personal queries like "i should...", "my exam...", etc.
    if (rawSubject && rawSubject.length > 1 && !/^(i|my|we|you)\b/i.test(rawSubject)) {
      const subjectFormatted = rawSubject.charAt(0).toUpperCase() + rawSubject.slice(1);
      return `### Conceptual Analysis: **${subjectFormatted}**

Here is a structured explanation of **${subjectFormatted}** and how it integrates into your studies and your trajectory toward **${careerName}**:

#### 1. Core Principle & Definition
* **Definition**: **${subjectFormatted}** represents a key concept in this domain. Approaching it from first principles allows you to understand how individual components work together to deliver robust results.
* **Why It Matters**: Developing a crisp, intuitive mental model of ${subjectFormatted} enables you to solve related problems efficiently, write clearer explanations on exams, and answer interview questions with confidence.

#### 2. 3-Step Framework to Master ${subjectFormatted}
1. **Deconstruct the Components**: Break ${subjectFormatted} down into inputs, rules/operations, and outputs or observed behavior.
2. **Apply with an Artifact**: Cement your understanding by writing an example summary, solving a sample problem, or writing code that demonstrates the principle.
3. **Test Boundary Conditions**: Identify edge cases or common misconceptions to test the limits of your understanding.

#### 3. Integration with Your Career Pathway
In **${careerName}**, professionals frequently apply concepts related to ${subjectFormatted} when designing solutions, troubleshooting complex systems, or communicating across multidisciplinary teams.

Would you like a step-by-step example, practice problems, or curated reference links for **${subjectFormatted}**?`;
    }
  }

  // 11. Dynamic Keyword-Based Synthesis Fallback (Addresses ANY unclassified topic directly)
  const meaningfulWords = promptLower
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

  if (meaningfulWords.length > 0) {
    const topicHeading = meaningfulWords
      .slice(0, 3)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    return `### Academic & Career Guidance: **${topicHeading}**

Hello ${studentName}! Here is targeted guidance addressing **${topicHeading}** and how it connects with your preparation for **${careerName}**:

#### 1. Core Focus on ${topicHeading}
* **First-Principles Understanding**: Approaching questions related to **${topicHeading}** requires deconstructing the core components. Clarify key definitions, observe underlying patterns, and identify how inputs relate to outcomes.
* **Applied Skill Development**: Connect theoretical concepts directly to practical execution. Build focused exercises or small proof-of-concept projects to test your understanding.

#### 2. Recommended 3-Step Action Plan:
1. **Targeted Reading & Lecture Review**: Consult authoritative documentation, university lecture notes, or standard textbook chapters on this topic.
2. **Hands-On Synthesis**: Formulate a one-page summary or create a small technical demo showing how **${topicHeading}** works in practice.
3. **Self-Assessment**: Challenge yourself with practice questions or explain the concept to a peer to verify conceptual depth.

#### 3. Integration with Your Pathway in ${careerName}:
Your strongest cognitive dimension is **${topDim.toUpperCase()}**. Leverage your analytical instincts when breaking down challenging topics like **${topicHeading}**.

What specific aspect or problem regarding **${topicHeading}** would you like to explore next?`;
  }

  // 12. General encouraging mentor response
  return `### AIspire Career Guidance

Hello ${studentName}! Based on your current trajectory in **${careerName}**:

*   **Milestone-Driven Execution**: Treat long-term ambitions as a series of compounding milestones rather than an overwhelming single leap.
*   **Current Milestone**: Focus your energy on **Step ${stepData?.stepNumber || 1}: ${stepData?.title || 'Core Foundations'}**.
*   **Structured Preparation**: Check out the **Study & Exam Hub** for past examination papers, revision formula sheets, and curated lecture playlists.

Feel free to ask me to explain any subject concept, review study techniques, or help you brainstorm your next project!`;
}

import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Main AI counsellor function:
 * 1. Checks prompt safety and educational relevance.
 * 2. Primary Production Path: Supabase Edge Function with authenticated JWT (zero client system prompt).
 * 3. Local Development / Server-Side API Call (/api/ai-mentor middleware).
 * 4. Client-Side Gemini Fallback (if VITE_GEMINI_API_KEY is configured).
 * 5. Deterministic offline heuristic advisor.
 */
export async function askAICounsellor(options: AskAIOptions): Promise<{ answer: string; usedGemini: boolean }> {
  const { prompt, selectedCareer, currentRoadmapStep, chatHistory } = options;

  // 1. Safety & Relevance Validation
  const safetyCheck = validatePromptSafety(prompt);
  if (!safetyCheck.isSafe && safetyCheck.message) {
    return {
      answer: safetyCheck.message,
      usedGemini: false,
    };
  }

  if (safetyCheck.refusalReason === 'off_topic_redirect' && safetyCheck.message) {
    return {
      answer: safetyCheck.message,
      usedGemini: false,
    };
  }

  const payload = {
    prompt,
    careerId: selectedCareer?.id,
    careerTitle: selectedCareer?.title,
    currentStepNumber: currentRoadmapStep,
    chatHistory: chatHistory?.slice(-8).map((m) => ({
      sender: m.sender,
      text: m.text,
    })),
  };

  // 2. Primary Production Path: Supabase Edge Function
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.functions.invoke('ai-mentor', {
        body: payload,
      });

      if (!error && data?.answer) {
        return { answer: data.answer, usedGemini: !!data.usedGemini };
      }

      if (data?.error && data?.rateLimited) {
        return { answer: `⚠️ ${data.error}`, usedGemini: false };
      }

      if (error) {
        let errorMsg = error.message || '';
        if ('context' in error && (error as any).context) {
          try {
            const body = await (error as any).context.clone().json();
            if (body?.error) {
              errorMsg = body.error;
            }
          } catch {
            // Ignore json parse error
          }
        }
        if (
          errorMsg &&
          (errorMsg.includes('Rate limit') ||
            errorMsg.includes('cooldown') ||
            errorMsg.includes('wait a moment') ||
            errorMsg.includes('Too Many Requests'))
        ) {
          return { answer: `⚠️ ${errorMsg}`, usedGemini: false };
        }
        console.warn('Supabase Edge Function returned error, falling back:', errorMsg);
      }
    } catch (edgeErr) {
      console.warn('Supabase Edge Function invocation failed, falling back:', edgeErr);
    }
  }

  // 3. Development / Server-Side API Call (/api/ai-mentor middleware)
  if (typeof window !== 'undefined') {
    try {
      const response = await fetch('/api/ai-mentor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.answer) {
          return { answer: data.answer, usedGemini: !!data.usedGemini };
        }
      }
    } catch (err) {
      console.warn('Development AI Mentor middleware call failed:', err);
    }
  }

  // 4. Client-Side Direct Gemini Call (Resilient fallback if frontend API key is configured)
  const clientApiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (clientApiKey && typeof clientApiKey === 'string' && clientApiKey.length > 5) {
    try {
      const models = [
        'gemini-2.5-flash',
        'gemini-2.0-flash',
        'gemini-1.5-flash',
        'gemini-2.5-flash-lite',
      ];
      const targetCareerTitle = selectedCareer?.title || 'General Career Exploration';

      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
      if (chatHistory && chatHistory.length > 0) {
        for (const msg of chatHistory.slice(-8)) {
          contents.push({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }],
          });
        }
      }
      if (contents.length === 0 || contents[contents.length - 1].parts[0].text !== prompt) {
        contents.push({
          role: 'user',
          parts: [{ text: prompt }],
        });
      }

      for (const model of models) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${clientApiKey.trim()}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: {
              parts: [
                {
                  text: `You are AIspire's official AI Career & Academic Mentor for students.
CORE INSTRUCTION: Always directly, thoroughly, and accurately address the student's question, prompt, or topic of inquiry first with clear explanations and examples. Relate it back to their educational journey and target career in ${targetCareerTitle} (Roadmap Step ${currentRoadmapStep || 1} of 10) when helpful. Use Markdown formatting with headings, bullet points, bold terms, and code blocks where appropriate.`,
                },
              ],
            },
            contents,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1200,
            },
          }),
        });

        if (res.ok) {
          const resData = await res.json();
          const candidate = resData?.candidates?.[0];
          const textParts =
            candidate?.content?.parts
              ?.filter((p: any) => !p.thought)
              ?.map((p: any) => p.text)
              ?.filter(Boolean) || [];

          const answer =
            textParts.join('\n\n').trim() || candidate?.content?.parts?.[0]?.text?.trim() || '';

          if (answer) {
            return { answer, usedGemini: true };
          }
        }
      }
    } catch (clientErr) {
      console.warn('Client-side direct Gemini call failed:', clientErr);
    }
  }

  // 5. Deterministic offline heuristic advisor
  const fallbackAnswer = generateBuiltInAdvice(options);
  return { answer: fallbackAnswer, usedGemini: false };
}

/**
 * Dynamic Internet & Study Resource Generator for any search query
 */
export async function generateDynamicResources(
  query: string
): Promise<{ googleResources: ResourceItem[]; notesResources: ResourceItem[]; youtubeResources: ResourceItem[] }> {
  const cleanedQuery = query.trim();
  const encodedQuery = encodeURIComponent(cleanedQuery);

  const googleResources: ResourceItem[] = [
    {
      id: `dyn-g-1-${Date.now()}`,
      title: `${cleanedQuery} - Official Syllabus & Examination Guide`,
      type: 'google',
      category: 'Web Search',
      examOrSubjectId: 'custom-search',
      description: `Targeted search query for official academic curriculum, candidate requirements, and guidelines for ${cleanedQuery}.`,
      url: `https://www.google.com/search?q=${encodedQuery}+official+syllabus+curriculum+guide`,
      tags: ['Google Search', 'Official', cleanedQuery],
      authorOrSource: 'Official Educational Portal',
      badge: 'Official Syllabus',
    },
    {
      id: `dyn-g-2-${Date.now()}`,
      title: `${cleanedQuery} - Academic Notes & Revision Sheets (PDF Search)`,
      type: 'google',
      category: 'Web Search',
      examOrSubjectId: 'custom-search',
      description: `Direct search for downloadable revision formula sheets, cheat sheets, and university lecture slides for ${cleanedQuery}.`,
      url: `https://www.google.com/search?q=${encodedQuery}+lecture+notes+summary+cheat+sheet+filetype:pdf`,
      tags: ['PDF Search', 'Cheat Sheet', 'Lecture Slides'],
      authorOrSource: 'Academic Open Web',
      badge: 'Study Resource',
    },
    {
      id: `dyn-g-3-${Date.now()}`,
      title: `${cleanedQuery} - Past Question Papers & Practice Bank`,
      type: 'google',
      category: 'Web Search',
      examOrSubjectId: 'custom-search',
      description: `Targeted search indexing previous year question papers, model tests, and solved solutions with answer keys.`,
      url: `https://www.google.com/search?q=${encodedQuery}+past+question+papers+solved+answers+mcq`,
      tags: ['PYQ', 'Practice Questions', 'Answer Keys'],
      authorOrSource: 'Practice Repository',
      badge: 'Practice Bank',
    },
  ];

  const notesResources: ResourceItem[] = [
    {
      id: `dyn-n-1-${Date.now()}`,
      title: `${cleanedQuery} - High-Yield Conceptual Summary & Formula Guide`,
      type: 'notes',
      category: 'Study Notes',
      examOrSubjectId: 'custom-search',
      description: `Structured revision overview covering core principles, high-yield traps, and memory formulas for ${cleanedQuery}.`,
      url: `#notes-${encodedQuery}`,
      tags: ['Revision Notes', 'High Yield', 'Core Concepts'],
      authorOrSource: 'AIspire Academic Library',
      badge: 'Study Notes',
      notesContent: `
# High-Yield Revision Guide: ${cleanedQuery}

## 1. Executive Summary & Core Concept
- **Primary Objective**: Master the foundational principles and core problem-solving models for **${cleanedQuery}**.
- **First Principles**: Break problems into primary components before attempting multi-variable problems.
- **Common Trap**: Pay close attention to definitions, unit conversions, and boundary conditions.

## 2. Recommended Study Cadence
1. **Active Recall**: Dedicate 60% of your prep time to solving problems and 40% to reading theory.
2. **Formula & Terminology Vault**: Keep a clean 1-page formula sheet updated after every study block.
3. **Spaced Intervals**: Re-test yourself at 1 day, 7 days, and 30 days to cement retention.

## 3. Action Checklist
- [ ] Read through official syllabus topics.
- [ ] Solve 25+ past exam questions on this topic.
- [ ] Explain the concept out loud in plain language to test your understanding.
      `,
    },
  ];

  const youtubeResources: ResourceItem[] = [
    {
      id: `dyn-y-1-${Date.now()}`,
      title: `${cleanedQuery} - Comprehensive Video Masterclass & Full Course`,
      type: 'youtube',
      category: 'Video Lectures',
      examOrSubjectId: 'custom-search',
      description: `Curated YouTube search query finding top-rated full lectures, animated breakdowns, and tutorials for ${cleanedQuery}.`,
      url: `https://www.youtube.com/results?search_query=${encodedQuery}+full+course+lecture`,
      tags: ['YouTube', 'Video Course', 'Lectures'],
      authorOrSource: 'YouTube Learning',
      badge: 'Video Course',
      youtubeVideoId: '8mAITcNt710',
    },
    {
      id: `dyn-y-2-${Date.now()}`,
      title: `${cleanedQuery} - Rapid Revision Crash Course (Under 1 Hour)`,
      type: 'youtube',
      category: 'Video Lectures',
      examOrSubjectId: 'custom-search',
      description: `Find condensed crash courses and one-shot revision sessions perfect for quick exam preparation.`,
      url: `https://www.youtube.com/results?search_query=${encodedQuery}+one+shot+revision+crash+course`,
      tags: ['Crash Course', 'One Shot', 'Quick Review'],
      authorOrSource: 'YouTube Learning',
      badge: 'Video Course',
    },
  ];

  return { googleResources, notesResources, youtubeResources };
}
