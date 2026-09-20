import { supabase } from './supabase'

// Same-origin by default (Vercel rewrites /api/* to the API project).
// Set VITE_API_URL to call the API directly, e.g. to skip the rewrite.
const BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? ''

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function token(): Promise<string | null> {
  const { data } = (await supabase?.auth.getSession()) ?? { data: { session: null } }
  return data.session?.access_token ?? null
}

async function parse<T>(res: Response): Promise<T> {
  const text = await res.text()
  let body: unknown = null
  try {
    body = text ? JSON.parse(text) : null
  } catch {
    body = null
  }
  if (!res.ok) {
    const message = (body as { message?: string | string[] } | null)?.message
    const msg = Array.isArray(message) ? message.join('; ') : message
    throw new ApiError(res.status, msg || (res.status === 413 ? 'Envio grande demais.' : `Erro ${res.status} ao falar com o servidor.`))
  }
  return body as T
}

export async function api<T>(path: string, init: { method?: string; json?: unknown } = {}): Promise<T> {
  const headers: Record<string, string> = {}
  const t = await token()
  if (t) headers.Authorization = `Bearer ${t}`
  if (init.json !== undefined) headers['Content-Type'] = 'application/json'
  const res = await fetch(`${BASE}${path}`, {
    method: init.method ?? (init.json !== undefined ? 'POST' : 'GET'),
    headers,
    body: init.json !== undefined ? JSON.stringify(init.json) : undefined,
  })
  return parse<T>(res)
}

export async function apiUpload<T>(path: string, fields: Record<string, string>, frames: Blob[]): Promise<T> {
  const form = new FormData()
  for (const [k, v] of Object.entries(fields)) form.append(k, v)
  frames.forEach((blob, i) => form.append('frames', blob, `f${i}.jpg`))
  const headers: Record<string, string> = {}
  const t = await token()
  if (t) headers.Authorization = `Bearer ${t}`
  const res = await fetch(`${BASE}${path}`, { method: 'POST', headers, body: form })
  return parse<T>(res)
}
