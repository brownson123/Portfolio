// The world: my last two years, laid out left to right. Everything on the signs is true.

export const TILE = 16

export type Solid = { x: number; y: number; w: number; h: number; oneWay: boolean; zone: number }
export type Pickup = { x: number; y: number; kind: 'commit' | 'boost'; taken: boolean; phase: number }
export type Bug = { x: number; y: number; min: number; max: number; dir: number; dead: number; t: number }
export type Sign = { x: number; y: number; text: string }
export type Gate = { x: number; y: number; id: GateId; done: boolean }
export type Prop = { x: number; y: number; type: string; label?: string; v?: number }
export type GateId = 'budget' | 'medicare' | 'travel' | 'nexus' | 'tps' | 'huddle' | 'station'

export type Zone = {
  name: string
  when: string
  x0: number
  x1: number
  sky: [string, string]
  far: string
  near: string
  top: string
  fill: string
  accent: string
}

export type Level = {
  zones: Zone[]
  solids: Solid[]
  pickups: Pickup[]
  bugs: Bug[]
  signs: Sign[]
  gates: Gate[]
  props: Prop[]
  width: number
  baseY: number
  finishX: number
  spawn: { x: number; y: number }
  totalCommits: number
}

const BASE = 240

export function buildLevel(): Level {
  const zones: Zone[] = []
  const solids: Solid[] = []
  const pickups: Pickup[] = []
  const bugs: Bug[] = []
  const signs: Sign[] = []
  const gates: Gate[] = []
  const props: Prop[] = []
  let x = 0
  let y = BASE

  const zone = (z: Omit<Zone, 'x0' | 'x1'>) => {
    if (zones.length) zones[zones.length - 1].x1 = x
    zones.push({ ...z, x0: x, x1: x })
  }
  const zi = () => zones.length - 1
  /** n tiles of flat ground; returns where it started. */
  const ground = (n: number) => {
    const s = x
    const w = n * TILE
    solids.push({ x, y, w, h: 400, oneWay: false, zone: zi() })
    x += w
    return s
  }
  const gap = (n: number) => {
    x += n * TILE
  }
  const step = (tiles: number) => {
    y -= tiles * TILE
  }
  const plat = (at: number, up: number, len: number) => {
    solids.push({ x: at, y: y - up * TILE, w: len * TILE, h: 6, oneWay: true, zone: zi() })
    return { x: at, y: y - up * TILE, w: len * TILE }
  }
  const commits = (at: number, h: number, n: number, dx = 14) => {
    for (let i = 0; i < n; i++) pickups.push({ x: at + i * dx, y: y - h, kind: 'commit', taken: false, phase: Math.random() * 6 })
  }
  const arc = (at: number, n: number, height = 40, dx = 13) => {
    for (let i = 0; i < n; i++) {
      const t = n === 1 ? 0.5 : i / (n - 1)
      pickups.push({ x: at + i * dx, y: y - 16 - Math.sin(t * Math.PI) * height, kind: 'commit', taken: false, phase: Math.random() * 6 })
    }
  }
  const bug = (at: number, range = 48) => {
    bugs.push({ x: at, y: y - 10, min: at - range, max: at + range, dir: Math.random() < 0.5 ? -1 : 1, dead: 0, t: Math.random() * 3 })
  }
  const sign = (at: number, text: string) => {
    signs.push({ x: at, y, text })
    props.push({ x: at, y, type: 'sign' })
  }
  const gate = (at: number, id: GateId) => gates.push({ x: at, y, id, done: false })
  const prop = (at: number, type: string, label?: string, v?: number) => props.push({ x: at, y, type, label, v })

  // ---- 2024: Sheridan ----------------------------------------------------------------
  zone({ name: 'Sheridan College', when: '2024', sky: ['#8ecbff', '#e2f2ff'], far: '#b4d4ee', near: '#8fb6d6', top: '#23120a', fill: '#3a1f10', accent: '#140a02' })
  let s = ground(30)
  prop(s + 90, 'building', 'SHERIDAN', 62)
  prop(s + 190, 'tree')
  prop(s + 330, 'building', 'CS', 44)
  prop(s + 440, 'tree')
  sign(s + 60, "Oakville, 2024. I started a Computer Science degree at Sheridan: Mobile Computing.")
  commits(s + 130, 16, 4)
  sign(s + 230, 'Green squares are commits. Grab them. It is the only metric that matters, allegedly.')
  bug(s + 340, 40)
  sign(s + 400, 'Bugs die if you land on them. Very true to life.')
  gap(2)
  s = ground(14)
  arc(s - 42, 5)
  step(1)
  s = ground(10)
  commits(s + 40, 16, 3)
  step(1)
  s = ground(8)
  step(-2)
  s = ground(16)
  sign(s + 40, 'Learned C++, Java, Python and data structures. Wrote a lot of linked lists.')
  plat(s + 100, 3, 4)
  commits(s + 104, 64, 4)
  bug(s + 180, 50)

  // ---- 2025: the hackathon -------------------------------------------------------------
  zone({ name: 'BearHacks', when: 'March 2025', sky: ['#080c28', '#2b1a63'], far: '#171345', near: '#251c66', top: '#7c5cff', fill: '#15103a', accent: '#ff7a45' })
  s = ground(26)
  prop(s + 60, 'clock')
  prop(s + 180, 'desk')
  prop(s + 250, 'desk')
  prop(s + 340, 'banner', 'HACK')
  sign(s + 44, 'The clock starts. Budget Buddy, an AI expense tracker, from nothing to demo in 24 hours.')
  pickups.push({ x: s + 150, y: y - 16, kind: 'boost', taken: false, phase: 0 })
  commits(s + 200, 16, 5)
  bug(s + 300, 44)
  bug(s + 370, 30)
  gap(3)
  s = ground(8)
  arc(s - 58, 6, 44)
  plat(s + 90, 3, 3)
  gap(3)
  s = ground(6)
  step(2)
  s = ground(8)
  commits(s + 20, 16, 4)
  step(-2)
  s = ground(18)
  prop(s + 40, 'desk')
  sign(s + 90, 'Four of us. Flask, SQLAlchemy, and an AI that answers questions about your spending.')
  bug(s + 170, 40)
  gate(s + 240, 'budget')

  // ---- Medicare -------------------------------------------------------------------------
  zone({ name: 'Medicare', when: 'Full-stack', sky: ['#d9e4ff', '#f4f0ff'], far: '#c3cbf7', near: '#a9b2ee', top: '#4f46e5', fill: '#2a2590', accent: '#ef4444' })
  s = ground(26)
  prop(s + 70, 'cross')
  prop(s + 150, 'shelf')
  prop(s + 230, 'shelf')
  prop(s + 330, 'cross')
  sign(s + 40, 'A pharmacy system. Four logins: admin, pharmacist, prescriber, patient.')
  commits(s + 110, 16, 4)
  plat(s + 190, 3, 4)
  commits(s + 194, 64, 4)
  bug(s + 300, 50)
  sign(s + 370, 'Java, Spring Boot, Angular, MySQL. Every prescription is a state machine.')
  gap(2)
  s = ground(5)
  gap(2)
  s = ground(5)
  arc(s - 30, 4, 36)
  step(1)
  s = ground(6)
  step(1)
  s = ground(14)
  sign(s + 30, '40 database migrations. Schemas change. Plan for it.')
  commits(s + 80, 16, 4)
  bug(s + 130, 30)
  step(-2)
  s = ground(14)
  gate(s + 150, 'medicare')

  // ---- Side projects --------------------------------------------------------------------
  zone({ name: 'Side projects', when: 'Early 2026', sky: ['#bfe3d6', '#eef8f3'], far: '#a6d3c3', near: '#86bda9', top: '#0f3d2e', fill: '#1c5a45', accent: '#0f3d2e' })
  s = ground(16)
  sign(s + 40, 'Somewhere along the way I learned Flutter from scratch, to build one travel app.')
  commits(s + 110, 16, 4)
  gate(s + 215, 'travel')
  gap(2)
  s = ground(14)
  arc(s - 24, 4, 34)
  commits(s + 70, 16, 3)
  gate(s + 180, 'nexus')
  gap(3)

  // ---- Turning Point Studios ------------------------------------------------------------
  zone({ name: 'Turning Point Studios', when: 'May - Aug 2026', sky: ['#ff7a45', '#ffc08a'], far: '#ee6531', near: '#c8481b', top: '#2a0f05', fill: '#5a1f09', accent: '#fff4e6' })
  s = ground(26)
  prop(s + 50, 'building', 'TPS', 56)
  prop(s + 170, 'arcade')
  prop(s + 230, 'arcade')
  prop(s + 340, 'arcade')
  sign(s + 110, 'May 2026. Software engineering intern at an indie game studio, and the website was mine.')
  bug(s + 210, 44)
  bug(s + 300, 44)
  plat(s + 250, 3, 4)
  commits(s + 254, 64, 4)
  sign(s + 370, 'I built their production website and lead pipeline, and wired up Stripe.')
  gap(3)
  s = ground(6)
  step(2)
  s = ground(6)
  arc(s - 10, 4, 30)
  step(-2)
  s = ground(14)
  sign(s + 20, 'Then ads, then game scripting: debugging gameplay with the designers.')
  gate(s + 170, 'tps')

  // ---- Huddle ---------------------------------------------------------------------------
  zone({ name: 'Huddle', when: 'Project Manager', sky: ['#f2eee6', '#fbf9f4'], far: '#e6d9c1', near: '#d3c0a0', top: '#c8350b', fill: '#7a2006', accent: '#2413dc' })
  s = ground(24)
  prop(s + 70, 'board')
  prop(s + 200, 'board')
  prop(s + 320, 'board')
  sign(s + 40, 'Huddle: a student collaboration platform at Sheridan. I am the project manager.')
  commits(s + 120, 16, 5)
  bug(s + 250, 40)
  sign(s + 300, 'Roadmap, MVP scoping, sprint planning, pitches to faculty. And I still review the code.')
  gap(3)
  s = ground(6)
  arc(s - 44, 5, 40)
  plat(s + 110, 3, 3)
  gap(3)
  s = ground(18)
  bug(s + 90, 44)
  bug(s + 150, 30)
  gate(s + 230, 'huddle')

  // ---- Station --------------------------------------------------------------------------
  zone({ name: 'Station', when: 'Sept 2026 - now', sky: ['#050a1f', '#0f1c50'], far: '#101a46', near: '#1a2861', top: '#34d399', fill: '#0a2a24', accent: '#34d399' })
  s = ground(26)
  prop(s + 80, 'crowd')
  prop(s + 220, 'banner', 'DATATHON')
  prop(s + 330, 'crowd')
  sign(s + 40, 'Station: check-in for Sheridan Datathon. I was one of two main builders.')
  commits(s + 120, 16, 5)
  bug(s + 260, 50)
  gap(3)
  s = ground(5)
  step(1)
  s = ground(5)
  arc(s - 16, 4, 34)
  step(1)
  s = ground(14)
  sign(s + 30, 'I built the first version, and I still help improve it.')
  commits(s + 90, 16, 5)
  step(-2)
  s = ground(14)
  gate(s + 120, 'station')
  s = ground(22)
  prop(s + 40, 'crowd')
  sign(s + 60, 'And that brings us to now. Which is where you come in.')
  const finishX = s + 240
  x += 24
  zones[zones.length - 1].x1 = x + 200
  // a wall at the end of the world
  solids.push({ x: x + 40, y: y - 400, w: 40, h: 800, oneWay: false, zone: zi() })
  solids.push({ x, y, w: 80, h: 400, oneWay: false, zone: zi() })

  return {
    zones,
    solids,
    pickups,
    bugs,
    signs,
    gates,
    props,
    width: x + 80,
    baseY: BASE,
    finishX,
    spawn: { x: 40, y: BASE - 24 },
    totalCommits: pickups.filter((p) => p.kind === 'commit').length,
  }
}
