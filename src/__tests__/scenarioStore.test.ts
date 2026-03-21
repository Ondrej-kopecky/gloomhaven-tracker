import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useScenarioStore } from '@/stores/scenarioStore'
import { useCampaignStore } from '@/stores/campaignStore'
import { useAchievementStore } from '@/stores/achievementStore'
import { ScenarioStatus } from '@/models/types'
import type { ScenarioData } from '@/models/Scenario'

function createCampaign() {
  const campaignStore = useCampaignStore()
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
  return campaignStore
}

function makeScenario(overrides: Partial<ScenarioData> & { id: string }): ScenarioData {
  return {
    name: `Scenario ${overrides.id}`,
    location: '',
    isSide: false,
    isRoot: false,
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
    ...overrides,
  } as ScenarioData
}

describe('scenarioStore - status computation', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('root scenario is always AVAILABLE', () => {
    createCampaign()
    const store = useScenarioStore()
    store.scenarioDefinitions = [makeScenario({ id: '1', isRoot: true })] as any

    expect(store.getScenarioStatus('1')).toBe(ScenarioStatus.AVAILABLE)
  })

  it('non-root scenario without links is LOCKED', () => {
    createCampaign()
    const store = useScenarioStore()
    store.scenarioDefinitions = [
      makeScenario({ id: '1', isRoot: true }),
      makeScenario({ id: '50' }),
    ] as any

    expect(store.getScenarioStatus('50')).toBe(ScenarioStatus.LOCKED)
  })

  it('linked scenario becomes AVAILABLE when parent is completed', () => {
    const campaignStore = createCampaign()
    const store = useScenarioStore()

    store.scenarioDefinitions = [
      makeScenario({ id: '1', isRoot: true, linksTo: [2] }),
      makeScenario({ id: '2', linkedFrom: [1] }),
    ] as any

    // Complete scenario 1
    campaignStore.currentCampaign!.scenarios['1'] = {
      id: '1', status: ScenarioStatus.COMPLETED, notes: '', treasuresLooted: [],
    }

    expect(store.getScenarioStatus('2')).toBe(ScenarioStatus.AVAILABLE)
  })

  it('linked scenario stays LOCKED when parent not completed', () => {
    createCampaign()
    const store = useScenarioStore()

    store.scenarioDefinitions = [
      makeScenario({ id: '1', isRoot: true, linksTo: [2] }),
      makeScenario({ id: '2', linkedFrom: [1] }),
    ] as any

    expect(store.getScenarioStatus('2')).toBe(ScenarioStatus.LOCKED)
  })

  it('completed scenario stays COMPLETED', () => {
    const campaignStore = createCampaign()
    const store = useScenarioStore()

    store.scenarioDefinitions = [makeScenario({ id: '1', isRoot: true })] as any
    campaignStore.currentCampaign!.scenarios['1'] = {
      id: '1', status: ScenarioStatus.COMPLETED, notes: '', treasuresLooted: [],
    }

    expect(store.getScenarioStatus('1')).toBe(ScenarioStatus.COMPLETED)
  })

  it('attempted scenario stays ATTEMPTED', () => {
    const campaignStore = createCampaign()
    const store = useScenarioStore()

    store.scenarioDefinitions = [makeScenario({ id: '1', isRoot: true })] as any
    campaignStore.currentCampaign!.scenarios['1'] = {
      id: '1', status: ScenarioStatus.ATTEMPTED, notes: '', treasuresLooted: [],
    }

    expect(store.getScenarioStatus('1')).toBe(ScenarioStatus.ATTEMPTED)
  })

  it('coupled scenario is BLOCKED when partner is completed', () => {
    const campaignStore = createCampaign()
    const store = useScenarioStore()

    store.scenarioDefinitions = [
      makeScenario({ id: '1', isRoot: true, linksTo: [2, 3] }),
      makeScenario({ id: '2', linkedFrom: [1], coupled: 3 } as any),
      makeScenario({ id: '3', linkedFrom: [1], coupled: 2 } as any),
    ] as any

    campaignStore.currentCampaign!.scenarios['1'] = {
      id: '1', status: ScenarioStatus.COMPLETED, notes: '', treasuresLooted: [],
    }
    campaignStore.currentCampaign!.scenarios['2'] = {
      id: '2', status: ScenarioStatus.COMPLETED, notes: '', treasuresLooted: [],
    }

    expect(store.getScenarioStatus('3')).toBe(ScenarioStatus.BLOCKED)
  })
})

