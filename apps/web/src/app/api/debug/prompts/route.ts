import { NextResponse } from 'next/server'
import { existsSync, readdirSync } from 'fs'
import { join } from 'path'
import { getAgentSystemPrompt, AgentType } from '@lumara/agents'

export const dynamic = 'force-dynamic'

function listDir(path: string): string[] {
  try {
    return readdirSync(path)
  } catch {
    return []
  }
}

export async function GET() {
  const agents: AgentType[] = ['LUNA', 'ARCAS', 'NUMI', 'UMBRA']
  const result: Record<string, any> = {
    cwd: process.cwd(),
    agents: {},
  }

  for (const agent of agents) {
    const base = getAgentSystemPrompt(agent)
    const peer = getAgentSystemPrompt(agent, { crossPromoVariant: 'peer' })
    const academy = getAgentSystemPrompt(agent, { crossPromoVariant: 'academy' })
    result.agents[agent] = {
      baseLength: base.length,
      peerLength: peer.length,
      academyLength: academy.length,
      hasPeer: peer.length > base.length,
      hasAcademy: academy.length > base.length,
      peerPreview: peer.slice(base.length, base.length + 200),
      academyPreview: academy.slice(base.length, base.length + 200),
    }
  }

  // Діагностика директорій
  const candidates = [
    join(process.cwd(), 'packages', 'agents'),
    join(process.cwd(), '..', '..', 'packages', 'agents'),
    '/var/task/packages/agents',
    '/var/task/apps/web/packages/agents',
  ]

  result.candidates = candidates.map((dir) => ({
    path: dir,
    exists: existsSync(dir),
    files: existsSync(dir) ? listDir(dir) : [],
  }))

  return NextResponse.json(result)
}
