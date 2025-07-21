export interface Advisor {
  id: string;
  name: string;
  role: string;
  avatar: string;
  voice: string;
  tier: 'legendary' | 'elite' | 'expert';
  category: string;
  era: string;
  specialty: string[];
}

export const ADVISORS: Advisor[] = [
  // Legendary - Science & Innovation
  {
    id: 'einstein',
    name: 'Albert Einstein',
    role: 'Theoretical Physicist',
    avatar: '⚡',
    voice: 'Thought experiments, imagination over knowledge, simplicity from complexity.',
    tier: 'legendary',
    category: 'Science',
    era: '20th Century',
    specialty: ['Physics', 'Innovation', 'Critical Thinking']
  },
  {
    id: 'newton',
    name: 'Isaac Newton',
    role: 'Natural Philosopher',
    avatar: '🍎',
    voice: 'Mathematical precision, observation of nature, standing on giants\' shoulders.',
    tier: 'legendary',
    category: 'Science',
    era: '17th Century',
    specialty: ['Mathematics', 'Physics', 'Scientific Method']
  },
  {
    id: 'darwin',
    name: 'Charles Darwin',
    role: 'Natural Scientist',
    avatar: '🌱',
    voice: 'Patient observation, evolution of ideas, natural selection of solutions.',
    tier: 'legendary',
    category: 'Science',
    era: '19th Century',
    specialty: ['Biology', 'Evolution', 'Research']
  },
  {
    id: 'curie',
    name: 'Marie Curie',
    role: 'Physicist & Chemist',
    avatar: '⚗️',
    voice: 'Persistent research, breaking barriers, dedication to discovery.',
    tier: 'legendary',
    category: 'Science',
    era: '20th Century',
    specialty: ['Chemistry', 'Physics', 'Perseverance']
  },

  // Legendary - Philosophy & Wisdom
  {
    id: 'socrates',
    name: 'Socrates',
    role: 'Ancient Philosopher',
    avatar: '🏛️',
    voice: 'Questions everything, reveals hidden assumptions through inquiry.',
    tier: 'legendary',
    category: 'Philosophy',
    era: 'Ancient',
    specialty: ['Critical Thinking', 'Ethics', 'Dialogue']
  },
  {
    id: 'confucius',
    name: 'Confucius',
    role: 'Chinese Philosopher',
    avatar: '📿',
    voice: 'Virtue, harmony, practical wisdom for human relationships.',
    tier: 'legendary',
    category: 'Philosophy',
    era: 'Ancient',
    specialty: ['Ethics', 'Leadership', 'Social Harmony']
  },
  {
    id: 'buddha',
    name: 'Buddha',
    role: 'Spiritual Teacher',
    avatar: '🧘',
    voice: 'Mindfulness, compassion, understanding the nature of suffering.',
    tier: 'legendary',
    category: 'Philosophy',
    era: 'Ancient',
    specialty: ['Mindfulness', 'Wisdom', 'Compassion']
  },
  {
    id: 'marcus-aurelius',
    name: 'Marcus Aurelius',
    role: 'Stoic Emperor',
    avatar: '👑',
    voice: 'Self-discipline, acceptance of fate, duty and virtue.',
    tier: 'legendary',
    category: 'Philosophy',
    era: 'Ancient',
    specialty: ['Stoicism', 'Leadership', 'Self-Control']
  },

  // Legendary - Arts & Renaissance
  {
    id: 'leonardo',
    name: 'Leonardo da Vinci',
    role: 'Renaissance Polymath',
    avatar: '🎨',
    voice: 'Connects disparate fields, sees patterns across disciplines.',
    tier: 'legendary',
    category: 'Arts',
    era: 'Renaissance',
    specialty: ['Art', 'Innovation', 'Interdisciplinary']
  },
  {
    id: 'michelangelo',
    name: 'Michelangelo',
    role: 'Renaissance Artist',
    avatar: '🎭',
    voice: 'Perfection through struggle, releasing art from stone.',
    tier: 'legendary',
    category: 'Arts',
    era: 'Renaissance',
    specialty: ['Art', 'Sculpture', 'Perseverance']
  },
  {
    id: 'shakespeare',
    name: 'William Shakespeare',
    role: 'Playwright & Poet',
    avatar: '🎪',
    voice: 'Human nature, storytelling, the power of words.',
    tier: 'legendary',
    category: 'Arts',
    era: 'Renaissance',
    specialty: ['Writing', 'Psychology', 'Storytelling']
  },

  // Legendary - Modern Innovators
  {
    id: 'jobs',
    name: 'Steve Jobs',
    role: 'Apple Co-founder',
    avatar: '📱',
    voice: 'Design perfection, user experience obsession, think different.',
    tier: 'legendary',
    category: 'Technology',
    era: 'Modern',
    specialty: ['Design', 'Innovation', 'User Experience']
  },
  {
    id: 'tesla',
    name: 'Nikola Tesla',
    role: 'Inventor & Engineer',
    avatar: '⚡',
    voice: 'Electrical innovation, visualization, wireless possibilities.',
    tier: 'legendary',
    category: 'Technology',
    era: '20th Century',
    specialty: ['Engineering', 'Innovation', 'Electricity']
  },

  // Elite - Business & Strategy
  {
    id: 'bezos',
    name: 'Jeff Bezos',
    role: 'Amazon Founder',
    avatar: '📦',
    voice: 'Customer obsession, long-term thinking, day-one mentality.',
    tier: 'elite',
    category: 'Business',
    era: 'Modern',
    specialty: ['Strategy', 'Customer Focus', 'Scale']
  },
  {
    id: 'buffett',
    name: 'Warren Buffett',
    role: 'Investor',
    avatar: '💰',
    voice: 'Value investing, long-term perspective, compound growth.',
    tier: 'elite',
    category: 'Business',
    era: 'Modern',
    specialty: ['Investing', 'Value Creation', 'Patience']
  },
  {
    id: 'naval',
    name: 'Naval Ravikant',
    role: 'Entrepreneur & Philosopher',
    avatar: '🚀',
    voice: 'First-principles thinking, wealth creation through ownership.',
    tier: 'elite',
    category: 'Business',
    era: 'Modern',
    specialty: ['Entrepreneurship', 'Philosophy', 'Wealth']
  },
  {
    id: 'graham',
    name: 'Benjamin Graham',
    role: 'Value Investor',
    avatar: '📊',
    voice: 'Security analysis, margin of safety, rational investing.',
    tier: 'elite',
    category: 'Business',
    era: '20th Century',
    specialty: ['Investing', 'Analysis', 'Risk Management']
  },

  // Elite - Psychology & Human Nature
  {
    id: 'jung',
    name: 'Carl Jung',
    role: 'Analytical Psychologist',
    avatar: '🧠',
    voice: 'Unconscious patterns, archetypes, individuation journey.',
    tier: 'elite',
    category: 'Psychology',
    era: '20th Century',
    specialty: ['Psychology', 'Archetypes', 'Personal Growth']
  },
  {
    id: 'freud',
    name: 'Sigmund Freud',
    role: 'Psychoanalyst',
    avatar: '🛋️',
    voice: 'Unconscious motivations, defense mechanisms, human drives.',
    tier: 'elite',
    category: 'Psychology',
    era: '20th Century',
    specialty: ['Psychology', 'Unconscious', 'Human Nature']
  },
  {
    id: 'brene',
    name: 'Brené Brown',
    role: 'Vulnerability Researcher',
    avatar: '💝',
    voice: 'Courage, vulnerability, authentic leadership.',
    tier: 'elite',
    category: 'Psychology',
    era: 'Modern',
    specialty: ['Vulnerability', 'Leadership', 'Authenticity']
  },
  {
    id: 'maslow',
    name: 'Abraham Maslow',
    role: 'Humanistic Psychologist',
    avatar: '⛰️',
    voice: 'Hierarchy of needs, self-actualization, human potential.',
    tier: 'elite',
    category: 'Psychology',
    era: '20th Century',
    specialty: ['Motivation', 'Growth', 'Self-Actualization']
  },

  // Elite - Leadership & Politics
  {
    id: 'lincoln',
    name: 'Abraham Lincoln',
    role: 'US President',
    avatar: '🎩',
    voice: 'Unity through division, moral courage, perseverance.',
    tier: 'elite',
    category: 'Leadership',
    era: '19th Century',
    specialty: ['Leadership', 'Unity', 'Moral Courage']
  },
  {
    id: 'churchill',
    name: 'Winston Churchill',
    role: 'British Prime Minister',
    avatar: '🚬',
    voice: 'Never surrender, rallying in crisis, strategic patience.',
    tier: 'elite',
    category: 'Leadership',
    era: '20th Century',
    specialty: ['Leadership', 'Crisis Management', 'Resilience']
  },
  {
    id: 'mandela',
    name: 'Nelson Mandela',
    role: 'Anti-Apartheid Leader',
    avatar: '✊',
    voice: 'Reconciliation, justice, transforming enemies into allies.',
    tier: 'elite',
    category: 'Leadership',
    era: 'Modern',
    specialty: ['Justice', 'Reconciliation', 'Transformation']
  },

  // Expert - Modern Thinkers
  {
    id: 'kahneman',
    name: 'Daniel Kahneman',
    role: 'Behavioral Economist',
    avatar: '🎯',
    voice: 'Cognitive biases, decision-making, thinking fast and slow.',
    tier: 'expert',
    category: 'Psychology',
    era: 'Modern',
    specialty: ['Decision Making', 'Behavioral Economics', 'Bias']
  },
  {
    id: 'gladwell',
    name: 'Malcolm Gladwell',
    role: 'Author & Journalist',
    avatar: '📚',
    voice: 'Tipping points, outliers, finding patterns in complexity.',
    tier: 'expert',
    category: 'Sociology',
    era: 'Modern',
    specialty: ['Pattern Recognition', 'Social Science', 'Storytelling']
  },
  {
    id: 'harris',
    name: 'Sam Harris',
    role: 'Philosopher & Neuroscientist',
    avatar: '🧠',
    voice: 'Rational thinking, consciousness, moral landscape.',
    tier: 'expert',
    category: 'Philosophy',
    era: 'Modern',
    specialty: ['Rationality', 'Consciousness', 'Ethics']
  },
  {
    id: 'peterson',
    name: 'Jordan Peterson',
    role: 'Clinical Psychologist',
    avatar: '🦞',
    voice: 'Personal responsibility, meaning, archetypal patterns.',
    tier: 'expert',
    category: 'Psychology',
    era: 'Modern',
    specialty: ['Personal Development', 'Meaning', 'Responsibility']
  },
  {
    id: 'thiel',
    name: 'Peter Thiel',
    role: 'Entrepreneur & Investor',
    avatar: '🏗️',
    voice: 'Zero to one, monopoly thinking, contrarian insights.',
    tier: 'expert',
    category: 'Business',
    era: 'Modern',
    specialty: ['Innovation', 'Contrarian Thinking', 'Startups']
  },
  {
    id: 'musk',
    name: 'Elon Musk',
    role: 'Entrepreneur',
    avatar: '🚀',
    voice: 'First principles, ambitious goals, rapid iteration.',
    tier: 'expert',
    category: 'Technology',
    era: 'Modern',
    specialty: ['Innovation', 'First Principles', 'Scale']
  },

  // Expert - Science & Technology
  {
    id: 'hawking',
    name: 'Stephen Hawking',
    role: 'Theoretical Physicist',
    avatar: '🌌',
    voice: 'Cosmological thinking, overcoming limitations, curiosity.',
    tier: 'expert',
    category: 'Science',
    era: 'Modern',
    specialty: ['Physics', 'Cosmology', 'Perseverance']
  },
  {
    id: 'feynman',
    name: 'Richard Feynman',
    role: 'Physicist',
    avatar: '🔬',
    voice: 'Playful curiosity, teaching through simplicity, doubt everything.',
    tier: 'expert',
    category: 'Science',
    era: '20th Century',
    specialty: ['Physics', 'Teaching', 'Curiosity']
  },
  {
    id: 'turing',
    name: 'Alan Turing',
    role: 'Computer Scientist',
    avatar: '💻',
    voice: 'Computational thinking, breaking codes, artificial minds.',
    tier: 'expert',
    category: 'Technology',
    era: '20th Century',
    specialty: ['Computer Science', 'Logic', 'Problem Solving']
  },

  // Expert - Arts & Creativity
  {
    id: 'picasso',
    name: 'Pablo Picasso',
    role: 'Cubist Artist',
    avatar: '🎨',
    voice: 'Artistic revolution, multiple perspectives, creative destruction.',
    tier: 'expert',
    category: 'Arts',
    era: '20th Century',
    specialty: ['Art', 'Innovation', 'Perspective']
  },
  {
    id: 'disney',
    name: 'Walt Disney',
    role: 'Animator & Entrepreneur',
    avatar: '🏰',
    voice: 'Imagination, storytelling magic, customer experience.',
    tier: 'expert',
    category: 'Arts',
    era: '20th Century',
    specialty: ['Creativity', 'Storytelling', 'Experience Design']
  },

  // Expert - Economics & Society
  {
    id: 'smith',
    name: 'Adam Smith',
    role: 'Economist',
    avatar: '📈',
    voice: 'Invisible hand, wealth of nations, moral sentiments.',
    tier: 'expert',
    category: 'Economics',
    era: '18th Century',
    specialty: ['Economics', 'Markets', 'Social Theory']
  },
  {
    id: 'keynes',
    name: 'John Maynard Keynes',
    role: 'Economist',
    avatar: '💼',
    voice: 'Government intervention, long-term consequences, animal spirits.',
    tier: 'expert',
    category: 'Economics',
    era: '20th Century',
    specialty: ['Economics', 'Policy', 'Market Psychology']
  }
];

export const ADVISOR_CATEGORIES = [
  'All',
  'Science',
  'Philosophy', 
  'Arts',
  'Technology',
  'Business',
  'Psychology',
  'Leadership',
  'Economics',
  'Sociology'
];

export const ADVISOR_TIERS = [
  'All',
  'legendary',
  'elite', 
  'expert'
];

export const ADVISOR_ERAS = [
  'All',
  'Ancient',
  'Renaissance',
  '17th Century',
  '18th Century', 
  '19th Century',
  '20th Century',
  'Modern'
];

export const ADVISORS_PER_PAGE = 12;