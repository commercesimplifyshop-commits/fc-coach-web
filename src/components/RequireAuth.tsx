import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth'

export default function RequireAuth() {
  const { session, loading, configured } = useAuth()
  const location = useLocation()
  if (!configured) return <p className="note">O login não está configurado neste ambiente.</p>
  if (loading) return <p className="note">Carregando…</p>
  if (!session) return <Navigate to="/entrar" replace state={{ from: location.pathname }} />
  return <Outlet />
}
