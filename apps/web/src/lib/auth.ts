import { createClient } from '@/lib/supabase/server'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'woshem68@gmail.com'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export type SessionUser = {
  id: string
  email: string
  name: string | null
  image: string | null
  role: string
}

// Пошук юзера в таблиці users через service role (обходить RLS)
async function findUserByEmail(email: string): Promise<SessionUser | null> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/users?email=eq.${encodeURIComponent(email)}&select=id,email,name,image,role&limit=1`,
    {
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${SERVICE_KEY}`,
      },
    }
  )
  const rows = await res.json()
  if (Array.isArray(rows) && rows.length > 0) return rows[0] as SessionUser
  return null
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user?.email) return null

  const name =
    (user.user_metadata?.full_name as string | undefined)
    ?? (user.user_metadata?.name as string | undefined)
    ?? null
  const image =
    (user.user_metadata?.avatar_url as string | undefined)
    ?? (user.user_metadata?.picture as string | undefined)
    ?? null
  const isAdmin = user.email === ADMIN_EMAIL
  const role = isAdmin ? 'ADMIN' : 'USER'

  // Шукаємо по email з service key — обходить RLS, знаходить записи з будь-яким UUID
  const existing = await findUserByEmail(user.email)
  if (existing) return existing

  // Юзер не існує — створюємо новий запис через service key
  const createRes = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      Authorization: `Bearer ${SERVICE_KEY}`,
      Prefer: 'return=representation',
    },
    body: JSON.stringify({ id: user.id, email: user.email, name, image, role }),
  })

  if (createRes.ok) {
    const [newUser] = await createRes.json()
    if (newUser) return newUser as SessionUser
  }

  // Останній fallback — з Supabase Auth напряму
  return { id: user.id, email: user.email, name, image, role }
}
