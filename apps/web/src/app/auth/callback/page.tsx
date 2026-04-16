'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function CallbackHandler() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<string>('Автоматичний вхід...')

  useEffect(() => {
    async function run() {
      const errorParam = searchParams.get('error')
      const errorDesc = searchParams.get('error_description')
      const next = searchParams.get('next') ?? '/dashboard'

      if (errorParam || errorDesc) {
        setStatus(`Помилка Google: ${errorDesc || errorParam}`)
        return
      }

      const hash = typeof window !== 'undefined' ? window.location.hash.substring(1) : ''
      const hashParams = new URLSearchParams(hash)
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')

      if (!accessToken) {
        setStatus('Помилка: немає access_token')
        return
      }

      setStatus('Встановлення сесії...')
      const supabase = createClient()
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || '',
      })
      if (error) {
        setStatus(`Помилка setSession: ${error.message}`)
        return
      }

      setStatus('Синхронізація з базою...')
      const res = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: accessToken, refresh_token: refreshToken }),
      })

      let resText = ''
      try {
        resText = await res.text()
        const data = JSON.parse(resText)
        if (!res.ok || !data.success) {
          setStatus(`Помилка синхронізації: ${JSON.stringify(data, null, 2)}`)
          return
        }
      } catch (err: any) {
        setStatus(`Помилка fetch/parse: ${err?.message || String(err)}\n\nRaw response:\n${resText.slice(0, 500)}`)
        return
      }

      // Debug cookies
      const cookies = document.cookie.split('; ').filter(Boolean).join('\n')
      setStatus(`Успіх! Cookies:\n${cookies}\n\nПеренаправлення...`)

      setTimeout(() => {
        window.location.href = next
      }, 1500)
    }

    run()
  }, [searchParams])

  return (
    <div className="fixed left-4 top-4 z-[9999] max-h-[90vh] max-w-[90vw] overflow-auto rounded border-2 border-yellow-500 bg-black p-4 text-xs text-yellow-400 shadow-2xl">
      <pre className="whitespace-pre-wrap">{status}</pre>
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
