import { LUNA_SYSTEM_PROMPT } from '../prompts/luna'
import { ARCAS_SYSTEM_PROMPT } from '../prompts/arcas'
import { NUMI_SYSTEM_PROMPT } from '../prompts/numi'
import { UMBRA_SYSTEM_PROMPT } from '../prompts/umbra'

export type AgentType = 'LUNA' | 'ARCAS' | 'NUMI' | 'UMBRA'

// Маппінг агентів до їх промптів
export const AGENT_PROMPTS: Record<AgentType, string> = {
  LUNA: LUNA_SYSTEM_PROMPT,
  ARCAS: ARCAS_SYSTEM_PROMPT,
  NUMI: NUMI_SYSTEM_PROMPT,
  UMBRA: UMBRA_SYSTEM_PROMPT,
}

// Маппінг агентів до їх моделей
export const AGENT_MODELS: Record<AgentType, string> = {
  LUNA: 'claude-sonnet-4-6',
  ARCAS: 'claude-sonnet-4-6',
  NUMI: 'claude-sonnet-4-6',
  UMBRA: 'claude-sonnet-4-6',
}

// Ліміти токенів для агентів
export const AGENT_TOKEN_LIMITS: Record<AgentType, number> = {
  LUNA: 4000,
  ARCAS: 4000,
  NUMI: 4000,
  UMBRA: 3000,
}
