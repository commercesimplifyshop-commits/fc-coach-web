import { Link, useParams } from 'react-router-dom'
import HowToApply from '../components/HowToApply'
import Pitch from '../components/Pitch'
import { formationBySlug } from '../data/formations'
import { TEAMS } from '../data/teams'

export default function FormationDetail() {
  const { slug } = useParams()
  const f = formationBySlug(slug)
  if (!f) {
    return (
      <p>
        Formação não encontrada. <Link to="/formacoes">Ver todas</Link>
      </p>
    )
  }
  const teams = TEAMS.filter((t) => t.formation === f.slug)
  return (
    <section>
      <p className="eyebrow">
        <Link to="/formacoes">Formações</Link>
      </p>
      <h1 className="mono">{f.name}</h1>
      <p className="lead">{f.summary}</p>
      <div className="split">
        <Pitch lines={f.lines} label={`Desenho da formação ${f.name}`} />
        <div>
          <h2>Pontos fortes</h2>
          <ul className="bullets">
            {f.strengths.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <h2>Pontos fracos</h2>
          <ul className="bullets">
            {f.weaknesses.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <h2>Dicas</h2>
          <ul className="bullets">
            {f.tips.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      </div>
      <HowToApply formationName={f.name} />
      {teams.length > 0 && (
        <>
          <h2>Times de referência que usam esta base</h2>
          <p>
            {teams.map((t) => (
              <Link key={t.slug} className="chip chip-formation" to={`/times/${t.slug}`}>
                {t.name}
              </Link>
            ))}
          </p>
        </>
      )}
    </section>
  )
}
