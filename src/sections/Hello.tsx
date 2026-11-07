import { ChapterTag, Reveal } from '../components/ui'
import { hello, me } from '../data/content'
import { asset } from '../lib/util'

export function Hello() {
  const photo = me.photos.hello
  return (
    <section id="hello" data-chapter="hello" className="chapter pt-24 pb-24 min-h-[100svh] flex flex-col justify-center">
      <ChapterTag n="01" label="Hello" />
      <div className={`grid gap-8 lg:gap-12 mt-8 lg:mt-12 items-center ${photo ? 'lg:grid-cols-12' : ''}`}>
        <Reveal className={photo ? 'lg:col-span-7' : ''}>
          <h2 className="title text-[clamp(3rem,8.4vw,8.5rem)] leading-[0.92] m-0">{hello.title}</h2>
          <p className="title text-[clamp(1.75rem,4.2vw,4.25rem)] leading-[1.04] mt-6 lg:mt-8 mb-0 max-w-[24ch]">
            {hello.body}{' '}
            <span className="serif-i" style={{ color: 'var(--accent)' }}>
              {hello.passion}
            </span>
          </p>
        </Reveal>
        {photo && (
          <Reveal className="lg:col-span-5">
            <img src={asset(photo)} alt={me.photos.helloAlt} className="w-full max-h-[80vh] rounded-md object-cover" />
          </Reveal>
        )}
      </div>
    </section>
  )
}