describe('scenarioStore - actions', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('completeScenario sets status and timestamp', () => {
    const campaignStore = createCampaign()
    const store = useScenarioStore()

    store.scenarioDefinitions = [
      makeScenario({ id: '1', isRoot: true, rewards: {} }),
    ] as any

    store.completeScenario('1')

    const state = campaignStore.currentCampaign!.scenarios['1']
    expect(state).toBeDefined()
    expect(state!.status).toBe(ScenarioStatus.COMPLETED)
    expect(state!.completedAt).toBeDefined()
  })

  it('markAttempted sets ATTEMPTED status', () => {
    const campaignStore = createCampaign()
    const store = useScenarioStore()
    store.scenarioDefinitions = [makeScenario({ id: '1', isRoot: true })] as any

    store.markAttempted('1')

    expect(campaignStore.currentCampaign!.scenarios['1']!.status).toBe(ScenarioStatus.ATTEMPTED)
  })

  it('unlockScenario sets AVAILABLE status', () => {
    const campaignStore = createCampaign()
    const store = useScenarioStore()
    store.scenarioDefinitions = [makeScenario({ id: '50' })] as any

    store.unlockScenario('50')

    expect(campaignStore.currentCampaign!.scenarios['50']!.status).toBe(ScenarioStatus.AVAILABLE)
  })

  it('resetScenario removes the state', () => {
    const campaignStore = createCampaign()
    const store = useScenarioStore()
    store.scenarioDefinitions = [makeScenario({ id: '1', isRoot: true, rewards: {} })] as any

    store.completeScenario('1')
    expect(campaignStore.currentCampaign!.scenarios['1']).toBeDefined()

    store.resetScenario('1')
    expect(campaignStore.currentCampaign!.scenarios['1']).toBeUndefined()
  })

  it('setNotes saves notes', () => {
    const campaignStore = createCampaign()
    const store = useScenarioStore()
    store.scenarioDefinitions = [makeScenario({ id: '1', isRoot: true })] as any

    store.setNotes('1', 'Very tough fight')

    expect(campaignStore.currentCampaign!.scenarios['1']!.notes).toBe('Very tough fight')
  })

  it('lootTreasure tracks treasure', () => {
    const campaignStore = createCampaign()
    const store = useScenarioStore()
    store.scenarioDefinitions = [makeScenario({ id: '1', isRoot: true, rewards: {} })] as any

    store.completeScenario('1')
    store.lootTreasure('1', '7')

    expect(campaignStore.currentCampaign!.scenarios['1']!.treasuresLooted).toContain('7')
  })

  it('lootTreasure does not duplicate', () => {
    const campaignStore = createCampaign()
    const store = useScenarioStore()
    store.scenarioDefinitions = [makeScenario({ id: '1', isRoot: true, rewards: {} })] as any

    store.completeScenario('1')
    store.lootTreasure('1', '7')
    store.lootTreasure('1', '7')

    expect(campaignStore.currentCampaign!.scenarios['1']!.treasuresLooted.filter((t) => t === '7')).toHaveLength(1)
  })

  it('completeScenario awards achievements', () => {
    const campaignStore = createCampaign()
    const achStore = useAchievementStore()
    const store = useScenarioStore()

    // Set up achievement definitions
    achStore.globalDefinitions = [
      { id: 'PFS', name: 'First Steps', type: 'global' as any },
    ] as any

    store.scenarioDefinitions = [
      makeScenario({
        id: '1',
        isRoot: true,
        achievementsAwarded: ['PFS'],
        rewards: {},
      }),
    ] as any

    store.completeScenario('1')

    expect(achStore.isGlobalAchieved('PFS')).toBe(true)
  })
})

describe('scenarioStore - computed lists', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('allScenarios merges definition and state', () => {
    const campaignStore = createCampaign()
    const store = useScenarioStore()

    store.scenarioDefinitions = [
      makeScenario({ id: '1', isRoot: true, name: 'Black Barrow' }),
    ] as any

    expect(store.allScenarios).toHaveLength(1)
    expect(store.allScenarios[0]!.name).toBe('Black Barrow')
    expect(store.allScenarios[0]!.computedStatus).toBe(ScenarioStatus.AVAILABLE)
  })

  it('completedScenarios filters correctly', () => {
    const campaignStore = createCampaign()
    const store = useScenarioStore()

    store.scenarioDefinitions = [
      makeScenario({ id: '1', isRoot: true, rewards: {} }),
      makeScenario({ id: '2', linkedFrom: [1] }),
    ] as any

    store.completeScenario('1')

    expect(store.completedScenarios).toHaveLength(1)
    expect(store.completedScenarios[0]!.id).toBe('1')
  })

  it('availableScenarios filters correctly', () => {
    const campaignStore = createCampaign()
    const store = useScenarioStore()

    store.scenarioDefinitions = [
      makeScenario({ id: '1', isRoot: true, linksTo: [2], rewards: {} }),
      makeScenario({ id: '2', linkedFrom: [1] }),
    ] as any

    // Before completing 1: only 1 is available
    expect(store.availableScenarios).toHaveLength(1)

    store.completeScenario('1')

    // After completing 1: only 2 is available (1 is completed)
    expect(store.availableScenarios).toHaveLength(1)
    expect(store.availableScenarios[0]!.id).toBe('2')
  })
})
