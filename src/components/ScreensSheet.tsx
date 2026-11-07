import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { projects, type Shot } from '../data/content'
import { lockScroll, unlockScroll } from '../lib/scroll'
import { setOverlay, useOverlay } from '../lib/state'
import { asset } from '../lib/util'

// A plain viewer for a project's screenshots.
export function ScreensSheet() {
  const { sheet } = useOverlay()
  const project = projects.find((p) => p.id === sheet) ?? null
  const close = () => setOverlay({ sheet: null })

  useEffect(() => {
    if (!project) return
    lockScroll()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    addEventListener('keydown', onKey)
    return () => {
      unlockScroll()
      removeEventListener('keydown', onKey)
    }
  }, [project])

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          key={project.id}
          role="dialog"
          aria-modal="true"
          aria-label={`${project.title} screens`}
          data-lenis-prevent
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[70] overflow-y-auto overscroll-contain"
          style={{ background: project.bg, color: project.fg, ['--fg' as string]: project.fg, ['--bg' as string]: project.bg }}
        >
          <div className="flex justify-between items-center px-5 lg:px-8 h-14 mono">
            <span>{project.title}</span>
            <CloseButton onClose={close} />
          </div>
          <div className="px-5 lg:px-8 pb-12 max-w-[1320px] mx-auto">
            <Gallery shots={project.shots ?? []} title={project.title} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function CloseButton({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    ref.current?.focus({ preventScroll: true })
    return () => prev?.focus?.({ preventScroll: true })
  }, [])
  return (
    <button ref={ref} onClick={onClose} className="btn !min-h-9 !px-3.5" aria-label="Close the screens">
      Close ✕
    </button>
  )
}

function Gallery({ shots, title }: { shots: Shot[]; title: string }) {
  const strip = useRef<HTMLDivElement>(null)
  const [i, setI] = useState(0)
  const step = () => (strip.current?.firstElementChild?.getBoundingClientRect().width ?? 1) + 12

  const onScroll = () => setI(Math.round(strip.current!.scrollLeft / step()))
  const go = (d: number) => strip.current!.scrollTo({ left: (i + d) * step(), behavior: 'smooth' })

  return (
    <div>
      <div ref={strip} onScroll={onScroll} className="no-bar flex gap-3 overflow-x-auto snap-x snap-mandatory -mx-5 px-5 lg:mx-0 lg:px-0 pb-2" tabIndex={0} aria-label={`${title} screenshots`}>
        {shots.map((s) => (
          <figure key={s.src} className="m-0 snap-start shrink-0 w-[92%] lg:w-[80%]">
            <div className="rounded-md overflow-hidden bg-black/10">
              <img src={asset(s.src)} alt={s.caption} loading="lazy" className="block w-full h-auto max-h-[74vh] object-contain" />
            </div>
            <figcaption className="mono mt-2 opacity-75">{s.caption}</figcaption>
          </figure>
        ))}
      </div>
      <div className="flex justify-between items-center mt-4">
        <span className="mono opacity-70">
          {Math.min(i + 1, shots.length)} / {shots.length}
        </span>
        <div className="flex gap-1.5">
          <button onClick={() => go(-1)} disabled={i === 0} className="btn btn-ghost !min-h-10 !w-12 !p-0 disabled:opacity-30" aria-label="Previous screenshot">
            ←
          </button>
          <button onClick={() => go(1)} disabled={i >= shots.length - 1} className="btn btn-ghost !min-h-10 !w-12 !p-0 disabled:opacity-30" aria-label="Next screenshot">
            →
          </button>
        </div>
      </div>
    </div>
  )
}
