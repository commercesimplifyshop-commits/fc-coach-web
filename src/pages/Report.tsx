import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ConfidenceChip from '../components/Chip'
import FrameViewer from '../components/FrameViewer'
import { api } from '../lib/api'
import { formatTime } from '../lib/frames'
import type { AnalysisView, MomentView } from '../lib/types'

const KIND: Record<MomentView['kind'], string> = { goal_conceded: 'Gol sofrido', goal_scored: 'Gol marcado', custom: 'Lance escolhido' }
const CATEGORY: Record<string, string> = {
  marcacao: 'Marcação',
  espaco_entre_linhas: 'Espaço entre linhas',
  posicionamento: 'Posicionamento',
  goleiro: 'Goleiro',
  escolha_de_jogador: 'Escolha de jogador',
  decisao_com_bola: 'Decisão com a bola',
  segunda_bola: 'Segunda bola',
  transicao: 'Transição',
  outro: 'Outro',
}

function Moment({ m, index }: { m: MomentView; index: number }) {
  const a = m.analysis
  const notes: Record<number, string> = {}
  for (const s of a.sequence) notes[s.frame] = s.note
  const highlight = [...new Set(a.errors.flatMap((e) => e.evidence_frames))]
  return (
    <article className="card moment" id={`lance-${index}`}>
      <header className="moment-head">
        <span className={`tag tag-${m.kind}`}>{KIND[m.kind]}</span>
        <h3>{a.headline}</h3>
        <p className="mono note">
          vídeo {formatTime(m.t0)}–{formatTime(m.t1)}
          {m.clock ? ` · relógio ${m.clock}` : ''}
        </p>
      </header>
      <div className="moment-body">
        <FrameViewer frames={m.frames} notes={notes} highlight={highlight} />
        <div>
          {a.errors.length === 0 && <p className="note">Nenhum erro claro identificado neste lance.</p>}
          {a.errors.map((e, i) => (
            <div className="err" key={i}>
              <p className="err-head">
                <b>{CATEGORY[e.category] ?? 'Outro'}</b> <ConfidenceChip level={e.confidence} />
              </p>
              <p>{e.description}</p>
              <p>
                <b>Por que é erro:</b> {e.why}
              </p>
              <p className="fix">
                <b>Como corrigir:</b> {e.fix}
              </p>
              {e.evidence_frames.length > 0 && <p className="note mono">Veja os quadros {e.evidence_frames.map((f) => f + 1).join(', ')}</p>}
            </div>
          ))}
          {a.went_well.length > 0 && (
            <>
              <h4>O que funcionou</h4>
              <ul className="bullets">
                {a.went_well.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </>
          )}
          {a.limitations.length > 0 && (
            <>
              <h4>Limitações deste lance</h4>
              <ul className="bullets muted">
                {a.limitations.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </article>
  )
}

export default function Report() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState<AnalysisView | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!id) return
    api<AnalysisView>(`/api/analyses/${id}`)
      .then(setData)
      .catch((e: Error) => setError(e.message))
  }, [id])

  async function remove() {
    if (!id || !window.confirm('Apagar esta análise e as imagens dela? Isso não pode ser desfeito.')) return
    setDeleting(true)
    try {
      await api(`/api/analyses/${id}`, { method: 'DELETE' })
      navigate('/analises')
    } catch (e) {
      setError((e as Error).message)
      setDeleting(false)
    }
  }

  if (error) return <p role="alert" className="error">{error}</p>
  if (!data) return <p className="note">Carregando…</p>

  const r = data.report
  const score = data.score
  return (
    <section>
      <p className="eyebrow">
        {data.mode === 'match' ? 'Partida inteira' : 'Análise de lance'}
        {data.gameVersion ? ` · ${data.gameVersion}` : ''} · {new Date(data.createdAt).toLocaleDateString('pt-BR')}
      </p>
      <h1>{score ? `${score.home} ${score.homeScore} x ${score.awayScore} ${score.away}` : 'Relatório da análise'}</h1>
      {!r && <p className="note">Esta análise não foi concluída. Os lances abaixo são os que chegaram a ser analisados.</p>}

      {r && (
        <>
          <p className="lead">{r.summary}</p>

          {r.priorities.length > 0 && (
            <>
              <h2>O que mudar primeiro</h2>
              <div className="grid3">
                {r.priorities.map((p, i) => (
                  <article className="card prio" key={i}>
                    <span className="prio-n">{i + 1}</span>
                    <h3>{p.title}</h3>
                    <p>{p.why}</p>
                    <p className="fix">
                      <b>Faça assim:</b> {p.how_to_fix}
                    </p>
                    {p.moments.length > 0 && (
                      <p className="note">
                        Veja: {p.moments.map((mi) => <a key={mi} href={`#lance-${mi}`}>lance {mi + 1} </a>)}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            </>
          )}

          {(data.setup || r.playstyle.formation || r.playstyle.notes.length > 0) && (
            <>
              <h2>Formação e estilo</h2>
              <div className="card">
                <p>
                  <b>Formação:</b> {data.setup?.formation ?? r.playstyle.formation ?? 'não identificada'}{' '}
                  <ConfidenceChip level={r.playstyle.confidence} />
                </p>
                {r.playstyle.basis === 'tela_de_tatica' && <p className="note">Lida da tela de tática do seu vídeo.</p>}
                {r.playstyle.basis === 'inferido_dos_lances' && <p className="note">Deduzida dos lances analisados, com menos certeza.</p>}
                {r.playstyle.notes.length > 0 && (
                  <ul className="bullets">
                    {r.playstyle.notes.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>
                )}
                {data.setup && data.setup.warnings.length > 0 && (
                  <p>
                    <b>Avisos do jogo:</b> {data.setup.warnings.join('; ')}
                  </p>
                )}
                {data.setup && data.setup.out_of_position.length > 0 && (
                  <p>
                    <b>Fora de posição:</b> {data.setup.out_of_position.join(', ')}
                  </p>
                )}
                {data.setup?.formation && (
                  <p>
                    <Link to="/formacoes">Ver formações e times de referência</Link>
                  </p>
                )}
              </div>
            </>
          )}
        </>
      )}

      {data.moments.length > 0 && <h2>Lances analisados</h2>}
      <div className="stack">
        {data.moments.map((m, i) => (
          <Moment key={m.key} m={m} index={i} />
        ))}
      </div>

      {r && r.next_match_plan.length > 0 && (
        <>
          <h2>Plano para a próxima partida</h2>
          <ul className="bullets">
            {r.next_match_plan.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </>
      )}
      {r && r.patterns.length > 0 && (
        <>
          <h2>Padrões que se repetem</h2>
          <ul className="bullets">
            {r.patterns.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </>
      )}
      {r && r.limitations.length > 0 && (
        <>
          <h2>O que não deu para avaliar</h2>
          <ul className="bullets muted">
            {r.limitations.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </>
      )}

      <p className="actions">
        <Link className="btn" to="/analisar">
          Analisar outra partida
        </Link>
        <button className="btn btn-danger" onClick={() => void remove()} disabled={deleting}>
          Apagar esta análise
        </button>
      </p>
    </section>
  )
}
