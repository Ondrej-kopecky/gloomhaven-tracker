import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useCampaignStore } from './campaignStore'
import { getProsperityLevel, getShopPriceModifier } from '@/utils/prosperityTable'

export const usePartyStore = defineStore('party', () => {
  const campaignStore = useCampaignStore()

  const party = computed(() => campaignStore.currentCampaign?.party ?? null)

  const reputation = computed(() => party.value?.reputation ?? 0)
  const donations = computed(() => party.value?.donations ?? 0)
  const prosperityIndex = computed(() => campaignStore.currentCampaign?.prosperityIndex ?? 0)

  const prosperityLevel = computed(() => getProsperityLevel(prosperityIndex.value))
  const shopPriceModifier = computed(() => getShopPriceModifier(reputation.value))

  function changeReputation(delta: number) {
    if (!campaignStore.currentCampaign?.party) return
    const newVal = campaignStore.currentCampaign.party.reputation + delta
    campaignStore.currentCampaign.party.reputation = Math.max(-20, Math.min(20, newVal))
    campaignStore.autoSave()
  }

  function addDonation() {
    if (!campaignStore.currentCampaign?.party) return
    campaignStore.currentCampaign.party.donations += 10
    campaignStore.autoSave()
  }

  function addProsperity(amount: number) {
    if (!campaignStore.currentCampaign) return
    campaignStore.currentCampaign.prosperityIndex = Math.max(
      0,
      Math.min(64, campaignStore.currentCampaign.prosperityIndex + amount)
    )
    campaignStore.autoSave()
  }

  function setPartyName(name: string) {
    if (!campaignStore.currentCampaign?.party) return
    campaignStore.currentCampaign.party.name = name
    campaignStore.autoSave()
  }

  function setNotes(notes: string) {
    if (!campaignStore.currentCampaign?.party) return
    campaignStore.currentCampaign.party.notes = notes
    campaignStore.autoSave()
  }

  return {
    party,
    reputation,
    donations,
    prosperityIndex,
    prosperityLevel,
    shopPriceModifier,
    changeReputation,
    addDonation,
    addProsperity,
    setPartyName,
    setNotes,
  }
})
