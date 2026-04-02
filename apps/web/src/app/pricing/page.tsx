import Link from 'next/link'
import Image from 'next/image'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { FREE_MESSAGES_LIMIT } from '@/lib/stripe'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Тарифи — LUMARA Academy' }

const plans = [
  {
    key: 'FREE',
    name: 'Безкоштовно',
    price: null,
    description: 'Відчуй силу LUMARA',
    features: [
      `${FREE_MESSAGES_LIMIT} повідомлень (разово)`,
      'Доступ до LUNA',
      'Базові відповіді',
    ],
    limitations: [
      'Без збереження історії',
      'Без натальної карти',
    ],
    cta: 'Почати безкоштовно',
    href: '/login',
    highlighted: false,
  },
  {
    key: 'BASIC',
    name: 'Базовий',
    price: 180,
    description: 'Для тих, хто досліджує',
    features: [
      '150 повідомлень на місяць',
      'Всі 4 агенти',
      'Збереження історії сесій',
    ],
    limitations: [
      'Без натальної карти',
      'Без курсів',
    ],
    cta: 'Обрати Базовий',
    href: '/api/stripe/checkout?plan=BASIC',
    highlighted: false,
  },
  {
    key: 'PRO',
    name: 'Про',
    price: 450,
    description: 'Для серйозної практики',
    features: [
      'Необмежені повідомлення',
      'Всі 4 агенти',
      'Збереження історії сесій',
      'Персональна натальна карта',
    ],
    limitations: [],
    cta: 'Обрати Про',
    href: '/api/stripe/checkout?plan=PRO',
    highlighted: true, // найпопулярніший
  },
  {
    key: 'ELITE',
    name: 'Еліт',
    price: 1000,
    description: 'Максимальна глибина',
    features: [
      'Необмежені повідомлення',
      'Всі 4 агенти',
      'Збереження історії сесій',
      'Персональна натальна карта',
      'Модель Claude Opus (глибший аналіз)',
      'Доступ до курсів академії',
    ],
    limitations: [],
    cta: 'Обрати Еліт',
    href: '/api/stripe/checkout?plan=ELITE',
    highlighted: false,
  },
]

export default async function PricingPage() {
  const session = await getServerSession(authOptions)

  return (
    <main className="min-h-screen relative">
      {/* Фон */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-lumara-950/20 to-black pointer-events-none" />

      {/* Навігація */}
      <nav className="relative z-10 border-b border-white/5 backdrop-blur-md bg-black/20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/lumara-logo.png" alt="LUMARA" width={36} height={36} className="rounded-full" />
            <span className="font-display text-2xl font-bold bg-gradient-to-r from-lumara-300 to-gold-400 bg-clip-text text-transparent">
              LUMARA
            </span>
          </Link>
          {session ? (
            <Link href="/dashboard" className="text-white/70 hover:text-white text-sm transition-colors">
              До академії →
            </Link>
          ) : (
            <Link
              href="/login"
              className="bg-gradient-to-r from-lumara-600 to-lumara-500 text-white text-sm font-medium px-5 py-2 rounded-xl hover:from-lumara-500 hover:to-lumara-400 transition-all"
            >
              Увійти
            </Link>
          )}
        </div>
      </nav>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        {/* Заголовок */}
        <div className="text-center mb-16">
          <h1 className="font-display text-5xl font-bold text-white mb-4">
            Обери свій шлях
          </h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Від першого знайомства до глибокої практики — LUMARA супроводжує на кожному рівні
          </p>
        </div>

        {/* Картки планів */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.key}
              className={`relative glass-card p-6 flex flex-col ${
                plan.highlighted
                  ? 'border-lumara-500/50 bg-gradient-to-b from-lumara-900/30 to-lumara-950/20'
                  : 'border-white/10'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-lumara-600 to-lumara-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Найпопулярніший
                  </span>
                </div>
              )}

              {/* Назва і ціна */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white mb-1">{plan.name}</h2>
                <p className="text-white/40 text-sm mb-4">{plan.description}</p>
                {plan.price ? (
                  <div className="flex items-end gap-1">
                    <span className="font-display text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-white/50 text-sm mb-1">грн/міс</span>
                  </div>
                ) : (
                  <span className="font-display text-4xl font-bold text-white">0</span>
                )}
              </div>

              {/* Фічі */}
              <ul className="space-y-2 flex-1 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-white/70">
                    <span className="text-lumara-400 mt-0.5 flex-shrink-0">✓</span>
                    {f}
                  </li>
                ))}
                {plan.limitations.map((l) => (
                  <li key={l} className="flex items-start gap-2 text-sm text-white/30 line-through">
                    <span className="mt-0.5 flex-shrink-0">✗</span>
                    {l}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={plan.href}
                className={`w-full text-center py-3 rounded-xl text-sm font-semibold transition-all ${
                  plan.highlighted
                    ? 'bg-gradient-to-r from-lumara-600 to-lumara-500 text-white hover:from-lumara-500 hover:to-lumara-400 shadow-[0_0_20px_rgba(192,64,240,0.3)]'
                    : 'bg-white/5 text-white/80 hover:bg-white/10 border border-white/10'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Примітка */}
        <p className="text-center text-white/30 text-sm mt-10">
          Всі платні плани включають 7-денний безкоштовний пробний період. Скасування в будь-який момент.
        </p>
      </div>
    </main>
  )
}
