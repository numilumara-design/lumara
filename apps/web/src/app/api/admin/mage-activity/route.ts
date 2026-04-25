import { getSessionUser } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { db } from '@lumara/database'

export async function GET() {
  const session = await getSessionUser()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Доступ заборонено' }, { status: 403 })
  }

  const [outreachRows, referralRows] = await Promise.all([
    db.outreachResponse.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        id: true,
        platform: true,
        agentType: true,
        userHandle: true,
        targetUrl: true,
        responseText: true,
        createdAt: true,
      },
    }),
    db.referralClick.findMany({
      where: { agentType: { not: null } },
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        id: true,
        agentType: true,
        source: true,
        utmSource: true,
        utmMedium: true,
        ipAddress: true,
        createdAt: true,
      },
    }),
  ])

  // Групуємо referral clicks по магу для швидкого пошуку
  const referralsByAgent: Record<string, typeof referralRows> = {}
  for (const r of referralRows) {
    const agent = r.agentType!
    if (!referralsByAgent[agent]) referralsByAgent[agent] = []
    referralsByAgent[agent].push(r)
  }

  // Сортуємо всередині кожного агента по даті зростанням для бінарного пошуку
  for (const agent in referralsByAgent) {
    referralsByAgent[agent].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
  }

  const TWO_HOURS = 2 * 60 * 60 * 1000

  function findResult(agent: string, outreachTime: Date): string {
    const list = referralsByAgent[agent]
    if (!list || list.length === 0) return 'не відреагував'

    // Бінарний пошук першого referral, створеного після outreachTime
    let lo = 0
    let hi = list.length - 1
    let idx = -1
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2)
      if (list[mid].createdAt.getTime() >= outreachTime.getTime()) {
        idx = mid
        hi = mid - 1
      } else {
        lo = mid + 1
      }
    }
    if (idx === -1) return 'не відреагував'
    const referral = list[idx]
    const diff = referral.createdAt.getTime() - outreachTime.getTime()
    return diff <= TWO_HOURS ? 'перейшов на сайт' : 'не відреагував'
  }

  const PLATFORM_LABELS: Record<string, string> = {
    TELEGRAM_GROUP: 'Telegram',
    INSTAGRAM_COMMENT: 'Instagram',
  }

  const outreachItems = outreachRows.map((o) => ({
    id: o.id,
    type: 'outreach' as const,
    date: o.createdAt.toISOString(),
    mage: o.agentType,
    platform: PLATFORM_LABELS[o.platform] ?? o.platform,
    action: o.platform === 'INSTAGRAM_COMMENT' ? 'відповів на коментар' : 'надіслав повідомлення',
    username: o.userHandle ?? '—',
    result: o.targetUrl ? findResult(o.agentType, o.createdAt) : 'не відреагував',
  }))

  const referralItems = referralRows.map((r) => ({
    id: r.id,
    type: 'referral' as const,
    date: r.createdAt.toISOString(),
    mage: r.agentType ?? '—',
    platform: r.utmSource ?? r.source ?? 'Сайт',
    action: 'перейшов на сайт',
    username: '—',
    result: 'перейшов на сайт',
  }))

  const all = [...outreachItems, ...referralItems]
  all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return NextResponse.json({ items: all.slice(0, 100) })
}
