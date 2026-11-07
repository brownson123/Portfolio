import { moreBuilds, projects, work, type Build } from '../data/content'
import type { GateId } from './level'

// What each scan point in the game says. It reads straight from content.ts,
// so the game and the site can never disagree about a project.

export type Checkpoint = { title: string; chips: string[]; bullets: string[]; bg: string; fg: string }

const fromBuild = (b: Build): Pick<Checkpoint, 'title' | 'chips' | 'bullets'> => ({
  title: b.title,
  chips: [...(b.award ? [`★ ${b.award}`] : []), ...b.chips],
  bullets: b.bullets,
})

const project = (id: string): Checkpoint => {
  const p = projects.find((x) => x.id === id)!
  return { ...fromBuild(p), bg: p.bg, fg: p.fg }
}

const job = (id: string, bg: string, fg: string): Checkpoint => {
  const w = work.find((x) => x.id === id)!
  return { title: w.org, chips: [w.role, w.when], bullets: w.points.slice(0, 3), bg, fg }
}

export const CHECKPOINTS: Record<GateId, Checkpoint> = {
  budget: project('budget'),
  medicare: project('medicare'),
  travel: project('travel'),
  nexus: { ...fromBuild(moreBuilds.find((b) => b.id === 'nexus')!), bg: '#140a02', fg: '#f2eee6' },
  tps: job('tps', '#c8350b', '#fff4e6'),
  huddle: job('huddle', '#f2eee6', '#23120a'),
  station: project('station'),
}

export const CHECKPOINT_COUNT = Object.keys(CHECKPOINTS).length
