import Image from 'next/image'
import Link from 'next/link'

const mages = [
  {
    id: 'luna',
    name: 'LUNA',
    role: 'Астрологія',
    icon: '🌙',
    tg: 'https://t.me/luna_lumara',
    color: 'from-blue-600 to-indigo-600',
    glow: 'rgba(99,102,241,0.4)',
    border: 'border-blue-500/30',
    text: 'text-blue-300',
    bg: 'bg-blue-500/10',
  },
  {
    id: 'arcas',
    name: 'ARCAS',
    role: 'Таро',
    icon: '🃏',
    tg: 'https://t.me/arcas_lumara',
    color: 'from-purple-600 to-violet-600',
    glow: 'rgba(139,92,246,0.4)',
    border: 'border-purple-500/30',
    text: 'text-purple-300',
    bg: 'bg-purple-500/10',
  },
  {
    id: 'numi',
    name: 'NUMI',
    role: 'Нумерологія',
    icon: '🔢',
    tg: 'https://t.me/numi_lumara',
    color: 'from-amber-500 to-yellow-500',
    glow: 'rgba(245,158,11,0.4)',
    border: 'border-amber-500/30',
    text: 'text-amber-300',
    bg: 'bg-amber-500/10',
  },
  {
    id: 'umbra',
    name: 'UMBRA',
    role: 'Езо-психологія',
    icon: '🧠',
    tg: 'https://t.me/umbra_lumara',
    color: 'from-slate-500 to-gray-600',
    glow: 'rgba(100,116,139,0.4)',
    border: 'border-slate-500/30',
    text: 'text-slate-300',
    bg: 'bg-slate-500/10',
  },
]

const stars = Array.from({ length: 40 })

export const metadata = {
  title: 'LUMARA — Посилання',
  description: 'Illuminate your path. AI-маги астрології, таро, нумерології та езо-психології.',
}

export default function LinksPage() {
  return (
    <main className="min-h-screen relative overflow-hidden bg-[#080810] flex flex-col items-center">

      {/* ФОН — зірки */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {stars.map((_, i) => (
          <span
            key={i}
            className="star"
            style={
              {
                '--sx': `${(i * 47 + 13) % 100}%`,
                '--sy': `${(i * 31 + 7) % 100}%`,
                '--sd': `${(i * 1.3) % 5}s`,
                '--ss': `${1 + (i % 3)}px`,
                '--sc': 'rgba(200,200,255,0.8)',
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* ГРАДІЄНТ зверху */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at top, rgba(99,102,241,0.08) 0%, transparent 60%)',
        }}
      />

      {/* КОНТЕНТ */}
      <div className="relative z-10 w-full max-w-sm mx-auto px-5 py-12 flex flex-col items-center gap-8">

        {/* ЛОГОТИП */}
        <div className="flex flex-col items-center gap-3">
          <Image
            src="/lumara-logo.png"
            alt="LUMARA"
            width={56}
            height={56}
            className="rounded-full"
            priority
          />
          <h1 className="font-display text-2xl font-bold text-white tracking-widest uppercase">
            LUMARA
          </h1>
          <p className="text-white/50 text-sm tracking-wide">
            Illuminate your path
          </p>
        </div>

        {/* КАРТКИ МАГІВ */}
        <div className="w-full flex flex-col gap-3">
          {mages.map((m) => (
            <a
              key={m.id}
              href={m.tg}
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative w-full flex items-center gap-4 rounded-2xl border ${m.border} ${m.bg} p-4 transition-all hover:scale-[1.02] active:scale-95`}
              style={{ boxShadow: `0 0 20px ${m.glow}` }}
            >
              {/* Іконка */}
              <span className="text-3xl flex-shrink-0">{m.icon}</span>

              {/* Текст */}
              <div className="flex flex-col">
                <span className="text-white font-bold text-lg leading-tight">{m.name}</span>
                <span className={`text-sm ${m.text}`}>{m.role}</span>
              </div>

              {/* Стрілка */}
              <svg
                className="ml-auto w-5 h-5 text-white/30 group-hover:text-white/60 transition-colors flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          ))}
        </div>

        {/* КНОПКА — Академія */}
        <Link
          href="https://lumara.fyi"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-4 px-6 rounded-2xl text-base shadow-2xl active:scale-95 transition-transform"
          style={{ boxShadow: '0 0 25px rgba(99,102,241,0.3)' }}
        >
          <span>✨</span>
          Увійти до Академії
        </Link>

        {/* ПІДПИС */}
        <p className="text-white/30 text-xs text-center">
          AI-маги нового покоління · lumara.fyi
        </p>
      </div>

      {/* CSS для зірок */}
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
      `}</style>
    </main>
  )
}
