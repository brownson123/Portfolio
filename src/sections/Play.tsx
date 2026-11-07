import { useEffect, useRef, useState } from 'react'
import { ChapterTag, Reveal } from '../components/ui'
import type { Engine } from '../game/engine'
import { setOverlay, useOverlay } from '../lib/state'
import { finePointer, reducedMotion, store } from '../lib/util'

type Best = { rank: string; commits: number; time: number } | null

export function Play() {
  const { game } = useOverlay()
  const screen = useRef<HTMLCanvasElement>(null)
  const engine = useRef<Engine | null>(null)
  const [best, setBest] = useState<Best>(null)

  useEffect(() => setBest(store<Best>('bo.best', null)), [game])

  // A still frame from the game. On desktop it plays itself while you hover over it, and only then.
  useEffect(() => {
    if (game || !screen.current) return
    let dead = false
    let ro: ResizeObserver | null = null
    import('../game/engine').then(({ Engine }) => {
      if (dead || !screen.current) return
      const e = new Engine(screen.current, {}, { demo: true })
      e.still()
      engine.current = e
      ro = new ResizeObserver(() => {
        e.resize()
        if (!e.running) e.still()
      })
      ro.observe(screen.current)
    })
    return () => {
      dead = true
      ro?.disconnect()
      engine.current?.stop()
      engine.current = null
    }
  }, [game])

  const start = () => setOverlay({ game: true })
  const demo = (on: boolean) => {
    if (!finePointer() || reducedMotion() || !engine.current) return
    if (on) engine.current.start()
    else engine.current.stop()
  }

  return (
    <section id="play" data-chapter="play" className="chapter pt-24 lg:pt-36 pb-24 lg:pb-36 overflow-hidden">
      <ChapterTag n="06" label="Play" />
      <div className="grid lg:grid-cols-12 gap-10 mt-6 items-center">
        <div className="lg:col-span-5">
          <Reveal>
            <h2 className="title text-[clamp(3.25rem,7vw,7.5rem)] leading-[0.9] m-0">Or just play my life.</h2>
            <p className="text-lg leading-snug mt-6 mb-0 max-w-[28rem]">A small game I built along my real timeline. Each scan point tells you about a project. It takes about two minutes.</p>
            <div className="flex flex-wrap items-center gap-3 mt-7">
              <button className="btn !min-h-14 !px-7 !text-base" onClick={start}>
                ▶ Start the game
              </button>
              {best && <span className="mono opacity-80">Your best: {best.rank}, {best.commits} commits</span>}
            </div>
          </Reveal>
        </div>

        <div className="lg:col-span-7 min-w-0">
          <Reveal>
            <button
              onClick={start}
              onPointerEnter={() => demo(true)}
              onPointerLeave={() => demo(false)}
              aria-label="Start the game"
              className="block w-full max-w-[640px] mx-auto border-0 p-2.5 lg:p-3 rounded-[14px]"
              style={{ background: '#140a02' }}
            >
              <div className="relative aspect-[16/10] rounded-[6px] overflow-hidden bg-[#8ecbff]">
                <canvas ref={screen} className="absolute inset-0 w-full h-full" style={{ imageRendering: 'pixelated' }} aria-hidden />
              </div>
            </button>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
