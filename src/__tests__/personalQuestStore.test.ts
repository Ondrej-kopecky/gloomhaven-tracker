import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePersonalQuestStore } from '@/stores/personalQuestStore'
import { useCampaignStore } from '@/stores/campaignStore'

function setupCampaign() {
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
    characters: [
      {
        uuid: 'char-1',
        classId: 'brute' as any,
        playerName: 'Test',
        level: 1, xp: 0, gold: 0, notes: '',
        perksSelected: {}, abilities: [], items: [],
        checks: 0, isRetired: false, createdAt: '',
      },
    ],
    archivedCharacters: [],
    scenarios: {},
    personalQuests: {},
    notes: '',
  }
  return campaignStore
}

describe('personalQuestStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('assigns a checkbox quest to a character', () => {
    setupCampaign()
    const pqStore = usePersonalQuestStore()

    // Load a test definition
    pqStore.definitions = [
      {
        id: 510,
        name: 'Seeker of Xorn',
        character_unlock: 'PH',
        progress: [
          { type: 'checkbox', name: 'Complete three Crypt scenarios.', value: [0, 0, 0] },
        ],
      },
    ]

    pqStore.assignQuest('char-1', 510)

    const state = pqStore.getQuestForCharacter('char-1')
    expect(state).toBeDefined()
    expect(state!.questId).toBe(510)
    expect(state!.progress).toHaveLength(1)
    expect(state!.progress[0]!.checkboxValues).toEqual([false, false, false])
    expect(state!.isCompleted).toBe(false)
  })

  it('assigns a number quest to a character', () => {
    setupCampaign()
    const pqStore = usePersonalQuestStore()

    pqStore.definitions = [
      {
        id: 512,
        name: 'Greed is Good',
        character_unlock: 'QM',
        progress: [
          { type: 'number', name: 'Have 200 gold.', value: 0, target: 200 },
        ],
      },
    ]

    pqStore.assignQuest('char-1', 512)

    const state = pqStore.getQuestForCharacter('char-1')
    expect(state!.progress[0]!.numberValue).toBe(0)
  })

  it('toggles checkbox progress', () => {
    setupCampaign()
    const pqStore = usePersonalQuestStore()

    pqStore.definitions = [
      {
        id: 510,
        name: 'Test Quest',
        character_unlock: 'PH',
        progress: [
          { type: 'checkbox', name: 'Do something', value: [0, 0] },
        ],
      },
    ]

    pqStore.assignQuest('char-1', 510)
    pqStore.toggleCheckbox('char-1', 0, 0)

    const state = pqStore.getQuestForCharacter('char-1')
    expect(state!.progress[0]!.checkboxValues![0]).toBe(true)
    expect(state!.progress[0]!.checkboxValues![1]).toBe(false)
  })

  it('toggles checkbox back to false', () => {
    setupCampaign()
    const pqStore = usePersonalQuestStore()

    pqStore.definitions = [
      {
        id: 510,
        name: 'Test',
        progress: [{ type: 'checkbox', name: 'Do it', value: [0] }],
      },
    ]

    pqStore.assignQuest('char-1', 510)
    pqStore.toggleCheckbox('char-1', 0, 0)
    expect(pqStore.getQuestForCharacter('char-1')!.progress[0]!.checkboxValues![0]).toBe(true)

    pqStore.toggleCheckbox('char-1', 0, 0)
    expect(pqStore.getQuestForCharacter('char-1')!.progress[0]!.checkboxValues![0]).toBe(false)
  })

  it('sets number value', () => {
    setupCampaign()
    const pqStore = usePersonalQuestStore()

    pqStore.definitions = [
      {
        id: 512,
        name: 'Gold Quest',
        progress: [{ type: 'number', name: 'Get gold', value: 0, target: 200 }],
      },
    ]

    pqStore.assignQuest('char-1', 512)
    pqStore.setNumberValue('char-1', 0, 150)

    expect(pqStore.getQuestForCharacter('char-1')!.progress[0]!.numberValue).toBe(150)
  })

  it('clamps number value to minimum 0', () => {
    setupCampaign()
    const pqStore = usePersonalQuestStore()

    pqStore.definitions = [
      {
        id: 512,
        name: 'Gold Quest',
        progress: [{ type: 'number', name: 'Get gold', value: 0, target: 200 }],
      },
    ]

    pqStore.assignQuest('char-1', 512)
    pqStore.setNumberValue('char-1', 0, -10)

    expect(pqStore.getQuestForCharacter('char-1')!.progress[0]!.numberValue).toBe(0)
  })

  it('detects completion for checkbox quest', () => {
    setupCampaign()
    const pqStore = usePersonalQuestStore()

    pqStore.definitions = [
      {
        id: 510,
        name: 'Test',
        progress: [{ type: 'checkbox', name: 'Do it', value: [0, 0] }],
      },
    ]

    pqStore.assignQuest('char-1', 510)
    pqStore.toggleCheckbox('char-1', 0, 0)
    expect(pqStore.getQuestForCharacter('char-1')!.isCompleted).toBe(false)

    pqStore.toggleCheckbox('char-1', 0, 1)
    expect(pqStore.getQuestForCharacter('char-1')!.isCompleted).toBe(true)
  })

  it('detects completion for number quest', () => {
    setupCampaign()
    const pqStore = usePersonalQuestStore()

    pqStore.definitions = [
      {
        id: 512,
        name: 'Gold Quest',
        progress: [{ type: 'number', name: 'Get gold', value: 0, target: 200 }],
      },
    ]

    pqStore.assignQuest('char-1', 512)
    pqStore.setNumberValue('char-1', 0, 199)
    expect(pqStore.getQuestForCharacter('char-1')!.isCompleted).toBe(false)

    pqStore.setNumberValue('char-1', 0, 200)
    expect(pqStore.getQuestForCharacter('char-1')!.isCompleted).toBe(true)
  })

  it('removes quest from character', () => {
    setupCampaign()
    const pqStore = usePersonalQuestStore()

    pqStore.definitions = [
      {
        id: 510,
        name: 'Test',
        progress: [{ type: 'checkbox', name: 'Do it', value: [0] }],
      },
    ]

    pqStore.assignQuest('char-1', 510)
    expect(pqStore.getQuestForCharacter('char-1')).toBeDefined()

    pqStore.removeQuest('char-1')
    expect(pqStore.getQuestForCharacter('char-1')).toBeUndefined()
  })

  it('returns unlock class name', () => {
    const pqStore = usePersonalQuestStore()

    pqStore.definitions = [
      { id: 510, name: 'Test', character_unlock: 'PH', progress: [] },
      { id: 511, name: 'No Unlock', progress: [] },
    ]

    expect(pqStore.getUnlockClassName(510)).toBe('Plagueherald')
    expect(pqStore.getUnlockClassName(511)).toBeUndefined()
  })
})
