import { useEffect, useState } from 'react'

type Health = {
  status: string
  service: string
  environment: string
  commit: string | null
  supabaseConfigured: boolean
}

// Placeholder page: proves the whole chain is live (frontend -> same-origin
// /api rewrite -> serverless API). Replace with the real product UI.
export default function App() {
  const [health, setHealth] = useState<Health | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/health')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<Health>
      })
      .then(setHealth)
      .catch((err: Error) => setError(err.message))
  }, [])

  return (
    <main style={{ maxWidth: 640, margin: '4rem auto', padding: '0 1rem', textAlign: 'left' }}>
      <h1>FC Coach</h1>
      <p>Ambiente no ar. Status da API:</p>
      {error && <p role="alert">API indisponível ({error})</p>}
      {!error && !health && <p>Verificando…</p>}
      {health && <pre>{JSON.stringify(health, null, 2)}</pre>}
    </main>
  )
}
