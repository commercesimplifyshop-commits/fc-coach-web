import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FORMATIONS } from '../data/formations'
import { TEAMS } from '../data/teams'

export default function Formations() {
  const [tab, setTab] = useState<'times' | 'formacoes'>('times')
  const [q, setQ] = useState('')
  const query = q.trim().toLowerCase()

  const teams = useMemo(() => TEAMS.filter((t) => !query || `${t.name} ${t.country}`.toLowerCase().includes(query)), [query])
  const formations = useMemo(() => FORMATIONS.filter((f) => !query || f.name.toLowerCase().includes(query)), [query])

  return (
    <section>
      <h1>Formações</h1>
      <p className="lead">Escolha um time de referência ou uma formação, veja o desenho em campo e aprenda a aplicar no seu jogo.</p>
      <div className="tabs" role="tablist" aria-label="Tipo">
        <button role="tab" aria-selected={tab === 'times'} className={tab === 'times' ? 'on' : ''} onClick={() => setTab('times')}>
          Times de referência
        </button>
        <button role="tab" aria-selected={tab === 'formacoes'} className={tab === 'formacoes' ? 'on' : ''} onClick={() => setTab('formacoes')}>
          Formações do jogo
        </button>
      </div>
      <label htmlFor="q" className="sr">
        Buscar
      </label>
      <input id="q" className="search" placeholder={tab === 'times' ? 'Buscar time…' : 'Buscar formação…'} value={q} onChange={(e) => setQ(e.target.value)} />

      {tab === 'times' ? (
        <>
          <div className="grid3">
            {teams.map((t) => (
              <Link key={t.slug} to={`/times/${t.slug}`} className="card team-card">
                <h3>{t.name}</h3>
                <p className="note">{t.country}</p>
                <p className="chips">
                  <span className="chip chip-formation mono">{t.formation}</span>
                  <span className={`chip chip-${t.confidence === 'media' ? 'inferred' : 'uncertain'}`}>Confiança {t.confidence === 'media' ? 'média' : 'baixa'}</span>
                </p>
                <p>{t.style.join(' · ')}</p>
              </Link>
            ))}
          </div>
          {teams.length === 0 && <p className="note">Nenhum time encontrado.</p>}
          <p className="note">
            Os times são uma referência editorial, com fontes e nível de confiança em cada um. Táticas reais mudam de jogo para jogo.
          </p>
        </>
      ) : (
        <div className="grid3">
          {formations.map((f) => (
            <Link key={f.slug} to={`/formacoes/${f.slug}`} className="card team-card">
              <h3 className="mono">{f.name}</h3>
              <p>{f.summary}</p>
            </Link>
          ))}
          {formations.length === 0 && <p className="note">Nenhuma formação encontrada.</p>}
        </div>
      )}
    </section>
  )
}
