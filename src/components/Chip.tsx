import type { Confidence } from '../lib/types'

const LABEL: Record<Confidence, string> = { visible: 'Visível', inferred: 'Inferido', uncertain: 'Incerto' }

export default function ConfidenceChip({ level }: { level: Confidence }) {
  return <span className={`chip chip-${level}`}>{LABEL[level]}</span>
}
