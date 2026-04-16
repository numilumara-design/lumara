'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function CallbackHandler() {
  const searchParams = useSearchParams()

  // Витягуємо hash ОДИН РАЗ при ініціалізації компонента, ДО будь-яких ефектів
  const [tokens] = useState(() => {
    if (typeof window === 'undefined') {
      console.log('[callback] window undefined на момент ініціалізації')
      return null
    }
    const rawHash = window.location.hash
    console.log('[callback] raw window.location.hash:', JSON.stringify(rawHash))
    const hash = rawHash.substring(1)
    const params = new URLSearchParams(hash)
    const result = {
      accessToken: params.get('access_token'),
      refreshToken: params.get('refresh_token'),
    }
    console.log('[callback] parsed tokens:', {
      hasAccessToken: !!result.accessToken,
      hasRefreshToken: !!result.refreshToken,
    })
    return result
  })

  const [status, setStatus] = useState<string>('Авторизація...')

  useEffect(() => {
    async function doLogin() {
      const errorParam = searchParams.get('error')
      const errorDesc = searchParams.get('error_description')
      const next = searchParams.get('next') ?? '/dashboard'

      if (errorParam || errorDesc) {
        console.error('[callback] OAuth error from query:', { errorParam, errorDesc })
        window.location.href = `/login?error=${encodeURIComponent(errorDesc || errorParam || 'unknown')}`
        return
      }

      if (!tokens?.accessToken) {
        console.error('[callback] missing access_token. tokens:', tokens)
        setStatus('Помилка: не вдалося отримати access_token з URL. Спробуй увійти знову.')
        return
      }

      setStatus('Синхронізація з сервером...')

      const res = await fetch('/api/auth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: tokens.accessToken,
          refresh_token: tokens.refreshToken,
        }),
      })

      const data = await res.json().catch(() => ({ error: 'parse_failed' }))
      console.log('[callback] server response:', { status: res.status, data })

      if (!res.ok || !data.success) {
        const msg = data.error || data.details || 'unknown'
        window.location.href = `/login?error=${encodeURIComponent(msg)}`
        return
      }

      window.location.href = next
    }

    doLogin()
  }, [searchParams, tokens])

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-xl font-semibold text-white">Вхід через Google</h1>
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      <p className="text-white/60 text-sm max-w-md">{status}</p>
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
