import { motion, useScroll, useTransform } from 'motion/react'
import { useEffect, useRef, type ReactNode } from 'react'
import { RoleToy, ThemeToy, TravelToy } from '../components/toys'
import { ArrowUR, ChapterTag, Reveal } from '../components/ui'
import { me, moreBuilds, projects, type Build, type Project } from '../data/content'
import { setOverlay } from '../lib/state'
import { reducedMotion } from '../lib/util'

const TOYS: Record<string, ReactNode> = {
  medicare: <RoleToy />,
  budget: <ThemeToy />,
  travel: <TravelToy />,
}

/** Award, event and date, as a row of chips. */
function Chips({ build }: { build: Build }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {build.award && (
        <span className="chip font-medium" style={{ background: 'var(--fg)', color: 'var(--bg)', borderColor: 'var(--fg)' }}>
          ★ {build.award}
        </span>
      )}
      {build.chips.map((c) => (
        <span key={c} className="chip">
          {c}
        </span>
      ))}
    </div>
  )
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="list-none m-0 p-0 space-y-2">
      {items.map((b) => (
        <li key={b} className="flex gap-2.5 leading-snug">
          <span className="sq mt-[7px]" aria-hidden />
          <span>{b}</span>
        </li>
      ))}
    </ul>
  )
}

/** Learn more, source code and screens. Private repos get a way to ask for access. */
function Links({ build, solid }: { build: Build; solid?: boolean }) {
  const code = build.privateCode ? `mailto:${me.email}?subject=${encodeURIComponent(`Code access: ${build.title}`)}` : null
  const links = build.links ?? []
  return (
    <div className="flex flex-wrap gap-2">
      {build.play && (
        <button onClick={() => setOverlay({ game: true })} className="btn">
          ▶ Play it
        </button>
      )}
      {links.map((l, i) => (
        <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className={`btn no-underline ${solid && i === 0 && !build.play ? '' : 'btn-ghost'}`}>
          {l.label}
          <ArrowUR />
        </a>
      ))}
      {build.shots?.length ? (
        <button onClick={() => setOverlay({ sheet: build.id })} className={`btn ${solid && !links.length ? '' : 'btn-ghost'}`}>
          See the screens
        </button>
      ) : null}
      {code && (
        <a href={code} className={`btn no-underline ${solid && !links.length && !build.shots?.length ? '' : 'btn-ghost'}`}>
          Code on request
        </a>
      )}
    </div>
  )
}

function ProjectCard({ project, index, total }: { project: Project; index: number; total: number }) {
  const shell = useRef<HTMLElement>(null)
  // Tall cards on phones stick by their bottom edge, so you can read the whole thing first.
  useEffect(() => {
    const el = shell.current!
    const fit = () => {
      el.style.top = `${Math.min(0, innerHeight - el.offsetHeight)}px`
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    addEventListener('resize', fit)
    return () => {
      ro.disconnect()
      removeEventListener('resize', fit)
    }
  }, [])

  // As the next card slides over, this one settles back.
  const { scrollYProgress } = useScroll({ target: shell, offset: ['end end', 'end start'] })
  const scale = useTransform(scrollYProgress, [0, 1], reducedMotion() || index === total - 1 ? [1, 1] : [1, 0.95])

  return (
    <motion.article
      ref={shell}
      data-chapter="builds"
      data-bg={project.bg}
      data-fg={project.fg}
      data-accent={project.accent}
      className="sticky top-0 min-h-[100svh] rounded-t-[22px] lg:rounded-t-[30px] overflow-hidden origin-top will-change-transform"
      style={{ background: project.bg, color: project.fg, scale, ['--fg' as string]: project.fg, ['--bg' as string]: project.bg, ['--accent' as string]: project.accent }}
    >
      <div className="chapter pt-20 lg:pt-24 pb-24 lg:pb-16 min-h-[100svh] grid lg:grid-cols-12 gap-8 lg:gap-10 items-center">
        <div className="lg:col-span-5">
          <Chips build={project} />
          <h3 className="m-0 mt-5 display text-[clamp(3rem,6vw,6rem)]">{project.title}</h3>
          <div className="mt-5">
            <Bullets items={project.bullets} />
          </div>
          {project.credits && <p className="mono mt-4 mb-0 opacity-70">{project.credits}</p>}
          <div className="mt-6">
            <Links build={project} solid />
          </div>
        </div>
        <div className="lg:col-span-7 min-w-0">{TOYS[project.id]}</div>
      </div>
    </motion.article>
  )
}

// Projects with screens get the big cards; the rest sit together under Also built.
const big = projects.filter((p) => p.shots?.length)
const small: Build[] = [...projects.filter((p) => !p.shots?.length), ...moreBuilds]

export function Builds() {
  return (
    <section id="builds" data-chapter="builds">
      <div className="chapter pt-24 lg:pt-36 pb-16 lg:pb-24">
        <ChapterTag n="03" label="Builds" />
        <Reveal>
          <h2 className="title text-[clamp(3rem,8.4vw,8.5rem)] leading-[0.92] mt-6 mb-0 max-w-[14ch]">Things I&rsquo;ve built, and you can poke them.</h2>
        </Reveal>
      </div>

      <div className="relative">
        {big.map((p, i) => (
          <ProjectCard key={p.id} project={p} index={i} total={big.length} />
        ))}
      </div>

      <div
        className="relative z-10 rounded-t-[22px] lg:rounded-t-[30px] -mt-5"
        style={{ background: '#140a02', color: '#f2eee6', ['--fg' as string]: '#f2eee6', ['--bg' as string]: '#140a02' }}
        data-chapter="builds"
        data-bg="#140a02"
        data-fg="#f2eee6"
        data-accent="#ff7a45"
      >
        <div className="chapter pt-20 lg:pt-28 pb-20 lg:pb-28">
          <h3 className="title text-[clamp(2.25rem,4.4vw,4.25rem)] m-0">Also built</h3>
          <div className="grid md:grid-cols-2 gap-3 mt-8">
            {small.map((b) => (
              <Reveal key={b.id} className="md:last:odd:col-span-2">
                <article className="panel h-full p-5 flex flex-col">
                  <Chips build={b} />
                  <h4 className="m-0 mt-4 title text-3xl">{b.title}</h4>
                  <div className="mt-4 mb-5 text-[0.9375rem]">
                    <Bullets items={b.bullets} />
                  </div>
                  {b.credits && <p className="mono mt-0 mb-4 opacity-70">{b.credits}</p>}
                  <div className="mt-auto">
                    <Links build={b} />
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
