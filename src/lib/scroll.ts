import Lenis from 'lenis'
import { reducedMotion } from './util'

let lenis: Lenis | null = null
let locks = 0

export function initScroll() {
  if (lenis || reducedMotion()) return () => {}
  lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 })
  let raf = 0
  const loop = (t: number) => {
    lenis?.raf(t)
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)
  return () => {
    cancelAnimationFrame(raf)
    lenis?.destroy()
    lenis = null
  }
}

export function scrollToId(id: string, immediate = false) {
  const el = document.getElementById(id)
  if (!el) return
  if (lenis) lenis.scrollTo(el, { immediate, duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4) })
  else el.scrollIntoView({ behavior: immediate || reducedMotion() ? 'auto' : 'smooth' })
}

export function lockScroll() {
  if (locks++ === 0) {
    lenis?.stop()
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
  }
}
export function unlockScroll() {
  locks = Math.max(0, locks - 1)
  if (locks === 0) {
    lenis?.start()
    document.documentElement.style.overflow = ''
    document.body.style.overflow = ''
  }
}
