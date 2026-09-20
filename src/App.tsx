import { Link, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import RequireAuth from './components/RequireAuth'
import Analyze from './pages/Analyze'
import FormationDetail from './pages/FormationDetail'
import Formations from './pages/Formations'
import History from './pages/History'
import Home from './pages/Home'
import Login from './pages/Login'
import Report from './pages/Report'
import TeamDetail from './pages/TeamDetail'

function NotFound() {
  return (
    <section>
      <h1>Página não encontrada</h1>
      <p>
        <Link to="/">Voltar ao início</Link>
      </p>
    </section>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="entrar" element={<Login />} />
        <Route path="formacoes" element={<Formations />} />
        <Route path="formacoes/:slug" element={<FormationDetail />} />
        <Route path="times/:slug" element={<TeamDetail />} />
        <Route element={<RequireAuth />}>
          <Route path="analisar" element={<Analyze />} />
          <Route path="analises" element={<History />} />
          <Route path="analises/:id" element={<Report />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
