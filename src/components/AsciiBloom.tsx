import { useEffect, useRef, useState } from 'react'
import bouquets from '../data/bouquets.json'
import { AsciiEngine, hasWebGL2, imageTexture, loadImage } from '../lib/ascii'
import { asset, clamp, reducedMotion, whileVisible } from '../lib/util'

// Brownson's ASCII bouquets, originally a Python + pygame script, running in WebGL.
// Foliage grows up from the bottom edge, each flower swells open from its own centre,
// then the whole thing sways in the wind. Move across it and you are the wind.

type Key = keyof typeof bouquets
const KEYS = Object.keys(bouquets) as Key[]
const MAX_FLOWERS = 12

const SCENE_FS = /* glsl */ `#version 300 es
precision highp float;
precision highp sampler2D;
out vec4 frag;
uniform sampler2D uRgb;
uniform sampler2D uData;
uniform vec2 uGrid;   // cells on screen
uniform vec2 uScene;  // cells in the source art
uniform float uTime;
uniform float uGust;
uniform float uCount;
uniform vec4 uFlower[${MAX_FLOWERS}];   // cx, cy, r, tOpen
uniform float uKind[${MAX_FLOWERS}];

const float GROW = 2.6, OPEN = 1.6, WIND = 3.0, WAVE = 14.0, BREATH = 7.0, DEPTH = 0.035, TAU = 6.28318;
const vec3 BUD = vec3(0.45, 0.66, 0.32), GOLD = vec3(1.0, 0.8, 0.4);

float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
float backOut(float p) { float k = 1.3; float c = p - 1.0; return 1.0 + (k + 1.0) * c * c * c + k * c * c; }

vec3 rgbAt(vec2 c) { return texelFetch(uRgb, ivec2(c), 0).rgb; }
vec2 dataAt(vec2 c) { return texelFetch(uData, ivec2(c), 0).rg; }

void main() {
  float t = uTime;
  float H = uScene.y;
  float W = uScene.x;
  vec2 screen = floor(gl_FragCoord.xy);
  // scene coordinates for this screen cell
  float y = floor((screen.y + 0.5) * H / uGrid.y);
  float x0 = (screen.x + 0.5) * W / uGrid.x;

  // wind: each row slides sideways, more toward the top; stems stay anchored
  float h = clamp((H + 10.0 - (y + 0.5)) / (H * 0.93), 0.0, 1.0);
  float w = t - 0.4 * h;
  float amp = WIND * (0.5 + 0.5 * smoothstep(1.5, 5.0, t));
  float shift = 2.0 * amp * (0.6 * sin(TAU * 2.0 * w / WAVE) + 0.3 * sin(TAU * 3.0 * w / WAVE + 1.0) + 0.1 * sin(TAU * 5.0 * w / WAVE + 2.0)) * pow(h, 1.5);
  shift += uGust * pow(h, 1.5);
  float x = floor(x0 - shift);

  float lum = 0.0;
  vec3 col = vec3(0.0);
  bool valid = x >= 0.0 && x < W && y >= 0.0 && y < H;

  if (valid) {
    vec2 c = vec2(x, y);
    vec2 d = dataAt(c);
    float L = d.r;
    float kind = floor(d.g * 255.0 + 0.5);
    vec3 rgb = rgbAt(c);
    float rise = pow((H - y) / H, 0.85);
    float tCell = 0.2 + GROW * rise + 0.12 * sin(x * 0.09 + 1.3) + 0.18 * hash(c);
    float age = t - tCell;

    if (kind > 0.5 && kind < 2.5 && age > 0.0) {
      float tip = clamp(1.0 - age / 0.3, 0.0, 1.0);
      lum = L * clamp(age / 0.35, 0.0, 1.0) + 0.35 * tip;
      vec3 base = kind > 1.5 ? mix(BUD, rgb, smoothstep(0.1, 0.9, age)) : rgb;
      col = base + (1.0 - base) * 0.6 * tip;
    } else if (kind > 2.5 && age > 0.0) {
      lum = (0.07 + 0.2 * L) * clamp(age / 0.5, 0.0, 1.0);
      col = (rgb * 0.55 + BUD * 0.45) * 0.75;
    }

    // flowers swell open from their own centres, back to front
    for (int i = 0; i < int(uCount); i++) {
      vec4 f = uFlower[i];
      float p = (t - f.w) / OPEN;
      if (p <= 0.0) continue;
      p = min(p, 1.0);
      float s = 0.3 + 0.7 * backOut(p);
      float settle = smoothstep(f.w + OPEN, f.w + OPEN + 1.5, t);
      s *= 1.0 + DEPTH * settle * (0.5 - 0.5 * cos(TAU * (t - f.w) / BREATH + float(i) * 0.9));
      float sy = f.y + (y - f.y) / s;
      float sx = f.x + (x - f.x) / s;
      vec2 q = vec2(floor(sx + 0.5), floor(sy + 0.5));
      if (q.x < 0.0 || q.y < 0.0 || q.x >= W || q.y >= H) continue;
      if (length(vec2((sx - f.x) * 0.5, sy - f.y)) > f.z * 1.6) continue;
      vec2 fd = dataAt(q);
      if (abs(floor(fd.g * 255.0 + 0.5) - uKind[i]) > 0.5) continue;
      float reach = 0.2 + 1.3 * p + 0.35 * (hash(q + 3.1) - 0.5) * (1.0 - p);
      if (length(vec2((sx - f.x) * 0.5, sy - f.y)) / f.z >= reach) continue;
      float rp = smoothstep(0.05, 0.7, p);
      lum = fd.r * (0.6 + 0.4 * rp);
      col = mix(BUD, rgbAt(q), rp);
    }
  }

  // faint backdrop specks, and gold drifting up once it has finished blooming
  if (lum < 0.02) {
    float r2 = pow((x0 - W / 2.0) / (W * 0.55), 2.0) + pow((y - H * 0.5) / (H * 0.6), 2.0);
    float dots = step(hash(vec2(floor(x0), y) + 11.0), 0.18);
    lum = dots * 0.11 * exp(-r2 * 2.2);
    col = vec3(0.55, 0.62, 0.8);
    float done = 0.2 + GROW + 1.7;
    float pv = 0.5 * smoothstep(done, done + 2.0, t);
    if (pv > 0.0 && lum < 0.1) {
      float pat = hash(vec2(floor(x0), y + floor(t * 4.0)));
      if (pat < 0.002) {
        lum = pv * (0.7 + 0.3 * sin(hash(vec2(floor(x0), 7.0)) * TAU + t * 3.0));
        col = GOLD;
      }
    }
  }
  float fade = smoothstep(0.0, 0.3, t);
  frag = vec4(col, clamp(lum * fade, 0.0, 1.0));
}`

