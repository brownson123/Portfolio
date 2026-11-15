import { AnimatePresence, motion, useInView } from 'motion/react'
import { useRef, useState, type FormEvent } from 'react'
import { ArrowUR, Reveal } from '../components/ui'
import { Wordmark } from '../components/Wordmark'
import { me } from '../data/content'
import { haptic } from '../lib/util'

const STACKED = ["LET'S", 'TALK']

export function Talk() {
  const mark = useRef<HTMLDivElement>(null)
  const seen = useInView(mark, { once: true, margin: '0px 0px -10% 0px' })
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (state === 'sending') return
    setState('sending')
    try {
      const res = await fetch(me.formspree, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(e.currentTarget),
      })
      if (!res.ok) throw new Error(String(res.status))
      setState('sent')
      haptic([10, 40, 10])
    } catch {
      setState('error')
    }
  }

  const links = [
    ['Email', `mailto:${me.email}`, me.email],
    ['LinkedIn', me.linkedin, 'in/omotoyeb'],
    ['GitHub', me.github, 'brownson123'],
    ...(me.resume ? [['Résumé', me.resume, 'PDF']] : []),
  ] as const

  return (
    <section id="talk" data-chapter="talk" className="relative pt-24 lg:pt-32 overflow-hidden">
      <div ref={mark} className="chapter">
        <Wordmark stacked={STACKED} single="LET'S TALK" ready={seen} maxHeight={0.5} />
      </div>

      <div className="chapter grid lg:grid-cols-12 gap-10 lg:gap-14 mt-12 lg:mt-20 pb-20">
        <div className="lg:col-span-5">
          <div className="flex items-center gap-2.5 label">
            <span className="sq" />
            Get in touch
          </div>
          <Reveal>
            <p className="title text-[clamp(1.875rem,3.3vw,3.25rem)] leading-[1.02] mt-5 mb-0">
              Looking for a co-op or an internship, and happy to talk about anything I&rsquo;ve built here.
            </p>
          </Reveal>
          <ul className="list-none m-0 p-0 mt-8">
            {links.map(([label, href, note]) => (
              <li key={label} className="hair-t last:border-b last:hair">
                <a
                  href={href}
                  target={href.startsWith('mailto') ? undefined : '_blank'}
                  rel="noreferrer"
                  className="group flex items-center justify-between py-3.5 no-underline"
                >
                  <span className="title text-2xl transition-transform duration-300 group-hover:translate-x-1.5">{label}</span>
                  <span className="mono flex items-center gap-2 opacity-75">
                    {note}
                    <ArrowUR />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-7">
          <Reveal>
            <div className="relative rounded-xl" style={{ background: '#fbf9f4', color: '#140a02', boxShadow: '0 30px 60px -30px rgba(60,30,0,.5)' }}>
              <AnimatePresence mode="wait" initial={false}>
                {state === 'sent' ? (
                  <motion.div
                    key="sent"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="px-5 lg:px-7 py-16 text-center"
                    role="status"
                  >
                    <motion.div
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                      className="inline-grid place-items-center w-16 h-16 rounded-full bg-[#16a34a] text-white text-3xl"
                      aria-hidden
                    >
                      ✓
                    </motion.div>
                    <p className="title text-2xl mt-7 mb-0">Got it. I&rsquo;ll reply soon.</p>
                  </motion.div>
                ) : (
                  <motion.form key="form" exit={{ opacity: 0 }} onSubmit={submit} className="px-5 lg:px-7 pt-6 lg:pt-7 pb-6 lg:pb-7">
                    <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
                    <div className="grid sm:grid-cols-2 gap-x-5">
                      <Field label="Your name" name="name" required autoComplete="name" />
                      <Field label="Your email" name="email" type="email" required autoComplete="email" />
                    </div>
                    <label className="block mt-4">
                      <span className="label opacity-70">Message</span>
                      <textarea
                        name="message"
                        required
                        rows={4}
                        placeholder="Hey Brownson…"
                        className="block w-full mt-1.5 bg-transparent border-0 border-b border-ink/30 focus:border-ink outline-none py-2 text-[16px] resize-none placeholder:text-ink/35"
                      />
                    </label>
                    <div className="flex flex-wrap items-center justify-between gap-3 mt-5">
                      <button
                        type="submit"
                        disabled={state === 'sending'}
                        className="btn !bg-ink !text-cream !border-ink disabled:opacity-60"
                      >
                        {state === 'sending' ? 'Sending…' : 'Send it'}
                        <ArrowUR />
                      </button>
                      {state === 'error' && (
                        <p className="mono m-0 text-[#c8350b]" role="alert">
                          That didn&rsquo;t send. <a className="underline" href={`mailto:${me.email}`}>Email me instead.</a>
                        </p>
                      )}
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </Reveal>
        </div>
      </div>

      <footer className="flex flex-wrap justify-between gap-2 px-5 lg:px-6 py-4 pb-[86px] lg:pb-4 mono hair-t">
        <span>© 2026 {me.name}</span>
        <span className="opacity-70">React, Motion, WebGL, and a small game.</span>
      </footer>
    </section>
  )
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block mt-3 sm:mt-0">
      <span className="label opacity-70">{label}</span>
      <input
        {...props}
        className="block w-full mt-1.5 bg-transparent border-0 border-b border-ink/30 focus:border-ink outline-none py-2 text-[16px]"
      />
    </label>
  )
}
