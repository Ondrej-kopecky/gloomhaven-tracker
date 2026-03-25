import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CampaignState, CampaignSummary, ShareInfo } from '@/models/Campaign'
import type { PartyState } from '@/models/Party'
import { useStorage } from '@/composables/useStorage'
import { uuid } from '@/utils/uuid'
import { useDebounceFn } from '@vueuse/core'
import * as campaignApi from '@/services/api/campaignApi'
import { hasToken } from '@/services/api/apiClient'

export const useCampaignStore = defineStore('campaign', () => {
  const campaigns = ref<CampaignSummary[]>([])
  const currentCampaign = ref<CampaignState | null>(null)
  const isLoading = ref(false)
  const shareInfo = ref<ShareInfo | null>(null)
  const shareLoading = ref(false)
  const shareError = ref('')

  const hasCampaign = computed(() => currentCampaign.value !== null)
  const campaignId = computed(() => currentCampaign.value?.id ?? null)
  const hideSpoilers = computed(() => currentCampaign.value?.hideSpoilers ?? false)

  function setHideSpoilers(value: boolean) {
    if (!currentCampaign.value) return
    currentCampaign.value = { ...currentCampaign.value, hideSpoilers: value }
    autoSave()
  }

  const unlockedItemDesigns = computed(() => currentCampaign.value?.unlockedItemDesigns ?? [])

  function unlockItemDesign(itemId: number) {
    if (!currentCampaign.value) return
    const current = currentCampaign.value.unlockedItemDesigns ?? []
    if (current.includes(itemId)) return
    currentCampaign.value = { ...currentCampaign.value, unlockedItemDesigns: [...current, itemId] }
    autoSave()
  }

  function removeItemDesign(itemId: number) {
    if (!currentCampaign.value) return
    const current = currentCampaign.value.unlockedItemDesigns ?? []
    currentCampaign.value = { ...currentCampaign.value, unlockedItemDesigns: current.filter((id) => id !== itemId) }
    autoSave()
  }

  const manuallyUnlockedScenarios = computed(() => currentCampaign.value?.manuallyUnlockedScenarios ?? [])

  function manuallyUnlockScenario(scenarioId: string) {
    if (!currentCampaign.value) return
    const current = currentCampaign.value.manuallyUnlockedScenarios ?? []
    if (current.includes(scenarioId)) return
    currentCampaign.value = { ...currentCampaign.value, manuallyUnlockedScenarios: [...current, scenarioId] }
    autoSave()
  }

  const unlockedClasses = computed(() => currentCampaign.value?.unlockedClasses ?? [])

  function unlockClass(classId: string) {
    if (!currentCampaign.value) return
    const current = currentCampaign.value.unlockedClasses ?? []
    if (current.includes(classId)) return
    currentCampaign.value = { ...currentCampaign.value, unlockedClasses: [...current, classId] }
    autoSave()
  }

  function lockClass(classId: string) {
    if (!currentCampaign.value) return
    const current = currentCampaign.value.unlockedClasses ?? []
    currentCampaign.value = { ...currentCampaign.value, unlockedClasses: current.filter((id) => id !== classId) }
    autoSave()
  }

  function removeManuallyUnlockedScenario(scenarioId: string) {
    if (!currentCampaign.value) return
    const current = currentCampaign.value.manuallyUnlockedScenarios ?? []
    currentCampaign.value = { ...currentCampaign.value, manuallyUnlockedScenarios: current.filter((id) => id !== scenarioId) }
    autoSave()
  }

  async function loadCampaignList() {
    campaigns.value = await useStorage().listCampaigns()
  }

  async function createCampaign(name: string): Promise<CampaignState> {
    const id = uuid()
    const now = new Date().toISOString()

    const defaultParty: PartyState = {
      name: 'Nová družina',
      reputation: 0,
      donations: 0,
      cityEventsAvailable: Array.from({ length: 30 }, (_, i) => i + 1),
      cityEventsRemoved: [],
      roadEventsAvailable: Array.from({ length: 30 }, (_, i) => i + 1),
      roadEventsRemoved: [],
      notes: '',
    }

    const campaign: CampaignState = {
      id,
      name,
      createdAt: now,
      lastPlayedAt: now,
      prosperityIndex: 0,
      globalAchievements: {},
      partyAchievements: {},
      party: defaultParty,
      characters: [],
      archivedCharacters: [],
      scenarios: {},
      personalQuests: {},
      players: [],
      notes: '',
    }

    await useStorage().saveCampaign(campaign)
    currentCampaign.value = campaign
    await loadCampaignList()
    return campaign
  }

  async function loadCampaign(id: string) {
    isLoading.value = true
    try {
      const campaign = await useStorage().loadCampaign(id)
      if (campaign) {
        // Ensure newer fields exist (backward compat)
        if (!campaign.personalQuests) campaign.personalQuests = {}
        if (!campaign.players) campaign.players = []

        // Auto-populate players from character owners if players list is empty
        if (campaign.players.length === 0) {
          const owners = new Set(
            (campaign.characters ?? [])
              .map((c) => c.owner?.trim())
              .filter(Boolean)
          )
          campaign.players = [...owners]
        }

        currentCampaign.value = campaign
        // Remember last active campaign for auto-load on refresh
        try { localStorage.setItem('gh_last_campaign', id) } catch {}
      }
    } finally {
      isLoading.value = false
    }
  }

  async function autoLoadLastCampaign() {
    if (currentCampaign.value) return // already loaded
    try {
      const lastId = localStorage.getItem('gh_last_campaign')
      if (lastId) {
        await loadCampaign(lastId)
      }
    } catch {}
  }

  async function deleteCampaign(id: string) {
    await useStorage().deleteCampaign(id)
    if (currentCampaign.value?.id === id) {
      currentCampaign.value = null
      try { localStorage.removeItem('gh_last_campaign') } catch {}
    }
    await loadCampaignList()
  }

  const MAX_SNAPSHOTS = 20

  function saveSnapshot(campaign: CampaignState) {
    try {
      const key = `gh_snapshots_${campaign.id}`
      const raw = localStorage.getItem(key)
      const snapshots: { ts: string; data: string }[] = raw ? JSON.parse(raw) : []
      const json = JSON.stringify(campaign)
      // Skip if same as last snapshot
      if (snapshots.length > 0 && snapshots[0].data === json) return
      snapshots.unshift({ ts: new Date().toISOString(), data: json })
      if (snapshots.length > MAX_SNAPSHOTS) snapshots.length = MAX_SNAPSHOTS
      localStorage.setItem(key, JSON.stringify(snapshots))
    } catch { /* localStorage full — ignore */ }
  }

  function getSnapshots(): { ts: string; data: string }[] {
    if (!currentCampaign.value) return []
    try {
      const raw = localStorage.getItem(`gh_snapshots_${currentCampaign.value.id}`)
      return raw ? JSON.parse(raw) : []
    } catch { return [] }
  }

  function restoreSnapshot(index: number) {
    const snapshots = getSnapshots()
    if (!snapshots[index]) return
    const campaign = JSON.parse(snapshots[index].data) as CampaignState
    currentCampaign.value = campaign
    useStorage().saveCampaign(campaign)
  }

  const debouncedSave = useDebounceFn(async () => {
    if (currentCampaign.value) {
      currentCampaign.value.lastPlayedAt = new Date().toISOString()
      saveSnapshot(currentCampaign.value)
      await useStorage().saveCampaign(currentCampaign.value)
    }
  }, 300)

  function autoSave() {
    debouncedSave()
  }

  async function exportCampaign(): Promise<string> {
    if (!currentCampaign.value) throw new Error('Žádná kampaň není načtena')
    return useStorage().exportCampaign(currentCampaign.value.id)
  }

  async function importCampaign(json: string) {
    const campaign = await useStorage().importCampaign(json)
    // Ensure newer fields exist (backward compat with older exports)
    if (!campaign.personalQuests) campaign.personalQuests = {}
    if (!campaign.players) campaign.players = []
    currentCampaign.value = campaign
    await loadCampaignList()
  }

  // --- Sharing ---
  const isCurrentCampaignOwned = computed(() => {
    if (!currentCampaign.value) return true
    const summary = campaigns.value.find((c) => c.id === currentCampaign.value?.id)
    return summary?.isOwner !== false
  })

  const currentCampaignSummary = computed(() =>
    campaigns.value.find((c) => c.id === currentCampaign.value?.id) ?? null
  )

  async function loadShareInfo() {
    if (!currentCampaign.value || !hasToken()) return
    shareLoading.value = true
    shareError.value = ''
    try {
      const { data, error } = await campaignApi.getShareInfo(currentCampaign.value.id)
      if (data) shareInfo.value = data
      if (error) shareError.value = error
    } finally {
      shareLoading.value = false
    }
  }

  async function generateShareCode(): Promise<string | null> {
    if (!currentCampaign.value) return null
    shareError.value = ''
    const { data, error } = await campaignApi.generateShareCode(currentCampaign.value.id)
    if (error) {
      shareError.value = error
      return null
    }
    if (data) {
      await loadShareInfo()
      await loadCampaignList()
      return data.shareCode
    }
    return null
  }

  async function revokeShareCode() {
    if (!currentCampaign.value) return
    shareError.value = ''
    const { error } = await campaignApi.revokeShareCode(currentCampaign.value.id)
    if (error) {
      shareError.value = error
      return
    }
    shareInfo.value = null
    await loadCampaignList()
  }

  async function joinCampaign(code: string): Promise<{ success: boolean; campaignName?: string; campaignId?: string; error?: string }> {
    shareError.value = ''
    const { data, error } = await campaignApi.joinCampaign(code)
    if (error) return { success: false, error }
    if (data) {
      // Download the shared campaign data locally
      const { data: campaignData } = await campaignApi.getCampaign(data.campaignId)
      if (campaignData) {
        await useStorage().saveCampaign(campaignData)
      }
      await loadCampaignList()
      return { success: true, campaignName: data.campaignName, campaignId: data.campaignId }
    }
    return { success: false, error: 'Neznámá chyba' }
  }

  async function leaveCampaign() {
    if (!currentCampaign.value) return
    shareError.value = ''
    const { error } = await campaignApi.leaveCampaign(currentCampaign.value.id)
    if (error) {
      shareError.value = error
      return
    }
    currentCampaign.value = null
    shareInfo.value = null
    await loadCampaignList()
  }

  async function kickMember(userId: number) {
    if (!currentCampaign.value) return
    shareError.value = ''
    const { error } = await campaignApi.kickMember(currentCampaign.value.id, userId)
    if (error) {
      shareError.value = error
      return
    }
    await loadShareInfo()
  }

  return {
    campaigns,
    currentCampaign,
    isLoading,
    hasCampaign,
    campaignId,
    hideSpoilers,
    setHideSpoilers,
    unlockedItemDesigns,
    unlockItemDesign,
    removeItemDesign,
    manuallyUnlockedScenarios,
    manuallyUnlockScenario,
    removeManuallyUnlockedScenario,
    unlockedClasses,
    unlockClass,
    lockClass,
    getSnapshots,
    restoreSnapshot,
    loadCampaignList,
    createCampaign,
    loadCampaign,
    autoLoadLastCampaign,
    deleteCampaign,
    autoSave,
    exportCampaign,
    importCampaign,
    // Sharing
    shareInfo,
    shareLoading,
    shareError,
    isCurrentCampaignOwned,
    currentCampaignSummary,
    loadShareInfo,
    generateShareCode,
    revokeShareCode,
    joinCampaign,
    leaveCampaign,
    kickMember,
  }
})
