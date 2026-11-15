import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { reducedMotion } from '../lib/util'

/** The site's one entrance animation: a short fade as something scrolls into view. */
export function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const still = reducedMotion()
  return (
    <motion.div
      className={className}
      initial={still ? false : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-8% 0px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

export function ArrowUR({ className = 'w-3 h-3' }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M2.5 9.5 9.5 2.5M4 2.5h5.5V8" />
    </svg>
  )
}

/** Section opener: index number and label. */
export function ChapterTag({ n, label }: { n: string; label: string }) {
  return (
    <div className="flex items-center gap-2.5 label">
      <span className="sq" />
      {n} // {label}
    </div>
  )
}
