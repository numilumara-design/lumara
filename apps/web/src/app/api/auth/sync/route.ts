import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { db } from '@lumara/database'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'woshem68@gmail.com'

export async function POST(request: Request) {
  try {
    const { access_token, refresh_token } = await request.json()

    if (!access_token) {
      return NextResponse.json({ error: 'missing_token' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser(access_token)

    if (userError || !user?.email) {
      console.error('getUser error:', userError)
      return NextResponse.json({ error: 'invalid_token' }, { status: 401 })
    }

    const isAdmin = user.email === ADMIN_EMAIL

    const dbUser = await db.user.upsert({
      where: { email: user.email },
      update: {
        name: (user.user_metadata?.full_name as string | undefined)
          ?? (user.user_metadata?.name as string | undefined)
          ?? null,
        image: (user.user_metadata?.avatar_url as string | undefined)
          ?? (user.user_metadata?.picture as string | undefined)
          ?? null,
        ...(isAdmin ? { role: 'ADMIN' } : {}),
      },
      create: {
        email: user.email,
        name: (user.user_metadata?.full_name as string | undefined)
          ?? (user.user_metadata?.name as string | undefined)
          ?? null,
        image: (user.user_metadata?.avatar_url as string | undefined)
          ?? (user.user_metadata?.picture as string | undefined)
          ?? null,
        role: isAdmin ? 'ADMIN' : 'USER',
      },
    })

    await db.profile.upsert({
      where: { userId: dbUser.id },
      update: {},
      create: { userId: dbUser.id, language: 'uk', timezone: 'Europe/Kiev' },
      
    }).catch(() => null)

    await db.activityLog.create({
      data: {
        userId: dbUser.id,
        action: 'SIGN_IN',
        metadata: { provider: 'google' },
      },
    }).catch(() => null)

    return NextResponse.json({ success: true, userId: dbUser.id })
  } catch (err) {
    console.error('Auth sync error:', err)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
