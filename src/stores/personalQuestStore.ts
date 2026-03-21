import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  PersonalQuestDefinition,
  PersonalQuestState,
  PersonalQuestProgressValue,
} from '@/models/PersonalQuest'
import { useCampaignStore } from './campaignStore'

export const usePersonalQuestStore = defineStore('personalQuest', () => {
  const campaignStore = useCampaignStore()
  const definitions = ref<PersonalQuestDefinition[]>([])
  const isDataLoaded = ref(false)

  async function loadData() {
    if (isDataLoaded.value) return
    const data = await import('@/data/personalQuests.json')
    definitions.value = data.default as PersonalQuestDefinition[]
    isDataLoaded.value = true
  }

  const questStates = computed(
    () => campaignStore.currentCampaign?.personalQuests ?? {}
  )

  function getDefinition(id: number): PersonalQuestDefinition | undefined {
    return definitions.value.find((d) => d.id === id)
  }

  function getQuestForCharacter(charUuid: string): PersonalQuestState | undefined {
    return questStates.value[charUuid]
  }

  function assignQuest(charUuid: string, questId: number) {
    if (!campaignStore.currentCampaign) return
    if (!campaignStore.currentCampaign.personalQuests) {
      campaignStore.currentCampaign.personalQuests = {}
    }

    const def = getDefinition(questId)
    if (!def) return

    // Initialize progress values based on definition
    const progress: PersonalQuestProgressValue[] = def.progress.map((p) => {
      if (p.type === 'checkbox') {
        return { checkboxValues: (p.value as number[]).map(() => false) }
      }
      return { numberValue: 0 }
    })

    campaignStore.currentCampaign.personalQuests[charUuid] = {
      questId,
      characterUuid: charUuid,
      progress,
      isCompleted: false,
    }

    // Also set on the character model
    const char = campaignStore.currentCampaign.characters.find(
      (c) => c.uuid === charUuid
    )
    if (char) {
      char.personalQuestId = questId
    }

    campaignStore.autoSave()
  }

  function removeQuest(charUuid: string) {
    if (!campaignStore.currentCampaign) return
    delete campaignStore.currentCampaign.personalQuests[charUuid]

    const char = campaignStore.currentCampaign.characters.find(
      (c) => c.uuid === charUuid
    )
    if (char) {
      delete char.personalQuestId
    }

    campaignStore.autoSave()
  }

  function toggleCheckbox(charUuid: string, progressIdx: number, checkIdx: number) {
    if (!campaignStore.currentCampaign) return
    const state = campaignStore.currentCampaign.personalQuests[charUuid]
    if (!state) return

    const pv = state.progress[progressIdx]
    if (!pv?.checkboxValues) return

    pv.checkboxValues[checkIdx] = !pv.checkboxValues[checkIdx]
    state.isCompleted = checkIsCompleted(charUuid)
    campaignStore.autoSave()
  }

  function setNumberValue(charUuid: string, progressIdx: number, value: number) {
    if (!campaignStore.currentCampaign) return
    const state = campaignStore.currentCampaign.personalQuests[charUuid]
    if (!state) return

    const pv = state.progress[progressIdx]
    if (pv?.numberValue === undefined) return

    pv.numberValue = Math.max(0, value)
    state.isCompleted = checkIsCompleted(charUuid)
    campaignStore.autoSave()
  }

  function checkIsCompleted(charUuid: string): boolean {
    const state = questStates.value[charUuid]
    if (!state) return false
    const def = getDefinition(state.questId)
    if (!def) return false

    return def.progress.every((p, idx) => {
      const pv = state.progress[idx]
      if (p.type === 'checkbox') {
        return pv?.checkboxValues?.every((v) => v) ?? false
      }
      if (p.type === 'number') {
        return (pv?.numberValue ?? 0) >= (p.target ?? 0)
      }
      return false
    })
  }

  // Character unlock code → class name mapping
  const unlockCodeToClass: Record<string, string> = {
    PH: 'Trýznitelský moronoš',
    QM: 'Valrathský zbrojmistr',
    SB: 'Lidský kostiřez',
    SK: 'Valrathská světlonoška',
    BE: 'Inoxská fúrie',
    BT: 'Krysácký zvěropán',
    SU: 'Aestherská vyvolávačka',
    SS: 'Quatrylská čaropěvkyně',
    DS: 'Orchidský zkázolov',
    NS: 'Aestherský stínochodec',
    EL: 'Savvasská vládkyně živlů',
  }

  function getUnlockClassName(questId: number): string | undefined {
    const def = getDefinition(questId)
    if (!def?.character_unlock) return undefined
    return unlockCodeToClass[def.character_unlock]
  }

  return {
    definitions,
    isDataLoaded,
    questStates,
    loadData,
    getDefinition,
    getQuestForCharacter,
    assignQuest,
    removeQuest,
    toggleCheckbox,
    setNumberValue,
    checkIsCompleted,
    getUnlockClassName,
  }
})
