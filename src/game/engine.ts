import { buildLevel, type Gate, type Level, type Prop, type Sign, type Zone } from './level'
import { drawText, makeBug, makeHero, textWidth, type HeroFrame } from './sprites'

const STEP = 1 / 60
const P_W = 10
const P_H = 24
const GRAVITY = 980
const JUMP = 330
const RUN = 124
const ACCEL = 1100
const FRICTION = 1300

export type Sfx = 'jump' | 'commit' | 'stomp' | 'hurt' | 'revert' | 'gate' | 'boost'

export type Hooks = {
  onGate?: (gate: Gate) => void
  onSign?: (text: string | null) => void
  onStats?: (s: Stats) => void
  onZone?: (z: Zone) => void
  onFinish?: () => void
  onRevert?: () => void
  sfx?: (s: Sfx) => void
}
export type Stats = { commits: number; bugs: number; reverts: number; time: number }

type Particle = { x: number; y: number; vx: number; vy: number; life: number; color: string; size: number }

const hex = (h: string) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]
const mix = (a: string, b: string, t: number) => {
  const A = hex(a)
  const B = hex(b)
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')})`
}

// Deterministic "random", so the skyline never shifts between frames.
const rnd = (n: number) => {
  const x = Math.sin(n * 127.1) * 43758.5453
  return x - Math.floor(x)
}

export class Engine {
  ctx: CanvasRenderingContext2D
  W = 320
  H = 180
  level: Level = buildLevel()
  input = { left: false, right: false, jump: false }
  p = { x: 0, y: 0, vx: 0, vy: 0, face: 1, ground: false, coyote: 0, buffer: 0, hurt: 0, boost: 0, anim: 0, lastJump: false, frozen: false }
  cam = { x: 0, y: 0 }
  stats: Stats = { commits: 0, bugs: 0, reverts: 0, time: 0 }
  running = false
  paused = false
  finished = false
  demo = false
  private hero = makeHero()
  private bug = makeBug()
  private particles: Particle[] = []
  private raf = 0
  private last = 0
  private acc = 0
  private t = 0
  private shake = 0
  private zoneIndex = -1
  private activeSign: Sign | null = null
  private checkpoint = { x: 40, y: 0 }

  constructor(
    private canvas: HTMLCanvasElement,
    private hooks: Hooks = {},
    opts: { demo?: boolean } = {},
  ) {
    this.ctx = canvas.getContext('2d')!
    this.demo = !!opts.demo
    this.reset()
    this.resize()
  }

  reset() {
    this.level = buildLevel()
    const { spawn } = this.level
    Object.assign(this.p, { x: spawn.x, y: spawn.y, vx: 0, vy: 0, face: 1, ground: false, hurt: 0, boost: 0, frozen: false })
    this.checkpoint = { x: spawn.x, y: spawn.y }
    this.stats = { commits: 0, bugs: 0, reverts: 0, time: 0 }
    this.particles = []
    this.finished = false
    this.zoneIndex = -1
    this.activeSign = null
    this.cam.x = 0
    this.cam.y = spawn.y - this.H * 0.7
  }

  /** Crisp pixels at any size: pick a whole-number scale in physical pixels. */
  resize() {
    const r = this.canvas.getBoundingClientRect()
    const dpr = Math.min(devicePixelRatio || 1, 3)
    const pw = Math.max(1, r.width * dpr)
    const ph = Math.max(1, r.height * dpr)
    const target = r.width > r.height ? 360 : 270
    const scale = Math.max(1, Math.round(pw / target))
    this.W = Math.ceil(pw / scale)
    this.H = Math.ceil(ph / scale)
    this.canvas.width = this.W
    this.canvas.height = this.H
    this.ctx.imageSmoothingEnabled = false
  }

  start() {
    if (this.running) return
    this.running = true
    this.last = 0
    this.raf = requestAnimationFrame(this.loop)
  }
  stop() {
    this.running = false
    cancelAnimationFrame(this.raf)
  }

  private loop = (now: number) => {
    if (!this.running) return
    this.raf = requestAnimationFrame(this.loop)
    const dt = Math.min(0.05, this.last ? (now - this.last) / 1000 : STEP)
    this.last = now
    if (!this.paused) {
      this.acc += dt
      let guard = 0
      while (this.acc >= STEP && guard++ < 5) {
        this.update(STEP)
        this.acc -= STEP
      }
    }
    this.render()
  }

