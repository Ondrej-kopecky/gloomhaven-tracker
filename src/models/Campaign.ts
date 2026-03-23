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
  unlockedClasses?: string[]
  forgottenCircles?: boolean
  openedEnvelopes?: Record<string, boolean>
}

export interface CampaignSummary {
  id: string
  name: string
  createdAt: string
  lastPlayedAt: string
  isOwner?: boolean
  ownerUsername?: string
  memberCount?: number
  shareCode?: string
}

export interface ShareInfo {
  shareCode: string | null
  isShared: boolean
  members: ShareMember[]
  ownerUsername: string
}

export interface ShareMember {
  userId: number
  username: string
  joinedAt: string | null
}
