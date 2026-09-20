import { Link, useParams } from 'react-router-dom'
import HowToApply from '../components/HowToApply'
import Pitch from '../components/Pitch'
import { formationBySlug } from '../data/formations'
import { teamBySlug } from '../data/teams'

export default function TeamDetail() {
  const { slug } = useParams()
  const team = teamBySlug(slug)
  const formation = formationBySlug(team?.formation)
  if (!team || !formation) {
    return (
      <p>
        Time não encontrado. <Link to="/formacoes">Ver todos</Link>
      </p>
    )
  }
  return (
    <section>
      <p className="eyebrow">
        <Link to="/formacoes">Formações</Link> · {team.country}
      </p>
      <h1>{team.name}</h1>
      <p className="chips">
        <Link className="chip chip-formation mono" to={`/formacoes/${formation.slug}`}>
          {formation.name}
        </Link>
        <span className={`chip chip-${team.confidence === 'media' ? 'inferred' : 'uncertain'}`}>Confiança {team.confidence === 'media' ? 'média' : 'baixa'}</span>
        {team.style.map((s) => (
          <span className="chip" key={s}>
            {s}
          </span>
        ))}
      </p>
      <p className="card note-card">{team.note}</p>
      <div className="split">
        <Pitch lines={formation.lines} label={`Desenho da formação ${formation.name}`} />
        <div>
          <h2>Ideias principais</h2>
          <ul className="bullets">
            {team.principles.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <h2>Fontes</h2>
          <ul className="bullets">
            {team.sources.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noreferrer">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="note">Revisado em {new Date(team.reviewedAt).toLocaleDateString('pt-BR')}. Referência editorial, não dado oficial.</p>
        </div>
      </div>
      <HowToApply formationName={formation.name} extra={team.inGame} />
    </section>
  )
}
