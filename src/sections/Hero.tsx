import { motion } from 'motion/react'
import { Lanyard } from '../components/Lanyard'
import { Wordmark } from '../components/Wordmark'
import { hero, me } from '../data/content'
import { scrollToId } from '../lib/scroll'
import { setOverlay } from '../lib/state'

const STACKED = ['BROWN', 'SON']

export function Hero({ ready }: { ready: boolean }) {
  const up = (delay: number) => ({
    initial: { opacity: 0, y: 12 },
    animate: ready ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
  })
  return (
    <section id="door" data-chapter="door" className="relative overflow-hidden flex flex-col" style={{ minHeight: '100svh' }}>
      <Lanyard ready={ready} />

      <div className="relative z-30 flex-1 flex flex-col px-5 lg:px-6 pt-16 lg:pt-20 pb-[72px] lg:pb-6 pointer-events-none">
        <div className="max-w-[640px] pointer-events-auto lg:mt-4 mt-[252px] sm:mt-0">
          <motion.h1 {...up(0.05)} className="title text-[clamp(1.625rem,3.6vw,3.25rem)] m-0 sm:max-w-[62%] lg:max-w-none">
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

        <div className="flex-1 min-h-4" />

        <div className="relative pointer-events-auto">
          <motion.div {...up(0.3)} className="flex justify-between items-end mb-2.5 lg:mb-3.5">
            <div className="pixel text-[clamp(1.5rem,5vw,3.25rem)] leading-none">{me.last.toUpperCase()}</div>
            <div className="mono text-right">{me.status}</div>
          </motion.div>
          <Wordmark stacked={STACKED} single="BROWNSON" ready={ready} maxHeight={0.56} />
        </div>
      </div>
    </section>
  )
}
