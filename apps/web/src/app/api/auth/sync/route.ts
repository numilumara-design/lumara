import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'woshem68@gmail.com'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function supabaseQuery(method: string, path: string, body?: any) {
  const url = `${SUPABASE_URL}/rest/v1${path}`
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Prefer': method === 'POST' && path.includes('on_conflict') ? 'resolution=merge-duplicates' : 'return=representation',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  if (!res.ok) {
    throw new Error(`Supabase ${method} ${path} failed: ${res.status} ${text.slice(0, 200)}`)
  }
  return text ? JSON.parse(text) : null
}

export async function POST(request: Request) {
  try {
    const { access_token } = await request.json()

    if (!access_token) {
      return NextResponse.json({ error: 'missing_token' }, { status: 400 })
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { data: { user }, error: userError } = await supabase.auth.getUser(access_token)
    if (userError || !user?.email) {
      return NextResponse.json({ error: 'invalid_token', details: userError?.message }, { status: 401 })
    }

    const email = user.email
    const isAdmin = email === ADMIN_EMAIL
    const name = (user.user_metadata?.full_name as string | undefined)
      ?? (user.user_metadata?.name as string | undefined)
      ?? null
    const image = (user.user_metadata?.avatar_url as string | undefined)
      ?? (user.user_metadata?.picture as string | undefined)
      ?? null
    const role = isAdmin ? 'ADMIN' : 'USER'

    // Перевіряємо, чи є користувач
    const existing = await supabaseQuery('GET', `/users?email=eq.${encodeURIComponent(email)}&select=id`)
    let userId: string

    if (existing && existing.length > 0) {
      userId = existing[0].id
      await supabaseQuery('PATCH', `/users?id=eq.${userId}`, { name, image, role })
    } else {
      userId = randomUUID()
      await supabaseQuery('POST', '/users', { id: userId, email, name, image, role })
    }

    // Profile
    const profiles = await supabaseQuery('GET', `/profiles?user_id=eq.${userId}&select=id`)
    if (!profiles || profiles.length === 0) {
      await supabaseQuery('POST', '/profiles', {
        id: randomUUID(),
        user_id: userId,
        language: 'uk',
        timezone: 'Europe/Kiev',
      })
    }

    // Activity log
    await supabaseQuery('POST', '/activity_logs', {
      id: randomUUID(),
      user_id: userId,
      action: 'SIGN_IN',
      metadata: { provider: 'google' },
    })

    return NextResponse.json({ success: true, userId })
  } catch (err: any) {
    console.error('Auth sync error:', err?.message || err)
    return NextResponse.json({ error: 'server_error', details: err?.message || String(err) }, { status: 500 })
  }
}
