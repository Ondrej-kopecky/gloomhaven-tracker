import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ScenarioStatus } from '@/models/types'

export type StatusFilter = ScenarioStatus | 'all'
export type StoryFilter = 'all' | 'main' | 'side'

export const useFlowchartStore = defineStore('flowchart', () => {
  const selectedNodeId = ref<string | null>(null)
  const filterStatus = ref<StatusFilter>('all')
  const storyFilter = ref<StoryFilter>('main')
  function selectNode(id: string | null) {
    selectedNodeId.value = id
  }

  function setFilter(status: StatusFilter) {
    filterStatus.value = status
  }

  function setStoryFilter(filter: StoryFilter) {
    storyFilter.value = filter
  }

  return {
    selectedNodeId,
    filterStatus,
    storyFilter,
    selectNode,
    setFilter,
    setStoryFilter,
  }
})
