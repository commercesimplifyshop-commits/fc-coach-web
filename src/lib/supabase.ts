import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// Public (publishable) credentials only. Null when not configured so the
// public pages (formations) keep working without a login backend.
export const supabase = url && key ? createClient(url, key) : null
