import { useEffect, useRef, useState } from 'react'
import { chapters, me } from '../data/content'
import { award, useApp } from '../lib/state'
import { asset, clamp, finePointer, haptic } from '../lib/util'
import { ArrowUR, QR } from './ui'

// Brownson's badge, hanging on a rope you can actually grab.
// Rope: Verlet points with a heavy end. Card: a rigid body swinging off the last point.

const STRAP_TEXT = 'BROWNSON OMOTOYE ✶ CHECK-IN ✶ FALL 26 ✶ BROWNSON OMOTOYE ✶ CHECK-IN ✶ FALL 26 ✶ '

export function Lanyard({ ready }: { ready: boolean }) {
  const root = useRef<HTMLDivElement>(null)
  const card = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)
  const strap = useRef<SVGPathElement>(null)
  const [flipped, setFlipped] = useState(false)
  const flipRef = useRef(false)
  flipRef.current = flipped
  const stamps = useApp((s) => s.stamps)
  const readyRef = useRef(ready)
  readyRef.current = ready

  useEffect(() => {
    const host = root.current!
    const cardEl = card.current!

    const N = 12
    let W = host.clientWidth
    let H = host.clientHeight
    let cardW = cardEl.offsetWidth
      let anchor = { x: 0, y: -12 }
    let seg = 0
    const pts = Array.from({ length: N + 1 }, () => ({ x: 0, y: 0, px: 0, py: 0 }))

    const place = (drop: boolean) => {
      W = host.clientWidth
      H = host.clientHeight
      cardW = cardEl.offsetWidth
      const narrow = W < 640
      anchor = { x: W * (narrow ? 0.64 : 0.72), y: -12 }
      seg = ((narrow ? 44 : H * 0.13) + 12) / N
      pts.forEach((p, i) => {
        const lift = drop ? -(H * 0.5) : 0
        p.x = p.px = anchor.x
        p.y = p.py = anchor.y + i * seg + lift
      })
    }
    place(true)

    let angle = 0
    let spin = 0
    let flip = 0
    let tiltX = 0
    let tiltY = 0
    let tiltTX = 0
    let tiltTY = 0
    let dragging = false
    let grabDX = 0
    let grabDY = 0
    let targetX = 0
    let targetY = 0
    let moved = 0
    let downAt = 0
    let dropped = false
    let raf = 0
    let last = 0
    let accum = 0
    let visible = true
    const DT = 1 / 60

    const step = () => {
      const damp = dragging ? 0.97 : 0.975
      for (let i = 1; i <= N; i++) {
        const p = pts[i]
        const vx = (p.x - p.px) * damp
        const vy = (p.y - p.py) * damp
        p.px = p.x
        p.py = p.y
        p.x += vx
        p.y += vy + 2100 * DT * DT
      }
      pts[0].x = anchor.x
      pts[0].y = anchor.y
      for (let k = 0; k < 18; k++) {
        for (let i = 0; i < N; i++) {
          const a = pts[i]
          const b = pts[i + 1]
          const dx = b.x - a.x
          const dy = b.y - a.y
          const d = Math.hypot(dx, dy) || 0.001
          const diff = (d - seg) / d
          // The last point carries the card, so it moves less.
          const wa = i === 0 ? 0 : 1
          const wb = i + 1 === N ? 0.22 : 1
          const sum = wa + wb
          a.x += dx * diff * (wa / sum)
          a.y += dy * diff * (wa / sum)
          b.x -= dx * diff * (wb / sum)
          b.y -= dy * diff * (wb / sum)
        }
        if (dragging) {
          const end = pts[N]
          // A little stretch beyond the rope's length, then it resists.
          const reach = seg * N * 1.35
          const ax = targetX - anchor.x
          const ay = targetY - anchor.y
          const ad = Math.hypot(ax, ay)
          const s = ad > reach ? reach / ad : 1
          end.x = anchor.x + ax * s
          end.y = anchor.y + ay * s
        }
      }
      // The card follows the rope's direction, but has its own momentum.
      const end = pts[N]
      const prev = pts[N - 2]
      const aim = Math.atan2(-(end.x - prev.x), end.y - prev.y)
      const vx = end.x - end.px
      spin += (aim - angle) * 0.075 + vx * -0.0012
      spin *= 0.86
      angle += spin
    }

    const render = () => {
      const end = pts[N]
      let d = `M${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`
      for (let i = 1; i < N; i++) {
        const mx = (pts[i].x + pts[i + 1].x) / 2
        const my = (pts[i].y + pts[i + 1].y) / 2
        d += `Q${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`
      }
      d += `L${end.x.toFixed(1)} ${end.y.toFixed(1)}`
      strap.current?.setAttribute('d', d)
      cardEl.style.transform = `translate3d(${(end.x - cardW / 2).toFixed(2)}px, ${end.y.toFixed(2)}px, 0) rotate(${angle.toFixed(4)}rad)`
      if (!dragging && !finePointer()) {
        tiltTY = clamp((end.x - end.px) * 2.2, -22, 22)
        tiltTX = clamp((end.y - end.py) * -1.4, -12, 12)
      }
      tiltX += (tiltTX - tiltX) * 0.1
      tiltY += (tiltTY - tiltY) * 0.1
      flip += ((flipRef.current ? 180 : 0) - flip) * 0.13
      if (inner.current) {
        inner.current.style.transform = `rotateY(${(flip + tiltY).toFixed(2)}deg) rotateX(${tiltX.toFixed(2)}deg)`
      }
    }

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      if (!visible) return
      if (!dropped) {
        if (!readyRef.current) return
        dropped = true
      }
      const dt = Math.min(0.05, last ? (now - last) / 1000 : DT)
      last = now
      accum += dt
      let guard = 0
      while (accum >= DT && guard++ < 4) {
        step()
        accum -= DT
      }
      render()
    }
    raf = requestAnimationFrame(tick)

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      last = 0
    })
    io.observe(host)

    const local = (e: PointerEvent) => {
      const r = host.getBoundingClientRect()
      return { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const down = (e: PointerEvent) => {
      if (e.button) return
      // Links on the back of the card should still be links.
      if ((e.target as Element).closest('a')) return
      dragging = true
      moved = 0
      downAt = performance.now()
      const p = local(e)
      grabDX = p.x - pts[N].x
      grabDY = p.y - pts[N].y
      targetX = pts[N].x
      targetY = pts[N].y
      cardEl.setPointerCapture(e.pointerId)
      cardEl.style.cursor = 'grabbing'
      haptic(6)
    }
    const move = (e: PointerEvent) => {
      if (finePointer()) {
        const r = cardEl.getBoundingClientRect()
        if (dragging || (e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom)) {
          tiltTY = clamp(((e.clientX - r.left) / r.width - 0.5) * 34, -20, 20)
          tiltTX = clamp(((e.clientY - r.top) / r.height - 0.5) * -24, -14, 14)
        }
      }
      if (!dragging) return
      const p = local(e)
      const nx = p.x - grabDX
      const ny = p.y - grabDY
      moved += Math.abs(nx - targetX) + Math.abs(ny - targetY)
      targetX = nx
      targetY = ny
    }
    const up = () => {
      if (!dragging) return
      dragging = false
      cardEl.style.cursor = ''
      tiltTX = tiltTY = 0
      const end = pts[N]
      // Cap the throw so a flick can't launch it through the ceiling.
      const vx = clamp(end.x - end.px, -46, 46)
      const vy = clamp(end.y - end.py, -46, 46)
      end.px = end.x - vx
      end.py = end.y - vy
      const speed = Math.hypot(vx, vy)
      if (moved < 7 && performance.now() - downAt < 350) {
        setFlipped((f) => !f)
      } else if (speed > 22) {
        award('thrown', 'You threw my badge', "Rude. It's on a lanyard, so it came back. +1 respect.")
      }
    }
    const leave = () => {
      if (!dragging) tiltTX = tiltTY = 0
    }
    cardEl.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    cardEl.addEventListener('pointerleave', leave)

    let resizeW = W
    const ro = new ResizeObserver(() => {
      // Mobile browsers change height as the URL bar hides; only re-hang on real width changes.
      if (host.clientWidth === resizeW) return
      resizeW = host.clientWidth
      place(false)
    })
    ro.observe(host)

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      cardEl.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
      cardEl.removeEventListener('pointerleave', leave)
    }
  }, [])

  return (
    <div ref={root} className="absolute inset-0 z-20 pointer-events-none overflow-visible">
      <svg className="absolute inset-0 w-full h-full overflow-visible" aria-hidden>
        <path id="strap" ref={strap} fill="none" stroke="#140a02" strokeWidth="24" strokeLinejoin="round" />
        <text fill="#f2eee6" className="pixel" fontSize="12" letterSpacing="1" dy="4">
          <textPath href="#strap">{STRAP_TEXT}</textPath>
        </text>
      </svg>

      <div
        ref={card}
        className="absolute top-0 left-0 w-[166px] h-[252px] lg:w-[264px] lg:h-[400px] pointer-events-auto select-none touch-none cursor-grab"
        style={{ transformOrigin: '50% 0', perspective: 1100, willChange: 'transform', transform: 'translateY(-120vh)' }}
        role="group"
        aria-label={`${me.name}'s badge. Drag to swing it, or tap to flip it over.`}
      >
        {/* metal clip */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-[10px] w-[34px] h-[18px] rounded-[3px] z-10" style={{ background: 'linear-gradient(180deg,#3a2a1c,#140a02)' }} aria-hidden />
        <div ref={inner} className="relative w-full h-full" style={{ transformStyle: 'preserve-3d' }}>
          <BadgeFront stamps={stamps} />
          <BadgeBack stamps={stamps.length} />
        </div>
        <button
          onClick={() => setFlipped((f) => !f)}
          className="sr-only"
          aria-label={flipped ? 'Show the front of the badge' : 'Flip the badge to see links'}
        />
      </div>
    </div>
  )
}

