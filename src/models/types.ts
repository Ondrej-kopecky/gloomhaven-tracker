export const ScenarioStatus = {
  HIDDEN: 'hidden',
  LOCKED: 'locked',
  AVAILABLE: 'available',
  COMPLETED: 'completed',
  BLOCKED: 'blocked',
  REQUIRED: 'required',
  ATTEMPTED: 'attempted',
} as const
export type ScenarioStatus = (typeof ScenarioStatus)[keyof typeof ScenarioStatus]

export const AchievementType = {
  GLOBAL: 'global',
  PARTY: 'party',
} as const
export type AchievementType = (typeof AchievementType)[keyof typeof AchievementType]

export const ConnectionType = {
  UNLOCKS: 'unlocks',
  BLOCKS: 'blocks',
  LINKS_TO: 'links_to',
  REQUIRED_BY: 'required_by',
} as const
export type ConnectionType = (typeof ConnectionType)[keyof typeof ConnectionType]

export const CharacterClass = {
  // Starting 6
  BRUTE: 'brute',
  CRAGHEART: 'cragheart',
  MINDTHIEF: 'mindthief',
  SCOUNDREL: 'scoundrel',
  SPELLWEAVER: 'spellweaver',
  TINKERER: 'tinkerer',
  // Unlockable
  BEAST_TYRANT: 'beast_tyrant',
  BERSERKER: 'berserker',
  DOOMSTALKER: 'doomstalker',
  ELEMENTALIST: 'elementalist',
  NIGHTSHROUD: 'nightshroud',
  PLAGUEHERALD: 'plagueherald',
  QUARTERMASTER: 'quartermaster',
  SAWBONES: 'sawbones',
  SOOTHSINGER: 'soothsinger',
  SUMMONER: 'summoner',
  SUNKEEPER: 'sunkeeper',
  // Forgotten Circles
  DIVINER: 'diviner',
  // Envelope X
  BLADESWARM: 'bladeswarm',
} as const
export type CharacterClass = (typeof CharacterClass)[keyof typeof CharacterClass]

export type ItemSlot = 'head' | 'body' | 'legs' | 'one_hand' | 'two_hands' | 'small_item'

export interface MapCoordinates {
  name?: string
  x: number
  y: number
}
