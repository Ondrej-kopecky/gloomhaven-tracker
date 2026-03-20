import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CampaignState, CampaignSummary } from '@/models/Campaign'
import type { PartyState } from '@/models/Party'
import { useStorage } from '@/composables/useStorage'
import { uuid } from '@/utils/uuid'
import { useDebounceFn } from '@vueuse/core'

export const useCampaignStore = defineStore('campaign', () => {
  const campaigns = ref<CampaignSummary[]>([])
  const currentCampaign = ref<CampaignState | null>(null)
  const isLoading = ref(false)

  const hasCampaign = computed(() => currentCampaign.value !== null)
  const campaignId = computed(() => currentCampaign.value?.id ?? null)
  const hideSpoilers = computed(() => currentCampaign.value?.hideSpoilers ?? false)

  function setHideSpoilers(value: boolean) {
    if (!currentCampaign.value) return
    currentCampaign.value = { ...currentCampaign.value, hideSpoilers: value }
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
        currentCampaign.value = campaign
      }
    } finally {
      isLoading.value = false
    }
  }

  async function deleteCampaign(id: string) {
    await useStorage().deleteCampaign(id)
    if (currentCampaign.value?.id === id) {
      currentCampaign.value = null
    }
    await loadCampaignList()
  }

  const debouncedSave = useDebounceFn(async () => {
    if (currentCampaign.value) {
      currentCampaign.value.lastPlayedAt = new Date().toISOString()
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
    currentCampaign.value = campaign
    await loadCampaignList()
  }

  return {
    campaigns,
    currentCampaign,
    isLoading,
    hasCampaign,
    campaignId,
    hideSpoilers,
    setHideSpoilers,
    loadCampaignList,
    createCampaign,
    loadCampaign,
    deleteCampaign,
    autoSave,
    exportCampaign,
    importCampaign,
  }
})
