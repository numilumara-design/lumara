'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { syncUserAfterAuth } from './actions'

function CallbackHandler() {
  const searchParams = useSearchParams()
  const [info, setInfo] = useState<string>('Збір даних...')
  const [done, setDone] = useState(false)

  useEffect(() => {
    const params: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      params[key] = value
    })

    const storage: Record<string, string | null> = {}
    if (typeof window !== 'undefined') {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.includes('supabase') && key.includes('verifier')) {
          storage[key] = localStorage.getItem(key)
        }
      }
    }

    setInfo(JSON.stringify({ params, storage, url: typeof window !== 'undefined' ? window.location.href : null }, null, 2))
  }, [searchParams])

  async function proceed() {
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/dashboard'
    const errorParam = searchParams.get('error')
    const errorDesc = searchParams.get('error_description')

    if (errorParam || errorDesc) {
      window.location.href = `/login?error=callback&details=${encodeURIComponent(errorDesc || errorParam || 'unknown_error')}`
      return
    }

    if (!code) {
      window.location.href = '/login?error=callback&details=no_code'
      return
    }

    setDone(true)
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      window.location.href = `/login?error=callback&details=${encodeURIComponent(error.message)}`
      return
    }

    await syncUserAfterAuth()
    window.location.href = next
  }

  return (
    <div className="fixed left-4 top-4 z-[9999] max-h-[90vh] max-w-[90vw] overflow-auto rounded border-2 border-yellow-500 bg-black p-4 text-xs text-yellow-400 shadow-2xl">
      <pre className="whitespace-pre-wrap">{info}</pre>
      {!done && (
        <button
          onClick={proceed}
          className="mt-4 w-full rounded bg-yellow-500 px-3 py-2 font-bold text-black hover:bg-yellow-400"
        >
          Продовжити вхід
        </button>
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
