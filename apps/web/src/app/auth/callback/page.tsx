'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

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

      const code = searchParams.get('code')

      if (!code) {
        setErrorInfo('Помилка: відсутній код авторизації. Спробуй увійти знову.')
        return
      }

      setStatus('Обмін code на сесію...')
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error || !data.session) {
        setErrorInfo(`Обмін не вдався: ${error?.message || 'no session'}`)
        return
      }

      const accessToken = data.session.access_token
      const refreshToken = data.session.refresh_token

      setStatus('Синхронізація з сервером...')

      const res = await fetch('/api/auth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: accessToken,
          refresh_token: refreshToken,
        }),
      })

      const responseData = await res.json().catch(() => ({ error: 'parse_failed' }))

      if (!res.ok || !responseData.success) {
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
