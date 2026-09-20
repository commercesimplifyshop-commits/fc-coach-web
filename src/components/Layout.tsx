import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../lib/auth'

interface Health {
  status: string
  environment: string
  commit: string | null
}

export default function Layout() {
  const { session, signOut, configured } = useAuth()
  const [health, setHealth] = useState<Health | null>(null)

  useEffect(() => {
    fetch('/api/health')
      .then((r) => (r.ok ? (r.json() as Promise<Health>) : null))
      .then(setHealth)
      .catch(() => setHealth(null))
  }, [])

  return (
    <>
      <header className="bar">
        <div className="wrap bar-in">
          <Link to="/" className="brand" aria-label="FC Coach, página inicial">
            <span className="brand-mark" aria-hidden="true" />
            FC Coach
          </Link>
          <nav className="nav" aria-label="Principal">
            <NavLink to="/analisar">Analisar partida</NavLink>
            <NavLink to="/formacoes">Formações</NavLink>
            {session && <NavLink to="/analises">Minhas análises</NavLink>}
          </nav>
          <div className="bar-user">
            {configured &&
              (session ? (
                <button className="btn btn-ghost" onClick={() => void signOut()}>
                  Sair
                </button>
              ) : (
                <Link className="btn btn-ghost" to="/entrar">
                  Entrar
                </Link>
              ))}
          </div>
        </div>
      </header>
      <main className="wrap page">
        <Outlet />
      </main>
      <footer className="foot">
        <div className="wrap foot-in">
          <p>
            Análise por quadros parados: não avalia timing de botão, drible ou reação. Nada aqui tem vínculo com a EA ou a Konami.
          </p>
          <p className="mono">
            API {health ? `${health.status} · ${health.environment}${health.commit ? ` · ${health.commit}` : ''}` : 'indisponível'}
          </p>
        </div>
      </footer>
    </>
  )
}
