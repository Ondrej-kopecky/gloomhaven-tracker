import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CharacterDefinition, CharacterState } from '@/models/Character'
import type { CharacterClass, ItemSlot } from '@/models/types'
import type { ItemDefinition } from '@/models/Item'
import { uuid } from '@/utils/uuid'
import charactersData from '@/data/characters.json'
import itemsData from '@/data/items.json'
import { useCampaignStore } from './campaignStore'
import { useToastStore } from './toastStore'
import { getLevelFromXp } from '@/utils/prosperityTable'
import personalQuestsData from '@/data/personalQuests.json'

export const useCharacterStore = defineStore('character', () => {
  const campaignStore = useCampaignStore()
  const toastStore = useToastStore()

  const definitions = ref<CharacterDefinition[]>(charactersData as CharacterDefinition[])

  const characters = computed(
    () => campaignStore.currentCampaign?.characters ?? []
  )
  const archivedCharacters = computed(
    () => campaignStore.currentCampaign?.archivedCharacters ?? []
  )
  const activeCharacters = computed(
    () => characters.value.filter((c) => !c.isRetired)
  )
  const averageLevel = computed(() => {
    const active = activeCharacters.value
    if (active.length === 0) return 1
    const sum = active.reduce((acc, c) => acc + c.level, 0)
    return Math.round(sum / active.length)
  })

  function getDefinition(classId: CharacterClass): CharacterDefinition | undefined {
    return definitions.value.find((d) => d.classId === classId)
  }

  function createCharacter(classId: CharacterClass, playerName: string, owner?: string) {
    if (!campaignStore.currentCampaign) return

    const def = getDefinition(classId)
    if (!def) return

    const character: CharacterState = {
      uuid: uuid(),
      classId,
      playerName,
      level: 1,
      xp: 0,
      gold: 0,
      notes: '',
      perksSelected: {},
      abilities: [...def.startingAbilities],
      items: [],
      checks: 0,
      isRetired: false,
      createdAt: new Date().toISOString(),
      owner,
    }

    campaignStore.currentCampaign.characters.push(character)
    campaignStore.autoSave()
  }

  function getCharacter(uuid: string): CharacterState | undefined {
    return campaignStore.currentCampaign?.characters.find((c) => c.uuid === uuid)
  }

  function updateXp(uuid: string, amount: number) {
    const char = getCharacter(uuid)
    if (!char) return
    char.xp = Math.max(0, char.xp + amount)
    char.level = getLevelFromXp(char.xp)
    campaignStore.autoSave()
  }

  function updateGold(uuid: string, amount: number) {
    const char = getCharacter(uuid)
    if (!char) return
    char.gold = Math.max(0, char.gold + amount)
    campaignStore.autoSave()
  }

  function setXp(uuid: string, value: number) {
    const char = getCharacter(uuid)
    if (!char) return
    char.xp = Math.max(0, value)
    char.level = getLevelFromXp(char.xp)
    campaignStore.autoSave()
  }

  function setGold(uuid: string, value: number) {
    const char = getCharacter(uuid)
    if (!char) return
    char.gold = Math.max(0, value)
    campaignStore.autoSave()
  }

  function setChecks(uuid: string, value: number) {
    const char = getCharacter(uuid)
    if (!char) return
    char.checks = Math.max(0, value)
    campaignStore.autoSave()
  }

  function togglePerk(uuid: string, perkId: string) {
    const char = getCharacter(uuid)
    if (!char) return
    const current = char.perksSelected[perkId] ?? 0
    const def = getDefinition(char.classId)
    const perkDef = def?.perks.find((p) => p.id === perkId)
    const max = perkDef?.maxCount ?? 1

    if (current < max) {
      char.perksSelected[perkId] = current + 1
    } else {
      char.perksSelected[perkId] = 0
    }
    campaignStore.autoSave()
  }

  const REF_CLASS_MAP: Record<string, string> = {
    BE: 'berserker', BR: 'brute', BT: 'beast_tyrant', CH: 'cragheart',
    DS: 'doomstalker', EL: 'elementalist', MT: 'mindthief', NS: 'nightshroud',
    PH: 'plagueherald', QM: 'quartermaster', SB: 'sawbones', SC: 'scoundrel',
    SK: 'sunkeeper', SS: 'soothsinger', SU: 'summoner', SW: 'spellweaver',
    TI: 'tinkerer', DR: 'diviner',
  }

  function retireCharacter(uuid: string) {
    if (!campaignStore.currentCampaign) return
    const idx = campaignStore.currentCampaign.characters.findIndex((c) => c.uuid === uuid)
    if (idx < 0) return

    const char = campaignStore.currentCampaign.characters[idx]!
    char.isRetired = true
    char.retiredAt = new Date().toISOString()

    // Unlock class from personal quest
    if (char.personalQuestId) {
      const pq = (personalQuestsData as { id: number; character_unlock?: string }[])
        .find((q) => q.id === char.personalQuestId)
      if (pq?.character_unlock) {
        const classId = REF_CLASS_MAP[pq.character_unlock]
        if (classId) {
          campaignStore.unlockClass(classId)
          toastStore.show(`Třída odemčena: ${definitions.value.find(d => d.classId === classId)?.name ?? classId}`)
        }
      }
    }

    campaignStore.currentCampaign.archivedCharacters.push(char)
    campaignStore.currentCampaign.characters.splice(idx, 1)
    campaignStore.autoSave()
  }

  function updateChecks(uuid: string, amount: number) {
    const char = getCharacter(uuid)
    if (!char) return
    char.checks = Math.max(0, char.checks + amount)
    campaignStore.autoSave()
  }

  function setNotes(uuid: string, notes: string) {
    const char = getCharacter(uuid)
    if (!char) return
    char.notes = notes
    campaignStore.autoSave()
  }

  // --- Ability management ---

  function selectAbility(uuid: string, abilityId: string) {
    const char = getCharacter(uuid)
    if (!char) return
    if (!char.abilities.includes(abilityId)) {
      char.abilities.push(abilityId)
      campaignStore.autoSave()
    }
  }

  function deselectAbility(uuid: string, abilityId: string) {
    const char = getCharacter(uuid)
    if (!char) return
    char.abilities = char.abilities.filter((a) => a !== abilityId)
    campaignStore.autoSave()
  }

  // --- Item management ---

  const allItemDefs = itemsData as ItemDefinition[]

  function getItemDef(itemId: string): ItemDefinition | undefined {
    return allItemDefs.find((d) => d.id === Number(itemId))
  }

  function getItemOwners(itemId: string): CharacterState[] {
    return activeCharacters.value.filter((c) => c.items.includes(itemId))
  }

  function getAvailableCount(itemId: string): number {
    const def = getItemDef(itemId)
    if (!def) return 0
    const owned = activeCharacters.value.filter((c) => c.items.includes(itemId)).length
    return def.count - owned
  }

  function getSlotCounts(uuid: string): Record<ItemSlot, { used: number; max: number }> {
    const char = getCharacter(uuid)
    if (!char) {
      return {
        head: { used: 0, max: 1 },
        body: { used: 0, max: 1 },
        legs: { used: 0, max: 1 },
        one_hand: { used: 0, max: 2 },
        two_hands: { used: 0, max: 1 },
        small_item: { used: 0, max: 1 },
      }
    }
    const counts: Partial<Record<ItemSlot, number>> = {}
    for (const id of char.items) {
      const def = getItemDef(id)
      if (def) counts[def.slot] = (counts[def.slot] ?? 0) + 1
    }
    const smallMax = Math.ceil(char.level / 2)
    const result: Record<ItemSlot, { used: number; max: number }> = {
      head: { used: counts.head ?? 0, max: 1 },
      body: { used: counts.body ?? 0, max: 1 },
      legs: { used: counts.legs ?? 0, max: 1 },
      one_hand: { used: counts.one_hand ?? 0, max: 2 },
      two_hands: { used: counts.two_hands ?? 0, max: 1 },
      small_item: { used: counts.small_item ?? 0, max: smallMax },
    }
    // Hand exclusivity: two_hands and one_hand are mutually exclusive
    if ((counts.two_hands ?? 0) > 0) {
      result.one_hand.max = 0
    }
    if ((counts.one_hand ?? 0) > 0) {
      result.two_hands.max = 0
    }
    return result
  }

  function canEquipItem(uuid: string, itemId: string): { ok: boolean; warning?: string; reason?: string } {
    const char = getCharacter(uuid)
    if (!char) return { ok: false, reason: 'Postava nenalezena' }
    const def = getItemDef(itemId)
    if (!def) return { ok: false, reason: 'Neznámý předmět' }
    if (char.items.includes(itemId)) return { ok: false, reason: 'Již vlastníte tento předmět' }
    if (getAvailableCount(itemId) <= 0) return { ok: false, reason: 'Žádný volný kus' }

    // Slot warnings (not blocking — you can own more than slot limit)
    const slots = getSlotCounts(uuid)
    const slotNames: Record<string, string> = {
      head: 'Hlava', body: 'Tělo', legs: 'Nohy',
      one_hand: 'Jedna ruka', two_hands: 'Dvě ruce', small_item: 'Drobný předmět',
    }
    const slotInfo = slots[def.slot]
    if (slotInfo && slotInfo.used >= slotInfo.max) {
      return { ok: true, warning: `Slot "${slotNames[def.slot] ?? def.slot}" je plný — do scénáře si vezmete jen ${slotInfo.max}` }
    }
    return { ok: true }
  }

  function buyItem(uuid: string, itemId: string, shopPriceModifier: number): boolean {
    const char = getCharacter(uuid)
    if (!char) return false
    const def = getItemDef(itemId)
    if (!def) return false

    const check = canEquipItem(uuid, itemId)
    if (!check.ok) return false

    const price = Math.max(0, def.cost + shopPriceModifier)
    if (char.gold < price) return false

    char.gold -= price
    char.items.push(itemId)
    campaignStore.autoSave()
    toastStore.show(`${def.name} zakoupen za ${price} zl.`)
    return true
  }

  function addItemFree(uuid: string, itemId: string): boolean {
    const char = getCharacter(uuid)
    if (!char) return false
    const check = canEquipItem(uuid, itemId)
    if (!check.ok) return false
    char.items.push(itemId)
    campaignStore.autoSave()
    return true
  }

  function sellItem(uuid: string, itemId: string): boolean {
    const char = getCharacter(uuid)
    if (!char) return false
    const def = getItemDef(itemId)
    if (!def) return false

    const idx = char.items.indexOf(itemId)
    if (idx < 0) return false

    char.items.splice(idx, 1)
    char.gold += Math.floor(def.cost / 2)
    campaignStore.autoSave()
    return true
  }

  return {
    definitions,
    characters,
    archivedCharacters,
    activeCharacters,
    averageLevel,
    getDefinition,
    createCharacter,
    getCharacter,
    updateXp,
    updateGold,
    setXp,
    setGold,
    setChecks,
    togglePerk,
    retireCharacter,
    updateChecks,
    setNotes,
    getItemDef,
    getItemOwners,
    getAvailableCount,
    getSlotCounts,
    canEquipItem,
    buyItem,
    addItemFree,
    sellItem,
    selectAbility,
    deselectAbility,
  }
})
