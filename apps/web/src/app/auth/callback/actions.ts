'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { db } from '@lumara/database'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'woshem68@gmail.com'

export async function syncUserAfterAuth(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )

  // Встановлюємо сесію на сервері
  const { error: sessionError } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  })

  if (sessionError) {
    console.error('Server setSession error:', sessionError)
    return null
  }

  const { data: { user } } = await supabase.auth.getUser()

  if (!user?.email) return null

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

  return dbUser
}
