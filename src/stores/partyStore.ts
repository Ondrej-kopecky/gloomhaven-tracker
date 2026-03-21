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

  // ── Event management ──

  const cityEventsAvailable = computed(() => party.value?.cityEventsAvailable ?? [])
  const cityEventsRemoved = computed(() => party.value?.cityEventsRemoved ?? [])
  const roadEventsAvailable = computed(() => party.value?.roadEventsAvailable ?? [])
  const roadEventsRemoved = computed(() => party.value?.roadEventsRemoved ?? [])

  function removeEvent(type: 'city' | 'road', eventId: number) {
    if (!campaignStore.currentCampaign?.party) return
    const p = campaignStore.currentCampaign.party
    if (type === 'city') {
      const idx = p.cityEventsAvailable.indexOf(eventId)
      if (idx !== -1) {
        p.cityEventsAvailable.splice(idx, 1)
        p.cityEventsRemoved.push(eventId)
        p.cityEventsRemoved.sort((a, b) => a - b)
      }
    } else {
      const idx = p.roadEventsAvailable.indexOf(eventId)
      if (idx !== -1) {
        p.roadEventsAvailable.splice(idx, 1)
        p.roadEventsRemoved.push(eventId)
        p.roadEventsRemoved.sort((a, b) => a - b)
      }
    }
    campaignStore.autoSave()
  }

  function addEvent(type: 'city' | 'road', eventId: number) {
    if (!campaignStore.currentCampaign?.party) return
    const p = campaignStore.currentCampaign.party
    if (type === 'city') {
      if (!p.cityEventsAvailable.includes(eventId)) {
        p.cityEventsAvailable.push(eventId)
        p.cityEventsAvailable.sort((a, b) => a - b)
      }
    } else {
      if (!p.roadEventsAvailable.includes(eventId)) {
        p.roadEventsAvailable.push(eventId)
        p.roadEventsAvailable.sort((a, b) => a - b)
      }
    }
    campaignStore.autoSave()
  }

  function returnEvent(type: 'city' | 'road', eventId: number) {
    if (!campaignStore.currentCampaign?.party) return
    const p = campaignStore.currentCampaign.party
    if (type === 'city') {
      const idx = p.cityEventsRemoved.indexOf(eventId)
      if (idx !== -1) {
        p.cityEventsRemoved.splice(idx, 1)
        if (!p.cityEventsAvailable.includes(eventId)) {
          p.cityEventsAvailable.push(eventId)
          p.cityEventsAvailable.sort((a, b) => a - b)
        }
      }
    } else {
      const idx = p.roadEventsRemoved.indexOf(eventId)
      if (idx !== -1) {
        p.roadEventsRemoved.splice(idx, 1)
        if (!p.roadEventsAvailable.includes(eventId)) {
          p.roadEventsAvailable.push(eventId)
          p.roadEventsAvailable.sort((a, b) => a - b)
        }
      }
    }
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
    cityEventsAvailable,
    cityEventsRemoved,
    roadEventsAvailable,
    roadEventsRemoved,
    removeEvent,
    addEvent,
    returnEvent,
  }
})
