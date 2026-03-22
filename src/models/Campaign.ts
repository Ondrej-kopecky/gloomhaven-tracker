import type { CharacterState } from './Character'
import type { PartyState } from './Party'
import type { ScenarioState } from './Scenario'
import type { PersonalQuestState } from './PersonalQuest'

export interface CampaignState {
  id: string
  name: string
  createdAt: string
  lastPlayedAt: string
  prosperityIndex: number
  globalAchievements: Record<string, boolean>
  partyAchievements: Record<string, boolean>
  party: PartyState
  characters: CharacterState[]
  archivedCharacters: CharacterState[]
  scenarios: Record<string, ScenarioState>
  personalQuests: Record<string, PersonalQuestState>
  players: string[]
  notes: string
  hideSpoilers?: boolean
  unlockedItemDesigns?: number[]
  manuallyUnlockedScenarios?: string[]
  forgottenCircles?: boolean
}

export interface CampaignSummary {
  id: string
  name: string
  createdAt: string
  lastPlayedAt: string
}
