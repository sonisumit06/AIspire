import type { AptitudeQuestion, DimensionInfo } from '../types';

export const DIMENSIONS: DimensionInfo[] = [
  {
    key: 'analytical',
    label: 'Analytical & Logic',
    shortDesc: 'Mathematical reasoning, algorithmic thinking, and structural problem-solving',
    color: '#3b82f6', // blue
    iconName: 'Brain',
  },
  {
    key: 'creative',
    label: 'Creative & Design',
    shortDesc: 'Aesthetic innovation, visual storytelling, and lateral out-of-the-box thinking',
    color: '#ec4899', // pink
    iconName: 'Palette',
  },
  {
    key: 'technical',
    label: 'Technical & Engineering',
    shortDesc: 'Software development, hardware architectures, and digital systems mastery',
    color: '#06b6d4', // cyan
    iconName: 'Cpu',
  },
  {
    key: 'socialHealthcare',
    label: 'Social & Healthcare',
    shortDesc: 'Empathy, patient care, psychological support, and community well-being',
    color: '#10b981', // emerald
    iconName: 'HeartHandshake',
  },
  {
    key: 'management',
    label: 'Leadership & Strategy',
    shortDesc: 'Team leadership, executive planning, entrepreneurship, and operational execution',
    color: '#f59e0b', // amber
    iconName: 'Briefcase',
  },
  {
    key: 'research',
    label: 'Research & Science',
    shortDesc: 'Scientific method, deep-dive hypothesis testing, and exploratory discovery',
    color: '#8b5cf6', // purple
    iconName: 'Microscope',
  },
  {
    key: 'communication',
    label: 'Communication & Media',
    shortDesc: 'Articulate writing, public persuasion, storytelling, and policy negotiation',
    color: '#f97316', // orange
    iconName: 'MessageSquareQuote',
  },
];

