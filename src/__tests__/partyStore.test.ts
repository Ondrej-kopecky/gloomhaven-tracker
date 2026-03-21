import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePartyStore } from '@/stores/partyStore'
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
      name: 'Test Party',
      reputation: 0,
      donations: 0,
      cityEventsAvailable: [1, 2, 3, 4, 5],
      cityEventsRemoved: [],
      roadEventsAvailable: [1, 2, 3, 4, 5],
      roadEventsRemoved: [],
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

describe('partyStore - events', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('removes a city event from available to removed', () => {
    setupCampaign()
    const partyStore = usePartyStore()

    partyStore.removeEvent('city', 3)

    expect(partyStore.cityEventsAvailable).toEqual([1, 2, 4, 5])
    expect(partyStore.cityEventsRemoved).toEqual([3])
  })

  it('removes a road event from available to removed', () => {
    setupCampaign()
    const partyStore = usePartyStore()

    partyStore.removeEvent('road', 2)

    expect(partyStore.roadEventsAvailable).toEqual([1, 3, 4, 5])
    expect(partyStore.roadEventsRemoved).toEqual([2])
  })

  it('does nothing when removing non-existent event', () => {
    setupCampaign()
    const partyStore = usePartyStore()

    partyStore.removeEvent('city', 99)

    expect(partyStore.cityEventsAvailable).toEqual([1, 2, 3, 4, 5])
    expect(partyStore.cityEventsRemoved).toEqual([])
  })

  it('adds a new city event', () => {
    setupCampaign()
    const partyStore = usePartyStore()

    partyStore.addEvent('city', 31)

    expect(partyStore.cityEventsAvailable).toContain(31)
    expect(partyStore.cityEventsAvailable).toEqual([1, 2, 3, 4, 5, 31])
  })

  it('does not add duplicate event', () => {
    setupCampaign()
    const partyStore = usePartyStore()

    partyStore.addEvent('city', 3)

    expect(partyStore.cityEventsAvailable.filter((id) => id === 3)).toHaveLength(1)
  })

  it('returns a removed event back to available', () => {
    setupCampaign()
    const partyStore = usePartyStore()

    partyStore.removeEvent('road', 3)
    expect(partyStore.roadEventsAvailable).not.toContain(3)
    expect(partyStore.roadEventsRemoved).toContain(3)

    partyStore.returnEvent('road', 3)
    expect(partyStore.roadEventsAvailable).toContain(3)
    expect(partyStore.roadEventsRemoved).not.toContain(3)
  })

  it('keeps events sorted after add', () => {
    setupCampaign()
    const partyStore = usePartyStore()

    partyStore.addEvent('city', 2) // already exists, no-op
    partyStore.addEvent('city', 31)
    partyStore.addEvent('city', 10)

    const available = partyStore.cityEventsAvailable
    for (let i = 1; i < available.length; i++) {
      expect(available[i]!).toBeGreaterThanOrEqual(available[i - 1]!)
    }
  })

  it('keeps removed events sorted', () => {
    setupCampaign()
    const partyStore = usePartyStore()

    partyStore.removeEvent('city', 5)
    partyStore.removeEvent('city', 1)
    partyStore.removeEvent('city', 3)

    expect(partyStore.cityEventsRemoved).toEqual([1, 3, 5])
  })
})

describe('partyStore - reputation', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('changes reputation', () => {
    setupCampaign()
    const partyStore = usePartyStore()

    partyStore.changeReputation(3)
    expect(partyStore.reputation).toBe(3)

    partyStore.changeReputation(-5)
    expect(partyStore.reputation).toBe(-2)
  })

  it('clamps reputation to -20', () => {
    setupCampaign()
    const partyStore = usePartyStore()

    partyStore.changeReputation(-25)
    expect(partyStore.reputation).toBe(-20)
  })

  it('clamps reputation to +20', () => {
    setupCampaign()
    const partyStore = usePartyStore()

    partyStore.changeReputation(25)
    expect(partyStore.reputation).toBe(20)
  })
})

describe('partyStore - prosperity', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('adds prosperity', () => {
    setupCampaign()
    const partyStore = usePartyStore()

    partyStore.addProsperity(5)
    expect(partyStore.prosperityIndex).toBe(5)
  })

  it('clamps prosperity to 0', () => {
    setupCampaign()
    const partyStore = usePartyStore()

    partyStore.addProsperity(-10)
    expect(partyStore.prosperityIndex).toBe(0)
  })

  it('clamps prosperity to 64', () => {
    setupCampaign()
    const partyStore = usePartyStore()

    partyStore.addProsperity(100)
    expect(partyStore.prosperityIndex).toBe(64)
  })
})

describe('partyStore - donations', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('adds donation of 10', () => {
    setupCampaign()
    const partyStore = usePartyStore()

    partyStore.addDonation()
    expect(partyStore.donations).toBe(10)

    partyStore.addDonation()
    expect(partyStore.donations).toBe(20)
  })
})
