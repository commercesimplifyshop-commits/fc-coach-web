import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'

export default function Login() {
  const { session, configured } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/analisar'
  const [mode, setMode] = useState<'in' | 'up'>('in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (session) return <Navigate to={from} replace />
  if (!configured || !supabase) return <p className="note">O login não está configurado neste ambiente.</p>

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!supabase) return
    setBusy(true)
    setError(null)
    const { error: err } =
      mode === 'in' ? await supabase.auth.signInWithPassword({ email, password }) : await supabase.auth.signUp({ email, password })
    setBusy(false)
    if (err) {
      setError(
        err.message === 'Invalid login credentials'
          ? 'E-mail ou senha incorretos.'
          : err.message.includes('already registered')
            ? 'Este e-mail já tem conta. Entre com a senha.'
            : err.message,
      )
      return
    }
    navigate(from, { replace: true })
  }

  return (
    <section className="narrow">
      <h1>{mode === 'in' ? 'Entrar' : 'Criar conta'}</h1>
      <form className="form" onSubmit={(e) => void submit(e)}>
        <label htmlFor="email">E-mail</label>
        <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <label htmlFor="password">Senha</label>
        <input
          id="password"
          type="password"
          required
          minLength={6}
          autoComplete={mode === 'in' ? 'current-password' : 'new-password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <button className="btn btn-primary" disabled={busy}>
          {busy ? 'Aguarde…' : mode === 'in' ? 'Entrar' : 'Criar conta'}
        </button>
      </form>
      <p className="note">
        {mode === 'in' ? 'Ainda não tem conta? ' : 'Já tem conta? '}
        <button className="link" onClick={() => setMode(mode === 'in' ? 'up' : 'in')}>
          {mode === 'in' ? 'Criar conta' : 'Entrar'}
        </button>
      </p>
    </section>
  )
}
