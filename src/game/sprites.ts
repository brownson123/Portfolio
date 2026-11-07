// All of the game's art is drawn here, in code. No image files, no borrowed sprites.

type Palette = Record<string, string>

function toCanvas(rows: string[], palette: Palette) {
  const c = document.createElement('canvas')
  c.width = rows[0].length
  c.height = rows.length
  const x = c.getContext('2d')!
  rows.forEach((row, y) => {
    for (let i = 0; i < row.length; i++) {
      const col = palette[row[i]]
      if (col) {
        x.fillStyle = col
        x.fillRect(i, y, 1, 1)
      }
    }
  })
  return c
}

// Brownson: short afro, striped tee, plaid overshirt, white sneakers.
const HERO: Palette = {
  H: '#1b100a', h: '#2e1c12', S: '#7a4a2c', s: '#5e3620', E: '#120a05', w: '#f6efe2', m: '#3d1a10',
  W: '#f2e4c9', B: '#5a2d14', P: '#a39787', p: '#5c5448', L: '#20263a', K: '#f5f5f5', k: '#b9b9b9',
}

const HEAD = [
  '....hHHhHHh.....',
  '...HHHHHHHHHh...',
  '..hHHHHHHHHHHh..',
  '..HHHHHHHHHHHH..',
  '..HHHHSSSSSSHH..',
  '..HHHSSSSSSSSH..',
  '..hHSSwESSwESH..',
  '...HSSSSSSSSSs..',
  '....SSSSSSSSs...',
  '....SSSmmmSSs...',
  '.....SSSSSss....',
]
const TORSO = [
  '....PPWWWWpP....',
  '...PPpBBBBpPP...',
  '...PpPWWWWPpP...',
  '...PPpBBBBpPP...',
  '...PpPWWWWPpP...',
  '...SSpBBBBpSS...',
  '....PPWWWWPP....',
]
const TORSO_B = [
  '....PPWWWWpP....',
  '..PPPpBBBBpPP...',
  '..SPpPWWWWPpPP..',
  '.....pBBBBpPSS..',
  '....PPWWWWPP....',
  '....PpBBBBpP....',
  '....PPWWWWPP....',
]
const LEGS = {
  idle: ['.....LLLLLL.....', '.....LL..LL.....', '.....LL..LL.....', '.....LL..LL.....', '.....KKK.KKK....', '.....kkk.kkk....'],
  a: ['.....LLLLLL.....', '....LLL..LL.....', '...LLL....LL....', '...LL.....LL....', '..KKK......KKK..', '..kkk......kkk..'],
  b: ['.....LLLLLL.....', '......LLLL......', '......LLL.......', '......LLL.......', '......KKKK......', '......kkkk......'],
  c: ['.....LLLLLL.....', '.....LL..LLL....', '....LL....LLL...', '....LL.....LL...', '...KKK.....KKK..', '...kkk.....kkk..'],
  jump: ['.....LLLLLL.....', '....LLL..LLL....', '...LLL....LL....', '..KKK......KK...', '..kkk.......kK..', '............kk..'],
}

// A slightly different face for when you step on something and it was your fault.
const HEAD_HURT = HEAD.map((r, i) => (i === 6 ? r.replace(/wE/g, 'EE') : i === 9 ? '....SSmmmmmSs...' : r))

export type HeroFrame = 'idle' | 'runA' | 'runB' | 'runC' | 'runD' | 'jump' | 'fall' | 'hurt'

export function makeHero() {
  const f = (head: string[], torso: string[], legs: string[]) => toCanvas([...head, ...torso, ...legs], HERO)
  return {
    idle: f(HEAD, TORSO, LEGS.idle),
    runA: f(HEAD, TORSO, LEGS.a),
    runB: f(HEAD, TORSO_B, LEGS.b),
    runC: f(HEAD, TORSO, LEGS.c),
    runD: f(HEAD, TORSO_B, LEGS.b),
    jump: f(HEAD, TORSO_B, LEGS.jump),
    fall: f(HEAD, TORSO, LEGS.jump),
    hurt: f(HEAD_HURT, TORSO, LEGS.idle),
  } satisfies Record<HeroFrame, HTMLCanvasElement>
}

const BUG: Palette = { R: '#d7263d', r: '#8f1626', E: '#fff', e: '#111', a: '#3a0d14', d: '#3a0d14' }
export function makeBug() {
  const base = [
    '..a.......a...',
    '...a.....a....',
    '....RRRRR.....',
    '...RRRRRRR....',
    '..REeRRREeR...',
    '.RRRRrrRRRRR..',
    '.RRRRrrRRRRR..',
    '..RRRrrRRRR...',
  ]
  return [
    toCanvas([...base, '.d.d..d..d.d..', 'd...d....d...d'], BUG),
    toCanvas([...base, '..d.d.d.d.d...', '.d...d..d...d.'], BUG),
    toCanvas(['..............', '..............', '..............', '..............', '..............', '..............', '..............', '..............', '.RRRrrrrRRRR..', 'dddddddddddddd'], BUG),
  ]
}

// ------------------------------------------------------------ a tiny 3x5 pixel font
const FONT: Record<string, string> = {
  A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110', E: '111100110100111',
  F: '111100110100100', G: '011100101101011', H: '101101111101101', I: '111010010010111', J: '001001001101010',
  K: '101101110101101', L: '100100100100111', M: '101111111101101', N: '110101101101101', O: '010101101101010',
  P: '110101110100100', Q: '010101101110011', R: '110101110101101', S: '011100010001110', T: '111010010010010',
  U: '101101101101111', V: '101101101101010', W: '101101111111101', X: '101101010101101', Y: '101101010010010',
  Z: '111001010100111', '0': '111101101101111', '1': '010110010010111', '2': '110001010100111', '3': '110001010001110',
  '4': '101101111001001', '5': '111100110001110', '6': '011100111101111', '7': '111001010010010', '8': '111101111101111',
  '9': '111101111001110', ':': '000010000010000', '.': '000000000000010', '-': '000000111000000', '!': '010010010000010',
  '+': '000010111010000', '/': '001001010100100', "'": '010010000000000', ' ': '000000000000000',
}

export function drawText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color: string, s = 1) {
  ctx.fillStyle = color
  let cx = Math.round(x)
  const cy = Math.round(y)
  for (const ch of text.toUpperCase()) {
    const g = FONT[ch] ?? FONT[' ']
    for (let i = 0; i < 15; i++) {
      if (g[i] === '1') ctx.fillRect(cx + (i % 3) * s, cy + Math.floor(i / 3) * s, s, s)
    }
    cx += 4 * s
  }
}
export const textWidth = (text: string, s = 1) => text.length * 4 * s - s
