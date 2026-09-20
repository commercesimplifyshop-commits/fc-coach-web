import { api, apiUpload } from './api'
import { grabFrame, openVideo, type Crop, type VideoHandle } from './frames'
import type { PlanWindow } from './types'

export interface Progress {
  phase: string
  done: number
  total: number
}
type OnProgress = (p: Progress) => void

// Top-left strip where the scoreboard sits in the supported games.
const HUD_CROP: Crop = { x: 0, y: 0, w: 0.55, h: 0.3 }
const SCAN_STEP_SECONDS = 10
const SCAN_BATCH = 30
const SETUP_FRAMES = 8
const MAX_SAMPLES = 200
const FRAME_WIDTH = 768

interface StartOptions {
  gameVersion: string
}

function evenly(from: number, to: number, count: number): number[] {
  if (count <= 1) return [from]
  return Array.from({ length: count }, (_, i) => Math.round((from + ((to - from) * i) / (count - 1)) * 10) / 10)
}

async function grabAll(h: VideoHandle, times: number[], phase: string, onProgress: OnProgress, opts: { maxWidth: number; crop?: Crop }) {
  const blobs: Blob[] = []
  for (let i = 0; i < times.length; i++) {
    onProgress({ phase, done: i, total: times.length })
    blobs.push(await grabFrame(h, times[i], opts))
  }
  onProgress({ phase, done: times.length, total: times.length })
  return blobs
}

export interface ClipOptions extends StartOptions {
  myColors: string
  question: string
  /** Optional range inside the video, in seconds. */
  from?: number
  to?: number
}

/** One short clip = one moment. Returns the analysis id. */
export async function runClip(file: File, opts: ClipOptions, onProgress: OnProgress): Promise<string> {
  const h = await openVideo(file)
  try {
    const from = Math.max(0, opts.from ?? 0)
    const to = Math.min(h.duration, opts.to ?? h.duration)
    if (to - from < 2) throw new Error('O trecho precisa ter pelo menos 2 segundos.')
    if (to - from > 120) throw new Error('Para um lance, use um trecho de até 2 minutos. Para a partida inteira, use o outro modo.')

    onProgress({ phase: 'Criando análise', done: 0, total: 1 })
    const { id } = await api<{ id: string }>('/api/analyses', {
      json: { mode: 'clip', gameVersion: opts.gameVersion, myColors: opts.myColors || undefined, question: opts.question || undefined },
    })

    const count = Math.min(24, Math.max(4, Math.ceil(to - from)))
    const times = evenly(from, to - 0.1, count)
    const frames = await grabAll(h, times, 'Extraindo quadros do vídeo', onProgress, { maxWidth: FRAME_WIDTH })

    onProgress({ phase: 'A IA está analisando o lance', done: 0, total: 1 })
    await apiUpload(`/api/analyses/${id}/moments`, { times: JSON.stringify(times), kind: 'custom', key: 'clip-1' }, frames)
    onProgress({ phase: 'Montando o relatório', done: 0, total: 1 })
    await api(`/api/analyses/${id}/finalize`, { method: 'POST', json: {} })
    return id
  } finally {
    h.dispose()
  }
}

export interface MatchOptions extends StartOptions {
  /** Extra moments the player wants explained, as video seconds. */
  extraMoments: number[]
  chooseTeam: (teams: { home: string; away: string }) => Promise<string>
}

/** Whole match: scoreboard scan -> goals found in code -> one analysis per goal -> report. */
export async function runMatch(file: File, opts: MatchOptions, onProgress: OnProgress): Promise<string> {
  const h = await openVideo(file)
  try {
    onProgress({ phase: 'Criando análise', done: 0, total: 1 })
    const { id } = await api<{ id: string }>('/api/analyses', { json: { mode: 'match', gameVersion: opts.gameVersion } })

    // 1) scoreboard scan every ~10 s
    const step = Math.max(SCAN_STEP_SECONDS, Math.ceil(h.duration / MAX_SAMPLES))
    const sampleTimes: number[] = []
    for (let t = 0; t < h.duration - 1; t += step) sampleTimes.push(t)
    let teams: { home: string; away: string } | null = null
    for (let i = 0; i < sampleTimes.length; i += SCAN_BATCH) {
      const batch = sampleTimes.slice(i, i + SCAN_BATCH)
      const crops = await grabAll(h, batch, `Lendo o placar (${Math.min(i + SCAN_BATCH, sampleTimes.length)}/${sampleTimes.length})`, onProgress, { maxWidth: 640, crop: HUD_CROP })
      onProgress({ phase: 'A IA está lendo o placar', done: 0, total: 1 })
      const res = await apiUpload<{ teams: { home: string; away: string } | null }>(`/api/analyses/${id}/scan`, { times: JSON.stringify(batch) }, crops)
      teams = res.teams ?? teams
    }

    // 2) tactics / squad screens from the first frames (best effort)
    try {
      const early = sampleTimes.filter((t) => t < 120).slice(0, SETUP_FRAMES)
      if (early.length > 0) {
        const fulls = await grabAll(h, early, 'Procurando telas de tática e elenco', onProgress, { maxWidth: FRAME_WIDTH })
        onProgress({ phase: 'A IA está lendo a tática', done: 0, total: 1 })
        await apiUpload(`/api/analyses/${id}/setup`, { times: JSON.stringify(early) }, fulls)
      }
    } catch {
      // The report still works without the setup screens.
    }

    if (!teams) {
      throw new Error('Não consegui ler o placar deste vídeo. Confira se o placar aparece no canto superior esquerdo, ou use o modo "Entender um lance".')
    }

    // 3) the player picks their team, the API plans the windows around each goal
    const myAbbr = await opts.chooseTeam(teams)
    const plan = await api<{ windows: PlanWindow[] }>(`/api/analyses/${id}/plan`, { json: { myAbbr } })

    type Job = { key: string; kind: 'goal_conceded' | 'goal_scored' | 'custom'; times: number[]; clock: string }
    const jobs: Job[] = plan.windows.map((w) => ({ key: w.key, kind: w.kind, times: w.times, clock: w.clock ?? '' }))
    opts.extraMoments.slice(0, 3).forEach((t, i) => {
      const from = Math.max(0, t - 15)
      const to = Math.min(h.duration - 0.1, t + 3)
      jobs.push({ key: `custom-${i + 1}`, kind: 'custom', times: evenly(from, to, Math.min(18, Math.max(4, Math.ceil(to - from)))), clock: '' })
    })
    if (jobs.length === 0) {
      throw new Error('Não encontrei gols neste vídeo. Marque os lances que você quer entender (ex.: 3:57) e tente de novo.')
    }

    // 4) one analysis per moment
    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i]
      const frames = await grabAll(h, job.times, `Lance ${i + 1} de ${jobs.length}: extraindo quadros`, onProgress, { maxWidth: FRAME_WIDTH })
      onProgress({ phase: `Lance ${i + 1} de ${jobs.length}: a IA está analisando`, done: 0, total: 1 })
      await apiUpload(`/api/analyses/${id}/moments`, { times: JSON.stringify(job.times), kind: job.kind, key: job.key, clock: job.clock }, frames)
    }

    // 5) report
    onProgress({ phase: 'Montando o relatório', done: 0, total: 1 })
    await api(`/api/analyses/${id}/finalize`, { method: 'POST', json: {} })
    return id
  } finally {
    h.dispose()
  }
}
