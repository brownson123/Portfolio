import type { Sfx } from './engine'

// Every sound is synthesised, so there are no audio files to download.
let ctx: AudioContext | null = null

function tone(freq: number, dur: number, type: OscillatorType, vol: number, slide = 0, delay = 0) {
  if (!ctx) return
  const t = ctx.currentTime + delay
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, t)
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur)
  g.gain.setValueAtTime(vol, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g).connect(ctx.destination)
  o.start(t)
  o.stop(t + dur)
}

export function unlockAudio() {
  try {
    ctx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    void ctx.resume()
  } catch {
    ctx = null
  }
}

export function play(s: Sfx | 'win') {
  if (!ctx) return
  switch (s) {
    case 'jump':
      return tone(320, 0.14, 'square', 0.035, 380)
    case 'commit':
      return tone(880, 0.07, 'square', 0.03), tone(1320, 0.09, 'square', 0.03, 0, 0.05)
    case 'stomp':
      return tone(180, 0.12, 'square', 0.06, -120)
    case 'hurt':
      return tone(220, 0.26, 'sawtooth', 0.05, -160)
    case 'revert':
      return tone(520, 0.35, 'triangle', 0.06, -420)
    case 'gate':
      return tone(660, 0.1, 'square', 0.04), tone(990, 0.16, 'square', 0.04, 0, 0.1)
    case 'boost':
      return tone(420, 0.25, 'square', 0.04, 900)
    case 'win':
      ;[523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.2, 'square', 0.04, 0, i * 0.11))
  }
}
