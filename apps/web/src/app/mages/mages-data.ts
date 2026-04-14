export interface Mage {
  id: string
  name: string
  role: string
  tagline: string
  description: string
  abilities: string[]
  portrait: string
  room: string
  accentColor: string
  glowColor: string
  borderColor: string
  textAccent: string
  badgeBg: string
  ctaGradient: string
  particleColor: string
}

export const mages: Mage[] = [
  {
    id: 'luna',
    name: 'LUNA',
    role: 'Астрологія',
    tagline: 'Провідник по небесних картах',
    description:
      'LUNA читає небесний код твого народження. Розкриває характер, таланти та ключові цикли життя через мову зірок. Кожна планета — послання, кожен аспект — підказка до твого шляху.',
    abilities: ['Натальна карта', 'Транзити планет', 'Синастрія', 'Прогнози'],
    portrait: '/luna-portrait-1.png',
    room: '/luna-room.png',
    accentColor: 'from-blue-600 to-indigo-600',
    glowColor: 'rgba(99,102,241,0.5)',
    borderColor: 'border-blue-500/30',
    textAccent: 'text-blue-300',
    badgeBg: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    ctaGradient: 'from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500',
    particleColor: '#818cf8',
  },
  {
    id: 'arcas',
    name: 'ARCAS',
    role: 'Таро / Оракул',
    tagline: 'Майстер символів та архетипів',
    description:
      'ARCAS відкриває двері між видимим і невидимим. Кожна карта — дзеркало твоєї душі та ключ до розуміння ситуації. Символи говорять мовою глибинної мудрості.',
    abilities: ['Розклади Таро', 'Оракульні карти', 'Архетипний аналіз', 'Провісні читання'],
    portrait: '/arcas-portrait-1.png',
    room: '/arcas-room.png',
    accentColor: 'from-purple-600 to-violet-600',
    glowColor: 'rgba(139,92,246,0.5)',
    borderColor: 'border-purple-500/30',
    textAccent: 'text-purple-300',
    badgeBg: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    ctaGradient: 'from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500',
    particleColor: '#a78bfa',
  },
  {
    id: 'numi',
    name: 'NUMI',
    role: 'Нумерологія',
    tagline: 'Дешифрувач числових кодів долі',
    description:
      'NUMI розшифровує числовий код твого життя. Кожна дата, кожне ім\'я — математичний ключ до твоєї унікальної місії. Числа — найдавніша мова Всесвіту.',
    abilities: ['Число долі', 'Особистий рік', 'Матриця народження', 'Числа імені'],
    portrait: '/numi-portrait-1.png',
    room: '/numi-room.png',
    accentColor: 'from-amber-500 to-yellow-500',
    glowColor: 'rgba(245,158,11,0.5)',
    borderColor: 'border-amber-500/30',
    textAccent: 'text-amber-300',
    badgeBg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    ctaGradient: 'from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400',
    particleColor: '#fbbf24',
  },
  {
    id: 'umbra',
    name: 'UMBRA',
    role: 'Езо-психологія',
    tagline: 'Провідник у глибини підсвідомого',
    description:
      'UMBRA супроводжує в подорожі до тіні. Інтеграція несвідомих частин — шлях до справжньої цілісності та внутрішньої сили. Темрява — не ворог, а невідкрита частина тебе.',
    abilities: ['Тіньова робота', 'Архетипи Юнга', 'Медитації', 'Інтеграція частин'],
    portrait: '/umbra-portrait-1.png',
    room: '/umbra-room.png',
    accentColor: 'from-slate-500 to-gray-600',
    glowColor: 'rgba(100,116,139,0.5)',
    borderColor: 'border-slate-500/30',
    textAccent: 'text-slate-300',
    badgeBg: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
    ctaGradient: 'from-slate-600 to-gray-700 hover:from-slate-500 hover:to-gray-600',
    particleColor: '#94a3b8',
  },
]
