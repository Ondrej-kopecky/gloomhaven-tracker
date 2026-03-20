import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ScenarioStatus } from '@/models/types'
import type { ScenarioData, ScenarioState, ScenarioCondition } from '@/models/Scenario'
import { useCampaignStore } from './campaignStore'
import { useAchievementStore } from './achievementStore'

export const useScenarioStore = defineStore('scenario', () => {
  const campaignStore = useCampaignStore()
  const achievementStore = useAchievementStore()

  const scenarioDefinitions = ref<ScenarioData[]>([])
  const isDataLoaded = ref(false)

  async function loadScenarioData() {
    if (isDataLoaded.value) return
    const data = await import('@/data/scenarios.json')
    scenarioDefinitions.value = data.default as ScenarioData[]
    isDataLoaded.value = true
  }

  const scenarioStates = computed(
    () => campaignStore.currentCampaign?.scenarios ?? {}
  )

  // Helper: build a map for quick lookup by ID
  const scenarioMap = computed(() => {
    const map = new Map<string, ScenarioData>()
    for (const s of scenarioDefinitions.value) {
      map.set(s.id, s)
    }
    return map
  })

  function getState(id: string): ScenarioState {
    return (
      scenarioStates.value[id] ?? {
        id,
        status: ScenarioStatus.LOCKED,
        notes: '',
        treasuresLooted: [],
      }
    )
  }

  function getDefinition(id: string): ScenarioData | undefined {
    return scenarioMap.value.get(id)
  }

  // ── Status computation (multi-pass like gloomhaven-storyline validator) ──

  const computedStatuses = computed(() => {
    const statuses: Record<string, ScenarioStatus> = {}
    const campaign = campaignStore.currentCampaign
    if (!campaign) return statuses

    // Pass 1: Set completed, attempted, and manually unlocked from saved state
    for (const scenario of scenarioDefinitions.value) {
      const state = campaign.scenarios[scenario.id]
      if (state?.status === ScenarioStatus.COMPLETED) {
        statuses[scenario.id] = ScenarioStatus.COMPLETED
      } else if (state?.status === ScenarioStatus.ATTEMPTED) {
        statuses[scenario.id] = ScenarioStatus.ATTEMPTED
      } else if (state?.status === ScenarioStatus.AVAILABLE) {
        statuses[scenario.id] = ScenarioStatus.AVAILABLE
      }
    }

    // Pass 2: Determine visibility (hidden → available)
    for (const scenario of scenarioDefinitions.value) {
      if (statuses[scenario.id]) continue // already completed or attempted

      // Root scenarios are always available
      if (scenario.isRoot) {
        statuses[scenario.id] = ScenarioStatus.AVAILABLE
        continue
      }

      // Random side scenarios (no linkedFrom) stay locked until explicitly unlocked
      // They are unlocked via city/road events or other game mechanics

      // Check if any parent (linkedFrom) is completed
      const isUnlocked = scenario.linkedFrom.some((parentId) => {
        const parentDef = getDefinition(String(parentId))
        const parentStatus = statuses[String(parentId)]

        // If parent has choices, only unlock if this scenario was chosen
        if (parentDef?.choices?.length) {
          const parentState = campaign.scenarios[String(parentId)]
          return parentStatus === ScenarioStatus.COMPLETED &&
            parentState?.choice === Number(scenario.id)
        }

        return parentStatus === ScenarioStatus.COMPLETED
      })

      // Check treasure-based unlocking
      const isTreasureUnlocked = scenario.treasuresFrom?.some((srcId) => {
        const srcDef = getDefinition(String(srcId))
        const srcState = campaign.scenarios[String(srcId)]
        if (!srcDef?.treasuresTo || !srcState) return false
        // Check if any treasure that links to this scenario was looted
        for (const [treasureId, targetIds] of Object.entries(srcDef.treasuresTo)) {
          if (targetIds.includes(Number(scenario.id)) &&
              srcState.treasuresLooted.includes(String(treasureId))) {
            return true
          }
        }
        return false
      }) ?? false

      if (isUnlocked || isTreasureUnlocked) {
        statuses[scenario.id] = ScenarioStatus.AVAILABLE
      }
    }

    // Pass 3: Check blocks_on conditions (only block scenarios that would be AVAILABLE)
    for (const scenario of scenarioDefinitions.value) {
      if (statuses[scenario.id] !== ScenarioStatus.AVAILABLE) continue
      if (!scenario.blocksOn?.length) continue

      const isBlocked = checkAnyConditionMet(scenario.blocksOn)
      if (isBlocked) {
        statuses[scenario.id] = ScenarioStatus.BLOCKED
      }
    }

    // Pass 4: Check required_by conditions
    for (const scenario of scenarioDefinitions.value) {
      if (statuses[scenario.id] !== ScenarioStatus.AVAILABLE) continue
      if (!scenario.requiredBy?.length) continue

      const requirementsMet = checkAnyConditionMet(scenario.requiredBy)
      if (!requirementsMet) {
        statuses[scenario.id] = ScenarioStatus.REQUIRED
      }
    }

    // Pass 5: Check coupled scenarios (if one is completed, block the other)
    for (const scenario of scenarioDefinitions.value) {
      if (!scenario.coupled) continue
      if (statuses[scenario.id] !== ScenarioStatus.AVAILABLE) continue
      if (statuses[String(scenario.coupled)] === ScenarioStatus.COMPLETED) {
        statuses[scenario.id] = ScenarioStatus.BLOCKED
      }
    }

    // Fill remaining as locked
    for (const scenario of scenarioDefinitions.value) {
      if (!statuses[scenario.id]) {
        statuses[scenario.id] = ScenarioStatus.LOCKED
      }
    }

    return statuses
  })

  /**
   * Check if ANY condition set is fully met (OR between sets, AND within set).
   * Used for both blocks_on and required_by.
   */
  function checkAnyConditionMet(conditions: ScenarioCondition[]): boolean {
    return conditions.some((condition) => {
      // All "complete" items must be achieved/completed
      const completeOk = (condition.complete ?? []).every((id) => isConditionItemComplete(id))
      // All "incomplete" items must NOT be achieved/completed
      const incompleteOk = (condition.incomplete ?? []).every((id) => !isConditionItemComplete(id))
      return completeOk && incompleteOk
    })
  }

  /**
   * Check if a condition item (achievement ID or scenario ID) is "complete".
   */
  function isConditionItemComplete(id: string): boolean {
    // If it's a number, it's a scenario ID
    if (/^\d+$/.test(id)) {
      const state = scenarioStates.value[id]
      return state?.status === ScenarioStatus.COMPLETED
    }
    // Otherwise it's an achievement ID - check both global and party
    return achievementStore.isGlobalAchieved(id) || achievementStore.isPartyAchieved(id)
  }

  function getScenarioStatus(id: string): ScenarioStatus {
    return computedStatuses.value[id] ?? ScenarioStatus.LOCKED
  }

  // ── Computed lists ──

  const allScenarios = computed(() =>
    scenarioDefinitions.value.map((def) => ({
      ...def,
      state: getState(def.id),
      computedStatus: computedStatuses.value[def.id] ?? ScenarioStatus.LOCKED,
    }))
  )

  const availableScenarios = computed(() =>
    allScenarios.value.filter((s) => s.computedStatus === ScenarioStatus.AVAILABLE)
  )

  const completedScenarios = computed(() =>
    allScenarios.value.filter((s) => s.computedStatus === ScenarioStatus.COMPLETED)
  )

  // ── Actions ──

  function completeScenario(id: string) {
    if (!campaignStore.currentCampaign) return

    const def = getDefinition(id)
    if (!def) return

    const state: ScenarioState = {
      id,
      status: ScenarioStatus.COMPLETED,
      notes: campaignStore.currentCampaign.scenarios[id]?.notes ?? '',
      treasuresLooted:
        campaignStore.currentCampaign.scenarios[id]?.treasuresLooted ?? [],
      completedAt: new Date().toISOString(),
    }

    campaignStore.currentCampaign.scenarios[id] = state

    // Award achievements from the new achievementsAwarded field
    if (def.achievementsAwarded) {
      for (const achId of def.achievementsAwarded) {
        if (achievementStore.isGlobalDefined(achId)) {
          achievementStore.awardGlobal(achId)
        } else {
          achievementStore.awardParty(achId)
        }
      }
    }

    // Remove achievements from achievementsLost
    if (def.achievementsLost) {
      for (const achId of def.achievementsLost) {
        achievementStore.removeAchievement(achId)
      }
    }

    // Legacy: also check rewards.achievements / rewards.partyAchievements
    if (def.rewards.achievements) {
      for (const achId of def.rewards.achievements) {
        achievementStore.awardGlobal(achId)
      }
    }
    if (def.rewards.partyAchievements) {
      for (const achId of def.rewards.partyAchievements) {
        achievementStore.awardParty(achId)
      }
    }

    campaignStore.autoSave()
  }

  function setChoice(scenarioId: string, chosenScenarioId: number) {
    if (!campaignStore.currentCampaign) return
    const state = campaignStore.currentCampaign.scenarios[scenarioId]
    if (state) {
      state.choice = chosenScenarioId
      campaignStore.autoSave()
    }
  }

  function markAttempted(id: string) {
    if (!campaignStore.currentCampaign) return
    const existing = campaignStore.currentCampaign.scenarios[id]
    campaignStore.currentCampaign.scenarios[id] = {
      id,
      status: ScenarioStatus.ATTEMPTED,
      notes: existing?.notes ?? '',
      treasuresLooted: existing?.treasuresLooted ?? [],
    }
    campaignStore.autoSave()
  }

  function unlockScenario(id: string) {
    if (!campaignStore.currentCampaign) return
    const existing = campaignStore.currentCampaign.scenarios[id]
    campaignStore.currentCampaign.scenarios[id] = {
      id,
      status: ScenarioStatus.AVAILABLE,
      notes: existing?.notes ?? '',
      treasuresLooted: existing?.treasuresLooted ?? [],
    }
    campaignStore.autoSave()
  }

  function resetScenario(id: string) {
    if (!campaignStore.currentCampaign) return
    delete campaignStore.currentCampaign.scenarios[id]
    campaignStore.autoSave()
  }

  function lootTreasure(scenarioId: string, treasureId: string) {
    if (!campaignStore.currentCampaign) return
    const state = campaignStore.currentCampaign.scenarios[scenarioId]
    if (!state) return
    if (!state.treasuresLooted.includes(treasureId)) {
      state.treasuresLooted.push(treasureId)
      campaignStore.autoSave()
    }
  }

  function setNotes(id: string, notes: string) {
    if (!campaignStore.currentCampaign) return
    if (!campaignStore.currentCampaign.scenarios[id]) {
      campaignStore.currentCampaign.scenarios[id] = {
        id,
        status: ScenarioStatus.LOCKED,
        notes,
        treasuresLooted: [],
      }
    } else {
      campaignStore.currentCampaign.scenarios[id].notes = notes
    }
    campaignStore.autoSave()
  }

  function getLinksFrom(id: string): ScenarioData[] {
    const def = getDefinition(id)
    if (!def) return []
    return def.linksTo
      .map((targetId) => getDefinition(String(targetId)))
      .filter(Boolean) as ScenarioData[]
  }

  function getLinksTo(id: string): ScenarioData[] {
    const def = getDefinition(id)
    if (!def) return []
    return def.linkedFrom
      .map((sourceId) => getDefinition(String(sourceId)))
      .filter(Boolean) as ScenarioData[]
  }

  return {
    scenarioDefinitions,
    isDataLoaded,
    scenarioStates,
    scenarioMap,
    computedStatuses,
    allScenarios,
    availableScenarios,
    completedScenarios,
    loadScenarioData,
    getState,
    getDefinition,
    getScenarioStatus,
    completeScenario,
    setChoice,
    markAttempted,
    unlockScenario,
    resetScenario,
    lootTreasure,
    setNotes,
    getLinksFrom,
    getLinksTo,
  }
})
