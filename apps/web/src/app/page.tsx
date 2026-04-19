import Link from 'next/link'
import Image from 'next/image'
import { mages } from './mages/mages-data'

const steps = [
  { number: '01', title: 'Створи профіль', description: 'Вкажи дату, час та місце народження для точного аналізу' },
  { number: '02', title: 'Обери провідника', description: 'Обери мудреця відповідно до свого запиту' },
  { number: '03', title: 'Отримай відповідь', description: 'Глибокий персоналізований аналіз прямо зараз' },
]

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Навігація */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 backdrop-blur-md bg-black/20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/lumara-logo.png" alt="LUMARA" width={36} height={36} className="rounded-full" />
            <span className="font-display text-2xl font-bold bg-gradient-to-r from-lumara-300 to-gold-400 bg-clip-text text-transparent">
              LUMARA
            </span>
          </div>
          <Link
            href="/login"
            className="bg-gradient-to-r from-lumara-600 to-lumara-500 text-white text-sm font-medium px-5 py-2 rounded-xl hover:from-lumara-500 hover:to-lumara-400 transition-all"
          >
            Увійти
          </Link>
        </div>
      </nav>

      {/* Hero секція */}
      <section className="px-4 sm:px-6 text-center relative min-h-screen flex flex-col justify-end">
        {/* Фон — анімація руху планет */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
          style={{ opacity: 0.75 }}
        >
          <source src="/planets-bg.mp4" type="video/mp4" />
        </video>
        {/* Градієнт — сильніше знизу щоб текст читався */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/90 pointer-events-none" />
        {/* Фонове світіння */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-lumara-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto w-full pb-16 sm:pb-24">
          {/* Бейдж без BETA і без AI */}
          <div className="inline-flex items-center gap-2 bg-lumara-950/60 border border-lumara-700/30 rounded-full px-4 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-lumara-400 animate-pulse" />
            <span className="text-lumara-300 text-xs tracking-wider uppercase">Містичні провідники LUMARA</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold mb-5 leading-tight">
            <span className="bg-gradient-to-br from-white via-lumara-200 to-lumara-400 bg-clip-text text-transparent">
              Відкрий свій шлях
            </span>
            <br />
            <span className="text-white/80 text-3xl sm:text-4xl lg:text-5xl font-normal">
              крізь мудрість зірок
            </span>
          </h1>

          {/* Емоційний підзаголовок */}
          <p className="text-white/80 text-lg sm:text-2xl max-w-2xl mx-auto mb-3 leading-relaxed font-medium">
            Вони вже чекають тебе. Перша сесія — безкоштовно.
          </p>
          <p className="text-white/40 text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed">
            Провідники з астрології, таро та нумерології — доступні 24/7 для твого особистого зростання.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            {/* Кнопка веде одразу до чату LUNA */}
            <Link
              href="/chat/luna"
              className="w-full sm:w-auto bg-gradient-to-r from-lumara-600 to-lumara-500 text-white font-semibold px-8 py-4 rounded-xl hover:from-lumara-500 hover:to-lumara-400 transition-all shadow-[0_0_30px_rgba(192,64,240,0.3)] text-base sm:text-lg"
            >
              Почати безкоштовно
            </Link>
            <a
              href="#agents"
              className="w-full sm:w-auto text-white/60 hover:text-white font-medium px-8 py-4 rounded-xl border border-white/10 hover:border-white/20 transition-all text-base sm:text-lg text-center"
            >
              Дізнатись більше
            </a>
          </div>

          {/* Соціальний доказ */}
          <p className="mt-4 text-white/35 text-xs sm:text-sm tracking-wide">
            4 провідники · 9 408 сесій · перші 15 повідомлень безкоштовно
          </p>
        </div>
      </section>

      {/* Провідники */}
      <section id="agents" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-white mb-4">
              Твої провідники
            </h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto">
              Чотири унікальні оракули, кожен — майстер своєї дисципліни
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mages.map((mage) => (
              <div
                key={mage.id}
                className={`glass-card border ${mage.borderColor} hover:scale-[1.03] hover:bg-white/10 transition-all duration-300 cursor-pointer group overflow-hidden flex flex-col`}
              >
                {/* Фото-заголовок картки */}
                <div className="relative h-52 overflow-hidden">
                  <Image
                    src={mage.room}
                    alt=""
                    fill
                    className="object-cover opacity-30 group-hover:opacity-50 transition-opacity duration-300 scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <Image
                    src={mage.portrait}
                    alt={mage.name}
                    fill
                    className={`object-cover ${mage.portraitPosition}`}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300"
                    style={{ background: `radial-gradient(circle at bottom, ${mage.glowColor}, transparent 70%)` }}
                  />
                </div>

                {/* Текстова частина картки */}
                <div className="p-5 flex flex-col gap-3 flex-1">
                  <div>
                    <div className={`text-xs font-semibold tracking-widest uppercase mb-1 ${mage.textAccent}`}>
                      {mage.role}
                    </div>
                    <h3 className="text-2xl font-bold text-white">{mage.name}</h3>
                  </div>
                  <p className="text-white/50 text-sm leading-relaxed flex-1">{mage.tagline}</p>

                  <div className="flex gap-2 mt-1">
                    <Link
                      href={`/mages/${mage.id}`}
                      className={`flex-1 text-center text-xs font-semibold py-2 px-3 rounded-xl border ${mage.borderColor} ${mage.textAccent} hover:bg-white/10 transition-all`}
                    >
                      Дізнатись
                    </Link>
                    <Link
                      href={`/chat/${mage.id}`}
                      className={`flex-1 text-center text-xs font-semibold py-2 px-3 rounded-xl bg-gradient-to-r ${mage.accentColor} text-white hover:opacity-90 transition-all`}
                    >
                      Поговорити
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Як це працює */}
      <section className="py-24 px-6 border-y border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-white mb-4">
              Як це працює
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.number} className="text-center">
                <div className="text-6xl font-display font-bold bg-gradient-to-b from-lumara-400/40 to-transparent bg-clip-text text-transparent mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="text-6xl mb-6">🌟</div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-6">
            Готовий почати свій шлях?
          </h2>
          <p className="text-white/50 text-lg mb-4">
            Провідники вже чекають тебе
          </p>
          <Link
            href="/chat/luna"
            className="inline-block bg-gradient-to-r from-lumara-600 to-lumara-500 text-white font-semibold px-10 py-5 rounded-xl hover:from-lumara-500 hover:to-lumara-400 transition-all shadow-[0_0_40px_rgba(192,64,240,0.4)] text-xl"
          >
            Почати безкоштовно
          </Link>
          <p className="mt-4 text-white/30 text-sm">
            4 провідники · 9 408 сесій · перші 15 повідомлень безкоштовно
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 text-center">
        <p className="text-white/30 text-sm">
          © 2026 LUMARA Academy · lumara.fyi
        </p>
      </footer>
    </main>
  )
}
