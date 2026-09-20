// Shapes returned by fc-coach-api (see src/analysis/schemas.ts there).

export type Confidence = 'visible' | 'inferred' | 'uncertain'

export interface MomentErrorItem {
  category: string
  description: string
  why: string
  fix: string
  evidence_frames: number[]
  confidence: Confidence
}

export interface MomentAnalysis {
  headline: string
  moment_type: string
  clock_estimate: string | null
  sequence: { frame: number; note: string; confidence: Confidence }[]
  errors: MomentErrorItem[]
  went_well: string[]
  limitations: string[]
}

export interface MomentView {
  key: string
  kind: 'goal_conceded' | 'goal_scored' | 'custom'
  t0: number
  t1: number
  clock: string | null
  analysis: MomentAnalysis
  frames: { t: number; url: string | null }[]
}

export interface Setup {
  team_name: string | null
  formation: string | null
  roles: { player: string | null; position: string | null; role: string | null; focus: string | null }[]
  warnings: string[]
  out_of_position: string[]
  notes: string[]
  confidence: Confidence
}

export interface Report {
  summary: string
  playstyle: { formation: string | null; notes: string[]; basis: string; confidence: Confidence }
  priorities: { title: string; why: string; how_to_fix: string; moments: number[] }[]
  patterns: string[]
  next_match_plan: string[]
  limitations: string[]
}

export interface AnalysisView {
  id: string
  mode: 'clip' | 'match'
  status: string
  gameVersion: string | null
  createdAt: string
  context: { myAbbr?: string; myColors?: string; question?: string }
  teams: { home: string; away: string } | null
  score: { home: string; away: string; homeScore: number; awayScore: number } | null
  setup: Setup | null
  moments: MomentView[]
  report: Report | null
}

export interface AnalysisListItem {
  id: string
  mode: 'clip' | 'match'
  status: string
  gameVersion: string | null
  createdAt: string
  summary: string | null
  score: string | null
}

export interface PlanWindow {
  key: string
  kind: 'goal_conceded' | 'goal_scored'
  abbr: string
  score: string
  clock: string | null
  t0: number
  t1: number
  times: number[]
}
