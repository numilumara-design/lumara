# 🌿 LUMARA Academy

> *Ancient wisdom meets modern intelligence*

**LUMARA** — езотерична академія нового покоління. Астрологія, Таро, Нумерологія через призму штучного інтелекту. Персональні AI-агенти, курси і спільнота.

🌐 **[lumara.fyi](https://lumara.fyi)**

---

## ✨ Що таке LUMARA

LUMARA — це платформа де кожен напрямок езотерики представлений окремим AI-персонажем з унікальною особистістю, знаннями і стилем спілкування. Користувач отримує персональний досвід — не загальний гороскоп, а глибокий діалог з мудрим провідником.

### Персонажі академії
| Персонаж | Спеціалізація | Соц. мережі |
|----------|--------------|-------------|
| 🌙 **LUNA** | Астрологія, натальні карти, транзити | @luna.lumara |
| 🃏 **ARCAS** | Таро, Оракул, розклади | @arcas.lumara |
| 🔢 **NUMI** | Нумерологія, матриця долі | @numi.lumara |
| 🧠 **UMBRA** | Езо-психологія, архетипи, тінь | @umbra.lumara |

---

## 🏗️ Архітектура

```
lumara/
├── apps/
│   ├── web/          # Next.js 14 — головний застосунок
│   └── admin/        # Адмін панель
├── packages/
│   ├── agents/       # AI агенти з системними промптами
│   ├── content/      # Автогенерація контенту для соцмереж
│   ├── database/     # Prisma схема + міграції Supabase
│   ├── ui/           # Спільна UI бібліотека (shadcn/ui)
│   └── shared/       # TypeScript типи, утиліти
├── .github/
│   └── workflows/    # GitHub Actions CI/CD
├── CLAUDE.md         # Інструкції для Claude агента
└── README.md
```

---

## 🛠️ Технічний стек

| Шар | Технологія |
|-----|-----------|
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS |
| **UI** | shadcn/ui, Framer Motion |
| **Auth** | NextAuth.js |
| **Database** | Supabase (PostgreSQL) + Prisma |
| **AI** | Anthropic Claude API + OpenAI GPT-4 |
| **Payments** | Stripe |
| **Email** | Resend |
| **Deploy** | Vercel + GitHub Actions |
| **DNS/CDN** | Cloudflare |

---

## 🚀 Швидкий старт

### Вимоги
- Node.js 18+
- pnpm 8+
- Git

### Встановлення

```bash
# Клонуй репозиторій
git clone https://github.com/your-username/lumara.git
cd lumara

# Встанови залежності
pnpm install

# Скопіюй змінні середовища
cp .env.example .env.local

# Запусти локально
pnpm dev
```

### Змінні середовища

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# NextAuth
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000

# AI
ANTHROPIC_API_KEY=
OPENAI_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Resend
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=https://lumara.fyi
```

---

## 📦 Деплой

### Автоматичний (рекомендований)

Кожен пуш в гілку `main` автоматично деплоїться на Vercel через GitHub Actions.

```bash
git add .
git commit -m "опис змін"
git push origin main
# → автоматичний деплой на lumara.fyi
```

### Гілки
- `main` → продакшн (lumara.fyi)
- `dev` → preview деплой
- `feature/*` → розробка нових функцій

---

## 📊 Ринок і стратегія

| Показник | Значення |
|----------|---------|
| Ринок 2026 | $5.7 млрд |
| Ринок 2030 | $11.7 млрд |
| CAGR | 20% |
| Цільова аудиторія | 18-45 років, духовний розвиток |

### Фази розвитку
- **Фаза 1** — Контент і соціальні мережі (зараз)
- **Фаза 2** — Платформа MVP з першим агентом LUNA
- **Фаза 3** — Повна академія, всі агенти, монетизація
- **Фаза 4** — Міжнародний ринок, white-label, B2B

---

## 🌍 Соціальні мережі

### 🌿 LUMARA Academy (основний акаунт)
| Платформа | Ім'я | Нікнейм | Посилання |
|-----------|------|---------|-----------|
| Instagram | LUMARA | @lumara_fyi | [instagram.com/lumara_fyi](https://instagram.com/lumara_fyi) |
| TikTok | @lumara | @lumara48 | [tiktok.com/@lumara48](https://tiktok.com/@lumara48) |
| YouTube | @lumara | @lumara_fyi | [youtube.com/@lumara_fyi](https://youtube.com/@lumara_fyi) |
| Telegram | — | @lumara | [t.me/lumara](https://t.me/lumara) |

> ⚠️ TikTok: нікнейм @lumara48 тимчасовий — змінити після 1 квітня на @lumara

### 🌙 LUNA — Агент-астролог
| Платформа | Ім'я | Нікнейм | Посилання |
|-----------|------|---------|-----------|
| Instagram | Luna \| Астролог LUMARA | @luna.lumara | [instagram.com/luna.lumara](https://instagram.com/luna.lumara) |
| TikTok | Luna | @luna385355 | [tiktok.com/@luna385355](https://tiktok.com/@luna385355) |
| YouTube | — | @luna.lumara | *(URL уточнити після створення)* |
| Telegram | — | @luna_lumara | [t.me/luna_lumara](https://t.me/luna_lumara) |

### 🃏 ARCAS — Агент-таролог
*(акаунти створюються в Фазі 1, Тиждень 3-4)*

### 🔢 NUMI — Агент-нумеролог
*(акаунти створюються в Фазі 1, Місяць 2)*

### 🧠 UMBRA — Езо-психолог
*(акаунти створюються в Фазі 1, Місяць 3)*

---

## 📄 Ліцензія

Приватний проект. Всі права захищені.

---

*Побудовано з ❤️ і ✦ · LUMARA Academy · lumara.fyi*
*Останнє оновлення: 26 Березня 2026*

