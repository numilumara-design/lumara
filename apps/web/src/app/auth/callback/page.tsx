'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function CallbackHandler() {
  const searchParams = useSearchParams()

  useEffect(() => {
    async function run() {
      const errorParam = searchParams.get('error')
      const errorDesc = searchParams.get('error_description')
      const next = searchParams.get('next') ?? '/dashboard'

      if (errorParam || errorDesc) {
        window.location.href = `/login?error=callback&details=${encodeURIComponent(errorDesc || errorParam || 'unknown')}`
        return
      }

      const code = searchParams.get('code')
      const hash = typeof window !== 'undefined' ? window.location.hash.substring(1) : ''
      const hashParams = new URLSearchParams(hash)
      let accessToken = hashParams.get('access_token')
      let refreshToken = hashParams.get('refresh_token')

      const supabase = createClient()

      // PKCE flow: обмінюємо code на сесію спочатку на клієнті
      if (code && !accessToken) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        if (error || !data.session) {
          window.location.href = `/login?error=callback&details=${encodeURIComponent(error?.message || 'exchange_failed')}`
          return
        }
        accessToken = data.session.access_token
        refreshToken = data.session.refresh_token
      }

      if (!accessToken) {
        window.location.href = '/login?error=callback&details=no_token'
        return
      }

      const res = await fetch('/api/auth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: accessToken, refresh_token: refreshToken }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        window.location.href = `/login?error=callback&details=${encodeURIComponent(data.error || 'sync_failed')}`
        return
      }

      window.location.href = next
    }

    run()
  }, [searchParams])

  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-white/60">Вхід виконується...</p>
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
