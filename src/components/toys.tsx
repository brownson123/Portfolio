import { AnimatePresence, motion } from 'motion/react'
import { useRef, useState } from 'react'
import { asset, haptic } from '../lib/util'
import { QR } from './ui'

// Little working demos, so visitors can feel what a project does instead of reading about it.

const EASE = [0.22, 1, 0.36, 1] as const

// ------------------------------------------------------------ Station: a scanner demo
type Pass = { id: string; name: string }
const PASSES: Pass[] = [
  { id: 'a', name: 'Alex R.' },
  { id: 'b', name: 'Sam T.' },
]

export function ScannerToy() {
  const [result, setResult] = useState<{ ok: boolean; big: string; small: string } | null>(null)
  const [hint, setHint] = useState(true)
  const seen = useRef<Record<string, boolean>>({})
  const timer = useRef(0)
  const finder = useRef<HTMLDivElement>(null)
  const justDragged = useRef(false)

  const scan = (p: Pass) => {
    setHint(false)
    window.clearTimeout(timer.current)
    const again = seen.current[p.id]
    seen.current[p.id] = true
    setResult({ ok: !again, big: again ? 'ALREADY IN' : 'ADMIT', small: p.name })
    haptic(again ? [30, 50, 30] : 18)
    timer.current = window.setTimeout(() => setResult(null), 1400)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-stretch justify-center">
      {/* phone */}
      <div
        className="relative w-[236px] h-[420px] rounded-[34px] p-[9px] shrink-0"
        style={{ background: '#0b1230', boxShadow: '0 0 0 1px rgba(255,255,255,.14), 0 40px 80px -30px rgba(52,211,153,.35)' }}
      >
        <div className="relative w-full h-full rounded-[26px] overflow-hidden flex flex-col" style={{ background: '#050a1f', color: '#eef2ff' }}>
          <div className="px-3.5 pt-3 pb-1 font-mono text-[10px] tracking-wider opacity-80">DEMO</div>
          <div ref={finder} className="relative flex-1 m-3 mt-1.5 rounded-lg overflow-hidden" style={{ background: 'radial-gradient(circle at 50% 40%, #16214f, #070c26)' }}>
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="absolute w-7 h-7 border-mint"
                style={{
                  top: i < 2 ? 22 : undefined,
                  bottom: i >= 2 ? 22 : undefined,
                  left: i % 2 === 0 ? 22 : undefined,
                  right: i % 2 === 1 ? 22 : undefined,
                  borderTopWidth: i < 2 ? 2 : 0,
                  borderBottomWidth: i >= 2 ? 2 : 0,
                  borderLeftWidth: i % 2 === 0 ? 2 : 0,
                  borderRightWidth: i % 2 === 1 ? 2 : 0,
                }}
                aria-hidden
              />
            ))}
            {hint && <div className="absolute inset-x-0 bottom-3 text-center font-mono text-[10px] opacity-70">Scan a pass</div>}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.16 }}
                  className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-3"
                  style={{ background: result.ok ? '#16a34a' : '#dc2626' }}
                  aria-live="assertive"
                >
                  <span className="pixel leading-none" style={{ fontSize: result.ok ? 44 : 28 }}>{result.big}</span>
                  <span className="font-mono text-[11px] mt-3">{result.small}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* passes */}
      <div className="flex sm:flex-col gap-2 w-full max-w-[220px] sm:w-[112px] justify-center sm:justify-start" aria-label="Passes to scan">
        <div className="hidden sm:block label opacity-70 mb-1 leading-snug">Drag or tap a pass</div>
        {PASSES.map((p) => (
          <motion.button
            key={p.id}
            drag
            dragSnapToOrigin
            dragMomentum={false}
            dragElastic={0.2}
            whileDrag={{ scale: 1.08, zIndex: 40, rotate: -3 }}
            whileTap={{ scale: 0.96 }}
            onDragStart={() => {
              justDragged.current = true
            }}
            onDragEnd={(_, info) => {
              window.setTimeout(() => {
                justDragged.current = false
              }, 60)
              const r = finder.current?.getBoundingClientRect()
              if (r && info.point.x > r.left && info.point.x < r.right && info.point.y - scrollY > r.top && info.point.y - scrollY < r.bottom) scan(p)
            }}
            onClick={() => {
              if (!justDragged.current) scan(p)
            }}
            className="relative flex-1 sm:flex-none p-2 rounded-md border-0 text-left touch-none"
            style={{ background: '#fbf9f4', color: '#140a02' }}
            aria-label={`Scan ${p.name}`}
          >
            <QR text={`DEMO PASS ${p.id}`} className="w-full block" />
            <div className="font-mono text-[10px] mt-1.5 truncate">{p.name}</div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

// ------------------------------------------------------------ Medicare: four logins
const ROLES = [
  { id: 'Admin', shot: 'admin-overview' },
  { id: 'Pharmacist', shot: 'pharmacist-dispense-history' },
  { id: 'Prescriber', shot: 'prescriber-write-rx' },
  { id: 'Patient', shot: 'patient-overview' },
]

export function BrowserFrame({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg overflow-hidden ${className}`} style={{ background: '#fff', boxShadow: '0 30px 70px -30px rgba(10,5,60,.55), 0 0 0 1px rgba(10,5,60,.12)' }}>
      <div className="h-7 flex items-center gap-1.5 px-3" style={{ background: '#eceaf6' }}>
        {[0, 1, 2].map((i) => (
          <span key={i} className="w-2 h-2 rounded-full bg-[#d8d4e8]" />
        ))}
      </div>
      {children}
    </div>
  )
}

/** A browser frame with tabs along the top. It only changes when you pick a tab. */
function ScreenTabs({ label, tabs, folder, aspect }: { label: string; tabs: { id: string; shot: string }[]; folder: string; aspect: string }) {
  const [active, setActive] = useState(0)
  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5 mb-3" role="tablist" aria-label={label}>
        <span className="label mr-1 opacity-70">{label}</span>
        {tabs.map((t, i) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={active === i}
            onClick={() => setActive(i)}
            className="min-h-9 px-3 border font-mono text-xs rounded-[3px] transition-colors"
            style={{ borderColor: 'currentColor', background: active === i ? 'var(--fg)' : 'transparent', color: active === i ? 'var(--bg)' : 'inherit' }}
          >
            {t.id}
          </button>
        ))}
      </div>
      <BrowserFrame>
        <div className={`relative overflow-hidden bg-[#f3f4f6] ${aspect}`}>
          {/* Every screen stays mounted, so switching tabs is instant. */}
          {tabs.map((t, i) => (
            <img
              key={t.id}
              src={asset(`projects/${folder}/${t.shot}.webp`)}
              alt={`${t.id} screen`}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-200"
              style={{ opacity: active === i ? 1 : 0 }}
            />
          ))}
        </div>
      </BrowserFrame>
    </div>
  )
}

export function RoleToy() {
  return <ScreenTabs label="Sign in as" tabs={ROLES} folder="medicare" aspect="aspect-[1.753]" />
}

// ------------------------------------------------------------ Budget Buddy: scorch your eyes
export function ThemeToy() {
  const [light, setLight] = useState(false)
  const btn = useRef<HTMLButtonElement>(null)
  const box = useRef<HTMLDivElement>(null)
  const [origin, setOrigin] = useState('90% 4%')

  const toggle = () => {
    const a = btn.current!.getBoundingClientRect()
    const b = box.current!.getBoundingClientRect()
    setOrigin(`${a.left + a.width / 2 - b.left}px ${a.top + a.height / 2 - b.top}px`)
    setLight((l) => !l)
    haptic(10)
  }

  return (
    <div className="relative pb-6 sm:pb-10 pr-[14%] sm:pr-[12%]">
      <BrowserFrame>
        <div ref={box} className="relative aspect-[1.08] sm:aspect-[1.25] overflow-hidden" style={{ background: '#141824' }}>
          <img src={asset('projects/budget/budgetbuddy1.webp')} alt="Budget Buddy dashboard in dark mode" loading="lazy" className="absolute inset-0 w-full object-cover object-top" />
          <motion.div
            className="absolute inset-0"
            initial={false}
            animate={{ clipPath: light ? `circle(150% at ${origin})` : `circle(0% at ${origin})` }}
            transition={{ duration: 0.7, ease: EASE }}
            style={{ background: '#f4f5f7' }}
          >
            <img src={asset('projects/budget/budgetbuddy6.webp')} alt="Budget Buddy dashboard in light mode" loading="lazy" className="absolute inset-0 w-full object-cover object-top" />
          </motion.div>
          <button
            ref={btn}
            onClick={toggle}
            aria-pressed={light}
            className="absolute right-3 top-[7%] min-h-10 px-3 rounded-full border-0 font-mono text-xs flex items-center gap-2"
            style={{ background: '#27c25c', color: '#04180b', boxShadow: '0 6px 18px rgba(0,0,0,.35)' }}
          >
            {light ? '☾ Dark mode' : '☀ Light mode'}
          </button>
        </div>
      </BrowserFrame>
      <div
        className="absolute right-0 bottom-0 w-[27%] rounded-[16px] p-[4px] overflow-hidden"
        style={{ background: '#0b0e16', boxShadow: '0 20px 40px -14px rgba(0,0,0,.6)' }}
      >
        <img src={asset('projects/budget/budgetbuddy7.webp')} alt="Budget Buddy on a phone" loading="lazy" className="block w-full rounded-[12px] aspect-[0.55] object-cover object-top" />
      </div>
    </div>
  )
}

// ------------------------------------------------------------ Flutter travel app
const TRAVEL = [
  { id: 'Browse', shot: 'home' },
  { id: 'Details', shot: 'details' },
  { id: 'Customize', shot: 'booking' },
]

export function TravelToy() {
  return <ScreenTabs label="Screens" tabs={TRAVEL} folder="travel" aspect="aspect-[1.78]" />
}
