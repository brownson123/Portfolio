import { motion } from 'motion/react'
import { BrowserFrame } from '../components/toys'
import { Wordmark } from '../components/Wordmark'
import { hero, me } from '../data/content'
import { scrollToId } from '../lib/scroll'
import { setOverlay } from '../lib/state'
import { asset } from '../lib/util'

const STACKED = ['BROWN', 'SON']

// A peek at the work, back to front. Each one lifts when you point at it.
const PEEK = [
  { src: 'projects/medicare/admin-overview.webp', alt: 'Medicare admin dashboard', at: 'left-[28%] top-0' },
  { src: 'projects/travel/home.webp', alt: 'Flutter Travel App home screen', at: 'left-[14%] top-[16.5%]' },
  { src: 'projects/budget/budgetbuddy1.webp', alt: 'Budget Buddy dashboard', at: 'left-0 top-[33%]' },
]

export function Hero() {
  const up = (delay: number) => ({
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
  })
  return (
    <section id="door" data-chapter="door" className="relative overflow-hidden flex flex-col" style={{ minHeight: '100svh' }}>
      <div className="relative z-30 flex-1 flex flex-col px-5 lg:px-6 pt-16 lg:pt-20 pb-[72px] lg:pb-6">
        <div className="flex flex-col lg:flex-row lg:justify-between gap-8">
          <div className="max-w-[640px] lg:mt-4">
            <motion.h1 {...up(0.05)} className="title text-[clamp(1.625rem,3.6vw,3.25rem)] m-0">
              {hero.line}
            </motion.h1>
            <motion.div {...up(0.15)} className="flex flex-wrap gap-2 mt-4 lg:mt-7">
              <button className="btn" onClick={() => scrollToId('builds')}>
                See the work
              </button>
              <button className="btn btn-ghost" onClick={() => setOverlay({ game: true })}>
                ▶ Play the game
              </button>
            </motion.div>
          </div>

          <motion.a
            {...up(0.25)}
            href="#builds"
            onClick={(e) => {
              e.preventDefault()
              scrollToId('builds')
            }}
            aria-label="See the work"
            className="relative block shrink-0 w-full max-w-[420px] lg:w-[min(40vw,540px)] lg:max-w-none aspect-[1.45]"
          >
            {PEEK.map((s) => (
              <BrowserFrame
                key={s.src}
                className={`absolute w-[72%] ${s.at} transition-transform duration-300 ease-out hover:-translate-y-2`}
              >
                <img src={asset(s.src)} alt={s.alt} className="block w-full aspect-[1.75] object-cover object-top" />
              </BrowserFrame>
            ))}
          </motion.a>
        </div>

        <div className="flex-1 min-h-8" />

        <div className="relative">
          <motion.div {...up(0.3)} className="flex justify-between items-end mb-2.5 lg:mb-3.5">
            <div className="title text-[clamp(1.5rem,5vw,3.25rem)] leading-none">{me.last.toUpperCase()}</div>
            <div className="mono text-right">{me.status}</div>
          </motion.div>
          <Wordmark stacked={STACKED} single="BROWNSON" ready maxHeight={0.56} />
        </div>
      </div>
    </section>
  )
}
