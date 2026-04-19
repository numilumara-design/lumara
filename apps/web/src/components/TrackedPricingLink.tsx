'use client'

import Link from 'next/link'
import { track } from '@vercel/analytics'

export function TrackedPricingLink() {
  return (
    <Link
      href="/pricing"
      onClick={() => track('pricing_click')}
      className="mt-1 w-full flex items-center gap-2 px-3 py-2 rounded-xl text-lumara-400/60 hover:text-lumara-300 hover:bg-lumara-900/20 transition-all text-xs"
    >
      <span>⭐</span> Тарифи
    </Link>
  )
}
