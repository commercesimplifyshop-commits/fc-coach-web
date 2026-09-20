import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import type { AnalysisListItem } from '../lib/types'

export default function History() {
  const [items, setItems] = useState<AnalysisListItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api<AnalysisListItem[]>('/api/analyses')
      .then(setItems)
      .catch((e: Error) => setError(e.message))
  }, [])

  return (
    <section>
      <h1>Minhas análises</h1>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {!items && !error && <p className="note">Carregando…</p>}
      {items && items.length === 0 && (
        <p>
          Você ainda não analisou nenhuma partida. <Link to="/analisar">Comece por aqui.</Link>
        </p>
      )}
      <ul className="list">
        {items?.map((a) => (
          <li key={a.id}>
            <Link to={`/analises/${a.id}`} className="card row-card">
              <div>
                <b>{a.mode === 'match' ? 'Partida inteira' : 'Lance'}</b>
                {a.score && <span className="mono"> · {a.score}</span>}
                <p className="note">{a.summary ?? (a.status === 'done' ? 'Sem resumo.' : 'Análise incompleta.')}</p>
              </div>
              <span className="mono note">{new Date(a.createdAt).toLocaleDateString('pt-BR')}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