export const APTITUDE_QUESTIONS: AptitudeQuestion[] = [
  {
    id: 1,
    title: 'Critical Outage Investigation',
    scenario:
      'A school portal or service crashes right before exam registration. How do you naturally approach this emergency?',
    category: 'Problem Solving & Systems',
    primaryDimension: 'technical',
    options: [
      {
        id: '1a',
        text: 'Inspect server logs, isolate the database query error, and patch the backend script immediately.',
        dimensionWeights: { technical: 10, analytical: 8 },
      },
      {
        id: '1b',
        text: 'Coordinate the team, delegate tasks, update anxious users, and establish a rollback timeline.',
        dimensionWeights: { management: 10, communication: 7 },
      },
      {
        id: '1c',
        text: 'Analyze the traffic patterns statistically to model server load bottlenecks for future capacity.',
        dimensionWeights: { analytical: 10, research: 7 },
      },
      {
        id: '1d',
        text: 'Design a friendly fallback error page with live status updates and helpful alternatives for students.',
        dimensionWeights: { creative: 9, communication: 6 },
      },
    ],
  },
  {
    id: 2,
    title: 'Product Redesign Workshop',
    scenario:
      'You are asked to revamp an educational mobile app that students find boring and hard to navigate. What excites you most?',
    category: 'Design & Experience',
    primaryDimension: 'creative',
    options: [
      {
        id: '2a',
        text: 'Crafting an engaging visual interface with intuitive animations, micro-interactions, and dark mode.',
        dimensionWeights: { creative: 10, technical: 5 },
      },
      {
        id: '2b',
        text: 'Interviewing frustrated students, observing their emotions, and identifying pain points empathetically.',
        dimensionWeights: { socialHealthcare: 9, communication: 8 },
      },
      {
        id: '2c',
        text: 'Restructuring the app information architecture, state management, and speed benchmarks.',
        dimensionWeights: { technical: 10, analytical: 7 },
      },
      {
        id: '2d',
        text: 'Conducting A/B hypothesis tests to measure retention metrics and student engagement statistically.',
        dimensionWeights: { research: 9, analytical: 8 },
      },
    ],
  },
  {
    id: 3,
    title: 'Student Wellness & Support',
    scenario:
      'A close friend or peer is experiencing intense academic burnout and feeling overwhelmed about their future. What do you do?',
    category: 'Human Connection & Care',
    primaryDimension: 'socialHealthcare',
    options: [
      {
        id: '3a',
        text: 'Listen deeply without judgment, validate their emotional struggles, and connect them with wellness resources.',
        dimensionWeights: { socialHealthcare: 10, communication: 7 },
      },
      {
        id: '3b',
        text: 'Break down their overwhelming syllabus into a structured, step-by-step weekly milestone timetable.',
        dimensionWeights: { management: 9, analytical: 7 },
      },
      {
        id: '3c',
        text: 'Help them build automated Notion/flashcard tools and Pomodoro trackers to optimize their study flow.',
        dimensionWeights: { technical: 8, analytical: 7 },
      },
      {
        id: '3d',
        text: 'Research neuroplasticity, cognitive load, and sleep science to explain how their brain recovers.',
        dimensionWeights: { research: 9, analytical: 6 },
      },
    ],
  },
  {
    id: 4,
    title: 'The Hackathon Dilemma',
    scenario:
      'Your hackathon team has 12 hours left. The prototype is only 40% complete. What is your leadership stance?',
    category: 'Strategy & Execution',
    primaryDimension: 'management',
    options: [
      {
        id: '4a',
        text: 'Ruthlessly cut non-essential features, define an MVP scope, assign roles, and align everyone on delivery.',
        dimensionWeights: { management: 10, analytical: 6 },
      },
      {
        id: '4b',
        text: 'Dive straight into the code, refactor the core API, and stay up all night coding the main pipeline.',
        dimensionWeights: { technical: 10, analytical: 8 },
      },
      {
        id: '4c',
        text: 'Craft a compelling pitch deck, design crisp demo mockups, and rehearse a captivating story for judges.',
        dimensionWeights: { communication: 10, creative: 8 },
      },
      {
        id: '4d',
        text: 'Keep team morale high, bring refreshments, resolve internal disputes, and ensure no one burns out.',
        dimensionWeights: { socialHealthcare: 9, communication: 7 },
      },
    ],
  },
  {
    id: 5,
    title: 'Scientific Enigma in the Lab',
    scenario:
      'While conducting an experiment, your data shows an unexpected anomaly that contradicts established textbook theories. What is your reaction?',
    category: 'Inquiry & Investigation',
    primaryDimension: 'research',
    options: [
      {
        id: '5a',
        text: 'Get thrilled! Isolate variables, formulate three alternative hypotheses, and design rigorous control runs.',
        dimensionWeights: { research: 10, analytical: 8 },
      },
      {
        id: '5b',
        text: 'Write a Python or R script to run statistical regression, check outlier distributions, and graph results.',
        dimensionWeights: { analytical: 10, technical: 8 },
      },
      {
        id: '5c',
        text: 'Write a detailed research report clearly describing the unexpected phenomenon and its ethical implications.',
        dimensionWeights: { communication: 9, research: 7 },
      },
      {
        id: '5d',
        text: 'Envision how this anomaly could inspire a brand new patent or commercial green-tech application.',
        dimensionWeights: { creative: 8, management: 8 },
      },
    ],
  },
  {
    id: 6,
    title: 'Public Debate & Policy',
    scenario:
      'You are chosen to represent your student council in a contentious debate on campus environmental policies. What is your weapon?',
    category: 'Communication & Persuasion',
    primaryDimension: 'communication',
    options: [
      {
        id: '6a',
        text: 'Well-researched arguments, rhetorical clarity, emotional resonance, and persuasive speech delivery.',
        dimensionWeights: { communication: 10, socialHealthcare: 6 },
      },
      {
        id: '6b',
        text: 'Hard statistical data, cost-benefit trade-offs, and logical proof of long-term economic sustainability.',
        dimensionWeights: { analytical: 10, management: 7 },
      },
      {
        id: '6c',
        text: 'A concrete technical proposal involving solar sensors, automated waste sorting, and smart grids.',
        dimensionWeights: { technical: 9, creative: 6 },
      },
      {
        id: '6d',
        text: 'Mediating between opposing factions, finding common ground, and drafting a coalition policy compromise.',
        dimensionWeights: { management: 9, socialHealthcare: 8 },
      },
    ],
  },
  {
    id: 7,
    title: 'Complex Algorithm & Optimization',
    scenario:
      'You are given a complex mathematical riddle or a slow computational algorithm. What is your instinctive way of thinking?',
    category: 'Logic & Computation',
    primaryDimension: 'analytical',
    options: [
      {
        id: '7a',
        text: 'Decompose the problem into mathematical sub-problems, find edge cases, and prove time complexity O(N log N).',
        dimensionWeights: { analytical: 10, technical: 7 },
      },
      {
        id: '7b',
        text: 'Visualize the problem geometrically using colored graphs, spatial trees, and interactive mental simulations.',
        dimensionWeights: { creative: 9, analytical: 7 },
      },
      {
        id: '7c',
        text: 'Implement multiple algorithms in code, benchmark their memory and CPU latency on real hardware.',
        dimensionWeights: { technical: 10, research: 6 },
      },
      {
        id: '7d',
        text: 'Explain the solution using intuitive everyday analogies so even non-technical peers can understand it.',
        dimensionWeights: { communication: 9, socialHealthcare: 6 },
      },
    ],
  },
  {
    id: 8,
    title: 'Campus Festival Branding',
    scenario:
      'The university needs an iconic theme and promotional campaign for its annual festival. What role do you naturally take?',
    category: 'Creativity & Arts',
    primaryDimension: 'creative',
    options: [
      {
        id: '8a',
        text: 'Creating the visual identity: logos, typography, motion graphics, and 3D visual concepts.',
        dimensionWeights: { creative: 10, technical: 5 },
      },
      {
        id: '8b',
        text: 'Negotiating sponsorships, managing budgets, booking keynote guests, and overseeing vendor logistics.',
        dimensionWeights: { management: 10, communication: 7 },
      },
      {
        id: '8c',
        text: 'Writing captivating copy, press releases, social media reels scripts, and promotional podcasts.',
        dimensionWeights: { communication: 10, creative: 7 },
      },
      {
        id: '8d',
        text: 'Setting up stage sound systems, programmable LED lighting rigs, and ticket scanning QR code apps.',
        dimensionWeights: { technical: 10, analytical: 6 },
      },
    ],
  },
  {
    id: 9,
    title: 'Medical Emergency Simulation',
    scenario:
      'During a community first-aid drill, you participate in a mock triage response. What aspect feels most natural?',
    category: 'Healthcare & Life Sciences',
    primaryDimension: 'socialHealthcare',
    options: [
      {
        id: '9a',
        text: 'Checking vital signs, assessing physical trauma, and staying calm while providing immediate hands-on care.',
        dimensionWeights: { socialHealthcare: 10, research: 5 },
      },
      {
        id: '9b',
        text: 'Rapidly calculating medication dosages, analyzing symptoms against diagnostic matrices systematically.',
        dimensionWeights: { analytical: 9, research: 8 },
      },
      {
        id: '9c',
        text: 'Comforting panicked bystanders and communicating clear, reassuring instructions in a high-stress room.',
        dimensionWeights: { communication: 9, socialHealthcare: 8 },
      },
      {
        id: '9d',
        text: 'Managing emergency kit inventory, tracking patient dispatch queues, and ensuring protocol compliance.',
        dimensionWeights: { management: 9, analytical: 6 },
      },
    ],
  },
  {
    id: 10,
    title: 'Smart Home Automation Project',
    scenario:
      'You are building a custom DIY project for your room using sensors, microcontrollers, and smart assistants. What is your goal?',
    category: 'Engineering & Hardware',
    primaryDimension: 'technical',
    options: [
      {
        id: '10a',
        text: 'Soldering circuits, programming microcontrollers (Arduino/ESP32), and integrating IoT cloud webhooks.',
        dimensionWeights: { technical: 10, analytical: 7 },
      },
      {
        id: '10b',
        text: 'Focusing on clean industrial product design, 3D printing custom sleek enclosures, and ambient lighting.',
        dimensionWeights: { creative: 9, technical: 7 },
      },
      {
        id: '10c',
        text: 'Measuring energy efficiency, power draw curves, and conducting battery degradation studies.',
        dimensionWeights: { research: 9, analytical: 8 },
      },
      {
        id: '10d',
        text: 'Documenting a full open-source build guide on YouTube and GitHub with schematics and tutorial write-ups.',
        dimensionWeights: { communication: 9, technical: 6 },
      },
    ],
  },
  {
    id: 11,
    title: 'Starting a High-Growth Venture',
    scenario:
      'You and your friends decide to launch a startup over summer break. Which core responsibility do you gravitate toward?',
    category: 'Entrepreneurship & Leadership',
    primaryDimension: 'management',
    options: [
      {
        id: '11a',
        text: 'Chief Executive & Strategy: Setting the company vision, hiring talent, fundraising, and pitch decks.',
        dimensionWeights: { management: 10, communication: 8 },
      },
      {
        id: '11b',
        text: 'Chief Technology Officer: Writing the software codebase, choosing tech stack, and cloud deployment.',
        dimensionWeights: { technical: 10, analytical: 8 },
      },
      {
        id: '11c',
        text: 'Chief Design Officer: Brand personality, UI/UX design, customer journeys, and aesthetic packaging.',
        dimensionWeights: { creative: 10, communication: 6 },
      },
      {
        id: '11d',
        text: 'Chief Data Officer: Customer cohort retention metrics, unit economics modeling, and pricing algorithms.',
        dimensionWeights: { analytical: 10, research: 7 },
      },
    ],
  },
  {
    id: 12,
    title: 'Environmental Climate Research',
    scenario:
      'Your regional river or lake is facing sudden algae blooms. How would you investigate and address this crisis?',
    category: 'Science & Ecology',
    primaryDimension: 'research',
    options: [
      {
        id: '12a',
        text: 'Collect water samples, test nitrogen/phosphorus levels in a lab, and identify microscopic bacterial species.',
        dimensionWeights: { research: 10, analytical: 7 },
      },
      {
        id: '12b',
        text: 'Build an autonomous floating water-filtration drone with automated telemetry sensors and GPS tracking.',
        dimensionWeights: { technical: 10, creative: 6 },
      },
      {
        id: '12c',
        text: 'Mobilize local neighborhood volunteers, organize cleanup drives, and support affected fishing families.',
        dimensionWeights: { socialHealthcare: 9, management: 8 },
      },
      {
        id: '12d',
        text: 'Draft policy proposals for municipal government regulations and write an investigative press piece.',
        dimensionWeights: { communication: 10, research: 6 },
      },
    ],
  },
  {
    id: 13,
    title: 'Financial Portfolio & Markets',
    scenario:
      'You are given $10,000 in virtual capital for a national high-school/college investment simulation. What is your strategy?',
    category: 'Finance & Quantitative Logic',
    primaryDimension: 'analytical',
    options: [
      {
        id: '13a',
        text: 'Build quantitative spreadsheet models evaluating P/E ratios, discounted cash flows, and balance sheets.',
        dimensionWeights: { analytical: 10, research: 7 },
      },
      {
        id: '13b',
        text: 'Write algorithmic trading bots to execute momentum signals and backtest strategies on historical data.',
        dimensionWeights: { technical: 9, analytical: 9 },
      },
      {
        id: '13c',
        text: 'Invest in socially responsible ESG companies developing green energy and accessible healthcare technology.',
        dimensionWeights: { socialHealthcare: 8, management: 7 },
      },
      {
        id: '13d',
        text: 'Analyze consumer psychology, viral market trends, and brand popularity shifts among Gen-Z.',
        dimensionWeights: { creative: 8, communication: 7 },
      },
    ],
  },
  {
    id: 14,
    title: 'Storytelling & Media Production',
    scenario:
      'You are tasked with producing a documentary video highlighting the future of human society. What excites you most?',
    category: 'Media & Narrative',
    primaryDimension: 'communication',
    options: [
      {
        id: '14a',
        text: 'Scriptwriting, conducting thought-provoking interviews, and articulating a moving narrative voiceover.',
        dimensionWeights: { communication: 10, creative: 7 },
      },
      {
        id: '14b',
        text: 'Cinematography, color grading, visual CGI effects, and designing an evocative musical soundscape.',
        dimensionWeights: { creative: 10, technical: 5 },
      },
      {
        id: '14c',
        text: 'Deep historical and sociological research, uncovering archival manuscripts, and validating factual accuracy.',
        dimensionWeights: { research: 10, analytical: 6 },
      },
      {
        id: '14d',
        text: 'Directing the film crew, managing production budgets, distribution licensing, and film festival entries.',
        dimensionWeights: { management: 10, communication: 7 },
      },
    ],
  },
  {
    id: 15,
    title: 'Ethical AI & Society',
    scenario:
      'An autonomous AI system makes high-stakes decisions (e.g. loan approvals or college admissions). What aspect concerns you most?',
    category: 'Ethics & Society',
    primaryDimension: 'socialHealthcare',
    options: [
      {
        id: '15a',
        text: 'Ensuring fairness, preventing discrimination against vulnerable communities, and protecting human dignity.',
        dimensionWeights: { socialHealthcare: 10, communication: 7 },
      },
      {
        id: '15b',
        text: 'Auditing neural network mathematical weights, statistical bias benchmarks, and explainability metrics.',
        dimensionWeights: { analytical: 10, technical: 8 },
      },
      {
        id: '15c',
        text: 'Drafting national regulatory frameworks, international treaties, and transparent accountability standards.',
        dimensionWeights: { communication: 9, management: 8 },
      },
      {
        id: '15d',
        text: 'Building cryptographic verification mechanisms, zero-knowledge proofs, and secure sandboxes.',
        dimensionWeights: { technical: 10, research: 7 },
      },
    ],
  },
  {
    id: 16,
    title: 'Architecting a Sustainable City',
    scenario:
      'Imagine you are asked to design a prototype for a zero-carbon futuristic eco-neighborhood. What is your focal point?',
    category: 'Architecture & Engineering',
    primaryDimension: 'creative',
    options: [
      {
        id: '16a',
        text: 'Spatial architecture: Biophilic buildings, natural airflow, harmonious parks, and aesthetic living spaces.',
        dimensionWeights: { creative: 10, technical: 6 },
      },
      {
        id: '16b',
        text: 'Civil engineering: Smart water recycling systems, geothermal power grids, and structural load calculations.',
        dimensionWeights: { technical: 10, analytical: 8 },
      },
      {
        id: '16c',
        text: 'Public health & social cohesion: Accessible clinics, community gardens, and elder-friendly facilities.',
        dimensionWeights: { socialHealthcare: 10, management: 6 },
      },
      {
        id: '16d',
        text: 'Urban policy economics: Tax incentives for green businesses, public-private zoning, and transit subsidies.',
        dimensionWeights: { management: 9, analytical: 7 },
      },
    ],
  },
  {
    id: 17,
    title: 'Cybersecurity Threat Defense',
    scenario:
      'A mysterious cyber-threat is probing your school or company’s digital infrastructure. How do you respond?',
    category: 'Cyber Defense & Systems',
    primaryDimension: 'technical',
    options: [
      {
        id: '17a',
        text: 'Reverse-engineer the exploit payload, trace packet origins, and deploy automated firewall intrusion rules.',
        dimensionWeights: { technical: 10, analytical: 8 },
      },
      {
        id: '17b',
        text: 'Perform behavioral anomaly detection on user access telemetry using Bayesian probability models.',
        dimensionWeights: { analytical: 10, research: 8 },
      },
      {
        id: '17c',
        text: 'Run disaster-recovery protocol, brief senior leadership, and coordinate response with law enforcement.',
        dimensionWeights: { management: 9, communication: 8 },
      },
      {
        id: '17d',
        text: 'Conduct interactive cybersecurity awareness workshops to train staff against social engineering phishing.',
        dimensionWeights: { communication: 9, socialHealthcare: 7 },
      },
    ],
  },
  {
    id: 18,
    title: 'Bio-Technology & Genetic Engineering',
    scenario:
      'Exciting breakthroughs in CRISPR gene editing are announced. What aspect of this revolution captivates your curiosity?',
    category: 'Biotechnology & Genetics',
    primaryDimension: 'research',
    options: [
      {
        id: '18a',
        text: 'Understanding molecular mechanisms of DNA repair, enzymatic folding, and conducting laboratory gene assays.',
        dimensionWeights: { research: 10, analytical: 7 },
      },
      {
        id: '18b',
        text: 'The potential to cure hereditary diseases, eradicate sickle cell, and alleviate human physical suffering.',
        dimensionWeights: { socialHealthcare: 10, research: 7 },
      },
      {
        id: '18c',
        text: 'Building computational bioinformatics pipelines to sequence terabytes of genomic RNA datasets.',
        dimensionWeights: { technical: 9, analytical: 9 },
      },
      {
        id: '18d',
        text: 'Leading bio-ethics councils to deliberate on gene-editing boundaries and drafting international standards.',
        dimensionWeights: { communication: 9, management: 8 },
      },
    ],
  },
  {
    id: 19,
    title: 'International Cultural Exchange',
    scenario:
      'You are appointed to lead a global summit bringing together students from 30 nations. How do you make it successful?',
    category: 'Diplomacy & Culture',
    primaryDimension: 'communication',
    options: [
      {
        id: '19a',
        text: 'Fostering cultural empathy, creating safe conversational spaces, and helping delegates celebrate diversity.',
        dimensionWeights: { socialHealthcare: 10, communication: 8 },
      },
      {
        id: '19b',
        text: 'Delivering inspirational opening addresses, moderating multilateral talks, and publishing the joint declaration.',
        dimensionWeights: { communication: 10, management: 7 },
      },
      {
        id: '19c',
        text: 'Managing the multi-track event schedule, coordinating bilingual translators, and budget administration.',
        dimensionWeights: { management: 10, analytical: 6 },
      },
      {
        id: '19d',
        text: 'Designing interactive cultural immersion pavilions, immersive soundscapes, and digital world maps.',
        dimensionWeights: { creative: 9, communication: 7 },
      },
    ],
  },
  {
    id: 20,
    title: 'Future Vision & Ideal Impact',
    scenario:
      'Looking 10 years into the future, what legacy would bring you the deepest sense of fulfillment and pride?',
    category: 'Life Purpose & Legacy',
    primaryDimension: 'management',
    options: [
      {
        id: '20a',
        text: 'Inventing breakthrough intelligent software, machines, or algorithms that solve massive engineering problems.',
        dimensionWeights: { technical: 10, analytical: 8 },
      },
      {
        id: '20b',
        text: 'Healing people, providing mental health care, or transforming underprivileged lives with compassionate care.',
        dimensionWeights: { socialHealthcare: 10, communication: 7 },
      },
      {
        id: '20c',
        text: 'Founding an impactful organization, leading visionary teams, and mentoring the next generation of pioneers.',
        dimensionWeights: { management: 10, communication: 7 },
      },
      {
        id: '20d',
        text: 'Publishing landmark scientific discoveries or creative artistic works that reshape human perspective.',
        dimensionWeights: { research: 9, creative: 9 },
      },
    ],
  },
];
