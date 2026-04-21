import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { mages } from '../../mages/mages-data'
import type { Metadata } from 'next'

export function generateStaticParams() {
  return mages.map((m) => ({ mage: m.id }))
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://lumara.fyi'

const telegramHandles: Record<string, string> = {
  luna: 'luna_lumara',
  arcas: 'arcas_lumara',
  numi: 'numi_lumara',
  umbra: 'umbra_lumara',
}

export async function generateMetadata({
  params,
}: {
  params: { mage: string }
}): Promise<Metadata> {
  const mage = mages.find((m) => m.id === params.mage)
  if (!mage) return {}
  const title = `${mage.name} — ${mage.role} | LUMARA`
  const description = mage.tagline + '. Перші 15 повідомлень безкоштовно.'
  const image = `${BASE_URL}/${mage.id}-portrait-1.png`
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: image, width: 800, height: 1067, alt: mage.name }],
    },
  }
}

export default function LinksPage({ params }: { params: { mage: string } }) {
  const mage = mages.find((m) => m.id === params.mage)
  if (!mage) notFound()

  const tgHandle = telegramHandles[mage.id]
  const chatUrl = `${BASE_URL}/chat/${mage.id}?utm_source=instagram&utm_medium=bio_links`

  const stars = Array.from({ length: 30 })

  return (
    <main className="min-h-screen relative overflow-hidden bg-[#080810] flex items-center justify-center">

      {/* ФОН — кімната мага */}
      <div className="fixed inset-0 z-0">
        <Image
          src={mage.room}
          alt=""
          fill
          className="object-cover object-center opacity-20"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/50 to-black/95" />
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.9) 100%)',
          }}
        />
      </div>

      {/* СВІЧКОВИЙ ВІДБЛИСК */}
      <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
        <div
          className="candle-glow absolute bottom-0 left-1/3 w-80 h-80 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(251,146,60,0.15) 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full blur-3xl"
          style={{ background: `radial-gradient(ellipse, ${mage.candleColor} 0%, transparent 70%)`, opacity: 0.6 }}
        />
      </div>

      {/* ЗІРКИ */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {stars.map((_, i) => (
          <span
            key={i}
            className="star"
            style={
              {
                '--sx': `${(i * 47 + 13) % 100}%`,
                '--sy': `${(i * 31 + 7) % 70}%`,
                '--sd': `${(i * 1.3) % 5}s`,
                '--ss': `${1 + (i % 3)}px`,
                '--sc': mage.starColor,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* ОСНОВНИЙ КОНТЕНТ */}
      <div className="relative z-10 w-full max-w-sm mx-auto px-5 py-12 flex flex-col items-center gap-7">

        {/* АВАТАР */}
        <div className="relative">
          <div
            className="absolute inset-0 rounded-full blur-2xl scale-125"
            style={{ background: `radial-gradient(circle, ${mage.glowColor}, transparent 70%)` }}
          />
          <div
            className={`relative w-28 h-28 rounded-full border-2 overflow-hidden ${mage.borderColor}`}
            style={{ boxShadow: `0 0 30px ${mage.glowColor}` }}
          >
            <Image
              src={mage.portrait}
              alt={mage.name}
              fill
              className={`object-cover ${mage.portraitPosition}`}
              sizes="112px"
              priority
            />
          </div>
        </div>

        {/* ІМ'Я І РОЛЬ */}
        <div className="text-center">
          <h1 className="font-display text-4xl font-bold text-white tracking-wide">
            {mage.name}
          </h1>
          <span
            className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase border ${mage.badgeBg}`}
          >
            ✦ {mage.role}
          </span>
          <p className={`mt-2 text-sm ${mage.textAccent} opacity-80`}>
            {mage.tagline}
          </p>
        </div>

        {/* КНОПКИ */}
        <div className="w-full flex flex-col gap-3">

          {/* Кнопка 1 — головна */}
          <Link
            href={chatUrl}
            className={`w-full flex items-center justify-center gap-3 bg-gradient-to-r ${mage.ctaGradient} text-white font-bold py-4 px-6 rounded-2xl text-base shadow-2xl active:scale-95 transition-transform`}
            style={{ boxShadow: `0 0 25px ${mage.glowColor}` }}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            💬 Поговорити з {mage.name} безкоштовно
          </Link>

          {/* Кнопка 2 — Telegram */}
          <a
            href={`https://t.me/${tgHandle}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-white font-semibold py-4 px-6 rounded-2xl text-base border ${mage.borderColor}`}
          >
            <svg className="w-5 h-5 flex-shrink-0 text-sky-400" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L8.32 13.617l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.828.942z" />
            </svg>
            📲 Telegram канал
          </a>

          {/* Кнопка 3 — LUMARA (менша) */}
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 bg-white/3 hover:bg-white/8 active:scale-95 transition-all text-white/60 hover:text-white/80 font-medium py-3 px-6 rounded-xl text-sm border border-white/10"
          >
            🏛️ LUMARA Academy
          </Link>
        </div>

        {/* ПІДПИС */}
        <p className="text-white/35 text-xs text-center">
          Перші 15 повідомлень безкоштовно ✨
        </p>

        {/* ЛОГОТИП */}
        <Link href="/" className="flex items-center gap-2 opacity-40 hover:opacity-70 transition-opacity mt-2">
          <Image src="/lumara-logo.png" alt="LUMARA" width={18} height={18} className="rounded-full" />
          <span className="font-display text-xs text-white/60 tracking-widest uppercase">LUMARA</span>
        </Link>
      </div>

      {/* CSS */}
      <style>{`
        .star {
          position: absolute;
          left: var(--sx);
          top: var(--sy);
          width: var(--ss);
          height: var(--ss);
          border-radius: 50%;
          background: var(--sc);
          animation: twinkle var(--sd, 3s) infinite ease-in-out;
          animation-delay: calc(var(--sd) * -0.5);
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.1; transform: scale(0.8); }
          50% { opacity: 0.9; transform: scale(1.3); }
        }
        .candle-glow {
          animation: candle-flicker 3s infinite ease-in-out;
        }
        @keyframes candle-flicker {
          0%, 100% { opacity: 0.6; }
          40% { opacity: 0.85; }
          70% { opacity: 0.45; }
        }
      `}</style>
    </main>
  )
}
