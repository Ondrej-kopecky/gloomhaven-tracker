import type { AchievementType } from './types'

export interface AchievementDefinition {
  id: string
  name: string
  type: AchievementType
  description?: string
  group?: string
  upgrades?: string[]
  isManual?: boolean
  requirement?: string
}
