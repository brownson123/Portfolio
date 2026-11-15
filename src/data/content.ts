// Everything the site says about Brownson lives here.
// Edit this file to change the words, links, projects and photos.

export const me = {
  name: 'Brownson Omotoye',
  first: 'Brownson',
  last: 'Omotoye',
  location: 'Oakville, ON',
  status: 'Open to co-ops & internships',
  email: 'omotoyebrownson@yahoo.com',
  linkedin: 'https://www.linkedin.com/in/omotoyeb',
  github: 'https://github.com/brownson123',
  site: 'https://brownsonomotoye.netlify.app',
  formspree: 'https://formspree.io/f/xkowbyza',
  // Drop a PDF in /public and set this to e.g. 'resume.pdf' to show the résumé button.
  resume: null as string | null,
  // Your photo. Put the file in /public/img and set this, e.g. 'img/me.jpg'.
  photos: {
    hello: 'img/me-hello.webp' as string | null, // shows beside the Hello text
    helloAlt: 'Brownson sitting at a desk behind a laptop in a brown T-shirt, looking at the camera',
  },
}

export const chapters = [
  { id: 'door', n: '00', label: 'Home', bg: '#f2eee6', fg: '#140a02', accent: '#c8350b' },
  { id: 'hello', n: '01', label: 'Hello', bg: '#170c06', fg: '#f2eee6', accent: '#ff7a45' },
  { id: 'work', n: '02', label: 'Work', bg: '#f2eee6', fg: '#23120a', accent: '#c8350b' },
  { id: 'builds', n: '03', label: 'Builds', bg: '#140a02', fg: '#f2eee6', accent: '#ff7a45' },
  { id: 'stack', n: '04', label: 'Stack', bg: '#f2eee6', fg: '#23120a', accent: '#c8350b' },
  { id: 'lab', n: '05', label: 'Lab', bg: '#050505', fg: '#ece7dc', accent: '#ff7a45' },
  { id: 'play', n: '06', label: 'Play', bg: '#f2eee6', fg: '#23120a', accent: '#c8350b' },
  { id: 'talk', n: '07', label: 'Talk', bg: '#170c06', fg: '#f2eee6', accent: '#ff7a45' },
] as const

export type ChapterId = (typeof chapters)[number]['id']

export const hero = {
  line: 'I love building software, and I’d love to show off a little.',
}

export const hello = {
  title: "Hi, I'm Brownson.",
  body: 'I study Computer Science at Sheridan College, and I’m',
  passion: 'passionate about building.',
}

export const work = [
  {
    id: 'tps',
    org: 'Turning Point Studios',
    kicker: 'Indie game studio',
    role: 'Software Engineering Intern',
    when: 'May – Aug 2026',
    points: [
      "Built and maintained the studio's production website and lead-inquiry pipeline, working directly with the people running the studio to pin down what they needed.",
      'Integrated Stripe for secure payments: implemented, tested and shipped the checkout flow and transaction logic.',
      'Added ad integration to support monetization across the site and game titles.',
      'Worked on game scripting with developers and designers, debugging gameplay logic and fixing defects.',
    ],
  },
  {
    id: 'huddle',
    org: 'Huddle',
    kicker: 'Sheridan College · Student collaboration platform',
    role: 'Project Manager',
    when: 'Ongoing',
    points: [
      'Drive the product roadmap and review team code for quality.',
      'Led MVP scoping and sprint planning, reworking the pitch across faculty, team leads and club members.',
      'Ran cost analysis and survey design, and built the faculty-facing decks that kept everyone pointed the same way.',
    ],
  },
]

export type Shot = { src: string; caption: string }

// Every build reads the same way: award, event and date, the name, three bullets, then links.
export type Build = {
  id: string
  title: string
  award?: string
  chips: string[]
  bullets: string[]
  credits?: string
  links?: { label: string; href: string }[]
  privateCode?: boolean
  shots?: Shot[]
  play?: boolean
}
export type Project = Build & { bg: string; fg: string; accent: string }

const rx = (n: string, caption: string): Shot => ({ src: `projects/medicare/${n}.webp`, caption })
const bb = (n: string, caption: string): Shot => ({ src: `projects/budget/${n}.webp`, caption })
const tr = (n: string, caption: string): Shot => ({ src: `projects/travel/${n}.webp`, caption })

