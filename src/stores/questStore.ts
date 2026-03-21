import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useScenarioStore } from './scenarioStore'
import { ScenarioStatus } from '@/models/types'

interface QuestDefinition {
  id: number
  name: string
  checks: string[]
}

export interface QuestProgress {
  id: number
  name: string
  checks: { expression: string; completed: boolean }[]
  completedCount: number
  totalChecks: number
  isCompleted: boolean
  progressPercent: number
}

export const useQuestStore = defineStore('quest', () => {
  const scenarioStore = useScenarioStore()
  const questDefinitions = ref<QuestDefinition[]>([])
  const isDataLoaded = ref(false)

  async function loadQuestData() {
    if (isDataLoaded.value) return
    const data = await import('@/data/quests.json')
    questDefinitions.value = data.default as QuestDefinition[]
    isDataLoaded.value = true
  }

  /**
   * Evaluate a quest check expression against current scenario states.
   * Syntax: "1==c" (scenario 1 completed), "2!=c" (not completed),
   * "13'==15" (scenario 13 choice is 15), &&, ||, parentheses.
   */
  function evaluateCheck(expression: string): boolean {
    if (!expression || expression.trim() === '') return true

    const completedIds = new Set<string>()
    const scenarioStates = scenarioStore.scenarioStates

    for (const s of scenarioStore.scenarioDefinitions) {
      if (scenarioStore.getScenarioStatus(s.id) === ScenarioStatus.COMPLETED) {
        completedIds.add(s.id)
      }
    }

    // Tokenize: replace scenario expressions with true/false
    let expr = expression.trim()

    // Handle choice checks: 13'==15 → check if scenario 13 choice is 15
    expr = expr.replace(/(\d+)'==(\d+)/g, (_match, scenId, choiceId) => {
      const state = scenarioStates[scenId]
      return String(state?.choice === Number(choiceId))
    })

    // Handle completion checks: N==c → completed, N!=c → not completed
    expr = expr.replace(/(\d+)==c/g, (_match, id) => {
      return String(completedIds.has(id))
    })
    expr = expr.replace(/(\d+)!=c/g, (_match, id) => {
      return String(!completedIds.has(id))
    })

    // Now expr is a boolean expression with true/false, &&, ||, ()
    // Safe eval using Function (only contains true/false/&&/||/())
    try {
      // Validate: only allow safe tokens
      const sanitized = expr.replace(/true|false|&&|\|\||\(|\)|\s/g, '')
      if (sanitized.length > 0) return false
      return new Function(`return (${expr})`)() as boolean
    } catch {
      return false
    }
  }

  const questProgress = computed<QuestProgress[]>(() => {
    return questDefinitions.value.map((quest) => {
      // Filter out empty checks (first check is often empty string = "quest started")
      const meaningfulChecks = quest.checks.filter((c) => c.trim() !== '')
      const checks = meaningfulChecks.map((expression) => ({
        expression,
        completed: evaluateCheck(expression),
      }))
      const completedCount = checks.filter((c) => c.completed).length
      const totalChecks = checks.length
      return {
        id: quest.id,
        name: quest.name,
        checks,
        completedCount,
        totalChecks,
        isCompleted: totalChecks > 0 && completedCount === totalChecks,
        progressPercent: totalChecks > 0 ? Math.round((completedCount / totalChecks) * 100) : 0,
      }
    })
  })

  const activeQuests = computed(() =>
    questProgress.value.filter((q) => q.completedCount > 0 && !q.isCompleted)
  )

  const completedQuests = computed(() =>
    questProgress.value.filter((q) => q.isCompleted)
  )

  const notStartedQuests = computed(() =>
    questProgress.value.filter((q) => q.completedCount === 0)
  )

  return {
    questDefinitions,
    isDataLoaded,
    loadQuestData,
    questProgress,
    activeQuests,
    completedQuests,
    notStartedQuests,
    evaluateCheck,
  }
})
