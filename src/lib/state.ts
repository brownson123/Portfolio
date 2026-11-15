import { useSyncExternalStore } from 'react'
import type { ChapterId } from '../data/content'
import { persist, store } from './util'

// One tiny shared store: the section on screen and whether the game's sound is on.
type State = {
  chapter: ChapterId
  sound: boolean
}

let state: State = {
  chapter: 'door',
  sound: store<boolean>('bo.sound', false),
}
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())
const set = (patch: Partial<State>) => {
  state = { ...state, ...patch }
  emit()
}

export const useApp = <T,>(pick: (s: State) => T): T =>
  useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => pick(state),
  )
export const getApp = () => state

export function setChapter(id: ChapterId) {
  if (state.chapter !== id) set({ chapter: id })
}

export function setSound(on: boolean) {
  persist('bo.sound', on)
  set({ sound: on })
}

/** Re-colours the whole page. Project cards call this too, so the rail always matches. */
export function applyTheme(bg: string, fg: string, accent: string) {
  const r = document.documentElement.style
  r.setProperty('--bg', bg)
  r.setProperty('--fg', fg)
  r.setProperty('--accent', accent)
  document.querySelector('meta[name=theme-color]')?.setAttribute('content', bg)
}

// ------------------------------------------------------------ overlays
type Overlay = { sheet: string | null; game: boolean; menu: boolean }
let overlay: Overlay = { sheet: null, game: false, menu: false }
const overlayListeners = new Set<() => void>()
export const useOverlay = () =>
  useSyncExternalStore(
    (l) => {
      overlayListeners.add(l)
      return () => overlayListeners.delete(l)
    },
    () => overlay,
  )
export function setOverlay(patch: Partial<Overlay>) {
  overlay = { ...overlay, ...patch }
  overlayListeners.forEach((l) => l())
}