export const projects: Project[] = [
  {
    id: 'station',
    title: 'Station',
    chips: ['Sheridan Datathon 2026', 'Sept 2026 – present'],
    bullets: [
      'Built the first version of this QR and NFC check-in platform as one of two main builders, writing the spec (268 named test cases) and supporting iterative improvements since.',
    ],
    credits: 'With Yves Donato, George Farag, Jonathan Marien and Diya Patel.',
    privateCode: true,
    bg: '#050a1f',
    fg: '#eef2ff',
    accent: '#34d399',
  },
  {
    id: 'medicare',
    title: 'Medicare',
    chips: ['Full-stack project', 'January 2026'],
    bullets: [
      'Built a full-stack pharmacy system with four roles (admin, pharmacist, prescriber, patient) on Spring Boot, Angular and MySQL.',
      'Engineered the prescription lifecycle from pending to approved or denied to dispensed, with stock checks and automatic refill dates.',
      'Implemented JWT auth with Spring Security, role-guarded routes, audit logs and 40 Flyway migrations.',
    ],
    privateCode: true,
    bg: '#e4e1ff',
    fg: '#17105f',
    accent: '#4f46e5',
    shots: [
      rx('admin-overview', 'Admin: system overview'),
      rx('admin-audit-logs', 'Admin: audit trail'),
      rx('admin-drug-list', 'Admin: medication inventory'),
      rx('pharmacist-dispense-history', 'Pharmacist: dispense history'),
      rx('pharmacist-deny', 'Pharmacist: denying with a reason'),
      rx('pharmacist-dispense-modal', 'Pharmacist: confirming a dispense'),
      rx('prescriber-overview', 'Prescriber: today at a glance'),
      rx('prescriber-write-rx', 'Prescriber: writing a prescription'),
      rx('patient-overview', 'Patient: personal health portal'),
      rx('patient-prescriptions', 'Patient: medication history'),
      rx('book-appointment', 'Patient: booking an appointment'),
      rx('login-page', 'One sign-in for every role'),
    ],
  },
  {
    id: 'budget',
    title: 'Budget Buddy',
    award: '5th place',
    chips: ['BearHacks 2025', 'March 2025'],
    bullets: [
      'Built a working MVP in 24 hours with a team of four, using Flask, SQLAlchemy and Tailwind.',
      'Implemented categorization logic and spending-pattern analysis behind a single dashboard for students.',
      'Integrated Perplexity to answer questions about your budget using your own spending data.',
    ],
    credits: 'With Ethan Arsenault, George Farag and Adelaine Santoso.',
    links: [
      { label: 'Learn more', href: 'https://devpost.com/software/budget-buddy-3jfmkp' },
      { label: 'Source code', href: 'https://github.com/Arsenaet/BudgetBuddy' },
    ],
    bg: '#27c25c',
    fg: '#04180b',
    accent: '#04180b',
    shots: [
      bb('budgetbuddy1', 'The dashboard'),
      bb('budgetbuddy3', 'Insights and spending trends'),
      bb('budgetbuddy2', 'Expenses'),
      bb('budgetbuddy4', 'Spending by category'),
      bb('budgetbuddy5', 'Ask Budget Buddy'),
      bb('budgetbuddy6', 'Light mode'),
      bb('budgetbuddy7', 'On a phone'),
    ],
  },
  {
    id: 'travel',
    title: 'Flutter Travel App',
    chips: ['Solo project', 'January 2026'],
    bullets: [
      'Learned Flutter from scratch to build a cross-platform travel booking app for iOS, Android and the web.',
      'Implemented date selection, guest counts, VIP upgrades and live pricing, with Provider managing state.',
      'Persisted bookings and favourites with Shared Preferences, handling empty or corrupt data without crashing.',
    ],
    privateCode: true,
    bg: '#ff7a45',
    fg: '#200a02',
    accent: '#200a02',
    shots: [tr('home', 'Browse and search'), tr('details', 'Trip details'), tr('booking', 'Customize and book'), tr('my-trips', 'Your itinerary')],
  },
]

