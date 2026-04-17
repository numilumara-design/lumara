import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET() {
  const cookieStore = cookies()
  const allCookies = cookieStore.getAll()
  const supabaseCookies = allCookies.filter(c => c.name.includes('sb-') || c.name.includes('supabase'))

  const supabase = await createClient()
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  return NextResponse.json({
    allCookieNames: allCookies.map(c => c.name),
    supabaseCookieNames: supabaseCookies.map(c => c.name),
    session: session ? {
      userId: session.user?.id,
      email: session.user?.email,
      expiresAt: session.expires_at,
    } : null,
    sessionError: sessionError?.message ?? null,
    user: user ? {
      id: user.id,
      email: user.email,
    } : null,
    userError: userError?.message ?? null,
  })
}