  /** Draws one frame with the camera already in place, without starting the game. */
  still() {
    const p = this.p
    this.cam.x = Math.max(0, Math.min(this.level.width - this.W, p.x - this.W * 0.2))
    this.cam.y = Math.min(this.level.baseY + 34 - this.H, p.y - this.H * 0.62)
    this.render()
  }

  /** Called by tests and by a skip button. */
  teleport(x: number) {
    const s = this.level.solids.find((q) => !q.oneWay && q.x <= x && q.x + q.w > x)
    this.p.x = x
    this.p.y = (s ? s.y : this.level.baseY) - P_H - 2
    this.p.vx = this.p.vy = 0
  }

  // ---------------------------------------------------------------- update
  private update(dt: number) {
    this.t += dt
    if (!this.demo && !this.finished) this.stats.time += dt
    const p = this.p
    const lv = this.level
    if (this.demo) this.bot()

    // horizontal
    const max = RUN * (p.boost > 0 ? 1.45 : 1)
    const dir = p.frozen ? 0 : (this.input.right ? 1 : 0) - (this.input.left ? 1 : 0)
    if (dir) {
      p.vx += dir * ACCEL * dt
      p.face = dir
    } else {
      const f = FRICTION * dt
      p.vx = Math.abs(p.vx) <= f ? 0 : p.vx - Math.sign(p.vx) * f
    }
    p.vx = Math.max(-max, Math.min(max, p.vx))
    if (p.boost > 0) p.boost -= dt
    if (p.hurt > 0) p.hurt -= dt

    // jump, with coyote time and input buffering so it forgives slightly late taps
    if (this.input.jump && !p.lastJump) p.buffer = 0.11
    p.lastJump = this.input.jump
    p.buffer -= dt
    p.coyote = p.ground ? 0.09 : p.coyote - dt
    if (p.buffer > 0 && p.coyote > 0 && !p.frozen) {
      p.vy = -JUMP
      p.buffer = 0
      p.coyote = 0
      p.ground = false
      this.hooks.sfx?.('jump')
      this.dust(p.x, p.y + P_H)
    }
    const g = p.vy < 0 && !this.input.jump ? GRAVITY * 2.4 : GRAVITY
    p.vy = Math.min(520, p.vy + g * dt)

    // move X
    p.x += p.vx * dt
    p.x = Math.max(4, p.x)
    for (const s of lv.solids) {
      if (s.oneWay) continue
      if (p.x + P_W / 2 > s.x && p.x - P_W / 2 < s.x + s.w && p.y + P_H > s.y + 1 && p.y < s.y + s.h) {
        p.x = p.vx > 0 ? s.x - P_W / 2 : s.x + s.w + P_W / 2
        p.vx = 0
      }
    }
    // move Y
    const prevBottom = p.y + P_H
    p.y += p.vy * dt
    p.ground = false
    for (const s of lv.solids) {
      if (p.x + P_W / 2 <= s.x || p.x - P_W / 2 >= s.x + s.w) continue
      if (s.oneWay) {
        if (p.vy >= 0 && prevBottom <= s.y + 2 && p.y + P_H >= s.y) {
          p.y = s.y - P_H
          p.vy = 0
          p.ground = true
        }
        continue
      }
      if (p.y + P_H > s.y && p.y < s.y + s.h) {
        if (p.vy >= 0) {
          p.y = s.y - P_H
          p.vy = 0
          p.ground = true
        } else {
          p.y = s.y + s.h
          p.vy = 0
        }
      }
    }

    // pits: git revert
    if (p.y > lv.baseY + 120) this.revert()

    // pickups
    for (const k of lv.pickups) {
      if (k.taken) continue
      if (Math.abs(k.x - p.x) < 11 && k.y > p.y - 6 && k.y < p.y + P_H + 6) {
        k.taken = true
        if (k.kind === 'boost') {
          p.boost = 6
          this.hooks.sfx?.('boost')
          this.burst(k.x, k.y, '#ff7a45', 10)
        } else {
          this.stats.commits++
          this.hooks.sfx?.('commit')
          this.burst(k.x, k.y, '#39d353', 4)
          this.hooks.onStats?.(this.stats)
        }
      }
    }

    // bugs
    for (const b of lv.bugs) {
      if (b.dead > 0) {
        b.dead -= dt
        continue
      }
      if (b.dead < 0) continue
      b.t += dt
      b.x += b.dir * 26 * dt
      if (b.x < b.min || b.x > b.max) b.dir *= -1
      const hit = Math.abs(b.x - p.x) < 11 && p.y + P_H > b.y + 1 && p.y < b.y + 10
      if (!hit) continue
      if (p.vy > 30 && prevBottom <= b.y + 8) {
        b.dead = 0.6
        p.vy = -240
        this.stats.bugs++
        this.stats.commits++
        this.shake = 2
        this.hooks.sfx?.('stomp')
        this.burst(b.x, b.y + 4, '#d7263d', 9)
        this.hooks.onStats?.(this.stats)
      } else if (p.hurt <= 0) {
        p.hurt = 1.3
        p.vx = Math.sign(p.x - b.x || 1) * 220
        p.vy = -170
        const lost = Math.min(3, this.stats.commits)
        this.stats.commits -= lost
        for (let i = 0; i < lost; i++) this.burst(p.x, p.y + 8, '#39d353', 3)
        this.shake = 3
        this.hooks.sfx?.('hurt')
        this.hooks.onStats?.(this.stats)
      }
    }

    // signs
    let sign: Sign | null = null
    for (const s of lv.signs) {
      if (Math.abs(s.x - p.x) < 62) sign = s
      if (s.x < p.x && s.x > this.checkpoint.x && !this.demo) this.checkpoint = { x: s.x, y: s.y - P_H }
    }
    if (sign !== this.activeSign) {
      this.activeSign = sign
      this.hooks.onSign?.(sign ? sign.text : null)
    }

    // gates
    for (const gt of lv.gates) {
      if (gt.done) continue
      if (p.x >= gt.x) {
        gt.done = true
        this.checkpoint = { x: gt.x + 12, y: gt.y - P_H }
        if (!this.demo) {
          this.hooks.sfx?.('gate')
          this.input.left = this.input.right = this.input.jump = false
          p.vx = 0
          this.hooks.onGate?.(gt)
        }
      }
    }

    // zones
    const zi = lv.zones.findIndex((z) => p.x >= z.x0 && p.x < z.x1)
    if (zi >= 0 && zi !== this.zoneIndex) {
      this.zoneIndex = zi
      this.hooks.onZone?.(lv.zones[zi])
    }

    // the end
    if (p.x >= lv.finishX && !this.finished) {
      if (this.demo) {
        this.reset()
        return
      }
      this.finished = true
      p.frozen = true
      this.hooks.onFinish?.()
    }

    // particles
    for (const q of this.particles) {
      q.life -= dt
      q.vy += 500 * dt
      q.x += q.vx * dt
      q.y += q.vy * dt
    }
    this.particles = this.particles.filter((q) => q.life > 0)
    this.shake = Math.max(0, this.shake - dt * 14)

    // camera
    const lead = p.face * 26
    const tx = Math.max(0, Math.min(lv.width - this.W, p.x + lead - this.W * 0.38))
    const floor = lv.baseY + 34 - this.H
    const ty = Math.min(floor, p.y - this.H * 0.62)
    this.cam.x += (tx - this.cam.x) * 0.1
    this.cam.y += (ty - this.cam.y) * 0.08
  }