export function AsciiBloom() {
  const wrap = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const [which, setWhich] = useState<Key>('blue')
  const [broken] = useState(() => !hasWebGL2())
  const replay = useRef<() => void>(() => {})

  useEffect(() => {
    if (broken) return
    const el = wrap.current!
    const cv = canvas.current!
    let engine: AsciiEngine
    try {
      engine = new AsciiEngine(cv, SCENE_FS)
    } catch {
      return
    }
    const info = bouquets[which]
    let dead = false
    let stop = () => {}
    // ?bloomT=20 jumps ahead while developing, because headless browsers run slowly.
    const skip = import.meta.env.DEV ? Number(new URLSearchParams(location.search).get('bloomT') ?? 0) : 0
    let clock = reducedMotion() ? 20 : skip
    let started = reducedMotion() || skip > 0
    let gust = 0
    let gustV = 0
    let lastX: number | null = null
    let lastScroll = scrollY
    replay.current = () => {
      clock = 0
    }

    // Foliage starts rising when you arrive, so you always catch the bloom.
    const flowers = [...info.flowers].map((f, k) => {
      const tOpen = 0.2 + 2.6 * Math.pow((info.h - f[1]) / info.h, 0.85) + 0.25 + 0.06 * k
      return { cx: f[0], cy: f[1], r: f[2], tOpen, kind: 3 + k }
    })
    flowers.sort((a, b) => a.cy - b.cy)
    const fArr: number[] = []
    const kArr: number[] = []
    flowers.slice(0, MAX_FLOWERS).forEach((f) => {
      fArr.push(f.cx, f.cy, f.r, f.tOpen)
      kArr.push(f.kind)
    })
    while (fArr.length < MAX_FLOWERS * 4) fArr.push(0)
    while (kArr.length < MAX_FLOWERS) kArr.push(0)

    const place = () => {
      const w = el.clientWidth
      const h = el.clientHeight
      engine.resize(w, h, w < 520 ? 3.2 : 5.2, Math.min(devicePixelRatio || 1, 2), info.w)
    }

    const onMove = (e: PointerEvent) => {
      if (lastX !== null) gustV += clamp(e.clientX - lastX, -30, 30) * 0.05
      lastX = e.clientX
    }
    const onLeave = () => {
      lastX = null
    }
    el.addEventListener('pointermove', onMove, { passive: true })
    el.addEventListener('pointerleave', onLeave)

    Promise.all([
      loadImage(asset(`lab/${which}-rgb.webp`)),
      loadImage(asset(`lab/${which}-data.png`)),
      document.fonts.load('500 20px "Geist Mono"'),
    ])
      .then(([rgb, data]) => {
        if (dead) return
        const gl = engine.gl
        engine.setSceneTexture('uRgb', imageTexture(gl, rgb, gl.NEAREST))
        engine.setSceneTexture('uData', imageTexture(gl, data, gl.NEAREST))
        place()
        stop = whileVisible(
          el,
          (dt, t) => {
            if (!started) {
              const r = el.getBoundingClientRect()
              if (r.top < innerHeight * 0.72) started = true
            }
            if (started) clock += dt
            const sv = scrollY - lastScroll
            lastScroll = scrollY
            gustV += clamp(sv, -40, 40) * 0.012
            gustV *= 0.92
            gust = (gust + gustV) * 0.97
            engine.render(
              t,
              {
                uTime: clock,
                uScene: [info.w, info.h],
                uGust: clamp(gust, -18, 18),
                uCount: Math.min(flowers.length, MAX_FLOWERS),
                uFlower: fArr,
                uKind: kArr,
              },
              { glow: 0.28, shimmer: 3 },
            )
          },
          '5%',
        )
      })
      .catch(() => {})

    let lastW = 0
    const ro = new ResizeObserver(() => {
      if (el.clientWidth !== lastW && lastW !== 0) place()
      lastW = el.clientWidth
    })
    ro.observe(el)

    return () => {
      dead = true
      stop()
      ro.disconnect()
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
      engine.destroy()
    }
  }, [which, broken])

  if (broken) {
    return <p className="mono opacity-70">Your browser can&rsquo;t run WebGL2, so the flowers stayed home.</p>
  }

  return (
    <div>
      <div
        ref={wrap}
        className="relative mx-auto overflow-hidden touch-pan-y"
        style={{
          aspectRatio: `${bouquets[which].w * 0.6087} / ${bouquets[which].h}`,
          width: `min(100%, calc(84vh * ${(bouquets[which].w * 0.6087) / bouquets[which].h}))`,
        }}
      >
        <canvas
          ref={canvas}
          className="absolute inset-0 w-full h-full"
          role="img"
          aria-label={`${bouquets[which].title}: a bouquet drawn entirely in coloured text characters, growing and swaying.`}
          onClick={() => replay.current()}
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Choose a bouquet">
          {KEYS.map((k) => (
            <button
              key={k}
              role="tab"
              aria-selected={which === k}
              onClick={() => setWhich(k)}
              className="min-h-10 px-3 border font-mono text-xs rounded-[3px] transition-colors"
              style={{ borderColor: 'currentColor', background: which === k ? 'var(--fg)' : 'transparent', color: which === k ? 'var(--bg)' : 'inherit' }}
            >
              {bouquets[k].title}
            </button>
          ))}
        </div>
        <button onClick={() => replay.current()} className="btn btn-ghost !min-h-10">
          ↻ Regrow
        </button>
      </div>
    </div>
  )
}
