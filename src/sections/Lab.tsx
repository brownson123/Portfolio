import { AsciiBloom } from '../components/AsciiBloom'
import { ChapterTag, Reveal } from '../components/ui'

export function Lab() {
  return (
    <section id="lab" data-chapter="lab" className="chapter pt-24 lg:pt-36 pb-24 lg:pb-36">
      <ChapterTag n="05" label="Lab" />
      <div className="grid lg:grid-cols-12 gap-6 lg:gap-10 mt-6 items-start">
        <div className="lg:col-span-5 lg:sticky lg:top-24">
          <Reveal>
            <h2 className="title text-[clamp(3rem,5.6vw,6rem)] leading-[0.94] m-0">Flowers, but make them text.</h2>
            <p className="m-0 mt-6 text-lg leading-snug opacity-85 max-w-[26rem]">
              A side project. Each bouquet is traced from a photo into a grid of coloured characters. It started as a Python script, and I ported it to WebGL for this page.
            </p>
            <p className="mono m-0 mt-3 opacity-60">Move across it to blow on them. Tap to regrow.</p>
          </Reveal>
        </div>
        <div className="lg:col-span-7 min-w-0">
          <AsciiBloom />
        </div>
      </div>
    </section>
  )
}
