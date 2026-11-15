export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}

export const reducedMotion = () =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
export const finePointer = () =>
  typeof matchMedia !== 'undefined' && matchMedia('(hover: hover) and (pointer: fine)').matches
export const isDesktopWidth = () => typeof matchMedia !== 'undefined' && matchMedia('(min-width: 64rem)').matches

export function haptic(ms: number | number[] = 8) {
  try {
    if ((navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation?.hasBeenActive === false) return
    navigator.vibrate?.(ms)
  } catch {
    /* unsupported */
  }
}

export function store<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}
export function persist(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* private mode */
  }
}

export function asset(path: string) {
  return `${import.meta.env.BASE_URL}${path}`.replace(/^\.\//, './')
}

/** Runs `cb(dt, t)` on every animation frame while `el` is on screen. */
export function whileVisible(el: Element, cb: (dt: number, t: number) => void, margin = '10%') {
  let raf = 0
  let last = 0
  let start = 0
  const tick = (now: number) => {
    if (!start) start = now
    const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016)
    last = now
    cb(dt, (now - start) / 1000)
    raf = requestAnimationFrame(tick)
  }
  const io = new IntersectionObserver(
    ([e]) => {
      cancelAnimationFrame(raf)
      last = 0
      if (e.isIntersecting) raf = requestAnimationFrame(tick)
    },
    { rootMargin: margin },
  )
  io.observe(el)
  return () => {
    io.disconnect()
    cancelAnimationFrame(raf)
  }
}
