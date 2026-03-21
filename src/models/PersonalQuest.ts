export interface PersonalQuestProgressItem {
  type: 'checkbox' | 'number'
  name: string
  scenario_unlock?: number
  value: number[] | number
  target?: number
}

export interface PersonalQuestDefinition {
  id: number
  name: string
  character_unlock?: string
  unlock?: string
  progress: PersonalQuestProgressItem[]
}

export interface PersonalQuestState {
  questId: number
  characterUuid: string
  progress: PersonalQuestProgressValue[]
  isCompleted: boolean
}

export interface PersonalQuestProgressValue {
  // For checkbox: array of booleans
  // For number: current value
  checkboxValues?: boolean[]
  numberValue?: number
}
