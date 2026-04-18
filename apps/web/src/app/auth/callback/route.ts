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

  console.log('[auth/callback] code present:', !!code, '| origin:', origin, '| next:', next)

  if (!code) {
    console.error('[auth/callback] missing code')
    return NextResponse.redirect(`${origin}/login?error=missing_code`, { status: 302 })
  }

  const cookieStore = cookies()
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
          cookiesToSet.forEach((c) => captured.push(c))
        },
      },
    }
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('[auth/callback] EXCHANGE ERROR:', error.message, '| status:', error.status)
    return NextResponse.redirect(`${origin}/login?error=exchange_failed`, { status: 302 })
  }

  console.log('[auth/callback] exchange SUCCESS, user:', data.session?.user?.email)
  console.log('[auth/callback] captured cookies with options:', JSON.stringify(captured.map(c => ({ name: c.name, options: c.options }))))

  const response = NextResponse.redirect(`${origin}${next}`, { status: 302 })

  captured.forEach(({ name, value, options }) => {
    const cookieOptions: Parameters<typeof response.cookies.set>[2] = {
      path: typeof options.path === 'string' ? options.path : '/',
      sameSite: (options.sameSite as 'lax' | 'strict' | 'none') ?? 'lax',
      httpOnly: options.httpOnly === true,
      secure: options.secure === true,
    }
    if (typeof options.maxAge === 'number') cookieOptions.maxAge = options.maxAge
    if (options.expires instanceof Date) cookieOptions.expires = options.expires

    response.cookies.set(name, value, cookieOptions)
  })

  return response
}
