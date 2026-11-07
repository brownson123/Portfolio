import { useEffect, useRef, useState } from 'react'
import { clamp, reducedMotion, whileVisible } from '../lib/util'

// A wordmark that always fills its container exactly, in a variable font whose
// letters behave like an accordion: the ones near your finger or cursor swell,
// and their neighbours squeeze to make room, so the line width never changes.

type Line = { text: string; base: number }
type Table = Record<string, number[]> // glyph -> width at font-size 100, sampled along the wdth axis

const WEIGHT = 900
const MIN = 50
const MAX = 150
const STEP = 10

function buildTable(chars: string): Table {
  const el = document.createElement('span')
  // 'pre' so a lone space gets measured at its real width, the same as it renders.
  el.style.cssText = `position:absolute;visibility:hidden;white-space:pre;font-family:var(--font-display);font-size:100px;left:-9999px;top:-9999px`
  document.body.appendChild(el)
  const table: Table = {}
  for (const c of new Set(chars)) {
    el.textContent = c
    table[c] = []
    for (let v = MIN; v <= MAX; v += STEP) {
      el.style.fontVariationSettings = `'wdth' ${v}, 'wght' ${WEIGHT}`
      table[c].push(el.getBoundingClientRect().width)
    }
  }
  el.remove()
  return table
}

function glyphWidth(table: Table, c: string, wdth: number) {
  const t = (clamp(wdth, MIN, MAX) - MIN) / STEP
  const i = Math.min(Math.floor(t), table[c].length - 2)
  return table[c][i] + (table[c][i + 1] - table[c][i]) * (t - i)
}

/**
 * Finds the width-axis values that make a line exactly `target` wide (at font-size 100),
 * given how much each letter should swell relative to the others.
 */
function fitLine(table: Table, text: string, swell: number[], target: number, out: number[]) {
  const n = text.length
  const mean = swell.reduce((a, b) => a + b, 0) / n
  const axis = (b: number, i: number) => clamp(b * (1 + AMOUNT * (swell[i] - mean)), MIN, MAX)
  let lo = MIN * 0.5
  let hi = MAX * 1.5
  for (let k = 0; k < 14; k++) {
    const mid = (lo + hi) / 2
    let w = 0
    for (let i = 0; i < n; i++) w += glyphWidth(table, text[i], axis(mid, i))
    if (w < target) lo = mid
    else hi = mid
  }
  const b = (lo + hi) / 2
  for (let i = 0; i < n; i++) out[i] = axis(b, i)
  return b
}

const AMOUNT = 0.9

export function Wordmark({
  stacked,
  single,
  ready,
  maxHeight = 0.6,
  className = '',
}: {
  stacked: string[]
  single: string
  ready: boolean
  maxHeight?: number
  className?: string
}) {
  const root = useRef<HTMLDivElement>(null)
  const [layout, setLayout] = useState<{ size: number; lines: Line[]; table: Table; target: number } | null>(null)
  const letters = useRef<{ el: HTMLSpanElement; line: number; cur: number }[]>([])

  useEffect(() => {
    let dead = false
    const compute = async () => {
      try {
        await document.fonts.load(`${WEIGHT} 100px 'Anybody Variable'`, 'BROWNSONLETSTALK')
      } catch {
        /* fall back to whatever is available */
      }
      if (dead || !root.current) return
      const w = root.current.clientWidth
      if (!w) return
      const narrow = w < 640
      const useStack = narrow && stacked.length > 1
      const rows = useStack ? stacked : [single]
      const table = buildTable(rows.join(''))
      const sum = (t: string, v: number) => t.split('').reduce((a, c) => a + glyphWidth(table, c, v), 0)
      let size: number
      if (useStack) {
        // The longest line sets the type size; the others stretch to match it.
        const longest = rows.reduce((a, b) => (b.length > a.length ? b : a))
        size = (w / sum(longest, 56)) * 100
      } else {
        // One line, as tall as we are allowed; the width axis fills the rest.
        size = Math.min((innerHeight * maxHeight) / 0.74, (w / sum(single, MIN)) * 100)
      }
      const target = (w / size) * 100 - 0.2
      const lines = rows.map((text) => {
        const out: number[] = []
        const base = fitLine(table, text, text.split('').map(() => 1), target, out)
        return { text, base }
      })
      setLayout({ size, lines, table, target })
    }
    compute()
    let lastW = root.current?.clientWidth ?? 0
    const ro = new ResizeObserver(() => {
      const nw = root.current?.clientWidth ?? 0
      if (nw !== lastW) {
        lastW = nw
        compute()
      }
    })
    if (root.current) ro.observe(root.current)
    return () => {
      dead = true
      ro.disconnect()
    }
  }, [stacked, single, maxHeight])

  useEffect(() => {
    if (!layout || !root.current || reducedMotion()) return
    let px = -1
    let lastMove = -10
    let now = 0
    const onMove = (e: PointerEvent) => {
      const r = root.current!.getBoundingClientRect()
      if (e.clientY < r.top - 260 || e.clientY > r.bottom + 120) return
      px = (e.clientX - r.left) / r.width
      lastMove = now
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    const swell: number[] = []
    const out: number[] = []

    const stop = whileVisible(root.current, (_dt, t) => {
      now = t
      // The letters only move while someone is moving near them. Otherwise they rest.
      const active = px >= 0 && t - lastMove < 1.6

      layout.lines.forEach((line, li) => {
        const row = letters.current.filter((l) => l.line === li)
        const n = row.length
        for (let i = 0; i < n; i++) swell[i] = active ? Math.exp(-Math.pow(((i + 0.5) / n - px) * 3.2, 2)) : 1
        swell.length = n
        fitLine(layout.table, line.text, swell, layout.target, out)
        row.forEach((l, i) => {
          if (Math.abs(out[i] - l.cur) < 0.03) return
          l.cur += (out[i] - l.cur) * 0.14
          l.el.style.fontVariationSettings = `'wdth' ${l.cur.toFixed(1)}, 'wght' ${WEIGHT}`
        })
      })
    })
    return () => {
      stop()
      window.removeEventListener('pointermove', onMove)
    }
  }, [layout])

  letters.current = []
  const text = layout ? layout.lines.map((l) => l.text).join(' ') : single
  return (
    <div ref={root} className={`wordmark ${className}`} aria-label={text} role="img">
      {layout?.lines.map((line, li) => (
        <div
          key={line.text}
          aria-hidden
          className="flex overflow-hidden"
          style={{ fontSize: layout.size, height: layout.size * 0.74, lineHeight: `${layout.size * 0.74}px` }}
        >
          {line.text.split('').map((c, i) => (
            <span
              key={i}
              ref={(el) => {
                if (el) letters.current.push({ el, line: li, cur: line.base })
              }}
              style={{
                whiteSpace: 'pre',
                fontVariationSettings: `'wdth' ${line.base}, 'wght' ${WEIGHT}`,
                transform: ready ? 'translateY(0)' : 'translateY(105%)',
                transition: `transform 900ms cubic-bezier(0.22, 1, 0.36, 1) ${li * 90 + i * 42}ms`,
              }}
            >
              {c}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}
