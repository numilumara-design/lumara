async function getOutreachStats() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    return {
      telegram: { total: 0, byLanguage: { UK: 0, RU: 0, EN: 0, DE: 0 } },
      instagram: { total: 0, byLanguage: { UK: 0, RU: 0, EN: 0, DE: 0 } },
      referralClicks: 0,
      error: 'Supabase не налаштовано',
    }
  }

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayIso = todayStart.toISOString()

  // Отримуємо всі outreach_responses за сьогодні
  const outreachRes = await fetch(
    `${supabaseUrl}/rest/v1/outreach_responses?created_at=gte.${encodeURIComponent(todayIso)}&select=platform,language`,
    {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
      next: { revalidate: 60 },
    }
  )

  const outreachRows: { platform: string; language: string }[] = outreachRes.ok
    ? await outreachRes.json()
    : []

  // Отримуємо всі referral_clicks за сьогодні
  const referralRes = await fetch(
    `${supabaseUrl}/rest/v1/referral_clicks?created_at=gte.${encodeURIComponent(todayIso)}&select=id`,
    {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
      next: { revalidate: 60 },
    }
  )

  const referralRows: { id: string }[] = referralRes.ok ? await referralRes.json() : []

  const telegramRows = outreachRows.filter((r) => r.platform === 'TELEGRAM_GROUP')
  const instagramRows = outreachRows.filter((r) => r.platform === 'INSTAGRAM_COMMENT')

  const countByLang = (rows: { language: string }[]) => {
    const map: Record<string, number> = { UK: 0, RU: 0, EN: 0, DE: 0 }
    for (const row of rows) {
      map[row.language] = (map[row.language] || 0) + 1
    }
    return map
  }

  return {
    telegram: {
      total: telegramRows.length,
      byLanguage: countByLang(telegramRows),
    },
    instagram: {
      total: instagramRows.length,
      byLanguage: countByLang(instagramRows),
    },
    referralClicks: referralRows.length,
  }
}

export default async function AdminPage() {
  const stats = await getOutreachStats()

  const Card = ({
    title,
    value,
    sub,
  }: {
    title: string
    value: number
    sub?: React.ReactNode
  }) => (
    <div className="rounded-xl bg-gray-900 border border-gray-800 p-6">
      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">{title}</h3>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
      {sub && <div className="mt-3 text-sm text-gray-300">{sub}</div>}
    </div>
  )

  const LangBreakdown = ({ data }: { data: Record<string, number> }) => (
    <div className="flex gap-3 mt-2 flex-wrap">
      {Object.entries(data).map(([lang, count]) => (
        <span
          key={lang}
          className="inline-flex items-center rounded-full bg-purple-900/40 px-3 py-1 text-xs font-medium text-purple-200"
        >
          {lang}: {count}
        </span>
      ))}
    </div>
  )

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-purple-400 mb-2">LUMARA Admin</h1>
        <p className="text-gray-400 mb-8">Панель адміністратора</p>

        {stats.error && (
          <div className="mb-6 rounded-lg bg-red-900/30 border border-red-800 p-4 text-red-200">
            ⚠️ {stats.error}
          </div>
        )}

        <h2 className="text-xl font-semibold text-white mb-4">🔍 Активний пошук</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card
            title="Відповідей у Telegram групах (сьогодні)"
            value={stats.telegram.total}
            sub={<LangBreakdown data={stats.telegram.byLanguage} />}
          />
          <Card
            title="Відповідей у Instagram (сьогодні)"
            value={stats.instagram.total}
            sub={<LangBreakdown data={stats.instagram.byLanguage} />}
          />
          <Card
            title="Переходів на сайт з групових відповідей (сьогодні)"
            value={stats.referralClicks}
          />
          <Card
            title="Всього активних контактів (сьогодні)"
            value={stats.telegram.total + stats.instagram.total}
          />
        </div>
      </div>
    </main>
  )
}
