import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { me } from '../data/content'
import { haptic, qrMatrix, reducedMotion } from '../lib/util'

// The door. A pass assembles itself, gets scanned, you are admitted.
// Short on purpose, and only once per visit.
const SEEN = 'bo.door'

export function Preloader({ onDone }: { onDone: () => void }) {
  const [show, setShow] = useState(() => {
    if (reducedMotion()) return false
    try {
      return !sessionStorage.getItem(SEEN)
    } catch {
      return true
    }
  })
  const [admitted, setAdmitted] = useState(false)
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!show) {
      onDone()
      return
    }
    try {
      sessionStorage.setItem(SEEN, '1')
    } catch {
      /* private mode */
    }
    const c = canvas.current!
    const ctx = c.getContext('2d')!
    const m = qrMatrix(me.site)
    const size = m.length
    const px = Math.floor((Math.min(innerWidth, innerHeight) * 0.42) / size) * (devicePixelRatio > 1 ? 2 : 1)
    c.width = c.height = px * size
    const delays = m.map((row) => row.map(() => Math.random() * 0.5))
    const start = performance.now()
    let raf = 0
    let flagged = false
    const tick = (now: number) => {
      const t = (now - start) / 1000
      ctx.clearRect(0, 0, c.width, c.height)
      ctx.fillStyle = '#140a02'
      m.forEach((row, y) =>
        row.forEach((on, x) => {
          if (!on) return
          const p = Math.min(1, Math.max(0, (t - delays[y][x]) / 0.16))
          if (p <= 0) return
          const s = px * p
          ctx.fillRect(x * px + (px - s) / 2, y * px + (px - s) / 2, s, s)
        }),
      )
      // scan line
      const sweep = (t - 0.62) / 0.42
      if (sweep > 0 && sweep < 1) {
        const y = sweep * c.height
        ctx.fillStyle = '#f2eee6'
        ctx.fillRect(0, y - px, c.width, px * 2)
      }
      if (t > 1.05 && !flagged) {
        flagged = true
        setAdmitted(true)
        haptic(12)
      }
      if (t > 1.5) {
        setShow(false)
        onDone()
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] grid place-items-center bg-[#f2eee6] text-ink"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45 }}
          aria-hidden
        >
          <motion.div
            className="flex flex-col items-center gap-5"
            exit={{ scale: 1.5, opacity: 0, filter: 'blur(14px)' }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <canvas ref={canvas} style={{ width: 'min(42vw, 42vh)', height: 'min(42vw, 42vh)', imageRendering: 'pixelated' }} />
            <div className="pixel text-xl h-7">{admitted ? 'ADMIT' : 'Scanning your pass…'}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