export const moreBuilds: Build[] = [
  {
    id: 'sidequest',
    title: 'Side Quest',
    chips: ['This site', 'November 2026'],
    bullets: [
      'Built this 2D side-scroller from scratch in TypeScript on HTML Canvas, without a game engine, and it runs on both keyboard and touch.',
      'Engineered the platformer physics on a fixed timestep, with coyote time and jump buffering so the controls forgive late taps.',
      'Drew every sprite in code and synthesized every sound with the Web Audio API, so there are no asset files to download.',
    ],
    play: true,
    links: [{ label: 'Source code', href: 'https://github.com/brownson123/Portfolio' }],
  },
  {
    id: 'nexus',
    title: 'Nexus Link',
    chips: ['BearHacks 2026', 'April 2026'],
    bullets: [
      'Built an Expo app that keeps first responders connected to a control tower when the grid goes dark, using Bridgefy mesh networking.',
      'Engineered the mission flow over WebSockets: towers start missions, and responders discover, join and chat live.',
      'Integrated AI recommendations a commander can approve or deny, using Google Vision, a local Gemma model and ElevenLabs voice alerts.',
    ],
    credits: 'With Josh Moncarz.',
    links: [
      { label: 'Learn more', href: 'https://devpost.com/software/nexus-link' },
      { label: 'Source code', href: 'https://github.com/brownson123/Ember' },
    ],
  },
  {
    id: 'casino',
    title: 'Triple-A Casino',
    chips: ['Team project'],
    bullets: [
      'Built a mobile casino app with Poker, Blackjack and Crazy 8 on .NET MAUI.',
      'Designed the game logic for all three card games.',
      'Used Firebase for real-time user data.',
    ],
    credits: 'With Abinash Singh Patti and Aybars Ay.',
    links: [
      {
        label: 'Watch the demo',
        href: 'https://sheridanc-my.sharepoint.com/:v:/g/personal/omotoyeb_shernet_sheridancollege_ca/IQCduVhTzTyIR7mrzpaflt39AeMfbsYZ9VBCjFTkTz4F5NY?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=8TLvhn',
      },
    ],
  },
  {
    id: 'heroes',
    title: 'Heroes Unite',
    chips: ['Solo project'],
    bullets: [
      'Built a dice-driven adventure game in Python and Tkinter with three quests.',
      'Applied OOP to character stats that test strength, dexterity and intelligence.',
      'Implemented rewards, penalties and four possible endings based on how the dice land.',
    ],
  },
]

// The Stack graph. Hubs are what I work with, and each one links to what I built with it.
export const graph = {
  hubs: [
    { id: 'ts', label: 'TypeScript / JS', builds: ['station', 'nexus', 'tps', 'sidequest'] },
    { id: 'react', label: 'React', builds: ['nexus', 'station'] },
    { id: 'next', label: 'Next.js', builds: ['station'] },
    { id: 'java', label: 'Java', builds: ['medicare'] },
    { id: 'spring', label: 'Spring Boot', builds: ['medicare'] },
    { id: 'angular', label: 'Angular', builds: ['medicare'] },
    { id: 'python', label: 'Python', builds: ['budget', 'heroes', 'ascii', 'mongo'] },
    { id: 'flask', label: 'Flask', builds: ['budget'] },
    { id: 'csharp', label: 'C#', builds: ['casino'] },
    { id: 'maui', label: '.NET MAUI', builds: ['casino'] },
    { id: 'flutter', label: 'Flutter / Dart', builds: ['travel'] },
    { id: 'sql', label: 'SQL', builds: ['station', 'medicare', 'budget'] },
    { id: 'supabase', label: 'Supabase', builds: ['station', 'nexus'] },
    { id: 'firebase', label: 'Firebase', builds: ['casino'] },
    { id: 'mongodb', label: 'MongoDB', builds: ['mongo'] },
    { id: 'stripe', label: 'Stripe', builds: ['tps'] },
    { id: 'testing', label: 'Playwright / Vitest', builds: ['station'] },
    { id: 'ai', label: 'Applied AI', builds: ['budget', 'nexus'] },
    { id: 'pm', label: 'Roadmaps & MVPs', builds: ['huddle'] },
    { id: 'review', label: 'Code review', builds: ['huddle', 'tps'] },
  ],
  builds: {
    station: 'Station',
    medicare: 'Medicare',
    budget: 'Budget Buddy',
    travel: 'Flutter Travel App',
    nexus: 'Nexus Link',
    sidequest: 'Side Quest',
    casino: 'Triple-A Casino',
    heroes: 'Heroes Unite',
    tps: 'Turning Point Studios',
    huddle: 'Huddle',
    ascii: 'ASCII Blooms',
    mongo: 'MongoDB certs',
  } as Record<string, string>,
  also: ['C / C++', 'Kotlin', 'Swift', 'HTML & CSS', 'Docker', 'AWS', 'GCP', 'Git', 'Jira', 'Postman', 'REST APIs', 'JWT'],
  receipts: [
    'Connecting to MongoDB in Python',
    'MongoDB CRUD Operations in Python',
    'Using MongoDB with Python',
  ],
}
