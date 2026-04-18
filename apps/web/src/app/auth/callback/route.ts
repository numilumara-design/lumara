import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const nextParam = searchParams.get('next') ?? '/dashboard'
  const next = nextParam.startsWith('/') ? nextParam : '/dashboard'

  const forwardedHost = request.headers.get('x-forwarded-host')
  const origin = forwardedHost
    ? `https://${forwardedHost.split(',')[0].trim()}`
    : new URL(request.url).origin

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`)
  }

  const cookieStore = cookies()

  // Перехоплюємо cookies які Supabase хоче встановити
  const captured: Array<{ name: string; value: string; options: Record<string, unknown> }> = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          // Зберігаємо для явної передачі в redirect response
          cookiesToSet.forEach((c) => captured.push(c))
        },
      },
    }
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  const dest = error
    ? `${origin}/login?error=exchange_failed`
    : `${origin}${next}`

  if (error) {
    console.error('[auth/callback] exchangeCodeForSession error:', error.message)
  }

  // Явно ставимо session cookies на redirect response
  const response = NextResponse.redirect(dest)
  captured.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
  })
  return response
}
