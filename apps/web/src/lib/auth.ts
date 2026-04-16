import { createClient } from '@/lib/supabase/server'
import { db } from '@lumara/database'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'woshem68@gmail.com'

export type SessionUser = {
  id: string
  email: string
  name: string | null
  image: string | null
  role: string
}

// Отримує поточного користувача з Supabase Auth та синхронізує з Prisma
export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user?.email) return null

  const dbUser = await db.user.findUnique({
    where: { email: user.email },
    select: { id: true, email: true, name: true, image: true, role: true },
  })

  if (dbUser) return dbUser

  // Якщо користувач є в Supabase, але ще не в Prisma — створюємо
  const isAdmin = user.email === ADMIN_EMAIL
  const newUser = await db.user.create({
    data: {
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
    where: { userId: newUser.id },
    update: {},
    create: { userId: newUser.id, language: 'uk', timezone: 'Europe/Kiev' },
  }).catch(() => null)

  await db.activityLog.create({
    data: {
      userId: newUser.id,
      action: 'SIGN_IN',
      metadata: { provider: 'google' },
    },
  }).catch(() => null)

  return newUser
}
