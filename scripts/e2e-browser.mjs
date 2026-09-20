// Browser E2E for the whole product: real Edge, a real gameplay video, real Supabase
// (auth/DB/storage) and a FAKE OpenAI-compatible model unless REAL_AI=1 (then
// OPENAI_API_KEY is read from the local secrets file and the real AI is called: it costs money).
//
// Run from the fc-coach-web repo, with fc-coach-api checked out next to it and built
// (`npm run build` there):
//   npm i --no-save playwright-core
//   VIDEO=/path/to/match.mp4 node scripts/e2e-browser.mjs
//
// The fake model replays the scoreboard timeline of the sample match used to build the
// MVP (goals at video 3:31, 3:57, 6:23 and 9:41), so use that video with the fake model.
// Throwaway users are deleted at the end.
import { chromium } from 'playwright-core'
import { spawn } from 'node:child_process'
import http from 'node:http'
import fs from 'node:fs'
import net from 'node:net'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const SECRETS = 'C:\\Users\\Kaio\\.claude\\secret\\.env.txt'
const WEB_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const API_DIR = process.env.API_DIR || path.resolve(WEB_DIR, '..', 'fc-coach-api')
const VIDEO = process.env.VIDEO
if (!VIDEO) throw new Error('Set VIDEO to the path of a gameplay MP4')
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const REF = 'uovvowwxhajphllkfijv'
const SUPA = `https://${REF}.supabase.co`
const REAL_AI = process.env.REAL_AI === '1'

const secrets = {}
for (const line of fs.readFileSync(SECRETS, 'utf8').split(/\r?\n/)) {
  const m = /^([^:]+):\s*(.+?)\s*$/.exec(line)
  if (m) secrets[m[1].trim()] = m[2].trim()
}

