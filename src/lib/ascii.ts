// A small WebGL2 ASCII renderer, used for the bouquets in the Lab.
//
// It runs in two passes:
//   1. "compute" draws the scene into a tiny texture, one texel per character cell
//      (rgb = colour, a = brightness). Each scene supplies its own fragment shader.
//   2. "draw" stamps a glyph into every cell, picking from a brightness-sorted atlas.
//
// Because the per-cell work happens at grid resolution and not screen resolution,
// tens of thousands of animated characters stay smooth on a phone.

// Same glyph buckets as Brownson's Python bouquets, thin to dense.
const BUCKETS = [' ', ".'`", ':;,-~', '!/\\|()[]{}<>?+=', 'tfjrxnuvczil', 'XYUJCLQ0OZmwqpdbkhao', '#MW&8%B', '@$']
const LEVELS = [0.06, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9]

const VERT = /* glsl */ `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  vUv.y = 1.0 - vUv.y;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`

const DRAW_FS = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 frag;
uniform sampler2D uComp;
uniform sampler2D uAtlas;
uniform vec2 uGrid;
uniform vec2 uAtlasGrid;
uniform float uTime;
uniform float uGlow;
uniform float uShimmer;
uniform float uCounts[8];
uniform float uLevels[7];

float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

void main() {
  vec2 g = vUv * uGrid;
  vec2 cell = floor(g);
  vec2 f = fract(g);
  vec4 c = texelFetch(uComp, ivec2(cell), 0);
  float L = c.a;
  int b = 0;
  for (int i = 0; i < 7; i++) if (L >= uLevels[i]) b = i + 1;
  float cov = 0.0;
  if (b > 0) {
    float n = uCounts[b];
    float tick = uShimmer > 0.0 ? floor(uTime * uShimmer + hash(cell) * 8.0) : 0.0;
    float idx = floor(hash(cell + tick * 0.37) * n);
    vec2 auv = (vec2(idx, float(b)) + f) / uAtlasGrid;
    cov = texture(uAtlas, auv).r;
  }
  vec3 col = c.rgb * (0.62 + 0.55 * L);
  // soft glow: the compute texture read back smoothly, so bright regions bleed a little
  vec4 blur = textureLod(uComp, vUv, 0.0);
  vec3 glow = blur.rgb * blur.a * blur.a * uGlow;
  vec3 rgb = col * cov + glow;
  float a = clamp(max(cov, length(glow) * 1.4), 0.0, 1.0);

  frag = vec4(rgb * a, a);
}`

export type Uniforms = Record<string, number | number[]>

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!
  gl.shaderSource(s, src)
  gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'shader error')
  return s
}

function program(gl: WebGL2RenderingContext, fs: string) {
  const p = gl.createProgram()!
  gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, VERT))
  gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, fs))
  gl.bindAttribLocation(p, 0, 'aPos')
  gl.linkProgram(p)
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? 'link error')
  return p
}

function buildAtlas(gl: WebGL2RenderingContext) {
  const cw = 28
  const ch = 46
  const cols = Math.max(...BUCKETS.map((b) => b.length))
  const rows = BUCKETS.length
  const c = document.createElement('canvas')
  c.width = cols * cw
  c.height = rows * ch
  const x = c.getContext('2d')!
  x.fillStyle = '#000'
  x.fillRect(0, 0, c.width, c.height)
  x.fillStyle = '#fff'
  x.font = `500 ${ch * 0.74}px "Geist Mono", ui-monospace, Menlo, monospace`
  x.textAlign = 'center'
  x.textBaseline = 'middle'
  BUCKETS.forEach((row, r) => {
    row.split('').forEach((g, i) => x.fillText(g, i * cw + cw / 2, r * ch + ch / 2 + 1))
  })
  const t = gl.createTexture()!
  gl.bindTexture(gl.TEXTURE_2D, t)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, gl.RED, gl.UNSIGNED_BYTE, c)
  gl.generateMipmap(gl.TEXTURE_2D)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  return { tex: t, grid: [cols, rows] as const, counts: BUCKETS.map((b) => b.length) }
}

export function imageTexture(gl: WebGL2RenderingContext, img: TexImageSource, filter: number) {
  const t = gl.createTexture()!
  gl.bindTexture(gl.TEXTURE_2D, t)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, img)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  return t
}

export function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image()
    i.onload = () => resolve(i)
    i.onerror = reject
    i.src = src
  })
}

export class AsciiEngine {
  gl: WebGL2RenderingContext
  private compute: WebGLProgram
  private draw: WebGLProgram
  private atlas: ReturnType<typeof buildAtlas>
  private fbo: WebGLFramebuffer
  private compTex: WebGLTexture
  private vao: WebGLVertexArrayObject
  private locs = new Map<string, WebGLUniformLocation | null>()
  private textures: { name: string; tex: WebGLTexture }[] = []
  cols = 1
  rows = 1

  constructor(
    private canvas: HTMLCanvasElement,
    computeFS: string,
  ) {
    const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false, powerPreference: 'low-power' })
    if (!gl) throw new Error('webgl2 unavailable')
    this.gl = gl
    this.compute = program(gl, computeFS)
    this.draw = program(gl, DRAW_FS)
    this.atlas = buildAtlas(gl)
    this.vao = gl.createVertexArray()!
    gl.bindVertexArray(this.vao)
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
    this.fbo = gl.createFramebuffer()!
    this.compTex = gl.createTexture()!
  }

  setSceneTexture(name: string, tex: WebGLTexture) {
    this.textures = this.textures.filter((t) => t.name !== name)
    this.textures.push({ name, tex })
  }

  /** Size the canvas and work out how many character cells fit. */
  resize(cssW: number, cssH: number, cellW: number, dpr: number, maxCols = 400) {
    const gl = this.gl
    this.canvas.width = Math.round(cssW * dpr)
    this.canvas.height = Math.round(cssH * dpr)
    this.cols = Math.min(maxCols, Math.max(8, Math.floor(cssW / cellW)))
    const cellH = (cssW / this.cols) * (46 / 28)
    this.rows = Math.max(8, Math.round(cssH / cellH))
    gl.bindTexture(gl.TEXTURE_2D, this.compTex)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, this.cols, this.rows, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.compTex, 0)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  }

  private loc(p: WebGLProgram, name: string, tag: string) {
    const key = `${tag}:${name}`
    if (!this.locs.has(key)) this.locs.set(key, this.gl.getUniformLocation(p, name))
    return this.locs.get(key) ?? null
  }

  private set(p: WebGLProgram, tag: string, u: Uniforms) {
    const gl = this.gl
    for (const [k, v] of Object.entries(u)) {
      const l = this.loc(p, k, tag)
      if (l === null) continue
      if (typeof v === 'number') gl.uniform1f(l, v)
      else if (k === 'uFlower') gl.uniform4fv(l, v)
      else if (v.length === 2) gl.uniform2fv(l, v)
      else if (v.length === 3) gl.uniform3fv(l, v)
      else if (v.length === 4) gl.uniform4fv(l, v)
      else gl.uniform1fv(l, v)
    }
  }

  render(time: number, scene: Uniforms, opts: { glow?: number; shimmer?: number } = {}) {
    const gl = this.gl
    gl.bindVertexArray(this.vao)
    gl.disable(gl.BLEND)

    // pass 1: one texel per cell
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo)
    gl.viewport(0, 0, this.cols, this.rows)
    gl.useProgram(this.compute)
    this.textures.forEach((t, i) => {
      gl.activeTexture(gl.TEXTURE0 + i)
      gl.bindTexture(gl.TEXTURE_2D, t.tex)
      gl.uniform1i(this.loc(this.compute, t.name, 'c'), i)
    })
    this.set(this.compute, 'c', { uTime: time, uGrid: [this.cols, this.rows], ...scene })
    gl.drawArrays(gl.TRIANGLES, 0, 3)

    // pass 2: stamp glyphs to the screen
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.viewport(0, 0, this.canvas.width, this.canvas.height)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.useProgram(this.draw)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, this.compTex)
    gl.uniform1i(this.loc(this.draw, 'uComp', 'd'), 0)
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, this.atlas.tex)
    gl.uniform1i(this.loc(this.draw, 'uAtlas', 'd'), 1)
    gl.uniform1fv(this.loc(this.draw, 'uCounts', 'd'), this.atlas.counts)
    gl.uniform1fv(this.loc(this.draw, 'uLevels', 'd'), LEVELS)
    this.set(this.draw, 'd', {
      uGrid: [this.cols, this.rows],
      uAtlasGrid: [this.atlas.grid[0], this.atlas.grid[1]],
      uTime: time,
      uGlow: opts.glow ?? 0,
      uShimmer: opts.shimmer ?? 0,
    })
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }

  /** Frees what this engine made. The canvas keeps its context, so it can be reused. */
  destroy() {
    const gl = this.gl
    gl.deleteProgram(this.compute)
    gl.deleteProgram(this.draw)
    gl.deleteTexture(this.atlas.tex)
    gl.deleteTexture(this.compTex)
    gl.deleteFramebuffer(this.fbo)
    gl.deleteVertexArray(this.vao)
    this.textures.forEach((t) => gl.deleteTexture(t.tex))
  }
}

export const hasWebGL2 = () => {
  try {
    return !!document.createElement('canvas').getContext('webgl2')
  } catch {
    return false
  }
}
