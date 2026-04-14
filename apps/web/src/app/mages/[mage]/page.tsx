import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { mages } from '../mages-data'
import type { Metadata } from 'next'

export function generateStaticParams() {
  return mages.map((m) => ({ mage: m.id }))
}

export async function generateMetadata({
  params,
}: {
  params: { mage: string }
}): Promise<Metadata> {
  const mage = mages.find((m) => m.id === params.mage)
  if (!mage) return {}
  return {
    title: `${mage.name} — ${mage.role}`,
    description: mage.description,
  }
}

export default function MagePage({ params }: { params: { mage: string } }) {
  const mage = mages.find((m) => m.id === params.mage)
  if (!mage) notFound()

  return (
    <main className="min-h-screen relative overflow-hidden bg-[#0a0a0f]">
      {/* Фон — кімната мага (розмита, темна) */}
      <div className="fixed inset-0 z-0">
        <Image
          src={mage.room}
          alt=""
          fill
          className="object-cover object-center opacity-20"
          priority
          sizes="100vw"
        />
        {/* Градієнтний оверлей */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/40" />
      </div>

      {/* Містичні частинки (CSS анімація) */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {Array.from({ length: 20 }).map((_, i) => (
          <span
            key={i}
            className="particle"
            style={
              {
                '--x': `${(i * 37 + 10) % 100}%`,
                '--y': `${(i * 53 + 5) % 100}%`,
                '--delay': `${(i * 0.7) % 6}s`,
                '--duration': `${4 + (i % 5)}s`,
                '--size': `${2 + (i % 4)}px`,
                '--color': mage.particleColor,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* Навігація */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 backdrop-blur-md bg-black/30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/lumara-logo.png"
              alt="LUMARA"
              width={32}
              height={32}
              className="rounded-full"
            />
            <span className="font-display text-xl font-bold bg-gradient-to-r from-lumara-300 to-gold-400 bg-clip-text text-transparent">
              LUMARA
            </span>
          </Link>

          <Link
            href="/#agents"
            className="flex items-center gap-2 text-white/60 hover:text-white text-sm font-medium transition-colors border border-white/10 hover:border-white/20 px-4 py-2 rounded-xl backdrop-blur-sm"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Усі провідники
          </Link>
        </div>
      </nav>

      {/* Основний контент */}
      <div className="relative z-10 pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

            {/* Ліва колонка — портрет */}
            <div className="lg:sticky lg:top-28">
              <div className="relative">
                {/* Аура навколо портрету */}
                <div
                  className="absolute inset-0 rounded-3xl blur-3xl opacity-40 -z-10 scale-110"
                  style={{ background: `radial-gradient(circle, ${mage.glowColor}, transparent 70%)` }}
                />

                {/* Рамка портрету */}
                <div
                  className={`relative rounded-3xl border ${mage.borderColor} overflow-hidden bg-black/20`}
                  style={{
                    boxShadow: `0 0 60px ${mage.glowColor}, 0 0 120px ${mage.glowColor.replace('0.5', '0.2')}`,
                  }}
                >
                  <div className="aspect-[3/4] relative">
                    <Image
                      src={mage.portrait}
                      alt={mage.name}
                      fill
                      className="object-cover object-top"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      priority
                    />
                    {/* Нижній градієнт на портреті */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Ім'я поверх портрету (знизу) */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase border ${mage.badgeBg} backdrop-blur-sm mb-3`}
                      >
                        ✦ {mage.role}
                      </span>
                      <h1 className="font-display text-5xl font-bold text-white drop-shadow-lg">
                        {mage.name}
                      </h1>
                    </div>
                  </div>
                </div>

                {/* CTA кнопка під портретом (мобільна версія прихована, є нижче) */}
                <div className="mt-6 hidden lg:block">
                  <Link
                    href={`/chat/${mage.id}`}
                    className={`w-full flex items-center justify-center gap-3 bg-gradient-to-r ${mage.ctaGradient} text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 text-lg shadow-lg`}
                    style={{
                      boxShadow: `0 0 30px ${mage.glowColor}`,
                    }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    Поговорити з {mage.name}
                  </Link>
                </div>
              </div>
            </div>

            {/* Права колонка — інформація */}
            <div className="flex flex-col gap-8 pt-4 lg:pt-12">

              {/* Теглайн */}
              <div>
                <p className={`text-sm font-semibold tracking-widest uppercase ${mage.textAccent} mb-4`}>
                  ✦ {mage.tagline}
                </p>
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-white leading-tight">
                  Знайомся зі своїм{' '}
                  <span
                    className={`bg-gradient-to-r ${mage.accentColor} bg-clip-text text-transparent`}
                  >
                    провідником
                  </span>
                </h2>
              </div>

              {/* Опис */}
              <div className="glass-card p-6">
                <p className="text-white/75 text-lg leading-relaxed">
                  {mage.description}
                </p>
              </div>

              {/* Здібності */}
              <div>
                <h3 className="text-white/50 text-xs font-semibold tracking-widest uppercase mb-4">
                  Спеціалізація
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {mage.abilities.map((ability) => (
                    <div
                      key={ability}
                      className={`glass-card px-4 py-3.5 border ${mage.borderColor} flex items-center gap-3 group hover:bg-white/10 transition-all duration-200`}
                    >
                      <span
                        className={`text-base ${mage.textAccent} flex-shrink-0`}
                        aria-hidden="true"
                      >
                        ✦
                      </span>
                      <span className="text-white/85 text-sm font-medium">{ability}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Цитата / містичний блок */}
              <div
                className={`relative glass-card p-6 border ${mage.borderColor} overflow-hidden`}
              >
                <div
                  className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 -translate-y-8 translate-x-8"
                  style={{ background: mage.glowColor }}
                  aria-hidden="true"
                />
                <div className={`text-4xl font-display ${mage.textAccent} mb-3 opacity-40`} aria-hidden="true">
                  ❝
                </div>
                <p className="text-white/70 text-base italic leading-relaxed">
                  Кожна зустріч з {mage.name} — крок до глибшого розуміння себе та свого шляху.
                  Починай, коли серце відкрите.
                </p>
              </div>

              {/* CTA — мобільна версія */}
              <div className="lg:hidden">
                <Link
                  href={`/chat/${mage.id}`}
                  className={`w-full flex items-center justify-center gap-3 bg-gradient-to-r ${mage.ctaGradient} text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 text-lg shadow-lg`}
                  style={{
                    boxShadow: `0 0 30px ${mage.glowColor}`,
                  }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  Поговорити з {mage.name}
                </Link>
              </div>

              {/* Навігація між магами */}
              <div className="border-t border-white/10 pt-6">
                <p className="text-white/40 text-xs uppercase tracking-widest mb-4 font-semibold">
                  Інші провідники
                </p>
                <div className="flex gap-3 flex-wrap">
                  {mages
                    .filter((m) => m.id !== mage.id)
                    .map((other) => (
                      <Link
                        key={other.id}
                        href={`/mages/${other.id}`}
                        className={`flex items-center gap-2.5 glass-card px-4 py-2.5 border ${other.borderColor} hover:bg-white/10 transition-all duration-200 group`}
                      >
                        <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                          <Image
                            src={other.portrait}
                            alt={other.name}
                            fill
                            className="object-cover object-top"
                            sizes="32px"
                          />
                        </div>
                        <div>
                          <div className={`text-xs font-bold ${other.textAccent}`}>{other.name}</div>
                          <div className="text-white/40 text-xs">{other.role}</div>
                        </div>
                      </Link>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS для частинок */}
      <style>{`
        .particle {
          position: absolute;
          left: var(--x);
          top: var(--y);
          width: var(--size);
          height: var(--size);
          border-radius: 50%;
          background: var(--color);
          opacity: 0;
          animation: float-particle var(--duration) var(--delay) infinite ease-in-out;
        }

        @keyframes float-particle {
          0% {
            opacity: 0;
            transform: translateY(0) scale(0);
          }
          20% {
            opacity: 0.6;
            transform: translateY(-20px) scale(1);
          }
          80% {
            opacity: 0.3;
            transform: translateY(-80px) scale(0.8);
          }
          100% {
            opacity: 0;
            transform: translateY(-120px) scale(0);
          }
        }
      `}</style>
    </main>
  )
}
