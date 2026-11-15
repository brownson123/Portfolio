import { SkillGraph } from '../components/SkillGraph'
import { ChapterTag, Reveal } from '../components/ui'
import { graph } from '../data/content'

export function Stack() {
  return (
    <section id="stack" data-chapter="stack" className="chapter pt-24 lg:pt-36 pb-24 lg:pb-36">
      <ChapterTag n="04" label="Stack" />
      <div className="grid lg:grid-cols-12 gap-6 mt-6 mb-8 lg:mb-12 items-end">
        <Reveal className="lg:col-span-8">
          <h2 className="title text-[clamp(3rem,7.6vw,7.75rem)] leading-[0.92] m-0">Everything I&rsquo;ve built, connected.</h2>
        </Reveal>
        <p className="lg:col-span-4 m-0 text-lg leading-snug opacity-85 max-w-[26rem]">
          Tap anything to see where I used it.
        </p>
      </div>
      <SkillGraph />
      <div className="grid md:grid-cols-2 gap-3 mt-3">
        <Reveal>
          <div className="panel p-4 lg:p-5 h-full">
            <div className="label mb-3">Also comfortable with</div>
            <div className="flex flex-wrap gap-1.5">
              {graph.also.map((s) => (
                <span key={s} className="chip">{s}</span>
              ))}
            </div>
          </div>
        </Reveal>
        <Reveal>
          <div className="panel p-4 lg:p-5 h-full">
            <div className="label mb-3">Certificates · MongoDB · March 2026</div>
            <ul className="list-none m-0 p-0 mono space-y-1.5">
              {graph.receipts.map((r) => (
                <li key={r} className="flex gap-2.5 items-center">
                  <span className="sq" aria-hidden />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
