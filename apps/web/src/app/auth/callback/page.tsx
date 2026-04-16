'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

function getCookieValue(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  if (!match) return null
  try {
    return decodeURIComponent(match[2])
  } catch {
    return match[2]
  }
}

function getProjectRef(url: string): string {
  try {
    const host = new URL(url).hostname
    return host.split('.')[0]
  } catch {
    return ''
  }
}

function CallbackHandler() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<string>('Авторизація...')
  const [errorInfo, setErrorInfo] = useState<string | null>(null)

  useEffect(() => {
    async function doLogin() {
      const errorParam = searchParams.get('error')
      const errorDesc = searchParams.get('error_description')
      const next = searchParams.get('next') ?? '/dashboard'

      if (errorParam || errorDesc) {
        setErrorInfo(`Помилка OAuth: ${errorDesc || errorParam}`)
        return
      }

      let accessToken: string | null = null
      let refreshToken: string | null = null

      const code = searchParams.get('code')
      if (code) {
        setStatus('Обмін code на сесію...')

        const projectRef = getProjectRef(SUPABASE_URL)
        const verifierCookieName = projectRef
          ? `sb-${projectRef}-auth-token-code-verifier`
          : 'sb-auth-token-code-verifier'
        const verifierRaw = getCookieValue(verifierCookieName)

        console.log('[callback] verifier cookie name:', verifierCookieName)
        console.log('[callback] verifier raw:', verifierRaw ? verifierRaw.slice(0, 30) + '...' : null)
        console.log('[callback] document.cookie:', document.cookie)

        if (!verifierRaw) {
          setErrorInfo('Помилка: код verifier відсутній. Спробуй увійти знову.')
          return
        }

        const codeVerifier = verifierRaw.startsWith('"')
          ? JSON.parse(verifierRaw)
          : verifierRaw

        const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=pkce`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: ANON_KEY,
          },
          body: JSON.stringify({
            auth_code: code,
            code_verifier: codeVerifier,
          }),
        })

        const data = await res.json().catch(() => ({ parseError: true }))
        console.log('[callback] PKCE fetch status:', res.status)
        console.log('[callback] PKCE fetch data:', JSON.stringify(data))

        if (!res.ok || !data?.access_token) {
          const msg = data?.error_description || data?.error || res.statusText || JSON.stringify(data)
          setErrorInfo(`Обмін не вдався [${res.status}]: ${msg}`)
          return
        }

        accessToken = data.access_token
        refreshToken = data.refresh_token ?? null
      }

      if (!accessToken) {
        setErrorInfo('Помилка: не вдалося отримати токен авторизації.')
        return
      }

      setStatus('Синхронізація з сервером...')

      const syncRes = await fetch('/api/auth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: accessToken,
          refresh_token: refreshToken,
        }),
      })

      const responseData = await syncRes.json().catch(() => ({ error: 'parse_failed' }))
      console.log('[callback] відповідь /api/auth/callback:', { status: syncRes.status, data: responseData })

      if (!syncRes.ok || !responseData.success) {
        const msg = responseData.error || responseData.details || 'unknown'
        setErrorInfo(`Помилка сервера: ${msg}`)
        return
      }

      window.location.href = next
    }

    doLogin()
  }, [searchParams])

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-xl font-semibold text-white">Вхід через Google</h1>
      {errorInfo ? (
        <div className="rounded-lg bg-red-500/20 px-6 py-4 text-red-200 max-w-md">
          <p className="font-medium">{errorInfo}</p>
        </div>
      ) : (
        <>
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          <p className="text-white/60 text-sm max-w-md">{status}</p>
        </>
      )}
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <CallbackHandler />
    </Suspense>
  )
}
