import { motion } from 'motion/react'
import { useRef, useState } from 'react'
import { asset, haptic } from '../lib/util'

// Little working demos, so visitors can feel what a project does instead of reading about it.

const EASE = [0.22, 1, 0.36, 1] as const

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
