'use client'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Supabase клієнт для Client Components (чистий browser client з localStorage)
export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        detectSessionInUrl: false,
        persistSession: true,
      },
    }
  )
}
