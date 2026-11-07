import { ChapterTag, Reveal } from '../components/ui'
import { work } from '../data/content'

export function Work() {
  return (
    <section id="work" data-chapter="work" className="chapter pt-24 lg:pt-28 pb-28 lg:pb-36">
      <ChapterTag n="02" label="Work" />
      <Reveal>
        <h2 className="m-0 mt-6 title text-[clamp(3.25rem,10.5vw,10.5rem)] leading-[0.88]">Experience</h2>
      </Reveal>

      <div className="mt-16 lg:mt-24 space-y-20 lg:space-y-28">
        {work.map((job) => (
          <article key={job.id} className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            <div className="lg:col-span-5">
              <Reveal>
                <div className="flex items-center gap-2.5 label">
                  <span className="sq" />
                  {job.when}
                </div>
                <h3 className="m-0 mt-5 title text-[clamp(2.25rem,4.2vw,4rem)]">{job.org}</h3>
                <div className="mono mt-3">
                  {job.role} <span className="opacity-60">· {job.kicker}</span>
                </div>
              </Reveal>
            </div>
            <div className="lg:col-span-7">
              <Reveal>
                <ul className="list-none m-0 p-0">
                  {job.points.map((p) => (
                    <li key={p} className="hair-t py-3.5 flex gap-3 leading-snug">
                      <span className="sq mt-[7px]" aria-hidden />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