function Stamps({ stamps }: { stamps: string[] }) {
  return (
    <div className="flex gap-[3px]" aria-label={`${stamps.length} of ${chapters.length} checkpoints stamped`}>
      {chapters.map((c) => (
        <span
          key={c.id}
          className="block w-[6px] h-[6px] lg:w-[8px] lg:h-[8px] border border-current transition-colors duration-500"
          style={{ background: stamps.includes(c.id) ? 'currentColor' : 'transparent' }}
        />
      ))}
    </div>
  )
}

function BadgeFront({ stamps }: { stamps: string[] }) {
  return (
    <div
      className="absolute inset-0 rounded-[14px] overflow-hidden flex flex-col text-ink"
      style={{ background: '#fbf9f4', backfaceVisibility: 'hidden', boxShadow: '0 22px 50px -10px rgba(40,20,0,.45)' }}
    >
      <div className="flex justify-between items-center px-3 pt-2.5 pb-2 lg:px-4 lg:pt-3.5 text-[9px] lg:text-[10px] font-mono tracking-wider">
        <span>BADGE 001</span>
        <span className="w-[30px] h-[7px] rounded-full bg-[#f2eee6] border border-ink/70" aria-hidden />
        <span>FALL 26</span>
      </div>
      <div className="relative flex-1 mx-3 lg:mx-4 overflow-hidden bg-ink" style={{ minHeight: 0 }}>
        {me.photos.badge ? (
          <img src={asset(me.photos.badge)} alt={`Portrait of ${me.first}`} draggable={false} className="absolute inset-0 w-full h-full object-cover object-top pointer-events-none" />
        ) : (
          <div className="absolute inset-0 grid place-items-center pixel text-[#f2eee6] text-[64px] lg:text-[104px] leading-none" aria-hidden>
            BO
          </div>
        )}
      </div>
      <div className="px-3 pt-2 pb-2.5 lg:px-4 lg:pt-3 lg:pb-3.5">
        <div className="pixel text-[20px] lg:text-[32px] leading-[0.95]">BROWNSON</div>
        <div className="pixel text-[20px] lg:text-[32px] leading-[0.95]">OMOTOYE</div>
        <div className="flex items-end justify-between mt-1.5 lg:mt-2.5">
          <div className="text-[9px] lg:text-[10px] font-mono leading-tight">
            Software engineer
            <br />
            <span className="opacity-60">Tap to flip</span>
          </div>
          <Stamps stamps={stamps} />
        </div>
      </div>
    </div>
  )
}

