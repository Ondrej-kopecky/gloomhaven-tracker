import type { MapCoordinates, ScenarioStatus } from './types'

/** Condition for blocking or requiring a scenario */
export interface ScenarioCondition {
  complete?: string[]
  incomplete?: string[]
}

/** Treasure definition within a scenario */
export interface ScenarioTreasure {
  id: string
  description: string
}

/** Reward text strings from lang file */
export interface ScenarioReward {
  gold?: number
  xp?: number
  reputation?: number
  prosperity?: number
  itemDesigns?: string[]
  achievements?: string[]
  partyAchievements?: string[]
  text?: string[]
}

/** Full scenario definition (static data) */
export interface ScenarioData {
  id: string
  name: string
  location: string
  isSide: boolean
  isRoot?: boolean
  coordinates: MapCoordinates
  chapterId?: number
  regionIds?: number[]
  pages?: string[]

  // Connections
  linksTo: number[]
  linkedFrom: number[]

  // Choices & prompts
  choices?: number[]
  prompt?: string
  coupled?: number

  // Requirements & blocking
  requiredBy?: ScenarioCondition[]
  blocksOn?: ScenarioCondition[]

  // Achievements
  achievementsAwarded?: string[]
  achievementsLost?: string[]
  achievementsFromTreasures?: Record<string, string[]>

  // Treasures
  treasures: ScenarioTreasure[]
  treasuresTo?: Record<string, number[]>
  treasuresFrom?: number[]

  // Rewards
  rewards: ScenarioReward

  // Flags
  hasBoss?: boolean
  solo?: string

  // Quest references
  quests?: number[]

  // Story
  summary?: string
}

/** Per-campaign scenario state (mutable) */
export interface ScenarioState {
  id: string
  status: ScenarioStatus
  notes: string
  treasuresLooted: string[]
  choice?: number
  completedAt?: string
}

// Keep backward compat - connections are now embedded in ScenarioData (linksTo/linkedFrom)
// but we keep this for the separate connections file during transition
export interface ScenarioConnection {
  source: string
  target: string
  type: string
}
