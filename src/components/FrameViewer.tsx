import { useState } from 'react'
import { formatTime } from '../lib/frames'

interface Frame {
  t: number
  url: string | null
}

interface Props {
  frames: Frame[]
  /** Short note per frame index (from the analysis sequence). */
  notes?: Record<number, string>
  highlight?: number[]
}

export default function FrameViewer({ frames, notes, highlight = [] }: Props) {
  const [i, setI] = useState(0)
  const [zoom, setZoom] = useState(false)
  const usable = frames.filter((f) => f.url)
  if (usable.length === 0) return <p className="note">As imagens deste lance não estão disponíveis.</p>
  const idx = Math.min(i, frames.length - 1)
  const cur = frames[idx]
  return (
    <div className="viewer">
      <button className="viewer-stage" onClick={() => setZoom(true)} aria-label="Ampliar imagem">
        {cur.url ? <img src={cur.url} alt={`Quadro do vídeo em ${formatTime(cur.t)}`} /> : <span className="note">Imagem indisponível</span>}
        <span className="viewer-tag mono">
          {idx + 1}/{frames.length} · vídeo {formatTime(cur.t)}
        </span>
      </button>
      {notes?.[idx] && <p className="viewer-note">{notes[idx]}</p>}
      <div className="viewer-thumbs" role="tablist" aria-label="Quadros">
        {frames.map((f, n) => (
          <button
            key={n}
            role="tab"
            aria-selected={n === idx}
            className={`thumb${n === idx ? ' on' : ''}${highlight.includes(n) ? ' hl' : ''}`}
            onClick={() => setI(n)}
            aria-label={`Quadro ${n + 1}, ${formatTime(f.t)}`}
          >
            {f.url && <img src={f.url} alt="" loading="lazy" />}
            <small>{formatTime(f.t)}</small>
          </button>
        ))}
      </div>
      {zoom && cur.url && (
        <div className="lightbox" role="dialog" aria-modal="true" onClick={() => setZoom(false)}>
          <img src={cur.url} alt={`Quadro ampliado em ${formatTime(cur.t)}`} />
          <button className="btn" onClick={() => setZoom(false)}>
            Fechar
          </button>
        </div>
      )}
    </div>
  )
}
