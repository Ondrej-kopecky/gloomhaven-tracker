import { describe, it, expect, beforeEach, vi } from 'vitest'
import { HybridStorageAdapter } from '@/services/storage/HybridStorageAdapter'

// Mock localStorage for storage adapter tests
const store: Record<string, string> = {}
const mockLocalStorage = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value },
  removeItem: (key: string) => { delete store[key] },
  get length() { return Object.keys(store).length },
  key: (i: number) => Object.keys(store)[i] ?? null,
  clear: () => { Object.keys(store).forEach(k => delete store[k]) },
}

Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
})

import { LocalStorageAdapter } from '@/services/storage/LocalStorageAdapter'

const makeCampaign = (id: string, name: string) => ({
  id, name, createdAt: '2026-01-01', lastPlayedAt: '2026-01-01',
  prosperityIndex: 0, globalAchievements: {}, partyAchievements: {},
  party: {
    name: '', reputation: 0, donations: 0,
    cityEventsAvailable: [], cityEventsRemoved: [],
    roadEventsAvailable: [], roadEventsRemoved: [],
    notes: '',
  },
  characters: [] as any[], archivedCharacters: [] as any[],
  scenarios: {}, personalQuests: {}, notes: '',
})

describe('LocalStorageAdapter', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
  })

  it('saves and loads a campaign', async () => {
    const adapter = new LocalStorageAdapter('test')
    await adapter.saveCampaign(makeCampaign('c1', 'Test') as any)

    const loaded = await adapter.loadCampaign('c1')
    expect(loaded).toBeDefined()
    expect(loaded!.name).toBe('Test')
  })

  it('lists campaigns', async () => {
    const adapter = new LocalStorageAdapter('test')
    await adapter.saveCampaign(makeCampaign('c1', 'Test') as any)

    const list = await adapter.listCampaigns()
    expect(list).toHaveLength(1)
    expect(list[0]!.id).toBe('c1')
  })

  it('deletes campaign', async () => {
    const adapter = new LocalStorageAdapter('test')
    await adapter.saveCampaign(makeCampaign('c1', 'Test') as any)
    await adapter.deleteCampaign('c1')

    expect(await adapter.loadCampaign('c1')).toBeNull()
    expect(await adapter.listCampaigns()).toHaveLength(0)
  })

  it('exports and imports campaign', async () => {
    const adapter = new LocalStorageAdapter('test')
    await adapter.saveCampaign(makeCampaign('c1', 'Export Test') as any)

    const json = await adapter.exportCampaign('c1')
    const parsed = JSON.parse(json)
    expect(parsed.name).toBe('Export Test')

    // Import under same adapter
    mockLocalStorage.clear()
    const imported = await adapter.importCampaign(json)
    expect(imported.name).toBe('Export Test')
  })
})

describe('HybridStorageAdapter - cloud safety', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
  })

  it('deleteLocalOnly does NOT call cloud delete', async () => {
    const adapter = new HybridStorageAdapter('test')
    const cloudSpy = vi.spyOn((adapter as any).cloud, 'deleteCampaign').mockResolvedValue(undefined)

    await (adapter as any).local.saveCampaign(makeCampaign('c1', 'Test'))
    await adapter.deleteLocalOnly('c1')

    expect(cloudSpy).not.toHaveBeenCalled()
    expect(await (adapter as any).local.loadCampaign('c1')).toBeNull()
  })

  it('deleteCampaign DOES call cloud delete', async () => {
    const adapter = new HybridStorageAdapter('test')
    const cloudSpy = vi.spyOn((adapter as any).cloud, 'deleteCampaign').mockResolvedValue(undefined)

    await (adapter as any).local.saveCampaign(makeCampaign('c1', 'Test'))
    await adapter.deleteCampaign('c1')

    expect(cloudSpy).toHaveBeenCalledWith('c1')
  })

  it('saveCampaign saves locally and fires cloud save', async () => {
    const adapter = new HybridStorageAdapter('test')
    const cloudSpy = vi.spyOn((adapter as any).cloud, 'saveCampaign').mockResolvedValue(undefined)

    const campaign = makeCampaign('c1', 'Test')
    await adapter.saveCampaign(campaign as any)

    // Local should have it
    const loaded = await (adapter as any).local.loadCampaign('c1')
    expect(loaded!.name).toBe('Test')

    // Cloud should have been called
    expect(cloudSpy).toHaveBeenCalled()
  })
})

describe('Logout safety - local-only deletion', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
  })

  it('deleting via LocalStorageAdapter never triggers cloud calls', async () => {
    // This simulates what logout() does
    const local = new LocalStorageAdapter('default')

    // Save campaigns
    await local.saveCampaign(makeCampaign('c1', 'Campaign 1') as any)
    await local.saveCampaign(makeCampaign('c2', 'Campaign 2') as any)
    expect(await local.listCampaigns()).toHaveLength(2)

    // Simulate logout: delete all via local adapter
    const list = await local.listCampaigns()
    for (const c of list) {
      await local.deleteCampaign(c.id)
    }

    // All local data gone
    expect(await local.listCampaigns()).toHaveLength(0)

    // No cloud adapter was involved — LocalStorageAdapter has no
    // cloud dependency, so no server campaigns were touched
  })
})
