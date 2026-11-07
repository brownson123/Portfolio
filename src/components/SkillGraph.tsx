import { useEffect, useRef, useState } from 'react'
import { graph, projects } from '../data/content'
import { setOverlay } from '../lib/state'
import { clamp, haptic, reducedMotion, whileVisible } from '../lib/util'
import { ArrowUR } from './ui'

// A force-directed map of what I know and what I made with it.
// Tap or hover anything to light up its connections; drag nodes around.

type Node = {
  id: string
  label: string
  hub: boolean
  x: number
  y: number
  vx: number
  vy: number
  deg: number
  fixed?: boolean
}
type Edge = { a: Node; b: Node }

const INK = '35,18,10'
const HOT = '200,53,11'

export function SkillGraph() {
  const wrap = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const [selected, setSelected] = useState<string>('ts')
  const selectedRef = useRef(selected)
  selectedRef.current = selected

  useEffect(() => {
    const el = wrap.current!
    const cv = canvas.current!
    const ctx = cv.getContext('2d')!
    const still = reducedMotion()
    let W = 0
    let H = 0
    const nodes = new Map<string, Node>()
    const edges: Edge[] = []

    const make = (id: string, label: string, hub: boolean) => {
      const a = Math.random() * Math.PI * 2
      const r = 20 + Math.random() * 30
      const n: Node = { id, label, hub, x: Math.cos(a) * r, y: Math.sin(a) * r, vx: 0, vy: 0, deg: 0 }
      nodes.set(id, n)
      return n
    }
    graph.hubs.forEach((h) => make(`hub:${h.id}`, h.label, true))
    Object.entries(graph.builds).forEach(([id, label]) => make(`build:${id}`, label, false))
    graph.hubs.forEach((h) =>
      h.builds.forEach((b) => {
        const a = nodes.get(`hub:${h.id}`)!
        const c = nodes.get(`build:${b}`)!
        a.deg++
        c.deg++
        edges.push({ a, b: c })
      }),
    )
    const list = [...nodes.values()]

    const size = () => {
      const r = el.getBoundingClientRect()
      W = r.width
      H = r.height
      const dpr = Math.min(devicePixelRatio || 1, 2)
      cv.width = W * dpr
      cv.height = H * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    size()
    const ro = new ResizeObserver(size)
    ro.observe(el)

    const narrow = () => W < 640
    let hover: Node | null = null
    let drag: Node | null = null
    let dragId = -1

    const pick = (x: number, y: number) => {
      let best: Node | null = null
      let bd = narrow() ? 26 : 20
      for (const n of list) {
        const d = Math.hypot(n.x + W / 2 - x, n.y + H / 2 - y)
        if (d < bd) {
          bd = d
          best = n
        }
      }
      return best
    }
    const local = (e: PointerEvent | Touch) => {
      const r = cv.getBoundingClientRect()
      return { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const down = (e: PointerEvent) => {
      const p = local(e)
      const n = pick(p.x, p.y)
      if (n) {
        drag = n
        dragId = e.pointerId
        n.fixed = true
        cv.setPointerCapture(e.pointerId)
        const id = n.id
        setSelected(id.replace(/^(hub|build):/, ''))
        haptic(6)
      }
    }
    const move = (e: PointerEvent) => {
      const p = local(e)
      if (drag && e.pointerId === dragId) {
        drag.x = p.x - W / 2
        drag.y = p.y - H / 2
        drag.vx = drag.vy = 0
      } else if (e.pointerType === 'mouse') {
        hover = pick(p.x, p.y)
        cv.style.cursor = hover ? 'grab' : ''
        if (hover) setSelected(hover.id.replace(/^(hub|build):/, ''))
      }
    }
    const up = () => {
      if (drag) {
        drag.fixed = false
        settle = 1.6
      }
      drag = null
      dragId = -1
    }
    // Touch: only claim the gesture when it starts on a node, so the page still scrolls.
    const touch = (e: TouchEvent) => {
      const p = local(e.touches[0])
      if (pick(p.x, p.y)) e.preventDefault()
    }
    cv.addEventListener('pointerdown', down)
    cv.addEventListener('pointermove', move)
    cv.addEventListener('pointerup', up)
    cv.addEventListener('pointercancel', up)
    cv.addEventListener('touchstart', touch, { passive: false })

    const simulate = (dt: number) => {
      const k = narrow() ? 0.62 : 1
      const spread = Math.min(W, H * 1.3)
      const rep = (narrow() ? 1300 : 2600) * (spread / 800)
      for (let i = 0; i < list.length; i++) {
        const a = list[i]
        for (let j = i + 1; j < list.length; j++) {
          const b = list[j]
          let dx = a.x - b.x
          let dy = a.y - b.y
          let d2 = dx * dx + dy * dy
          if (d2 < 1) {
            dx = Math.random()
            dy = Math.random()
            d2 = 1
          }
          if (d2 > 90000 * k) continue
          const f = rep / d2
          const d = Math.sqrt(d2)
          const fx = (dx / d) * f
          const fy = (dy / d) * f
          a.vx += fx * dt * 60
          a.vy += fy * dt * 60
          b.vx -= fx * dt * 60
          b.vy -= fy * dt * 60
        }
      }
      const rest = (narrow() ? 58 : 92) * clamp(spread / 800, 0.7, 1.3)
      for (const e of edges) {
        const dx = e.b.x - e.a.x
        const dy = e.b.y - e.a.y
        const d = Math.hypot(dx, dy) || 1
        const f = (d - rest) * 0.012
        const fx = (dx / d) * f
        const fy = (dy / d) * f
        e.a.vx += fx * dt * 60
        e.a.vy += fy * dt * 60
        e.b.vx -= fx * dt * 60
        e.b.vy -= fy * dt * 60
      }
      for (const n of list) {
        // Pull toward the centre, elliptically, so it fills a wide or tall box.
        n.vx -= (n.x / Math.max(1, W)) * 3.4 * dt * 60 * 0.3
        n.vy -= (n.y / Math.max(1, H)) * 3.4 * dt * 60 * 0.3
        n.vx *= 0.86
        n.vy *= 0.86
        if (!n.fixed) {
          n.x += n.vx * dt * 60 * 0.5
          n.y += n.vy * dt * 60 * 0.5
        }
        const pad = narrow() ? 20 : 34
        n.x = clamp(n.x, -W / 2 + pad, W / 2 - pad)
        n.y = clamp(n.y, -H / 2 + 26, H / 2 - 26)
      }
    }

    // Warm up, so the graph isn't a tangle on first sight.
    for (let i = 0; i < 260; i++) simulate(1 / 60)

    const neighbours = (id: string) => {
      const set = new Set<string>()
      edges.forEach((e) => {
        if (e.a.id === id) set.add(e.b.id)
        if (e.b.id === id) set.add(e.a.id)
      })
      return set
    }

    let intro = still ? 1 : 0
    let settle = 1.2
    const draw = (dt: number) => {
      // It settles after arriving or being dragged, and otherwise holds still.
      if (!still && (drag || settle > 0)) {
        simulate(dt)
        settle -= dt
      }
      intro = clamp(intro + dt / 1.2)
      const ei = 1 - Math.pow(1 - intro, 3)
      ctx.clearRect(0, 0, W, H)
      const cx = W / 2
      const cy = H / 2
      const raw = selectedRef.current
      const sel = nodes.get(`hub:${raw}`) ?? nodes.get(`build:${raw}`) ?? null
      const near = sel ? neighbours(sel.id) : new Set<string>()
      const X = (n: Node) => cx + n.x * ei
      const Y = (n: Node) => cy + n.y * ei

      ctx.lineWidth = 1
      for (const e of edges) {
        const on = sel && (e.a === sel || e.b === sel)
        ctx.strokeStyle = on ? `rgba(${HOT},.95)` : `rgba(${INK},${sel ? 0.2 : 0.28})`
        ctx.beginPath()
        ctx.moveTo(X(e.a), Y(e.a))
        ctx.lineTo(X(e.b), Y(e.b))
        ctx.stroke()
      }
      ctx.textBaseline = 'middle'
      for (const n of list) {
        const on = n === sel
        const lit = on || near.has(n.id)
        const faded = sel && !lit
        const x = X(n)
        const y = Y(n)
        const a = (faded ? 0.62 : 1) * ei
        if (n.hub) {
          const s = 4 + Math.min(n.deg, 4) * 1.2 + (on ? 2 : 0)
          ctx.fillStyle = on ? `rgba(${HOT},1)` : `rgba(${INK},${a})`
          ctx.fillRect(x - s / 2, y - s / 2, s, s)
        } else {
          const s = 3 + Math.min(n.deg, 4) * 0.8 + (on ? 2 : 0)
          ctx.strokeStyle = on || lit ? `rgba(${HOT},1)` : `rgba(${INK},${a})`
          ctx.lineWidth = 1.2
          ctx.strokeRect(x - s / 2, y - s / 2, s, s)
          ctx.lineWidth = 1
        }
        const show = !narrow() || n.hub || lit
        if (show) {
          const fs = narrow() ? 10 : n.hub ? 12 : 11
          ctx.font = `${n.hub ? 500 : 400} ${fs}px "Geist Mono", monospace`
          ctx.fillStyle = lit ? `rgba(${HOT},1)` : `rgba(${INK},${n.hub ? a : a * 0.72})`
          const right = x > W - 90
          ctx.textAlign = right ? 'right' : 'left'
          ctx.fillText(n.label, x + (right ? -9 : 9), y + 0.5)
        }
      }
    }

    const stop = whileVisible(el, (dt) => draw(dt))
    return () => {
      stop()
      ro.disconnect()
      cv.removeEventListener('pointerdown', down)
      cv.removeEventListener('pointermove', move)
      cv.removeEventListener('pointerup', up)
      cv.removeEventListener('pointercancel', up)
      cv.removeEventListener('touchstart', touch)
    }
  }, [])

  const hub = graph.hubs.find((h) => h.id === selected)
  const build = graph.builds[selected]
  const related = hub
    ? hub.builds.map((b) => ({ id: b, label: graph.builds[b] }))
    : graph.hubs.filter((h) => h.builds.includes(selected)).map((h) => ({ id: h.id, label: h.label }))
  const hasCase = !hub && projects.some((p) => p.id === selected && p.shots?.length)

  return (
    <div>
      <div ref={wrap} className="relative h-[66svh] min-h-[420px] lg:h-[74vh] panel overflow-hidden">
        <span className="tick-b" aria-hidden />
        <canvas ref={canvas} className="absolute inset-0 w-full h-full touch-pan-y" role="img" aria-label="A graph connecting Brownson's skills to the projects that used them. The same information is listed below." />
      </div>
      <div className="panel p-4 lg:p-5 mt-3 min-h-[116px]" aria-live="polite">
        <span className="tick-b" aria-hidden />
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div className="title text-2xl lg:text-3xl">{hub?.label ?? build}</div>
          {hasCase && (
            <button className="btn btn-ghost !min-h-9" onClick={() => setOverlay({ sheet: selected })}>
              See the screens <ArrowUR />
            </button>
          )}
        </div>
        <div className="mono opacity-70 mt-2 mb-2">{hub ? 'Where I used it' : 'What it took'}</div>
        <div className="flex flex-wrap gap-1.5">
          {related.map((r) => (
            <button key={r.id} onClick={() => setSelected(r.id)} className="chip bg-transparent text-inherit min-h-8 hover:bg-black/10 transition-colors">
              {r.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
