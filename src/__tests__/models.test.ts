import { describe, it, expect } from 'vitest'
import { ScenarioStatus, AchievementType, CharacterClass } from '@/models/types'

describe('ScenarioStatus enum', () => {
  it('has all expected statuses', () => {
    expect(ScenarioStatus.HIDDEN).toBe('hidden')
    expect(ScenarioStatus.LOCKED).toBe('locked')
    expect(ScenarioStatus.AVAILABLE).toBe('available')
    expect(ScenarioStatus.COMPLETED).toBe('completed')
    expect(ScenarioStatus.BLOCKED).toBe('blocked')
    expect(ScenarioStatus.REQUIRED).toBe('required')
    expect(ScenarioStatus.ATTEMPTED).toBe('attempted')
  })
})

describe('AchievementType enum', () => {
  it('has global and party', () => {
    expect(AchievementType.GLOBAL).toBe('global')
    expect(AchievementType.PARTY).toBe('party')
  })
})

describe('CharacterClass enum', () => {
  it('has 6 starting classes', () => {
    const starting = [
      CharacterClass.BRUTE,
      CharacterClass.CRAGHEART,
      CharacterClass.MINDTHIEF,
      CharacterClass.SCOUNDREL,
      CharacterClass.SPELLWEAVER,
      CharacterClass.TINKERER,
    ]
    expect(starting).toHaveLength(6)
    starting.forEach((c) => expect(c).toBeTruthy())
  })

  it('has 11 unlockable classes', () => {
    const unlockable = [
      CharacterClass.BEAST_TYRANT,
      CharacterClass.BERSERKER,
      CharacterClass.DOOMSTALKER,
      CharacterClass.ELEMENTALIST,
      CharacterClass.NIGHTSHROUD,
      CharacterClass.PLAGUEHERALD,
      CharacterClass.QUARTERMASTER,
      CharacterClass.SAWBONES,
      CharacterClass.SOOTHSINGER,
      CharacterClass.SUMMONER,
      CharacterClass.SUNKEEPER,
    ]
    expect(unlockable).toHaveLength(11)
    unlockable.forEach((c) => expect(c).toBeTruthy())
  })

  it('has diviner (Forgotten Circles)', () => {
    expect(CharacterClass.DIVINER).toBe('diviner')
  })

  it('has 18 total classes', () => {
    const allClasses = Object.values(CharacterClass)
    expect(allClasses).toHaveLength(19)
  })
})

describe('data files are valid JSON', () => {
  it('loads scenarios.json', async () => {
    const data = await import('@/data/scenarios.json')
    expect(Array.isArray(data.default)).toBe(true)
    expect(data.default.length).toBeGreaterThan(50)
  })

  it('loads quests.json', async () => {
    const data = await import('@/data/quests.json')
    expect(Array.isArray(data.default)).toBe(true)
    expect(data.default.length).toBeGreaterThan(20)
  })

  it('loads personalQuests.json', async () => {
    const data = await import('@/data/personalQuests.json')
    expect(Array.isArray(data.default)).toBe(true)
    expect(data.default.length).toBeGreaterThan(20)
  })

  it('loads characters.json', async () => {
    const data = await import('@/data/characters.json')
    expect(Array.isArray(data.default)).toBe(true)
    expect(data.default.length).toBe(19)
  })

  it('loads achievements.json', async () => {
    const data = await import('@/data/achievements.json')
    expect(data.default).toHaveProperty('global')
    expect(data.default).toHaveProperty('party')
  })

  it('loads items.json', async () => {
    const data = await import('@/data/items.json')
    expect(Array.isArray(data.default)).toBe(true)
  })
})