const freePort = () => new Promise((res) => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)) }) })
const results = []
const check = (name, ok, extra = '') => { results.push([name, !!ok]); console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${extra ? `  [${extra}]` : ''}`) }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ---------------- fake model (same timeline as the real match) ----------------
const fakeCalls = []
function startFake(port) {
  const scoreAt = (t) => [(t >= 250) + (t >= 400) + (t >= 590), t >= 220 ? 1 : 0]
  const srv = http.createServer((req, res) => {
    let body = ''
    req.on('data', (c) => (body += c))
    req.on('end', () => {
      const j = JSON.parse(body)
      const system = j.messages[0].content
      const user = j.messages[1].content
      const text = user[0].text
      const images = user.filter((c) => c.type === 'image_url').length
      let out = {}
      if (system.includes('You read the on-screen scoreboard')) {
        const times = [...text.matchAll(/video time (\d+) s/g)].map((m) => Number(m[1]))
        out = { frames: times.map((t, i) => {
          if ([240, 350, 360, 390].includes(t)) return { i, home_abbr: null, away_abbr: null, home_score: null, away_score: null, clock: null }
          const [h, a] = scoreAt(t)
          return { i, home_abbr: 'ARG', away_abbr: 'FLA', home_score: h, away_score: a, clock: `${Math.floor(t / 10)}:00` }
        }) }
        fakeCalls.push({ kind: 'scan', images })
      } else if (system.includes('tactics / squad')) {
        out = { screens: [{ i: 0, screen: 'tactics' }], setup: { team_name: 'Flamengo', formation: '3-5-2', roles: [], warnings: ['Funcoes defensivas baixas'], out_of_position: ['Llorente'], notes: [], confidence: 'visible' } }
        fakeCalls.push({ kind: 'setup', images })
      } else if (system.includes('ONE moment')) {
        out = { headline: 'Gol sofrido de segunda bola', moment_type: 'goal_conceded', clock_estimate: null,
          sequence: [{ frame: 0, note: 'Bola no meio', confidence: 'visible' }, { frame: 1, note: 'Sobra na area', confidence: 'inferred' }],
          errors: [{ category: 'segunda_bola', description: 'Rebote nao afastado', why: 'Varios defensores na area sem limpar', fix: 'Limpe de primeira', evidence_frames: [1], confidence: 'inferred' }],
          went_well: [], limitations: ['Chute nao aparece'] }
        fakeCalls.push({ kind: 'moment', images })
      } else if (system.includes('post-match report')) {
        out = { summary: 'A partida foi decidida por gols de segunda bola.', playstyle: { formation: '3-5-2', notes: ['Alas ofensivos'], basis: 'tela_de_tatica', confidence: 'visible' },
          priorities: [{ title: 'Limpar segunda bola', why: 'Gols 1 e 2', how_to_fix: 'Chute de primeira', moments: [1, 2] }], patterns: ['Bola sobrando na pequena area'], next_match_plan: ['Limpe de primeira'], limitations: ['So quadros parados'] }
        fakeCalls.push({ kind: 'report', images })
      }
      const payload = JSON.stringify({ choices: [{ message: { content: JSON.stringify(out) } }], usage: { prompt_tokens: 1000, completion_tokens: 200 } })
      res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(payload)
    })
  })
  srv.listen(port, '127.0.0.1')
  return srv
}

async function waitFor(url, ms = 30000) {
  const t0 = Date.now()
  while (Date.now() - t0 < ms) { try { const r = await fetch(url); if (r.ok || r.status < 500) return true } catch { /* retry */ } await sleep(400) }
  throw new Error(`timeout waiting ${url}`)
}

async function main() {
  const keysRes = await fetch('https://api.supabase.com/v1/projects/' + REF + '/api-keys?reveal=true', { headers: { Authorization: 'Bearer ' + secrets.supabase } })
  const keys = await keysRes.json()
  const secret = keys.find((k) => k.type === 'secret').api_key
  const publishable = keys.find((k) => k.type === 'publishable').api_key

  const fakePort = await freePort(), apiPort = await freePort(), webPort = await freePort()
  const fake = REAL_AI ? null : startFake(fakePort)
  const apiEnv = { ...process.env, PORT: String(apiPort), SUPABASE_URL: SUPA, SUPABASE_SERVICE_ROLE_KEY: secret, DAILY_ANALYSIS_LIMIT: '10',
    ...(REAL_AI ? { OPENAI_API_KEY: secrets.openai, VISION_MODEL: process.env.VISION_MODEL || '' } : { OPENAI_API_KEY: 'fake', OPENAI_BASE_URL: `http://127.0.0.1:${fakePort}/v1`, VISION_MODEL: 'gpt-4o-mini' }) }
  const api = spawn('node', ['dist/src/main.js'], { cwd: API_DIR, env: apiEnv, stdio: 'ignore' })
  const web = spawn('node', ['node_modules/vite/bin/vite.js', '--port', String(webPort), '--strictPort', '--host', '127.0.0.1'], {
    cwd: WEB_DIR, stdio: 'ignore', env: { ...process.env, VITE_SUPABASE_URL: SUPA, VITE_SUPABASE_ANON_KEY: publishable, VITE_API_PROXY_TARGET: `http://127.0.0.1:${apiPort}` } })
  const base = `http://127.0.0.1:${webPort}`
  let userId = null
  const email = `e2e-${Math.random().toString(36).slice(2, 8)}@example.com`
  const password = 'Senha-' + Math.random().toString(36).slice(2, 12)
  let browser
  try {
    await waitFor(`http://127.0.0.1:${apiPort}/api/health`)
    await waitFor(base + '/')
    browser = await chromium.launch({ executablePath: EDGE, headless: true })
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
    const page = await ctx.newPage()
    page.setDefaultTimeout(60000)
    const consoleErrors = []
    page.on('pageerror', (e) => consoleErrors.push(String(e)))
    page.on('console', (m) => { if (m.type() === 'error' && !/fonts\.g|Failed to load resource.*(font|favicon)/.test(m.text())) consoleErrors.push(m.text()) })

    // ---------- public pages
    await page.goto(base + '/')
    check('home renders', await page.getByRole('heading', { level: 1 }).first().isVisible())
    await page.getByRole('link', { name: 'Formações' }).first().click()
    await page.getByRole('heading', { name: 'Formações', level: 1 }).waitFor()
    check('team list shows Flamengo and Palmeiras', (await page.getByText('Flamengo').count()) > 0 && (await page.getByText('Palmeiras').count()) > 0)
    await page.getByRole('link', { name: /Flamengo/ }).first().click()
    await page.getByRole('heading', { name: 'Flamengo', level: 1 }).waitFor()
    check('team page: formation + pitch + how-to-apply', (await page.locator('svg.pitch circle.dot').count()) === 11 && (await page.getByText('Como aplicar no jogo').isVisible()) && (await page.getByText('4-2-3-1').first().isVisible()))
    check('team page shows sources and confidence', (await page.getByRole('heading', { name: 'Fontes' }).isVisible()) && (await page.getByText(/Confiança/).first().isVisible()))
    await page.goto(base + '/formacoes/3-5-2')
    check('formation page 3-5-2 draws 11 players', (await page.locator('svg.pitch circle.dot').count()) === 11)

    // ---------- protected route redirects to login
    await page.goto(base + '/analisar')
    await page.getByRole('heading', { name: 'Entrar' }).waitFor()
    check('protected route redirects to login', page.url().endsWith('/entrar'))

    // ---------- sign up through the UI
    await page.getByRole('button', { name: 'Criar conta' }).click()
    await page.getByLabel('E-mail').fill(email)
    await page.getByLabel('Senha').fill(password)
    await page.locator('form button.btn-primary').click()
    await page.getByRole('heading', { name: 'Analisar partida' }).waitFor()
    check('sign up logs in and lands on /analisar', page.url().endsWith('/analisar'))
    const { data } = await (await fetch(`${SUPA}/auth/v1/admin/users?per_page=200`, { headers: { apikey: secret, Authorization: 'Bearer ' + secret } })).json().then((d) => ({ data: d }))
    userId = (data.users || []).find((u) => u.email === email)?.id ?? null

    // ---------- whole match, real video
    const t0 = Date.now()
    await page.setInputFiles('#video', VIDEO)
    await page.getByRole('button', { name: 'Analisar', exact: true }).click()
    await page.getByRole('heading', { name: 'Qual é o seu time?' }).waitFor({ timeout: 240000 })
    check('scoreboard scan finished and asks for my team', true, `${Math.round((Date.now() - t0) / 1000)}s`)
    const choices = await page.locator('.modal .btn-primary').allTextContents()
    check('team choices come from the scoreboard', choices.sort().join() === 'ARG,FLA', choices.join())
    await page.locator('.modal .btn-primary', { hasText: 'FLA' }).click()
    await page.waitForURL(/\/analises\/[0-9a-f-]{36}$/, { timeout: 300000 })
    const totalSec = Math.round((Date.now() - t0) / 1000)
    check('match analysis completes and opens the report', true, `${totalSec}s`)
    await page.getByRole('heading', { level: 1 }).waitFor()
    const h1 = (await page.getByRole('heading', { level: 1 }).textContent()) || ''
    check('report title shows the rebuilt final score', /ARG 3 x 1 FLA/.test(h1), h1)
    check('4 moments analysed (1 scored + 3 conceded)', (await page.locator('article.moment').count()) === 4)
    check('priorities and formation sections render', (await page.getByText('O que mudar primeiro').isVisible()) && (await page.getByText('3-5-2').first().isVisible()))
    await page.locator('article.moment').first().scrollIntoViewIfNeeded()
    await sleep(1500)
    const imgs = await page.locator('article.moment').first().locator('.viewer-stage img').evaluateAll((els) => els.map((e) => ({ w: e.naturalWidth, src: e.src.slice(0, 40) })))
    check('evidence frame loads from private storage (signed URL)', imgs.length === 1 && imgs[0].w > 300, JSON.stringify(imgs))
    const thumbs = await page.locator('article.moment').first().locator('.thumb').count()
    check('frame strip has multiple thumbnails', thumbs >= 4, String(thumbs))
    await page.locator('article.moment').first().locator('.thumb').nth(2).click()
    check('clicking a thumbnail switches the frame', (await page.locator('article.moment').first().locator('.viewer-tag').textContent())?.startsWith('3/'))
    await page.screenshot({ path: 'e2e-report-match.png', fullPage: true })
    if (!REAL_AI) {
      const counts = fakeCalls.reduce((a, c) => ((a[c.kind] = (a[c.kind] || 0) + 1), a), {})
      check('model calls: scan x3 (90 samples / 30), setup, 4 moments, report', counts.scan === 3 && counts.setup === 1 && counts.moment === 4 && counts.report === 1, JSON.stringify(counts))
      check('scan calls carried cropped HUD images', fakeCalls.filter((c) => c.kind === 'scan').every((c) => c.images > 0))
    }

    // ---------- history
    await page.getByRole('link', { name: 'Minhas análises' }).click()
    await page.getByRole('heading', { name: 'Minhas análises' }).waitFor()
    await page.getByText('ARG 3 x 1 FLA').waitFor({ timeout: 15000 }).catch(() => {})
    check('history lists the analysis with the score', await page.getByText('ARG 3 x 1 FLA').isVisible())

    // ---------- clip mode (14 s around the 2nd goal)
    await page.goto(base + '/analisar')
    await page.getByRole('tab', { name: 'Entender um lance' }).click()
    await page.setInputFiles('#video', VIDEO)
    await page.getByLabel('Cor da camisa do seu time').fill('vermelho e preto')
    await page.getByLabel('O que você quer entender? (opcional)').fill('Por que tomei esse gol?')
    await page.getByLabel('Início (opcional)').fill('3:44')
    await page.getByLabel('Fim (opcional)').fill('3:58')
    const c0 = Date.now()
    await page.getByRole('button', { name: 'Analisar', exact: true }).click()
    await page.waitForURL(/\/analises\/[0-9a-f-]{36}$/, { timeout: 180000 })
    await page.getByRole('heading', { level: 1 }).waitFor()
    check('clip analysis completes', true, `${Math.round((Date.now() - c0) / 1000)}s`)
    check('clip report has 1 moment and says pattern/style needs the full match', (await page.locator('article.moment').count()) === 1 && (await page.getByText(/único lance/).count()) > 0)
    const clipThumbs = await page.locator('article.moment .thumb').count()
    check('clip extracted about 14 frames', clipThumbs >= 12 && clipThumbs <= 16, String(clipThumbs))

    // ---------- delete through the UI
    page.once('dialog', (d) => d.accept())
    await page.getByRole('button', { name: 'Apagar esta análise' }).click()
    await page.getByRole('heading', { name: 'Minhas análises' }).waitFor()
    check('delete from the UI returns to history', page.url().endsWith('/analises'))

    check('no console/page errors during the whole run', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | ').slice(0, 300))
  } finally {
    if (browser) await browser.close()
    web.kill(); api.kill(); fake?.close()
    if (userId) {
      // remove leftover evidence via storage list, then the user (cascades DB rows)
      await fetch(`${SUPA}/auth/v1/admin/users/${userId}`, { method: 'DELETE', headers: { apikey: secret, Authorization: 'Bearer ' + secret } })
    }
  }
  const failed = results.filter(([, ok]) => !ok)
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
  process.exit(failed.length ? 1 : 0)
}

main().catch((e) => { console.error('E2E crashed:', e); process.exit(2) })
