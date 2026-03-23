import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AchievementDefinition } from '@/models/Achievement'
import achievementsData from '@/data/achievements.json'
import { useCampaignStore } from './campaignStore'
import { useToastStore } from './toastStore'

export const useAchievementStore = defineStore('achievement', () => {
  const campaignStore = useCampaignStore()

  const globalDefinitions = ref<AchievementDefinition[]>(
    achievementsData.global as AchievementDefinition[]
  )
  const partyDefinitions = ref<AchievementDefinition[]>(
    achievementsData.party as AchievementDefinition[]
  )

  const globalAchievements = computed(
    () => campaignStore.currentCampaign?.globalAchievements ?? {}
  )
  const partyAchievements = computed(
    () => campaignStore.currentCampaign?.partyAchievements ?? {}
  )

  function isGlobalAchieved(id: string): boolean {
    return globalAchievements.value[id] === true
  }

  function isPartyAchieved(id: string): boolean {
    return partyAchievements.value[id] === true
  }

  function toggleGlobal(id: string) {
    if (!campaignStore.currentCampaign) return
    const ga = campaignStore.currentCampaign.globalAchievements
    const def = globalDefinitions.value.find((a) => a.id === id)

    // Upgradeable achievements: cycle through levels
    if (def?.upgrades?.length) {
      if (!ga[id]) {
        // Not achieved → set level 1
        ga[id] = true
      } else {
        // Find current upgrade level and advance
        let advanced = false
        for (const uid of def.upgrades) {
          if (!ga[uid]) {
            ga[uid] = true
            advanced = true
            break
          }
        }
        if (!advanced) {
          // All upgrades maxed → reset all
          ga[id] = false
          for (const uid of def.upgrades) ga[uid] = false
        }
      }
      campaignStore.autoSave()
      return
    }

    // Regular toggle
    const current = ga[id]
    ga[id] = !current

    // Group exclusivity
    if (def?.group && !current) {
      globalDefinitions.value
        .filter((a) => a.group === def.group && a.id !== id)
        .forEach((a) => {
          ga[a.id] = false
        })
    }

    campaignStore.autoSave()
  }

  function toggleParty(id: string) {
    if (!campaignStore.currentCampaign) return
    const current = campaignStore.currentCampaign.partyAchievements[id]
    campaignStore.currentCampaign.partyAchievements[id] = !current
    campaignStore.autoSave()
  }

  function awardGlobal(id: string) {
    if (!campaignStore.currentCampaign) return
    const wasAchieved = campaignStore.currentCampaign.globalAchievements[id]
    campaignStore.currentCampaign.globalAchievements[id] = true
    campaignStore.autoSave()
    if (!wasAchieved) {
      const toastStore = useToastStore()
      toastStore.show(`Úspěch: ${getName(id)}`)
    }
  }

  function awardParty(id: string) {
    if (!campaignStore.currentCampaign) return
    campaignStore.currentCampaign.partyAchievements[id] = true
    campaignStore.autoSave()
  }

  function isGlobalDefined(id: string): boolean {
    return globalDefinitions.value.some((a) => a.id === id)
  }

  function isPartyDefined(id: string): boolean {
    return partyDefinitions.value.some((a) => a.id === id)
  }

  function getName(id: string): string {
    const g = globalDefinitions.value.find((a) => a.id === id)
    if (g) return g.name
    const p = partyDefinitions.value.find((a) => a.id === id)
    if (p) return p.name
    return id
  }

  function removeAchievement(id: string) {
    if (!campaignStore.currentCampaign) return
    if (isGlobalDefined(id)) {
      campaignStore.currentCampaign.globalAchievements[id] = false
    } else {
      campaignStore.currentCampaign.partyAchievements[id] = false
    }
    campaignStore.autoSave()
  }

  return {
    globalDefinitions,
    partyDefinitions,
    globalAchievements,
    partyAchievements,
    isGlobalAchieved,
    isPartyAchieved,
    isGlobalDefined,
    isPartyDefined,
    getName,
    toggleGlobal,
    toggleParty,
    awardGlobal,
    awardParty,
    removeAchievement,
  }
})