  private revert() {
    const p = this.p
    p.x = this.checkpoint.x
    p.y = this.checkpoint.y - 4
    p.vx = p.vy = 0
    p.hurt = 1
    this.stats.reverts++
    this.hooks.sfx?.('revert')
    this.hooks.onRevert?.()
  }

  private bot() {
    const p = this.p
    const lv = this.level
    this.input.right = true
    const footX = p.x + 26
    const groundAhead = lv.solids.some((s) => !s.oneWay && footX >= s.x && footX < s.x + s.w && s.y >= p.y + P_H - 1 && s.y < p.y + P_H + 40)
    const wall = lv.solids.some((s) => !s.oneWay && p.x + 22 >= s.x && p.x + 22 < s.x + s.w && s.y < p.y + P_H - 2 && s.y + s.h > p.y)
    const bugNear = lv.bugs.some((b) => b.dead === 0 && b.x > p.x && b.x - p.x < 42 && Math.abs(b.y - p.y) < 40)
    this.input.jump = p.ground ? !groundAhead || wall || bugNear : p.vy < 0
  }

  private dust(x: number, y: number) {
    for (let i = 0; i < 4; i++)
      this.particles.push({ x, y, vx: (Math.random() - 0.5) * 60, vy: -Math.random() * 30, life: 0.25, color: 'rgba(255,255,255,.7)', size: 1 })
  }
  private burst(x: number, y: number, color: string, n: number) {
    for (let i = 0; i < n; i++)
      this.particles.push({ x, y, vx: (Math.random() - 0.5) * 150, vy: -Math.random() * 140, life: 0.35 + Math.random() * 0.2, color, size: Math.random() < 0.4 ? 2 : 1 })
  }

