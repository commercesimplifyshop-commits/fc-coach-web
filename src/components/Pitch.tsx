interface PitchProps {
  /** Players per line from the defence to the attack (goalkeeper excluded). */
  lines: number[]
  label: string
}

// Simple top-down diagram: attack goes up. Positions are spread evenly per line.
export default function Pitch({ lines, label }: PitchProps) {
  const rows = lines.length
  const dots: { x: number; y: number; group: 'gk' | 'def' | 'mid' | 'att' }[] = [{ x: 50, y: 120, group: 'gk' }]
  lines.forEach((count, i) => {
    const y = 102 - ((i + 1) * 84) / (rows + 0.4)
    const group = i === 0 ? 'def' : i === rows - 1 ? 'att' : 'mid'
    for (let j = 0; j < count; j++) dots.push({ x: ((j + 1) / (count + 1)) * 100, y, group })
  })
  return (
    <svg className="pitch" viewBox="0 0 100 130" role="img" aria-label={label}>
      <rect x="1" y="1" width="98" height="128" rx="2" className="pitch-grass" />
      <g className="pitch-lines" fill="none">
        <rect x="1" y="1" width="98" height="128" rx="2" />
        <line x1="1" y1="65" x2="99" y2="65" />
        <circle cx="50" cy="65" r="11" />
        <rect x="26" y="1" width="48" height="19" />
        <rect x="26" y="110" width="48" height="19" />
        <rect x="38" y="1" width="24" height="7" />
        <rect x="38" y="122" width="24" height="7" />
      </g>
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r="4.3" className={`dot dot-${d.group}`} />
      ))}
    </svg>
  )
}
