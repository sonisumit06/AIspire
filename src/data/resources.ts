import type { ExamOrSubjectCategory, ResourceItem } from '../types';

export const EXAM_AND_SUBJECT_CATEGORIES: ExamOrSubjectCategory[] = [
  {
    id: 'sat-act',
    name: 'SAT & ACT',
    icon: 'GraduationCap',
    type: 'exam',
    description: 'Undergraduate college admissions tests covering Math, Reading, and Writing.',
  },
  {
    id: 'gre-gmat',
    name: 'GRE & GMAT',
    icon: 'Award',
    type: 'exam',
    description: 'Graduate school and business school entrance tests (Quant, Verbal, AWA).',
  },
  {
    id: 'jee-engineering',
    name: 'JEE Main & Advanced',
    icon: 'Compass',
    type: 'exam',
    description: 'Premier engineering entrance exams covering Physics, Chemistry, and Mathematics.',
  },
  {
    id: 'neet-mcat',
    name: 'NEET & MCAT',
    icon: 'Activity',
    type: 'exam',
    description: 'Pre-medical entrance examinations covering Biology, Chemistry, Physics, and Reasoning.',
  },
  {
    id: 'gate-cs',
    name: 'GATE (Computer Science)',
    icon: 'Cpu',
    type: 'exam',
    description: 'Graduate Aptitude Test in Engineering for M.Tech admissions and PSU careers.',
  },
  {
    id: 'upsc-civil',
    name: 'UPSC & Civil Services',
    icon: 'Shield',
    type: 'exam',
    description: 'Public administration, general studies, international relations, and ethics.',
  },
  {
    id: 'cs-ai',
    name: 'Computer Science & AI',
    icon: 'Brain',
    type: 'subject',
    description: 'Algorithms, data structures, machine learning, web systems, and cloud computing.',
  },
  {
    id: 'data-analytics',
    name: 'Data Science & Statistics',
    icon: 'BarChart3',
    type: 'subject',
    description: 'Probability, Python/R, SQL, predictive modeling, and data storytelling.',
  },
  {
    id: 'ui-ux-design',
    name: 'UI/UX & Product Design',
    icon: 'Palette',
    type: 'subject',
    description: 'Design systems, Figma, user research, wireframing, and interaction design.',
  },
  {
    id: 'finance-markets',
    name: 'Finance & Quantitative Markets',
    icon: 'TrendingUp',
    type: 'subject',
    description: 'Financial accounting, options derivatives, quantitative modeling, and economics.',
  },
];