  // ---------------------------------------------------------------- render
  render() {
    const { ctx, W, H, level: lv, p } = this
    const shx = this.shake ? (Math.random() - 0.5) * this.shake : 0
    const shy = this.shake ? (Math.random() - 0.5) * this.shake : 0
    const cx = Math.round(this.cam.x + shx)
    const cy = Math.round(this.cam.y + shy)

    // Blend between zones as you walk across the boundary, like the site itself.
    const focus = this.cam.x + W / 2
    let zi = lv.zones.findIndex((z) => focus >= z.x0 && focus < z.x1)
    if (zi < 0) zi = lv.zones.length - 1
    const z = lv.zones[zi]
    const next = lv.zones[zi + 1]
    const t = next ? Math.max(0, (focus - (z.x1 - 140)) / 140) : 0
    const pick = (fn: (q: Zone) => string) => (next && t > 0 ? mix(fn(z), fn(next), Math.min(1, t)) : fn(z))

    const sky = ctx.createLinearGradient(0, 0, 0, H)
    sky.addColorStop(0, pick((q) => q.sky[0]))
    sky.addColorStop(1, pick((q) => q.sky[1]))
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, W, H)

    const horizon = lv.baseY - cy

    // stars at night
    if (z.sky[0] === '#080c28' || z.sky[0] === '#050a1f') {
      ctx.fillStyle = 'rgba(255,255,255,.75)'
      for (let i = 0; i < 46; i++) {
        const sx = ((rnd(i) * (W + 60) - cx * 0.08) % (W + 60) + W + 60) % (W + 60)
        const sy = rnd(i + 99) * horizon * 0.8
        if (rnd(i + 7) > 0.3 || Math.sin(this.t * 2 + i) > 0) ctx.fillRect(Math.round(sx), Math.round(sy), 1, 1)
      }
    }

    // far skyline
    ctx.fillStyle = pick((q) => q.far)
    const farOff = cx * 0.25
    for (let i = Math.floor(farOff / 34) - 1; i < farOff / 34 + W / 34 + 2; i++) {
      const bw = 26 + rnd(i) * 24
      const bh = 30 + rnd(i + 50) * 60
      ctx.fillRect(Math.round(i * 34 - farOff), Math.round(horizon - bh - 6), Math.round(bw), Math.round(bh + 8))
    }
    ctx.fillRect(0, Math.round(horizon - 6), W, H)

    // mid layer
    ctx.fillStyle = pick((q) => q.near)
    const midOff = cx * 0.5
    for (let i = Math.floor(midOff / 56) - 1; i < midOff / 56 + W / 56 + 2; i++) {
      const bw = 34 + rnd(i + 3) * 30
      const bh = 12 + rnd(i + 77) * 36
      ctx.fillRect(Math.round(i * 56 - midOff), Math.round(horizon - bh + 2), Math.round(bw), Math.round(bh + 2))
    }
    ctx.fillRect(0, Math.round(horizon), W, H)

    // props, drawn in world space
    for (const q of lv.props) {
      if (q.x - cx < -90 || q.x - cx > W + 90) continue
      this.drawProp(q, cx, cy)
    }

    // gates
    for (const g of lv.gates) this.drawGate(g.x - cx, g.y - cy, g.done, this.zoneAt(g.x).accent)

    // finish door
    this.drawDoor(lv.finishX - cx, lv.baseY - cy)

