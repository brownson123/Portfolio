import { AnimatePresence } from 'motion/react'
import { lazy, Suspense, useEffect, useState } from 'react'
import { Dock, Header, Rail, Toasts } from './components/Chrome'
import { Preloader } from './components/Preloader'
import { chapters, type ChapterId } from './data/content'
import { initScroll } from './lib/scroll'
import { applyTheme, setChapter, setOverlay, useOverlay } from './lib/state'
import { ScreensSheet } from './components/ScreensSheet'
import { Builds } from './sections/Builds'
import { Hello } from './sections/Hello'
import { Hero } from './sections/Hero'
import { Lab } from './sections/Lab'
import { Play } from './sections/Play'
import { Stack } from './sections/Stack'
import { Talk } from './sections/Talk'
import { Work } from './sections/Work'

// The game is the heaviest thing on the page, so it only loads when someone asks for it.
const Game = lazy(() => import('./game/Game'))

/** Whatever element sits on the middle of the screen decides the page's colours. */
function useChapterColours() {
  useEffect(() => {
    const live = new Set<HTMLElement>()
    const apply = () => {
      const els = [...live].sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1))
      const el = els[els.length - 1]
      if (!el) return
      const id = (el.dataset.chapter ?? 'door') as ChapterId
      const base = chapters.find((c) => c.id === id)!
      applyTheme(el.dataset.bg ?? base.bg, el.dataset.fg ?? base.fg, el.dataset.accent ?? base.accent)
      setChapter(id)
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => (e.isIntersecting ? live.add(e.target as HTMLElement) : live.delete(e.target as HTMLElement)))
        apply()
      },
      { rootMargin: '-50% 0px -50% 0px' },
    )
    const watch = () => document.querySelectorAll('[data-chapter]').forEach((n) => io.observe(n))
    watch()
    const mo = new MutationObserver(watch)
    mo.observe(document.querySelector('main')!, { childList: true, subtree: true })
    return () => {
      io.disconnect()
      mo.disconnect()
    }
  }, [])
}

export default function App() {
  const [ready, setReady] = useState(false)
  useEffect(() => initScroll(), [])
  useChapterColours()
  const { game } = useOverlay()

  // Up, up, down, down... you know the rest.
  useEffect(() => {
    const code = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']
    let at = 0
    const on = (e: KeyboardEvent) => {
      at = e.key === code[at] ? at + 1 : e.key === code[0] ? 1 : 0
      if (at === code.length) {
        at = 0
        setOverlay({ game: true })
      }
    }
    addEventListener('keydown', on)
    return () => removeEventListener('keydown', on)
  }, [])

  useEffect(() => {
    console.log(
      '%cHey. Looking at the code? Say hi: omotoyebrownson@yahoo.com',
      'background:#140a02;color:#f2eee6;padding:6px 10px;font-family:monospace',
    )
  }, [])

  return (
    <>
      <a href="#hello" className="sr-only focus:not-sr-only focus:fixed focus:z-[100] focus:top-2 focus:left-2 btn">
        Skip to content
      </a>
      <Preloader onDone={() => setReady(true)} />
      <Header />
      <Rail />
      <Dock />
      <Toasts />
      <main>
        <Hero ready={ready} />
        <Hello />
        <Work />
        <Builds />
        <Stack />
        <Lab />
        <Play />
        <Talk />
      </main>
      <ScreensSheet />
      <AnimatePresence>
        {game && (
          <Suspense fallback={null} key="game">
            <Game />
          </Suspense>
        )}
      </AnimatePresence>
    </>
  )
}