export const CURATED_RESOURCES: ResourceItem[] = [
  // SAT & ACT
  {
    id: 'sat-google-1',
    title: 'College Board Official Digital SAT Practice Tests',
    type: 'google',
    category: 'SAT & ACT',
    examOrSubjectId: 'sat-act',
    description:
      'Official Bluebook practice tests and test-day specifications directly from the College Board portal.',
    url: 'https://www.google.com/search?q=official+digital+sat+bluebook+practice+tests+collegeboard',
    tags: ['Official', 'Practice Test', 'Digital SAT'],
    authorOrSource: 'College Board Official',
    badge: 'Official Portal',
  },
  {
    id: 'sat-google-2',
    title: 'Google Deep Search: Digital SAT Math Formula & Trick PDFs',
    type: 'google',
    category: 'SAT & ACT',
    examOrSubjectId: 'sat-act',
    description:
      'Targeted academic file search for high-scoring Math cheat sheets and shortcut formulas.',
    url: 'https://www.google.com/search?q=digital+sat+math+cheat+sheet+formula+filetype:pdf',
    tags: ['Google Search', 'PDF', 'Formula Sheet'],
    authorOrSource: 'Web Index',
    badge: 'Deep Search',
  },
  {
    id: 'sat-notes-1',
    title: 'SAT Math High-Yield Formulas & Desmos Shortcuts Note',
    type: 'notes',
    category: 'SAT & ACT',
    examOrSubjectId: 'sat-act',
    description:
      'Essential algebra, geometry, and trigonometry formulas plus high-speed Desmos graphing calculator hacks.',
    url: '#notes-sat-math',
    tags: ['Formulas', 'Desmos Hacks', 'Quick Revision'],
    authorOrSource: 'AIspire Academic Team',
    badge: 'Study Notes',
    notesContent: `
# Digital SAT Math High-Yield Quick Notes

## 1. Desmos Calculator Super-Powers
- **Finding Intersections / Roots**: Graph both equations directly (e.g., \`y = 2x^2 - 5x + 3\` and \`y = 4\`). Click gray dots to read exact coordinates immediately.
- **Solving Equations with One Variable**: Enter \`2(x - 4) + 7 = 3x + 1\` into Desmos. It plots a vertical line at the exact value of \`x\`.
- **Regressions**: Type table data, then use \`y_1 ~ m x_1 + b\` or quadratic \`y_1 ~ a x_1^2 + b x_1 + c\` for instant curve fits.

## 2. Quadratic & Vertex Form
- **Standard**: \\( f(x) = ax^2 + bx + c \\)
- **Vertex Form**: \\( f(x) = a(x - h)^2 + k \\) where vertex is \\((h, k)\\). Maximum if \\(a < 0\\), Minimum if \\(a > 0\\).
- **Vertex x-coordinate**: \\( x = -\\frac{b}{2a} \\)
- **Discriminant**: \\( \\Delta = b^2 - 4ac \\)
  - \\( \\Delta > 0 \\): 2 distinct real roots
  - \\( \\Delta = 0 \\): exactly 1 real root
  - \\( \\Delta < 0 \\): 0 real roots (complex)

## 3. Exponents & Percentages
- **Exponential Growth/Decay**: \\( A(t) = P(1 \\pm r)^t \\)
- **Compound Interest (n times/yr)**: \\( A = P(1 + \\frac{r}{n})^{nt} \\)
- **Percentage Change**: \\( \\frac{\\text{New} - \\text{Old}}{\\text{Old}} \\times 100\\% \\)
    `,
  },
  {
    id: 'sat-yt-1',
    title: 'Digital SAT Complete Crash Course & Strategy 2026',
    type: 'youtube',
    category: 'SAT & ACT',
    examOrSubjectId: 'sat-act',
    description:
      'Comprehensive multi-hour video course covering Reading, Writing conventions, and 800-target Math tactics.',
    url: 'https://www.youtube.com/results?search_query=digital+sat+complete+prep+course',
    tags: ['Video Course', 'Reading & Math', 'Crash Course'],
    authorOrSource: 'Khan Academy / Scalar Learning',
    badge: 'Video Course',
    youtubeVideoId: 'U_5_7F7Z-1s',
  },

  // JEE Main & Advanced
  {
    id: 'jee-google-1',
    title: 'JEE Advanced Past 10 Years Question Papers with Official Keys',
    type: 'google',
    category: 'JEE Main & Advanced',
    examOrSubjectId: 'jee-engineering',
    description:
      'Direct Google search indexing official IIT JEE Advanced question papers, answer keys, and candidate portal archives.',
    url: 'https://www.google.com/search?q=jee+advanced+past+year+question+papers+official+iit+pdf',
    tags: ['PYQ', 'IIT JEE', 'Official Papers'],
    authorOrSource: 'IIT Joint Admission Board',
    badge: 'Official Archive',
  },
  {
    id: 'jee-notes-1',
    title: 'JEE Physics & Physical Chemistry Formula Vault',
    type: 'notes',
    category: 'JEE Main & Advanced',
    examOrSubjectId: 'jee-engineering',
    description:
      'Condensed formula sheet covering Rotational Dynamics, Thermodynamics, Electromagnetism, and Chemical Kinetics.',
    url: '#notes-jee-formula',
    tags: ['Physics', 'Chemistry', 'Formulas'],
    authorOrSource: 'AIspire Engineering Faculty',
    badge: 'Study Notes',
    notesContent: `
# JEE High-Yield Revision Matrix

## 1. Rotational Mechanics
- **Moment of Inertia**:
  - Ring about central axis: \\( I = MR^2 \\)
  - Disc about central axis: \\( I = \\frac{1}{2}MR^2 \\)
  - Solid Sphere: \\( I = \\frac{2}{5}MR^2 \\)
  - Spherical Shell: \\( I = \\frac{2}{3}MR^2 \\)
- **Parallel Axis Theorem**: \\( I = I_{cm} + Md^2 \\)
- **Angular Momentum**: \\( \\vec{L} = \\vec{r} \\times \\vec{p} = I\\vec{\\omega} \\)
- **Torque**: \\( \\vec{\\tau} = \\frac{d\\vec{L}}{dt} = I\\vec{\\alpha} \\)

## 2. Electrodynamics & Gauss Law
- **Gauss's Law**: \\( \\oint \\vec{E} \\cdot d\\vec{A} = \\frac{Q_{enclosed}}{\\varepsilon_0} \\)
- **Electric Potential due to Dipole**: \\( V = \\frac{kp \\cos\\theta}{r^2} \\)
- **Capacitance with Dielectric**: \\( C = \\frac{K \\varepsilon_0 A}{d} \\)
- **Magnetic Force**: \\( \\vec{F} = q(\\vec{v} \\times \\vec{B}) \\)

## 3. Chemical Thermodynamics
- **First Law**: \\( \\Delta U = q + w \\)
- **Work in Isothermal Reversible**: \\( w = -2.303 nRT \\log\\left(\\frac{V_2}{V_1}\\right) \\)
- **Gibbs Free Energy**: \\( \\Delta G = \\Delta H - T\\Delta S \\) (Spontaneous when \\( \\Delta G < 0 \\))
    `,
  },
  {
    id: 'jee-yt-1',
    title: 'Physics Galaxy: Complete JEE Advanced Concept Visualizer',
    type: 'youtube',
    category: 'JEE Main & Advanced',
    examOrSubjectId: 'jee-engineering',
    description:
      'In-depth animated physics illustrations by Ashish Arora for mastering tricky Advanced concepts.',
    url: 'https://www.youtube.com/results?search_query=physics+galaxy+jee+advanced+complete',
    tags: ['Physics', 'Concept Videos', 'IIT JEE'],
    authorOrSource: 'Physics Galaxy',
    badge: 'Video Playlist',
    youtubeVideoId: 'w3gH_J9z-Zc',
  },

  // NEET & MCAT
  {
    id: 'neet-google-1',
    title: 'NCERT High-Yield Biology Line-by-Line Question Repository',
    type: 'google',
    category: 'NEET & MCAT',
    examOrSubjectId: 'neet-mcat',
    description:
      'Google search query for direct NCERT line-by-line multiple-choice question banks and diagrams.',
    url: 'https://www.google.com/search?q=ncert+biology+line+by+line+mcq+neet+filetype:pdf',
    tags: ['NCERT', 'Biology', 'Question Bank'],
    authorOrSource: 'Medical Education Web',
    badge: 'Deep Search',
  },
  {
    id: 'neet-notes-1',
    title: 'Human Physiology & Molecular Genetics NCERT Summary Notes',
    type: 'notes',
    category: 'NEET & MCAT',
    examOrSubjectId: 'neet-mcat',
    description:
      'Detailed revision notes covering Neural Control, Chemical Coordination, Mendelian Genetics, and Lac Operon.',
    url: '#notes-neet-bio',
    tags: ['Biology', 'Genetics', 'Physiology'],
    authorOrSource: 'AIspire Medical Mentors',
    badge: 'Study Notes',
    notesContent: `
# NEET / MCAT High-Yield Biology Core

## 1. Genetics & Molecular Biology
- **Central Dogma**: DNA \\( \\rightarrow \\) hnRNA \\( \\rightarrow \\) mRNA \\( \\rightarrow \\) Polypeptide.
- **Lac Operon Model (Jacob & Monod)**:
  - Repressor protein binds to **Operator gene (O)** in absence of lactose.
  - Lactose (Allolactose) acts as the **Inducer**, inactivating the repressor.
  - Structural genes:
    - \\( z \\): Beta-galactosidase (hydrolyzes lactose to glucose + galactose)
    - \\( y \\): Permease (increases membrane permeability to beta-galactosides)
    - \\( a \\): Transacetylase

## 2. Endocrine Feedback Loops
- **Thyroid Regulation**: Hypothalamus (TRH) \\( \\rightarrow \\) Anterior Pituitary (TSH) \\( \\rightarrow \\) Thyroid (T3/T4). Elevated T3/T4 provides negative feedback to both hypothalamus and pituitary.
- **RAAS (Renin-Angiotensin-Aldosterone System)**:
  - Juxtaglomerular apparatus releases **Renin** when GFR drops.
  - Renin converts Angiotensinogen \\( \\rightarrow \\) Angiotensin I.
  - ACE converts Angiotensin I \\( \\rightarrow \\) Angiotensin II (powerful vasoconstrictor).
  - Angiotensin II stimulates adrenal cortex to release **Aldosterone** (absorbs \\(Na^+\\) and \\(H_2O\\)).
    `,
  },
  {
    id: 'neet-yt-1',
    title: 'Crash Course Biology & Human Physiology Series',
    type: 'youtube',
    category: 'NEET & MCAT',
    examOrSubjectId: 'neet-mcat',
    description:
      'Hank Green’s famous fast-paced visual explanations of bodily systems, immune defense, and biochemistry.',
    url: 'https://www.youtube.com/results?search_query=crash+course+anatomy+and+physiology+playlist',
    tags: ['Anatomy', 'Physiology', 'Visual Animation'],
    authorOrSource: 'CrashCourse',
    badge: 'Video Series',
    youtubeVideoId: 'uBGl2BujkPQ',
  },

  // Computer Science & AI
  {
    id: 'cs-google-1',
    title: 'Google Deep Search: System Design Primer & Distributed Systems',
    type: 'google',
    category: 'Computer Science & AI',
    examOrSubjectId: 'cs-ai',
    description:
      'Curated GitHub repository and open-source system design diagrams explaining scalable architectures.',
    url: 'https://www.google.com/search?q=github+system+design+primer+donnemartin',
    tags: ['System Design', 'Architecture', 'Open Source'],
    authorOrSource: 'Donne Martin & GitHub Community',
    badge: 'Top GitHub Repo',
  },
  {
    id: 'cs-notes-1',
    title: 'Data Structures & Algorithms Complexity Cheat Sheet',
    type: 'notes',
    category: 'Computer Science & AI',
    examOrSubjectId: 'cs-ai',
    description:
      'Time & space complexities for arrays, linked lists, trees, graphs, sorting algorithms, and dynamic programming patterns.',
    url: '#notes-cs-algo',
    tags: ['Big-O', 'Algorithms', 'Data Structures'],
    authorOrSource: 'AIspire CS Department',
    badge: 'Study Notes',
    notesContent: `
# Data Structures & Algorithms Core Cheat Sheet

## 1. Complexity Matrix
| Data Structure | Access | Search | Insertion | Deletion | Space |
|---|---|---|---|---|---|
| **Array** | O(1) | O(n) | O(n) | O(n) | O(n) |
| **Hash Map** | N/A | O(1) avg | O(1) avg | O(1) avg | O(n) |
| **Binary Search Tree** | O(log n) | O(log n) | O(log n) | O(log n) | O(n) |
| **Min/Max Heap** | N/A | O(n) | O(log n) | O(log n) | O(n) |

## 2. Core Sorting Algorithms
- **Quick Sort**: O(n log n) average, O(n²) worst-case. In-place, unstable.
- **Merge Sort**: O(n log n) guaranteed. Requires O(n) extra auxiliary space. Stable.
- **Heap Sort**: O(n log n) guaranteed. In-place, unstable.

## 3. Dynamic Programming Top Patterns
- **0/1 Knapsack**: Pick or skip item. State: \`dp[i][w] = max(dp[i-1][w], val[i] + dp[i-1][w - weight[i]])\`.
- **Longest Common Subsequence (LCS)**: If \`A[i] == B[j]\`, \`1 + dp[i-1][j-1]\`, else \`max(dp[i-1][j], dp[i][j-1])\`.
- **Sliding Window**: Keep two pointers \`left\` and \`right\`. Expand \`right\` to satisfy constraint; contract \`left\` to optimize.
    `,
  },
  {
    id: 'cs-yt-1',
    title: 'Harvard CS50: Introduction to Computer Science',
    type: 'youtube',
    category: 'Computer Science & AI',
    examOrSubjectId: 'cs-ai',
    description:
      'David J. Malan’s legendary introduction to computing, C, memory management, algorithms, and web development.',
    url: 'https://www.youtube.com/results?search_query=cs50+full+course+youtube',
    tags: ['Harvard', 'CS50', 'Computer Science'],
    authorOrSource: 'Harvard University',
    badge: 'Complete Course',
    youtubeVideoId: '8mAITcNt710',
  },
  {
    id: 'cs-yt-2',
    title: '3Blue1Brown: Neural Networks & Deep Learning Intuition',
    type: 'youtube',
    category: 'Computer Science & AI',
    examOrSubjectId: 'cs-ai',
    description:
      'The world-renowned visual breakdown of gradient descent, backpropagation, and transformer attention.',
    url: 'https://www.youtube.com/results?search_query=3blue1brown+neural+networks+playlist',
    tags: ['AI & ML', 'Deep Learning', 'Math Visualization'],
    authorOrSource: 'Grant Sanderson (3Blue1Brown)',
    badge: 'Visual Masterclass',
    youtubeVideoId: 'aircAruvnKk',
  },

  // UI/UX & Product Design
  {
    id: 'design-google-1',
    title: 'Nielsen Norman Group (NN/g): UX Research & Heuristics Portal',
    type: 'google',
    category: 'UI/UX & Product Design',
    examOrSubjectId: 'ui-ux-design',
    description:
      'Search the premier research library for usability heuristics, cognitive psychology in design, and empirical benchmarks.',
    url: 'https://www.google.com/search?q=site:nngroup.com+10+usability+heuristics+user+experience',
    tags: ['NN/g', 'UX Research', 'Heuristics'],
    authorOrSource: 'Nielsen Norman Group',
    badge: 'Industry Benchmark',
  },
  {
    id: 'design-notes-1',
    title: '10 Usability Heuristics & Design System Architecture Notes',
    type: 'notes',
    category: 'UI/UX & Product Design',
    examOrSubjectId: 'ui-ux-design',
    description:
      'Jakob Nielsen’s 10 golden principles annotated with modern mobile and web app examples.',
    url: '#notes-ux-design',
    tags: ['Heuristics', 'Design Systems', 'Usability'],
    authorOrSource: 'AIspire Design Faculty',
    badge: 'Study Notes',
    notesContent: `
# Jakob Nielsen's 10 Usability Heuristics for Modern UI

## 1. Visibility of System Status
- The system should always keep users informed about what is going on through appropriate timely feedback (e.g. progress bars, upload loaders, optimistic UI updates).

## 2. Match Between System and the Real World
- Speak the user's language with words, phrases, and concepts familiar to the user, rather than system-oriented terms. Follow natural and logical conventions.

## 3. User Control and Freedom
- Users often make mistakes. Provide a clearly marked "emergency exit" without having to go through an extended process (e.g. Undo, Redo, Cancel).

## 4. Consistency and Standards
- Users should not have to wonder whether different words, situations, or actions mean the same thing. Adhere to established platform conventions (e.g. standard icons, placement).

## 5. Error Prevention
- Better than good error messages is a careful design that prevents problems from occurring in the first place (e.g. confirmation dialogues before irreversible deletion, smart input masks).

## 6. Recognition Rather Than Recall
- Minimize the user's memory load by making objects, actions, and options visible. The user should not have to remember information from one part of the dialogue to another.

## 7. Flexibility and Efficiency of Use
- Accelerators—unseen by novice users—may often speed up the interaction for expert users (e.g. keyboard shortcuts \`Cmd+K\`, gesture swipes).

## 8. Aesthetic and Minimalist Design
- Dialogues should not contain information that is irrelevant or rarely needed. Every extra unit of information in a dialogue competes with the relevant units of information.

## 9. Help Users Recognize, Diagnose, and Recover from Errors
- Error messages should be expressed in plain language (no error codes), precisely indicate the problem, and constructively suggest a solution.

## 10. Help and Documentation
- Even though it is better if the system can be used without documentation, it may be necessary to provide help and documentation that is easy to search and focused on the user's task.
    `,
  },
  {
    id: 'design-yt-1',
    title: 'Figma Complete Masterclass: From Beginner to Pro',
    type: 'youtube',
    category: 'UI/UX & Product Design',
    examOrSubjectId: 'ui-ux-design',
    description:
      'Comprehensive tutorial covering Figma components, auto-layout 5.0, variables, design tokens, and developer handoff.',
    url: 'https://www.youtube.com/results?search_query=figma+complete+masterclass+design+system',
    tags: ['Figma', 'UI Design', 'Design Tokens'],
    authorOrSource: 'freeCodeCamp / Mizko',
    badge: 'Masterclass',
    youtubeVideoId: 'c9Wg6Cb_YlU',
  },

  // Finance & Quantitative Markets
  {
    id: 'finance-google-1',
    title: 'CFA Institute Official Curriculum & Ethics Standards Portal',
    type: 'google',
    category: 'Finance & Quantitative Markets',
    examOrSubjectId: 'finance-markets',
    description:
      'Search official CFA Institute candidate study notes, ethics guidelines, and learning outcome statements.',
    url: 'https://www.google.com/search?q=cfa+level+1+curriculum+summary+cheat+sheet+filetype:pdf',
    tags: ['CFA', 'Finance', 'Curriculum'],
    authorOrSource: 'CFA Institute Web',
    badge: 'Official Curriculum',
  },
  {
    id: 'finance-notes-1',
    title: 'Corporate Finance & Financial Modeling Formula Sheet',
    type: 'notes',
    category: 'Finance & Quantitative Markets',
    examOrSubjectId: 'finance-markets',
    description:
      'Valuation multiples, DCF formulas, WACC calculations, and financial statement linkages.',
    url: '#notes-finance-formulas',
    tags: ['Valuation', 'DCF', 'WACC'],
    authorOrSource: 'AIspire Finance Faculty',
    badge: 'Study Notes',
    notesContent: `
# Quantitative Finance & Valuation Quick Notes

## 1. Discounted Cash Flow (DCF) Valuation
- **Free Cash Flow to Firm (FCFF)**:
  \\[
  \\text{FCFF} = \\text{EBIT}(1 - t) + \\text{Depreciation} - \\text{CapEx} - \\Delta\\text{Net Working Capital}
  \\]
- **Enterprise Value (EV)**:
  \\[
  \\text{EV} = \\sum_{t=1}^{N} \\frac{\\text{FCFF}_t}{(1 + \\text{WACC})^t} + \\frac{\\text{Terminal Value}_N}{(1 + \\text{WACC})^N}
  \\]
- **Gordon Growth Terminal Value**:
  \\[
  \\text{Terminal Value}_N = \\frac{\\text{FCFF}_{N+1}}{\\text{WACC} - g}
  \\]

## 2. Weighted Average Cost of Capital (WACC)
\\[
\\text{WACC} = \\left(\\frac{E}{V}\\right) r_e + \\left(\\frac{D}{V}\\right) r_d (1 - t)
\\]
- **Cost of Equity (CAPM)**: \\( r_e = r_f + \\beta (r_m - r_f) \\)

## 3. Financial Statement Linkages
- **Net Income** from Income Statement flows into the top of the **Cash Flow from Operating Activities** and increases **Retained Earnings** on the Balance Sheet (minus dividends).
- **CapEx** from Cash Flow from Investing increases **Property, Plant & Equipment (PP&E)** on the Balance Sheet.
    `,
  },
  {
    id: 'finance-yt-1',
    title: 'Damodaran on Valuation & Corporate Finance Masterclass',
    type: 'youtube',
    category: 'Finance & Quantitative Markets',
    examOrSubjectId: 'finance-markets',
    description:
      'NYU Stern Professor Aswath Damodaran’s legendary complete semester lectures on valuing companies and cash flows.',
    url: 'https://www.youtube.com/results?search_query=aswath+damodaran+valuation+complete+playlist',
    tags: ['NYU Stern', 'Damodaran', 'Valuation'],
    authorOrSource: 'Prof. Aswath Damodaran (NYU Stern)',
    badge: 'University Lecture',
    youtubeVideoId: '8aNzgv7o8Yg',
  },
];