    // ground
    for (const s of lv.solids) {
      const sx = Math.round(s.x - cx)
      if (sx > W || sx + s.w < 0) continue
      const zz = lv.zones[s.zone]
      const sy = Math.round(s.y - cy)
      if (s.oneWay) {
        ctx.fillStyle = zz.top
        ctx.fillRect(sx, sy, s.w, 4)
        ctx.fillStyle = zz.fill
        ctx.fillRect(sx, sy + 4, s.w, 2)
        continue
      }
      ctx.fillStyle = zz.fill
      ctx.fillRect(sx, sy, s.w, Math.min(H + 20, s.h))
      ctx.fillStyle = zz.top
      ctx.fillRect(sx, sy, s.w, 3)
      // a little texture so the ground reads as ground
      ctx.fillStyle = 'rgba(255,255,255,.07)'
      for (let i = Math.floor(s.x / 16); i * 16 < s.x + s.w; i++) {
        const tx = i * 16 - cx
        if (tx < -16 || tx > W) continue
        ctx.fillRect(Math.round(tx + (i % 2) * 8), sy + 7, 3, 1)
        ctx.fillRect(Math.round(tx + ((i + 1) % 2) * 8 + 4), sy + 13, 3, 1)
      }
    }

    // pickups
    for (const k of lv.pickups) {
      if (k.taken) continue
      const sx = Math.round(k.x - cx)
      if (sx < -10 || sx > W + 10) continue
      const sy = Math.round(k.y - cy + Math.sin(this.t * 3 + k.phase) * 2)
      if (k.kind === 'boost') {
        ctx.fillStyle = '#1c1c28'
        ctx.fillRect(sx - 3, sy - 6, 7, 12)
        ctx.fillStyle = '#ff7a45'
        ctx.fillRect(sx - 2, sy - 4, 5, 6)
        ctx.fillStyle = '#d7d7d7'
        ctx.fillRect(sx - 2, sy - 7, 5, 1)
      } else {
        // a GitHub-style contribution square
        ctx.fillStyle = '#0e4429'
        ctx.fillRect(sx - 4, sy - 4, 8, 8)
        ctx.fillStyle = '#26a641'
        ctx.fillRect(sx - 3, sy - 3, 6, 6)
        ctx.fillStyle = '#39d353'
        ctx.fillRect(sx - 3, sy - 3, 3, 3)
      }
    }

    // bugs
    for (const b of lv.bugs) {
      if (b.dead < 0) continue
      const sx = Math.round(b.x - cx)
      if (sx < -20 || sx > W + 20) continue
      const frame = b.dead > 0 ? this.bug[2] : this.bug[Math.floor(b.t * 8) % 2]
      this.blit(frame, sx - 7, Math.round(b.y - cy), b.dir < 0)
      if (b.dead > 0 && b.dead < 0.05) b.dead = -1
    }

    // player
    const blink = p.hurt > 0 && Math.floor(this.t * 16) % 2 === 0
    if (!blink) {
      let f: HeroFrame = 'idle'
      if (p.hurt > 0.9) f = 'hurt'
      else if (!p.ground) f = p.vy < 0 ? 'jump' : 'fall'
      else if (Math.abs(p.vx) > 8) {
        p.anim += Math.abs(p.vx) * STEP * 0.1
        f = (['runA', 'runB', 'runC', 'runD'] as const)[Math.floor(p.anim) % 4]
      }
      this.blit(this.hero[f], Math.round(p.x - 8 - cx), Math.round(p.y - cy), p.face < 0)
      if (p.boost > 0) {
        ctx.fillStyle = '#ff7a45'
        ctx.fillRect(Math.round(p.x - cx - p.face * 10), Math.round(p.y - cy + 8 + Math.random() * 10), 2, 1)
      }
    }

