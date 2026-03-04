import type { ItemSlot } from './types'

export interface ItemDefinition {
  id: number
  name: string
  cost: number
  count: number
  slot: ItemSlot
  source: string
  description: string
  spent?: boolean
  consumed?: boolean
  faq?: string
}
