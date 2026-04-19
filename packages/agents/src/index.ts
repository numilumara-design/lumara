import {
  globalSystemPrompt,
  monetizationTriggerTemplate,
  crossPromoRaw,
  academyPromoRaw,
  agentSystemPrompts,
  agentFirstMessageTemplates,
  agentInstagramPrompts,
} from './prompts'

export type AgentType = 'LUNA' | 'ARCAS' | 'NUMI' | 'UMBRA'

export const AGENT_MODELS: Record<AgentType, string> = {
  LUNA: 'claude-sonnet-4-6',
  ARCAS: 'claude-sonnet-4-6',
  NUMI: 'claude-sonnet-4-6',
  UMBRA: 'claude-sonnet-4-6',
}

export const AGENT_TOKEN_LIMITS: Record<AgentType, number> = {
  LUNA: 4000,
  ARCAS: 4000,
  NUMI: 4000,
  UMBRA: 3000,
}

const crossPromoMap: Record<AgentType, string> = {
  LUNA: extractBlock(crossPromoRaw, 'LUNA about ARCAS'),
  ARCAS: extractBlock(crossPromoRaw, 'ARCAS about NUMI'),
  NUMI: extractBlock(crossPromoRaw, 'NUMI about UMBRA'),
  UMBRA: extractBlock(crossPromoRaw, 'UMBRA about LUNA'),
}

const academyPromoMap: Record<AgentType, string> = {
  LUNA: extractBlock(academyPromoRaw, 'LUNA about Academy'),
  ARCAS: extractBlock(academyPromoRaw, 'ARCAS about Academy'),
  NUMI: extractBlock(academyPromoRaw, 'NUMI about Academy'),
  UMBRA: extractBlock(academyPromoRaw, 'UMBRA about Academy'),
}

function extractBlock(text: string, label: string): string {
  const regex = new RegExp(`${label}:\\s*"(.*?)"`, 's')
  const match = text.match(regex)
  return match ? match[1].trim() : ''
}

export function getGlobalSystemPrompt(): string {
  return globalSystemPrompt
}

export function getAgentSystemPrompt(
  agentType: AgentType,
  options?: {
    includeMonetization?: boolean
    crossPromoVariant?: 'peer' | 'academy'
  }
): string {
  const parts: string[] = []
  if (globalSystemPrompt) parts.push(globalSystemPrompt)
  const agentPrompt = agentSystemPrompts[agentType]
  if (agentPrompt) parts.push(agentPrompt)
  if (options?.includeMonetization && monetizationTriggerTemplate) {
    parts.push(`\n---\n${monetizationTriggerTemplate}\n---`)
  }
  if (options?.crossPromoVariant === 'peer' && crossPromoMap[agentType]) {
    parts.push(
      `\n---\nCross-promotion instruction: naturally insert the following at the end of your response:\n"${crossPromoMap[agentType]}"\n---`
    )
  }
  if (options?.crossPromoVariant === 'academy' && academyPromoMap[agentType]) {
    parts.push(
      `\n---\nAcademy promotion instruction: naturally insert the following at the end of your response:\n"${academyPromoMap[agentType]}"\n---`
    )
  }
  return parts.join('\n\n')
}

export function getAgentInstagramPrompt(agentType: AgentType): string {
  return agentInstagramPrompts[agentType] || ''
}

export interface ProfileLike {
  fullName?: string | null
  birthDate?: Date | string | null
  birthTime?: string | null
  birthPlace?: string | null
  gender?: string | null
  goal?: string | null
}

function extractQuoted(text: string): string {
  const match = text.match(/"([\s\S]+?)"/)
  return match ? match[1].trim() : text.trim()
}

export function getAgentFirstMessage(agentType: AgentType, profile?: ProfileLike): string {
  const name = profile?.fullName?.trim() || 'Друже'
  const template = agentFirstMessageTemplates[agentType]

  if (agentType === 'LUNA') {
    if (profile?.birthDate) {
      const sign = getMoonSignPlaceholder(profile.birthDate)
      const section = template.split('---')[0]
      return extractQuoted(section)
        .replace(/\[Ім'я\]/g, name)
        .replace(/\[знак\]/g, sign)
        .replace(/\[ключовий аспект\]/g, 'ключовий аспект')
    } else {
      const section = template.split('---')[1] ?? template
      return extractQuoted(section).replace(/\[Ім'я\]/g, name)
    }
  }

  if (agentType === 'NUMI') {
    const number = profile?.birthDate ? calculateDestinyNumber(profile.birthDate) : 'долі'
    return extractQuoted(template)
      .replace(/\[Ім'я\]/g, name)
      .replace(/\[число\]/g, String(number))
  }

  // ARCAS and UMBRA
  return extractQuoted(template).replace(/\[Ім'я\]/g, name)
}

function getMoonSignPlaceholder(_birthDate: Date | string): string {
  // Real astrology calculation is out of scope for this prompt layer;
  // return a culturally resonant placeholder.
  const signs = [
    'Рибах',
    'Терезах',
    'Скорпіоні',
    'Стрільці',
    'Козерозі',
    'Водолії',
    'Раках',
    'Леві',
    'Діві',
    'Овні',
    'Тільці',
    'Близнюках',
  ]
  // Deterministic-ish based on day of month to avoid randomness on every load
  const d = new Date(_birthDate)
  return signs[d.getDate() % signs.length]
}

function calculateDestinyNumber(birthDate: Date | string): number {
  const d = new Date(birthDate)
  const digits = `${d.getDate()}${d.getMonth() + 1}${d.getFullYear()}`.split('').map(Number)
  let sum = digits.reduce((a, b) => a + b, 0)
  while (sum > 9) {
    sum = String(sum)
      .split('')
      .map(Number)
      .reduce((a, b) => a + b, 0)
  }
  return sum || 9
}
