import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useQuestStore } from '@/stores/questStore'
import { useScenarioStore } from '@/stores/scenarioStore'
import { useCampaignStore } from '@/stores/campaignStore'
import { ScenarioStatus } from '@/models/types'

function setupStoresWithScenarios(completedIds: string[], choices?: Record<string, number>) {
  const campaignStore = useCampaignStore()
  const scenarioStore = useScenarioStore()

  // Create a minimal campaign
  campaignStore.currentCampaign = {
    id: 'test',
    name: 'Test',
    createdAt: '',
    lastPlayedAt: '',
    prosperityIndex: 0,
    globalAchievements: {},
    partyAchievements: {},
    party: {
      name: '', reputation: 0, donations: 0,
      cityEventsAvailable: [], cityEventsRemoved: [],
      roadEventsAvailable: [], roadEventsRemoved: [],
      notes: '',
    },
    characters: [],
    archivedCharacters: [],
    scenarios: {},
    personalQuests: {},
    notes: '',
  }

  // Set completed scenarios
  for (const id of completedIds) {
    campaignStore.currentCampaign.scenarios[id] = {
      id,
      status: ScenarioStatus.COMPLETED,
      notes: '',
      treasuresLooted: [],
      choice: choices?.[id],
    }
  }

  // Add minimal scenario definitions for completed IDs
  const allIds = new Set([...completedIds])
  scenarioStore.scenarioDefinitions = [...allIds].map((id) => ({
    id,
    name: `Scenario ${id}`,
    location: '',
    isSide: false,
    isRoot: id === '1',
    coordinates: { x: 0, y: 0 },
    chapterId: 1,
    regionIds: [],
    pages: [],
    linksTo: [],
    linkedFrom: [],
    blocksOn: [],
    requiredBy: [],
    achievementsAwarded: [],
    achievementsLost: [],
    rewards: {},
    summary: '',
  })) as any
  scenarioStore.isDataLoaded = true
}

describe('questStore.evaluateCheck', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('returns true for empty expression', () => {
    setupStoresWithScenarios([])
    const questStore = useQuestStore()
    expect(questStore.evaluateCheck('')).toBe(true)
  })

  it('evaluates simple completion check (1==c) when completed', () => {
    setupStoresWithScenarios(['1'])
    const questStore = useQuestStore()
    expect(questStore.evaluateCheck('1==c')).toBe(true)
  })

  it('evaluates simple completion check (1==c) when not completed', () => {
    setupStoresWithScenarios([])
    const questStore = useQuestStore()
    expect(questStore.evaluateCheck('1==c')).toBe(false)
  })

  it('evaluates not-completed check (2!=c)', () => {
    setupStoresWithScenarios([])
    const questStore = useQuestStore()
    expect(questStore.evaluateCheck('2!=c')).toBe(true)
  })

  it('evaluates not-completed check when actually completed', () => {
    setupStoresWithScenarios(['2'])
    const questStore = useQuestStore()
    expect(questStore.evaluateCheck('2!=c')).toBe(false)
  })

  it('evaluates AND expression (2==c && 3==c)', () => {
    setupStoresWithScenarios(['2', '3'])
    const questStore = useQuestStore()
    expect(questStore.evaluateCheck('2==c && 3==c')).toBe(true)
  })

  it('evaluates AND expression when partially complete', () => {
    setupStoresWithScenarios(['2'])
    const questStore = useQuestStore()
    expect(questStore.evaluateCheck('2==c && 3==c')).toBe(false)
  })

  it('evaluates OR expression (6==c || 3==c)', () => {
    setupStoresWithScenarios(['3'])
    const questStore = useQuestStore()
    expect(questStore.evaluateCheck('6==c || 3==c')).toBe(true)
  })

  it('evaluates complex expression with parentheses', () => {
    setupStoresWithScenarios(['6', '12'])
    const questStore = useQuestStore()
    expect(questStore.evaluateCheck('6==c && (12==c || 20==c)')).toBe(true)
  })

  it('evaluates mixed ==c and !=c', () => {
    setupStoresWithScenarios(['2', '8'])
    const questStore = useQuestStore()
    expect(questStore.evaluateCheck('2==c && 8==c && 3!=c')).toBe(true)
  })

  it('fails mixed when negation condition not met', () => {
    setupStoresWithScenarios(['2', '8', '3'])
    const questStore = useQuestStore()
    expect(questStore.evaluateCheck('2==c && 8==c && 3!=c')).toBe(false)
  })

  it('evaluates choice check (13\'==15)', () => {
    setupStoresWithScenarios(['13'], { '13': 15 })
    const questStore = useQuestStore()
    expect(questStore.evaluateCheck("13'==15")).toBe(true)
  })

  it('fails choice check with wrong choice', () => {
    setupStoresWithScenarios(['13'], { '13': 17 })
    const questStore = useQuestStore()
    expect(questStore.evaluateCheck("13'==15")).toBe(false)
  })

  it('rejects malicious expressions', () => {
    setupStoresWithScenarios([])
    const questStore = useQuestStore()
    expect(questStore.evaluateCheck('alert("xss")')).toBe(false)
  })
})

describe('questStore.questProgress', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('computes progress for loaded quests', () => {
    setupStoresWithScenarios(['1', '2'])
    const questStore = useQuestStore()

    // Manually set quest definitions
    questStore.questDefinitions = [
      { id: 1, name: 'Test Quest', checks: ['', '1==c', '2==c'] },
    ]

    expect(questStore.questProgress).toHaveLength(1)
    const progress = questStore.questProgress[0]!
    expect(progress.name).toBe('Test Quest')
    expect(progress.totalChecks).toBe(2) // empty check filtered out
    expect(progress.completedCount).toBe(2)
    expect(progress.isCompleted).toBe(true)
    expect(progress.progressPercent).toBe(100)
  })

  it('categorizes quests correctly', () => {
    setupStoresWithScenarios(['1'])
    const questStore = useQuestStore()

    questStore.questDefinitions = [
      { id: 1, name: 'Active', checks: ['1==c', '2==c'] },
      { id: 2, name: 'Complete', checks: ['1==c'] },
      { id: 3, name: 'NotStarted', checks: ['5==c'] },
    ]

    expect(questStore.activeQuests).toHaveLength(1)
    expect(questStore.activeQuests[0]!.name).toBe('Active')

    expect(questStore.completedQuests).toHaveLength(1)
    expect(questStore.completedQuests[0]!.name).toBe('Complete')

    expect(questStore.notStartedQuests).toHaveLength(1)
    expect(questStore.notStartedQuests[0]!.name).toBe('NotStarted')
  })
})
