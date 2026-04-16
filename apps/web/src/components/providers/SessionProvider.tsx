'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type SessionUser = {
  id: string
  email: string
  name: string | null
  image: string | null
  role: string
}

type SessionContextValue = {
  user: SessionUser | null
  status: 'loading' | 'authenticated' | 'unauthenticated'
}

const SessionContext = createContext<SessionContextValue>({
  user: null,
  status: 'loading',
})

// Обгортка для Client Components, що потребують сесію
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [value, setValue] = useState<SessionContextValue>({
    user: null,
    status: 'loading',
  })

  useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        setValue({
          user: data.user ?? null,
          status: data.user ? 'authenticated' : 'unauthenticated',
        })
      })
      .catch(() => {
        setValue({ user: null, status: 'unauthenticated' })
      })
  }, [])

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  return useContext(SessionContext)
}