    // particles
    for (const q of this.particles) {
      ctx.fillStyle = q.color
      ctx.fillRect(Math.round(q.x - cx), Math.round(q.y - cy), q.size, q.size)
    }
  }

  private zoneAt(x: number) {
    return this.level.zones.find((z) => x >= z.x0 && x < z.x1) ?? this.level.zones[0]
  }

  private blit(img: HTMLCanvasElement, x: number, y: number, flip: boolean) {
    const { ctx } = this
    if (flip) {
      ctx.save()
      ctx.scale(-1, 1)
      ctx.drawImage(img, -x - img.width, y)
      ctx.restore()
    } else ctx.drawImage(img, x, y)
  }

  private drawGate(x: number, y: number, done: boolean, accent: string) {
    const { ctx } = this
    x = Math.round(x)
    y = Math.round(y)
    if (x < -40 || x > this.W + 40) return
    ctx.fillStyle = '#10131f'
    ctx.fillRect(x - 15, y - 52, 5, 52)
    ctx.fillRect(x + 11, y - 52, 5, 52)
    ctx.fillRect(x - 17, y - 58, 35, 7)
    ctx.fillStyle = done ? '#39d353' : accent
    ctx.fillRect(x - 13, y - 56, 27, 3)
    if (!done) {
      const by = y - 50 + ((Math.sin(this.t * 3) + 1) / 2) * 46
      ctx.fillStyle = accent
      ctx.globalAlpha = 0.85
      ctx.fillRect(x - 10, Math.round(by), 21, 1)
      ctx.globalAlpha = 0.14
      ctx.fillRect(x - 10, y - 50, 21, 50)
      ctx.globalAlpha = 1
    }
    const label = done ? 'OK' : 'SCAN'
    drawText(ctx, label, x - textWidth(label) / 2, y - 66, done ? '#39d353' : accent)
  }

  private drawDoor(x: number, y: number) {
    const { ctx } = this
    x = Math.round(x)
    y = Math.round(y)
    if (x < -60 || x > this.W + 60) return
    const pulse = Math.floor(this.t * 3) % 2 === 0
    ctx.fillStyle = '#10131f'
    ctx.fillRect(x - 22, y - 70, 44, 70)
    ctx.fillStyle = pulse ? '#34d399' : '#5ee0b4'
    ctx.fillRect(x - 18, y - 66, 36, 66)
    ctx.fillStyle = '#10131f'
    ctx.fillRect(x + 11, y - 34, 3, 3)
    drawText(ctx, 'YOU ARE HERE', x - textWidth('YOU ARE HERE') / 2, y - 84, '#34d399')
    drawText(ctx, 'HIRE ME', x - textWidth('HIRE ME') / 2, y - 56, '#10131f')
  }

  private drawProp(q: Prop, cx: number, cy: number) {
    const { ctx } = this
    const x = Math.round(q.x - cx)
    const y = Math.round(q.y - cy)
    const z = this.zoneAt(q.x)
    switch (q.type) {
      case 'sign': {
        ctx.fillStyle = z.fill
        ctx.fillRect(x - 1, y - 16, 2, 16)
        ctx.fillStyle = z.accent
        ctx.fillRect(x - 8, y - 26, 16, 11)
        ctx.fillStyle = z.sky[1]
        ctx.fillRect(x - 6, y - 24, 12, 1)
        ctx.fillRect(x - 6, y - 22, 9, 1)
        ctx.fillRect(x - 6, y - 20, 11, 1)
        ctx.fillRect(x - 6, y - 18, 7, 1)
        break
      }
      case 'building': {
        const h = q.v ?? 50
        ctx.fillStyle = z.near
        ctx.fillRect(x - 34, y - h, 68, h)
        ctx.fillStyle = z.far
        for (let r = 0; r < Math.floor((h - 18) / 12); r++)
          for (let c = 0; c < 5; c++) ctx.fillRect(x - 28 + c * 12, y - h + 18 + r * 12, 7, 7)
        if (q.label) drawText(ctx, q.label, x - textWidth(q.label) / 2, y - h + 6, z.fill)
        break
      }
      case 'tree': {
        ctx.fillStyle = z.fill
        ctx.fillRect(x - 2, y - 22, 4, 22)
        ctx.fillStyle = z.near
        ctx.fillRect(x - 13, y - 40, 26, 20)
        ctx.fillRect(x - 9, y - 46, 18, 6)
        break
      }
      case 'clock': {
        ctx.fillStyle = '#05060f'
        ctx.fillRect(x - 28, y - 62, 56, 22)
        // the countdown runs down in real time while you are in the zone
        const left = Math.max(0, 86399 - Math.floor(this.stats.time * 60))
        const label = `${String(Math.floor(left / 3600)).padStart(2, '0')}:${String(Math.floor((left % 3600) / 60)).padStart(2, '0')}`
        drawText(ctx, label, x - textWidth(label, 2) / 2, y - 56, '#ff5252', 2)
        ctx.fillStyle = z.near
        ctx.fillRect(x - 2, y - 40, 4, 40)
        break
      }
      case 'desk': {
        ctx.fillStyle = z.near
        ctx.fillRect(x - 22, y - 16, 44, 3)
        ctx.fillRect(x - 20, y - 13, 3, 13)
        ctx.fillRect(x + 17, y - 13, 3, 13)
        ctx.fillStyle = '#c9cce0'
        ctx.fillRect(x - 11, y - 18, 16, 2)
        ctx.fillStyle = '#10131f'
        ctx.fillRect(x - 10, y - 28, 14, 10)
        ctx.fillStyle = '#39d353'
        const blink = Math.floor(this.t * 2 + q.x) % 2 === 0
        ctx.fillRect(x - 8, y - 26, 6, 1)
        ctx.fillRect(x - 8, y - 24, blink ? 9 : 4, 1)
        ctx.fillRect(x - 8, y - 22, 7, 1)
        break
      }
      case 'banner': {
        const label = q.label ?? ''
        const w = textWidth(label, 2) + 12
        ctx.fillStyle = z.accent
        ctx.fillRect(x - w / 2, y - 66, w, 18)
        drawText(ctx, label, x - textWidth(label, 2) / 2, y - 62, z.sky[0], 2)
        ctx.fillStyle = z.near
        ctx.fillRect(x - w / 2, y - 48, 2, 48)
        ctx.fillRect(x + w / 2 - 2, y - 48, 2, 48)
        break
      }
      case 'cross': {
        ctx.fillStyle = z.near
        ctx.fillRect(x - 1, y - 40, 2, 40)
        ctx.fillStyle = '#fff'
        ctx.fillRect(x - 12, y - 62, 24, 24)
        ctx.fillStyle = z.accent
        ctx.fillRect(x - 3, y - 58, 6, 16)
        ctx.fillRect(x - 8, y - 53, 16, 6)
        break
      }
      case 'shelf': {
        ctx.fillStyle = z.near
        ctx.fillRect(x - 26, y - 50, 52, 50)
        ctx.fillStyle = z.far
        ctx.fillRect(x - 24, y - 26, 48, 2)
        const cols = ['#ef4444', '#34d399', '#ff7a45', '#4f46e5', '#fff']
        for (let r = 0; r < 2; r++)
          for (let c = 0; c < 6; c++) {
            ctx.fillStyle = cols[Math.floor(rnd(q.x + c * 3 + r * 17) * cols.length)]
            ctx.fillRect(x - 22 + c * 8, y - 46 + r * 24 + Math.floor(rnd(c + r) * 3), 5, 12)
          }
        break
      }
      case 'arcade': {
        ctx.fillStyle = z.fill
        ctx.fillRect(x - 12, y - 44, 24, 44)
        ctx.fillStyle = '#10131f'
        ctx.fillRect(x - 9, y - 40, 18, 14)
        ctx.fillStyle = z.accent
        ctx.fillRect(x - 7 + (Math.floor(this.t * 4) % 3) * 4, y - 36, 3, 3)
        ctx.fillRect(x - 7, y - 30, 14, 1)
        ctx.fillStyle = '#ff5252'
        ctx.fillRect(x - 6, y - 21, 3, 3)
        ctx.fillStyle = '#39d353'
        ctx.fillRect(x + 1, y - 21, 3, 3)
        break
      }
      case 'board': {
        ctx.fillStyle = z.near
        ctx.fillRect(x - 32, y - 58, 64, 40)
        ctx.fillRect(x - 30, y - 18, 3, 18)
        ctx.fillRect(x + 27, y - 18, 3, 18)
        ctx.fillStyle = '#fffdf6'
        ctx.fillRect(x - 30, y - 56, 60, 36)
        const cols = ['#ff7a45', '#34d399', '#ff7a45', '#7c5cff']
        for (let i = 0; i < 7; i++) {
          ctx.fillStyle = cols[i % 4]
          ctx.fillRect(x - 26 + (i % 4) * 14, y - 52 + Math.floor(i / 4) * 12, 10, 8)
        }
        drawText(ctx, 'MVP', x + 2, y - 28, '#c8350b')
        break
      }
      case 'crowd': {
        for (let i = 0; i < 8; i++) {
          const px = x - 38 + i * 11
          const bob = Math.round(Math.sin(this.t * 3 + i) * 1)
          ctx.fillStyle = z.near
          ctx.fillRect(px, y - 18 + bob, 8, 18)
          ctx.fillRect(px + 1, y - 25 + bob, 6, 6)
          ctx.fillStyle = z.accent
          ctx.fillRect(px + 2, y - 13 + bob, 4, 3)
        }
        break
      }
    }
  }
}
