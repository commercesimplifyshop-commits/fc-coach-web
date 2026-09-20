import { useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../lib/api'
import { parseTime } from '../lib/frames'
import { runClip, runMatch, type Progress } from '../lib/runner'

type Mode = 'clip' | 'match'
const GAMES = ['EA FC 27', 'EA FC 26', 'eFootball']

interface TeamChoice {
  teams: { home: string; away: string }
  resolve: (abbr: string) => void
}

export default function Analyze() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('match')
  const [file, setFile] = useState<File | null>(null)
  const [game, setGame] = useState(GAMES[0])
  const [colors, setColors] = useState('')
  const [question, setQuestion] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [extra, setExtra] = useState('')
  const [progress, setProgress] = useState<Progress | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [choice, setChoice] = useState<TeamChoice | null>(null)
  const running = useRef(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!file || running.current) return
    running.current = true
    setError(null)
    try {
      let id: string
      if (mode === 'clip') {
        const f = from ? parseTime(from) : null
        const t = to ? parseTime(to) : null
        if ((from && f === null) || (to && t === null)) throw new Error('Use o formato minutos:segundos, por exemplo 3:45.')
        id = await runClip(file, { gameVersion: game, myColors: colors, question, from: f ?? undefined, to: t ?? undefined }, setProgress)
      } else {
        const moments = extra
          .split(/[,;\s]+/)
          .filter(Boolean)
          .map(parseTime)
        if (moments.some((m) => m === null)) throw new Error('Os lances marcados devem estar no formato minutos:segundos, por exemplo 3:57.')
        id = await runMatch(
          file,
          {
            gameVersion: game,
            extraMoments: moments as number[],
            chooseTeam: (teams) => new Promise<string>((resolve) => setChoice({ teams, resolve })),
          },
          setProgress,
        )
      }
      navigate(`/analises/${id}`)
    } catch (err) {
      setError(err instanceof ApiError || err instanceof Error ? err.message : 'Algo deu errado. Tente novamente.')
      setProgress(null)
    } finally {
      running.current = false
    }
  }

  const busy = progress !== null && error === null
  const pct = progress && progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0

  return (
    <section>
      <h1>Analisar partida</h1>
      <div className="tabs" role="tablist" aria-label="Tipo de análise">
        <button role="tab" aria-selected={mode === 'match'} className={mode === 'match' ? 'on' : ''} onClick={() => setMode('match')} disabled={busy}>
          Partida inteira
        </button>
        <button role="tab" aria-selected={mode === 'clip'} className={mode === 'clip' ? 'on' : ''} onClick={() => setMode('clip')} disabled={busy}>
          Entender um lance
        </button>
      </div>
      <p className="lead">
        {mode === 'match'
          ? 'O site lê o placar, acha os gols e analisa os segundos anteriores a cada um. Leva alguns minutos.'
          : 'Envie o clipe de um lance (até 2 minutos) e pergunte o que quiser sobre ele.'}
      </p>

      <form className="form" onSubmit={(e) => void submit(e)}>
        <label htmlFor="video">Vídeo (MP4)</label>
        <input id="video" type="file" accept="video/mp4,video/*" required disabled={busy} onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <p className="note">O arquivo não sai do seu computador: só quadros pequenos são enviados.</p>

        <label htmlFor="game">Jogo</label>
        <select id="game" value={game} onChange={(e) => setGame(e.target.value)} disabled={busy}>
          {GAMES.map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>

        {mode === 'clip' ? (
          <>
            <label htmlFor="colors">Cor da camisa do seu time</label>
            <input id="colors" placeholder="ex.: vermelho e preto" value={colors} onChange={(e) => setColors(e.target.value)} disabled={busy} />
            <label htmlFor="question">O que você quer entender? (opcional)</label>
            <input id="question" placeholder="ex.: por que tomei esse gol?" value={question} onChange={(e) => setQuestion(e.target.value)} disabled={busy} />
            <div className="row">
              <div>
                <label htmlFor="from">Início (opcional)</label>
                <input id="from" placeholder="0:00" value={from} onChange={(e) => setFrom(e.target.value)} disabled={busy} />
              </div>
              <div>
                <label htmlFor="to">Fim (opcional)</label>
                <input id="to" placeholder="0:20" value={to} onChange={(e) => setTo(e.target.value)} disabled={busy} />
              </div>
            </div>
          </>
        ) : (
          <>
            <label htmlFor="extra">Outros lances que você quer entender (opcional)</label>
            <input id="extra" placeholder="ex.: 3:57, 6:23" value={extra} onChange={(e) => setExtra(e.target.value)} disabled={busy} />
            <p className="note">Tempos do vídeo, no formato minutos:segundos. Até 3 lances.</p>
          </>
        )}

        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <button className="btn btn-primary" disabled={!file || busy}>
          {busy ? 'Analisando…' : 'Analisar'}
        </button>
      </form>

      {busy && progress && (
        <div className="progress" role="status" aria-live="polite">
          <div className="progress-bar" aria-hidden="true">
            <span style={{ width: `${pct}%` }} />
          </div>
          <p>
            {progress.phase}
            {progress.total > 1 ? ` (${progress.done}/${progress.total})` : '…'}
          </p>
          <p className="note">Mantenha esta aba aberta até terminar.</p>
        </div>
      )}

      {choice && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-labelledby="team-q">
          <div className="card modal">
            <h2 id="team-q">Qual é o seu time?</h2>
            <p>Encontrei estes dois times no placar. Escolha o seu para eu saber quais gols foram sofridos.</p>
            <div className="actions">
              {[choice.teams.home, choice.teams.away].map((abbr) => (
                <button
                  key={abbr}
                  className="btn btn-primary"
                  onClick={() => {
                    choice.resolve(abbr)
                    setChoice(null)
                  }}
                >
                  {abbr}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
