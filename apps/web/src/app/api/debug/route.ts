import { NextResponse } from 'next/server'
import { db } from '@lumara/database'

export const dynamic = 'force-dynamic'

export async function GET() {
  const results: Record<string, unknown> = {}

  // 1. Простий пінг до БД
  try {
    await db.$queryRaw`SELECT 1`
    results.db_ping = 'ok'
  } catch (e: any) {
    results.db_ping = 'error'
    results.db_ping_error = e.message
  }

  // 2. Чи є маги в БД
  try {
    const agents = await db.agent.findMany({ select: { type: true, name: true } })
    results.agents = agents.map((a) => a.type)
  } catch (e: any) {
    results.agents = 'error'
    results.agents_error = e.message
  }

  // 3. Чи працює profiles
  try {
    const profile = await db.profile.findFirst({ select: { id: true, userId: true, lastVisitedAgent: true } })
    results.profiles = profile ? 'ok (row exists)' : 'ok (table empty)'
  } catch (e: any) {
    results.profiles = 'error'
    results.profiles_error = e.message
  }

  // 4. Чи працює conversations
  try {
    const count = await db.conversation.count()
    results.conversations = `ok (count: ${count})`
  } catch (e: any) {
    results.conversations = 'error'
    results.conversations_error = e.message
  }

  // 5. Чи є ANTHROPIC_API_KEY
  results.anthropic_key = process.env.ANTHROPIC_API_KEY ? 'set' : 'missing'

  // 6. DATABASE_URL host
  const dbUrl = process.env.DATABASE_URL || ''
  results.db_host = dbUrl.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')

  return NextResponse.json(results)
}
