import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { me } from '../data/content'
import { lockScroll, unlockScroll } from '../lib/scroll'
import { setOverlay, setSound, useApp } from '../lib/state'
import { haptic, persist, store } from '../lib/util'
import { play as sfx, unlockAudio } from './audio'
import { Engine, type Stats } from './engine'
import type { Gate, GateId, Zone } from './level'
import { CHECKPOINTS, CHECKPOINT_COUNT } from './checkpoints'

type Screen = 'title' | 'play' | 'gate' | 'end'
export type Best = { rank: string; commits: number; time: number } | null

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

export function rankFor(commits: number) {
  if (commits >= 80) return { title: 'Hire me immediately', note: 'You now know more about me than most of my teachers.' }
  if (commits >= 60) return { title: 'Senior Visitor', note: 'Very thorough. You would be great at code review.' }
  if (commits >= 35) return { title: 'Full-time Visitor', note: 'Solid run. You read the signs, I can tell.' }
  if (commits >= 15) return { title: 'Co-op Visitor', note: 'Good start. Same place I am at, honestly.' }
  return { title: 'Intern Visitor', note: 'Everybody starts somewhere. I started with linked lists.' }
}

export default function Game() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const engine = useRef<Engine | null>(null)
  const [screen, setScreen] = useState<Screen>('title')
  const screenRef = useRef(screen)
  screenRef.current = screen
  const [stats, setStats] = useState<Stats>({ commits: 0, bugs: 0, reverts: 0, time: 0 })
  const [zone, setZone] = useState<Zone | null>(null)
  const [sign, setSign] = useState<string | null>(null)
  const [gate, setGate] = useState<GateId | null>(null)
  const gateNumber = useRef(0)
  const gateOpenedAt = useRef(0)
  const [revert, setRevert] = useState(0)
  const [zoneFlash, setZoneFlash] = useState(0)
  const [clock, setClock] = useState(0)
  const sound = useApp((s) => s.sound)
  const soundRef = useRef(sound)
  soundRef.current = sound

  useEffect(() => {
    lockScroll()
    const e = new Engine(canvas.current!, {
      onGate: (g: Gate) => {
        e.paused = true
        gateNumber.current += 1
        gateOpenedAt.current = performance.now()
        setGate(g.id)
        setScreen('gate')
        setSign(null)
        haptic(16)
      },
      onSign: setSign,
      onStats: (s) => setStats({ ...s }),
      onZone: (z) => {
        setZone(z)
        setZoneFlash((n) => n + 1)
      },
      onFinish: () => {
        // Hold on the door for a moment before the results.
        if (soundRef.current) sfx('win')
        haptic([20, 40, 20, 40, 60])
        setSign(null)
        window.setTimeout(() => setScreen('end'), 1500)
      },
      onRevert: () => {
        setRevert((n) => n + 1)
        haptic(30)
      },
      sfx: (s) => soundRef.current && sfx(s),
    })
    engine.current = e
    if (import.meta.env.DEV) (window as unknown as { __game: unknown }).__game = { engine: e, setScreen, setGate }
    e.paused = true
    e.start()

    const ro = new ResizeObserver(() => {
      e.resize()
    })
    ro.observe(canvas.current!)

    const key = (down: boolean) => (ev: KeyboardEvent) => {
      if (screenRef.current !== 'play') return
      const k = ev.key.toLowerCase()
      const map: Record<string, keyof Engine['input']> = {
        arrowleft: 'left', a: 'left', arrowright: 'right', d: 'right', arrowup: 'jump', w: 'jump', ' ': 'jump',
      }
      if (map[k]) {
        ev.preventDefault()
        e.input[map[k]] = down
      }
    }
    const kd = key(true)
    const ku = key(false)
    addEventListener('keydown', kd)
    addEventListener('keyup', ku)

    const tick = setInterval(() => setClock(e.stats.time), 500)
    return () => {
      e.stop()
      ro.disconnect()
      removeEventListener('keydown', kd)
      removeEventListener('keyup', ku)
      clearInterval(tick)
      unlockScroll()
      engine.current = null
    }
  }, [])

  const close = useCallback(() => setOverlay({ game: false }), [])

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    addEventListener('keydown', onEsc)
    return () => removeEventListener('keydown', onEsc)
  }, [close])

  const begin = () => {
    unlockAudio()
    const e = engine.current!
    e.reset()
    setStats({ commits: 0, bugs: 0, reverts: 0, time: 0 })
    gateNumber.current = 0
    setSign(null)
    e.paused = false
    setScreen('play')
    if (soundRef.current) sfx('gate')
  }

  const resume = useCallback(() => {
    // A short guard, so a jump pressed just as you reach the gate doesn't skip the summary.
    if (performance.now() - gateOpenedAt.current < 350) return
    engine.current!.paused = false
    setScreen('play')
  }, [])

  useEffect(() => {
    if (screen !== 'gate') return
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || (e.key !== 'Enter' && e.key !== ' ')) return
      e.preventDefault()
      resume()
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [screen, resume])

  // best run
  const best = store<Best>('bo.best', null)
  const rank = rankFor(stats.commits)
  useEffect(() => {
    if (screen !== 'end') return
    const prev = store<Best>('bo.best', null)
    if (!prev || stats.commits > prev.commits) {
      persist('bo.best', { rank: rank.title, commits: stats.commits, time: stats.time })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen])

  const hold = (k: keyof Engine['input']) => ({
    onPointerDown: (ev: React.PointerEvent) => {
      ev.preventDefault()
      // Set the input first: a failed capture should never cost the player a jump.
      if (engine.current) engine.current.input[k] = true
      try {
        ;(ev.currentTarget as HTMLElement).setPointerCapture(ev.pointerId)
      } catch {
        /* the button still works without capture */
      }
      haptic(4)
    },
    onPointerUp: () => {
      if (engine.current) engine.current.input[k] = false
    },
    onPointerCancel: () => {
      if (engine.current) engine.current.input[k] = false
    },
    onContextMenu: (ev: React.MouseEvent) => ev.preventDefault(),
  })

  const point = gate ? CHECKPOINTS[gate] : null

  return (
    <motion.div
      className="fixed inset-0 z-[85] flex flex-col select-none"
      style={{ background: '#0a0705', color: '#f2eee6', touchAction: 'none', height: '100dvh' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      data-lenis-prevent
      role="dialog"
      aria-modal="true"
      aria-label="A game about Brownson's last two years"
    >
      {/* HUD */}
      <div className="relative z-20 flex items-center justify-between gap-2 px-3 h-12 shrink-0 mono" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex items-center gap-1.5 tabular-nums" aria-label={`${stats.commits} commits`}>
            <span className="w-2.5 h-2.5 inline-block" style={{ background: '#39d353', boxShadow: 'inset 0 0 0 1px #0e4429' }} />
            {stats.commits}
          </span>
          <span className="tabular-nums opacity-60 hidden xs:inline">{fmt(clock)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => { unlockAudio(); setSound(!sound) }} className="h-9 px-2.5 border border-white/25 bg-transparent text-inherit mono rounded-[3px]" aria-pressed={sound} aria-label={sound ? 'Turn sound off' : 'Turn sound on'}>
            {sound ? '♪ On' : '♪ Off'}
          </button>
          <button onClick={close} className="h-9 px-2.5 border border-white/25 bg-transparent text-inherit mono rounded-[3px]" aria-label="Exit the game">
            Exit ✕
          </button>
        </div>
      </div>

      {/* The screen */}
      <div className="relative flex-1 min-h-0 mx-2 lg:mx-auto lg:w-[min(100%-2rem,calc((100dvh-3.5rem)*1.78))] overflow-hidden rounded-[6px]">
        <canvas ref={canvas} className="absolute inset-0 w-full h-full" style={{ imageRendering: 'pixelated' }} aria-label="Game screen" />

        {/* zone title */}
        <AnimatePresence>
          {screen === 'play' && zone && (
            <motion.div
              key={zoneFlash}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: [0, 1, 1, 0], y: 0 }}
              transition={{ duration: 3, times: [0, 0.1, 0.8, 1] }}
              className="absolute top-3 inset-x-0 text-center pointer-events-none"
              style={{ color: zone.fill === '#15103a' || zone.fill === '#0a2a24' ? '#fff' : zone.fill }}
            >
              <div className="pixel text-2xl lg:text-4xl leading-none">{zone.name}</div>
              <div className="mono mt-1.5">{zone.when}</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* signs */}
        <AnimatePresence>
          {screen === 'play' && sign && (
            <motion.div
              key={sign}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.18 }}
              className="absolute top-16 lg:top-auto lg:bottom-4 left-3 right-3 lg:left-1/2 lg:right-auto lg:-translate-x-1/2 lg:w-[min(560px,90%)] p-3 lg:p-3.5 pointer-events-none"
              style={{ background: '#fbf9f4', color: '#140a02', boxShadow: '0 0 0 2px #140a02, 4px 4px 0 0 rgba(20,10,2,.6)' }}
            >
              <p className="m-0 font-mono text-[13px] lg:text-sm leading-snug">{sign}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* git revert */}
        <AnimatePresence>
          {revert > 0 && screen === 'play' && (
            <motion.div
              key={revert}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: [0, 1, 1, 0], scale: 1 }}
              transition={{ duration: 1.6, times: [0, 0.1, 0.75, 1] }}
              className="absolute top-1/3 inset-x-0 text-center pointer-events-none"
            >
              <span className="inline-block font-mono text-sm px-3 py-1.5" style={{ background: '#140a02', color: '#39d353' }}>$ git revert HEAD</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* title screen */}
        {screen === 'title' && (
          <Dialog bg="rgba(10,7,5,.72)">
            <div className="text-center max-w-[460px]">
              <div className="mono opacity-70">A game about my last two years</div>
              <h2 className="pixel text-[clamp(2.75rem,10vw,5.5rem)] leading-[0.92] mt-3 mb-0" style={{ color: '#ff7a45' }}>Side Quest</h2>
              <p className="mt-4 mb-0 leading-snug">Run through my real timeline. Every scan point tells you about something I built. Takes about two minutes.</p>
              <div className="flex flex-wrap justify-center gap-2 mt-5">
                <button className="btn !bg-[#ff7a45] !text-ink !border-[#ff7a45] !min-h-12 !px-6 !text-base" onClick={begin} autoFocus>▶ Start</button>
              </div>
              <div className="mono opacity-70 mt-4 leading-relaxed">
                <span className="hidden lg:inline">← → to move · Space to jump</span>
                <span className="lg:hidden">Buttons below the screen</span>
                {best && <div>Your best: {best.rank}, {best.commits} commits</div>}
              </div>
            </div>
          </Dialog>
        )}

        {/* a scan point: what I built here */}
        {screen === 'gate' && point && (
          <Dialog bg={point.bg} fg={point.fg}>
            <div className="max-w-[560px] w-full">
              <div className="mono opacity-70">
                Scan point {gateNumber.current} of {CHECKPOINT_COUNT}
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {point.chips.map((c) => (
                  <span key={c} className="chip">
                    {c}
                  </span>
                ))}
              </div>
              <h2 className="pixel text-[clamp(2.25rem,8vw,4rem)] leading-none mt-3 mb-0">{point.title}</h2>
              <ul className="list-none m-0 p-0 mt-4 space-y-2.5 text-[1.0625rem] leading-snug">
                {point.bullets.map((b) => (
                  <li key={b} className="flex gap-2.5">
                    <span className="sq mt-[7px]" aria-hidden />
                    {b}
                  </li>
                ))}
              </ul>
              <button className="btn mt-5 !min-h-12 !px-6" style={{ background: point.fg, color: point.bg, borderColor: point.fg }} onClick={resume} autoFocus>
                Keep going →
              </button>
            </div>
          </Dialog>
        )}

        {/* the end */}
        {screen === 'end' && (
          <Dialog bg="#f2eee6" fg="#140a02">
            <div className="max-w-[480px] w-full">
              <div className="mono opacity-70">You caught up to the present</div>
              <h2 className="pixel text-[clamp(2.25rem,8vw,4rem)] leading-[0.95] mt-2 mb-0">{rank.title}</h2>
              <p className="text-lg leading-snug mt-3 mb-0">{rank.note}</p>
              <dl className="grid grid-cols-3 gap-2 mt-5 mono">
                {([['Commits', stats.commits], ['Bugs', stats.bugs], ['Time', fmt(stats.time)]] as const).map(([k, v]) => (
                  <div key={k} className="border-2 border-current p-2">
                    <dt className="opacity-60 text-[10px]">{k}</dt>
                    <dd className="m-0 pixel text-xl leading-tight">{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 mb-3 leading-snug">The next level hasn&rsquo;t been built yet. It might have your company in it.</p>
              <div className="flex flex-wrap gap-2">
                <a
                  className="btn !bg-ink !text-cream !border-ink !min-h-12 no-underline"
                  href={`mailto:${me.email}?subject=${encodeURIComponent(`I got "${rank.title}" in your game`)}&body=${encodeURIComponent(`Hey Brownson,\n\nI just finished Side Quest: ${stats.commits} commits in ${fmt(stats.time)}.\n\n`)}`}
                >
                  Tell me your score
                </a>
                <button className="btn btn-ghost !text-ink !border-ink !min-h-12" onClick={begin}>Play again</button>
                <button className="btn btn-ghost !text-ink !border-ink !min-h-12" onClick={close}>Back to the site</button>
              </div>
            </div>
          </Dialog>
        )}
      </div>

      {/* Touch controls. Hidden on devices with a real keyboard and mouse. */}
      <div className={`touch-controls relative z-20 shrink-0 flex items-center justify-between gap-3 px-3 pt-2.5 transition-opacity duration-200 ${screen === 'play' ? '' : 'opacity-25 pointer-events-none'}`} style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}>
        <div className="flex gap-2">
          <PadButton label="Move left" {...hold('left')}>◀</PadButton>
          <PadButton label="Move right" {...hold('right')}>▶</PadButton>
        </div>
        <PadButton label="Jump" jump {...hold('jump')}>JUMP</PadButton>
      </div>
      <style>{`
        @media (hover: hover) and (pointer: fine) { .touch-controls { display: none; } }
        @media (max-height: 480px) and (orientation: landscape) {
          .touch-controls { position: absolute; inset: auto 0 0 0; background: transparent; pointer-events: none; padding-bottom: 10px; }
          .touch-controls button { pointer-events: auto; opacity: .6; }
        }
      `}</style>
    </motion.div>
  )
}

function Dialog({ children, bg, fg, fill }: { children: React.ReactNode; bg: string; fg?: string; fill?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.16 }}
      className={`absolute inset-0 z-10 overflow-y-auto p-4 lg:p-8 ${fill ? '' : 'flex items-center justify-center'}`}
      style={{ background: bg, color: fg, ['--fg' as string]: fg ?? '#f2eee6', ['--bg' as string]: bg, touchAction: 'pan-y' }}
    >
      {fill ? <div className="h-full max-w-[720px] mx-auto lg:[&_.mono]:text-sm">{children}</div> : children}
    </motion.div>
  )
}

function PadButton({ children, label, jump, ...rest }: { children: React.ReactNode; label: string; jump?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      aria-label={label}
      className={`${jump ? 'w-[92px] rounded-full pixel text-lg' : 'w-[72px] rounded-[14px] text-xl'} h-[72px] border-2 flex items-center justify-center active:scale-95 transition-transform`}
      style={{
        background: jump ? '#ff7a45' : 'rgba(255,255,255,.08)',
        color: jump ? '#140a02' : '#f2eee6',
        borderColor: jump ? '#ff7a45' : 'rgba(255,255,255,.28)',
        touchAction: 'none',
        WebkitTouchCallout: 'none',
      }}
      {...rest}
    >
      {children}
    </button>
  )
}