function BadgeBack({ stamps }: { stamps: number }) {
  const links = [
    ['LinkedIn', me.linkedin],
    ['GitHub', me.github],
    ['Email', `mailto:${me.email}`],
  ]
  return (
    <div
      className="absolute inset-0 rounded-[14px] overflow-hidden flex flex-col p-3 lg:p-4 bg-ink text-cream"
      style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden', boxShadow: '0 22px 50px -10px rgba(40,20,0,.45)' }}
    >
      <div className="flex justify-between text-[9px] lg:text-[10px] font-mono tracking-wider opacity-70">
        <span>SCAN ME</span>
        <span>{stamps}/{chapters.length} STAMPS</span>
      </div>
      <div className="bg-cream text-ink p-2 lg:p-2.5 mt-2 lg:mt-3 rounded-[4px]">
        <QR text={me.site} className="w-full block" />
      </div>
      <ul className="mt-auto list-none m-0 p-0">
        {links.map(([label, href]) => (
          <li key={label} className="hair-t">
            <a
              href={href}
              target={href.startsWith('http') ? '_blank' : undefined}
              rel="noreferrer"
              className="flex justify-between items-center py-[5px] lg:py-2 text-[11px] lg:text-xs font-mono no-underline pointer-events-auto"
            >
              {label}
              <ArrowUR />
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
