import { AnimatePresence, motion } from 'motion/react'
import { useEffect } from 'react'
import { chapters, me } from '../data/content'
import { scrollToId } from '../lib/scroll'
import { setOverlay, useApp, useOverlay } from '../lib/state'

// ------------------------------------------------------------ top bar
export function Header() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 pointer-events-none">
      <div className="flex items-center justify-between px-5 lg:px-6 h-14 mono">
        <button
          onClick={() => scrollToId('door')}
          className="pointer-events-auto flex items-center gap-2 border-0 h-9 px-2.5 -ml-2.5 text-current mono rounded-full"
          style={{ background: 'var(--bg)' }}
          aria-label="Back to the top"
        >
          <span className="pixel text-base leading-none">BO</span>
          <span className="hidden sm:inline opacity-70">{me.name}</span>
        </button>
        <button onClick={() => scrollToId('talk')} className="pointer-events-auto btn !min-h-9 !px-3.5 hidden sm:inline-flex">
          Let&rsquo;s talk
        </button>
      </div>
    </header>
  )
}

// ------------------------------------------------------------ desktop side rail
export function Rail() {
  const chapter = useApp((s) => s.chapter)
  return (
    <nav
      aria-label="Checkpoints"
      className={`fixed left-0 top-1/2 -translate-y-1/2 z-40 hidden lg:block w-[var(--rail)] pl-6 pr-4 transition-opacity duration-500 ${
        chapter === 'door' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <ul className="m-0 p-0 list-none">
        {chapters.map((c) => {
          const on = chapter === c.id
          return (
            <li key={c.id}>
              <button
                onClick={() => scrollToId(c.id)}
                aria-current={on ? 'true' : undefined}
                className={`w-full flex items-center justify-between bg-transparent border-0 py-[5px] px-0 text-current mono transition-opacity duration-300 ${
                  on ? 'opacity-100' : 'opacity-50 hover:opacity-100'
                }`}
              >
                <span>{c.label}</span>
                <span className="block w-[7px] h-[7px] border-[1.5px] border-current" style={{ background: on ? 'currentColor' : 'transparent' }} />
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

// ------------------------------------------------------------ mobile dock
export function Dock() {
  const chapter = useApp((s) => s.chapter)
  const { menu } = useOverlay()
  const current = chapters.find((c) => c.id === chapter)!
  const close = () => setOverlay({ menu: false })

  useEffect(() => {
    if (!menu) return
    const onScroll = () => close()
    window.addEventListener('scroll', onScroll, { passive: true, once: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [menu])

  return (
    <div className="fixed inset-x-0 z-50 flex justify-center lg:hidden pointer-events-none" style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 14px)' }}>
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 420, damping: 36 }}
        className="pointer-events-auto overflow-hidden"
        style={{ background: 'var(--fg)', color: 'var(--bg)', borderRadius: menu ? 18 : 999, boxShadow: '0 10px 30px rgba(0,0,0,.25)' }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {menu ? (
            <motion.nav key="open" aria-label="Checkpoints" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-[min(86vw,320px)] p-2">
              <ul className="m-0 p-0 list-none grid grid-cols-2 gap-1">
                {chapters.map((c) => (
                  <li key={c.id}>
                    <button
                      onClick={() => {
                        close()
                        scrollToId(c.id)
                      }}
                      className="w-full flex items-center gap-2 px-3 min-h-11 border-0 rounded-xl mono text-left"
                      style={{ background: chapter === c.id ? 'color-mix(in srgb, var(--bg) 16%, transparent)' : 'transparent', color: 'inherit' }}
                    >
                      <span className="opacity-50">{c.n}</span>
                      {c.label}
                    </button>
                  </li>
                ))}
              </ul>
            </motion.nav>
          ) : (
            <motion.button
              key="closed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOverlay({ menu: true })}
              aria-expanded={false}
              aria-label={`Open the menu. You are at ${current.label}.`}
              className="flex items-center gap-2.5 h-11 px-4 bg-transparent border-0 mono"
              style={{ color: 'inherit' }}
            >
              <span className="opacity-60">{current.n}</span>
              {current.label}
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

// ------------------------------------------------------------ toasts
export function Toasts() {
  const t = useApp((s) => s.toast)
  return (
    <div className="fixed z-[80] left-1/2 -translate-x-1/2 lg:left-6 lg:translate-x-0 lg:bottom-6 top-16 lg:top-auto pointer-events-none w-[min(88vw,340px)]" role="status" aria-live="polite">
      <AnimatePresence>
        {t && (
          <motion.div
            key={t.id}
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="p-3.5"
            style={{ background: 'var(--fg)', color: 'var(--bg)' }}
          >
            <div className="pixel text-sm leading-none mb-1.5">{t.title}</div>
            <div className="mono opacity-80">{t.body}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
