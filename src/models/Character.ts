import type { CharacterClass } from './types'

export interface PerkDefinition {
  id: string
  description: string
  maxCount: number
}

export interface AbilityCard {
  id: string
  name: string
  level: number
  top: string
  bottom: string
}

export interface CharacterDefinition {
  classId: CharacterClass
  name: string
  maxHp: number[]
  handSize: number
  perks: PerkDefinition[]
  startingAbilities: string[]
  isStarting: boolean
  unlockCondition?: string
}

export interface CharacterState {
  uuid: string
  classId: CharacterClass
  playerName: string
  level: number
  xp: number
  gold: number
  notes: string
  perksSelected: Record<string, number>
  abilities: string[]
  items: string[]
  checks: number
  isRetired: boolean
  retiredAt?: string
  createdAt: string
  personalQuestId?: number
  owner?: string
}
