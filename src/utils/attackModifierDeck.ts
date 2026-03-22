/**
 * Attack Modifier Deck calculator.
 * Computes the current deck composition based on selected perks.
 */

export interface DeckCard {
  label: string
  count: number
  type: 'positive' | 'negative' | 'neutral' | 'miss' | 'crit' | 'rolling'
}

interface DeckMod {
  remove?: Record<string, number>
  add?: Record<string, number>
}

// Base deck for every character (20 cards)
const BASE_DECK: Record<string, number> = {
  '+0': 6,
  '+1': 5,
  '-1': 5,
  '+2': 1,
  '-2': 1,
  'x2': 1,
  'x0': 1,
}

// Perk → deck modification mapping
const PERK_MODS: Record<string, DeckMod> = {
  // Brute
  brute_1: { remove: { '-1': 2 } },
  brute_2: { remove: { '-1': 1 }, add: { '+1': 1 } },
  brute_3: { add: { '+1': 2 } },
  brute_4: { add: { '+3': 1 } },
  brute_5: { add: { '↻ odstrčení 1': 3 } },
  brute_6: { add: { '↻ průraznost 3': 2 } },
  brute_7: { add: { '↻ omráčení': 1 } },
  brute_8: { add: { '↻ odzbrojení': 1, '↻ zmatení': 1 } },
  brute_9: { add: { '↻ přidat cíl': 1 } },
  brute_10: { add: { '+1 obrana 1': 1 } },
  brute_11: { add: { '+1': 1 } },

  // Cragheart
  crag_1: { remove: { '+0': 4 } },
  crag_2: { remove: { '-1': 1 }, add: { '+1': 1 } },
  crag_3: { add: { '-2': 1, '+2': 2 } },
  crag_4: { add: { '+1 znehybnění': 1 } },
  crag_5: { add: { '+2 zmatení': 1 } },
  crag_6: { add: { '↻ odstrčení 2': 2 } },
  crag_7: { add: { '↻ země': 2 } },
  crag_8: { add: { '↻ vzduch': 2 } },
  crag_9: { add: { '+1': 1 } },

  // Mindthief
  mind_1: { remove: { '-1': 2 } },
  mind_2: { remove: { '+0': 4 } },
  mind_3: { remove: { '+1': 2 }, add: { '+2': 2 } },
  mind_4: { remove: { '-2': 1 }, add: { '+0': 1 } },
  mind_5: { add: { '+2 led': 1 } },
  mind_6: { add: { '↻ +1': 2 } },
  mind_7: { add: { '↻ přitažení 1': 3 } },
  mind_8: { add: { '↻ zmatení': 3 } },
  mind_9: { add: { '↻ znehybnění': 2 } },
  mind_10: { add: { '↻ omráčení': 1 } },
  mind_11: { add: { '↻ odzbrojení': 1, '↻ zmatení': 1 } },
  mind_12: {},

  // Scoundrel
  scou_1: { remove: { '-1': 2 } },
  scou_2: { remove: { '+0': 4 } },
  scou_3: { remove: { '-2': 1 }, add: { '+0': 1 } },
  scou_4: { remove: { '-1': 1 }, add: { '+1': 1 } },
  scou_5: { remove: { '+0': 1 }, add: { '+2': 1 } },
  scou_6: { add: { '↻ +1': 2 } },
  scou_7: { add: { '↻ průraznost 3': 2 } },
  scou_8: { add: { '↻ otrava': 2 } },
  scou_9: { add: { '↻ zmatení': 2 } },
  scou_10: { add: { '↻ neviditelnost': 1 } },

  // Spellweaver
  spell_1: { remove: { '-1': 2 } },
  spell_2: { remove: { '+0': 4 } },
  spell_3: { add: { '+0 omráčení': 1 } },
  spell_4: { add: { '+1 zranění': 1 } },
  spell_5: { add: { '+1 znehybnění': 1 } },
  spell_6: { add: { '+1 kletba': 1 } },
  spell_7: { add: { '+2 oheň': 2 } },
  spell_8: { add: { '+2 led': 2 } },
  spell_9: { add: { '↻ země': 2 } },
  spell_10: { add: { '↻ vzduch': 2 } },
  spell_11: { add: { '↻ světlo': 2 } },
  spell_12: { add: { '↻ tma': 2 } },

  // Tinkerer
  tink_1: { remove: { '-1': 2 } },
  tink_2: { remove: { '-2': 1 }, add: { '+0': 1 } },
  tink_3: { add: { '+1': 2 } },
  tink_4: { add: { '+3': 1 } },
  tink_5: { add: { '↻ oheň': 2 } },
  tink_6: { add: { '↻ zmatení': 1 } },
  tink_7: { add: { '+1 zranění': 1 } },
  tink_8: { add: { '+1 znehybnění': 1 } },
  tink_9: { add: { '+1 léčení 2': 1 } },
  tink_10: { add: { '+0 přidat cíl': 1 } },
  tink_11: { add: { '+1': 1 } },

  // Beast Tyrant
  beast_1: { remove: { '-1': 2 } },
  beast_2: { remove: { '-1': 1 }, add: { '+1': 1 } },
  beast_3: { remove: { '+0': 2 }, add: { '+2': 2 } },
  beast_4: { add: { '+1 zranění': 1 } },
  beast_5: { add: { '+1 znehybnění': 1 } },
  beast_6: { add: { '↻ léčení 1 sebe': 3 } },
  beast_7: { add: { '↻ země': 2 } },
  beast_8: { add: { '↻ slunce': 2 } },

  // Berserker
  berse_1: { remove: { '-1': 2 } },
  berse_2: { remove: { '-1': 1 }, add: { '+1': 1 } },
  berse_3: { remove: { '+0': 2 }, add: { '+2': 2 } },
  berse_4: { add: { '↻ omráčení': 2 } },
  berse_5: { add: { '↻ zranění': 2 } },
  berse_6: { add: { '↻ oheň': 2 } },
  berse_7: { add: { '↻ +1': 2 } },

  // Doomstalker
  doom_1: { remove: { '-1': 2 } },
  doom_2: { remove: { '-2': 1 }, add: { '+0': 1 } },
  doom_3: { remove: { '+0': 2 }, add: { '+1': 2 } },
  doom_4: { add: { '↻ +1': 2 } },
  doom_5: { add: { '+2 zmatení': 1 } },
  doom_6: { add: { '+1 otrava': 1 } },
  doom_7: { add: { '+1 zranění': 1 } },
  doom_8: { add: { '+1 znehybnění': 1 } },
  doom_9: { add: { '+0 omráčení': 1 } },
  doom_10: { add: { '↻ přidat cíl': 1 } },

  // Elementalist
  elem_1: { remove: { '-1': 2 } },
  elem_2: { remove: { '+0': 2 }, add: { '+2': 2 } },
  elem_3: { add: { '+0 oheň': 1 } },
  elem_4: { add: { '+0 led': 1 } },
  elem_5: { add: { '+0 vzduch': 1 } },
  elem_6: { add: { '+0 země': 1 } },
  elem_7: { add: { '+1 odstrčení 1': 1 } },
  elem_8: { add: { '+1 zranění': 1 } },
  elem_9: { remove: { '+0': 1 }, add: { '+0 omráčení': 1 } },

  // Nightshroud
  night_1: { remove: { '-1': 2 } },
  night_2: { remove: { '-2': 1 }, add: { '+0': 1 } },
  night_3: { remove: { '+0': 2 }, add: { '+1': 2 } },
  night_4: { add: { '+1 znehybnění': 1 } },
  night_5: { add: { '+1 zmatení': 1 } },
  night_6: { add: { '↻ tma': 2 } },
  night_7: { add: { '↻ neviditelnost': 2 } },
  night_8: { add: { '↻ +1': 2 } },

  // Plagueherald
  plague_1: { remove: { '-1': 2 } },
  plague_2: { remove: { '-1': 1 }, add: { '+1': 1 } },
  plague_3: { remove: { '+0': 2 }, add: { '+2': 2 } },
  plague_4: { add: { '+1 otrava': 1 } },
  plague_5: { add: { '+1 zranění': 1 } },
  plague_6: { add: { '+0 omráčení': 1 } },
  plague_7: { add: { '+0 kletba': 1 } },
  plague_8: { add: { '↻ vzduch': 2 } },
  plague_9: { add: { '↻ tma': 2 } },

  // Quartermaster
  quart_1: { remove: { '-1': 2 } },
  quart_2: { remove: { '+0': 2 }, add: { '+2': 2 } },
  quart_3: { add: { '↻ +1': 2 } },
  quart_4: { add: { '+1 znehybnění': 1 } },
  quart_5: { add: { '+1 otrava': 1 } },
  quart_6: { add: { '+0 obnova': 1 } },
  quart_7: { add: { '+0 léčení 3': 1 } },

  // Sawbones
  saw_1: { remove: { '-1': 2 } },
  saw_2: { remove: { '-2': 1 }, add: { '+0': 1 } },
  saw_3: { remove: { '+0': 2 }, add: { '+2': 2 } },
  saw_4: { add: { '+2 zranění': 1 } },
  saw_5: { add: { '+0 omráčení': 1 } },
  saw_6: { add: { '↻ znehybnění': 2 } },
  saw_7: { add: { '↻ léčení 3': 2 } },
  saw_8: { add: { '+1': 2 } },

  // Soothsinger
  sooth_1: { remove: { '-1': 2 } },
  sooth_2: { remove: { '-2': 1 } },
  sooth_3: { remove: { '+0': 2 }, add: { '+1': 2 } },
  sooth_4: { remove: { '+0': 2 }, add: { '+1 znehybnění': 1, '+1 zmatení': 1 } },
  sooth_5: { remove: { '+0': 2 }, add: { '+1 kletba': 1, '+1 otrava': 1 } },
  sooth_6: { remove: { '+0': 2 }, add: { '+1 zranění': 1, '+1 odstrčení 2': 1 } },
  sooth_7: { remove: { '+0': 2 }, add: { '+1 omráčení': 1, '+1 odzbrojení': 1 } },
  sooth_8: { add: { '↻ kletba': 2 } },

  // Summoner
  summ_1: { remove: { '-1': 2 } },
  summ_2: { remove: { '-2': 1 }, add: { '+0': 1 } },
  summ_3: { remove: { '+0': 2 }, add: { '+2': 2 } },
  summ_4: { add: { '+1 zranění': 1 } },
  summ_5: { add: { '+1 otrava': 1 } },
  summ_6: { add: { '↻ léčení 1': 3 } },
  summ_7: { add: { '↻ oheň': 2 } },
  summ_8: { add: { '↻ tma': 2 } },

  // Sunkeeper
  sun_1: { remove: { '-1': 2 } },
  sun_2: { remove: { '-2': 1 } },
  sun_3: { remove: { '+0': 2 }, add: { '+2': 2 } },
  sun_4: { add: { '+1 znehybnění': 1 } },
  sun_5: { add: { '+1 omráčení': 1 } },
  sun_6: { add: { '↻ léčení 1': 2 } },
  sun_7: { add: { '↻ světlo': 2 } },
  sun_8: { add: { '↻ obrana 1': 2 } },
  sun_9: { add: { '+1': 2 } },

  // Diviner
  div_1: { remove: { '-1': 2 } },
  div_2: { remove: { '-2': 1 }, add: { '+0': 1 } },
  div_3: { remove: { '+0': 2 }, add: { '+1': 2 } },
  div_4: { add: { '+1 kletba': 1 } },
  div_5: { add: { '+1 znehybnění': 1 } },
  div_6: { add: { '+1 zmatení': 1 } },
  div_7: { add: { '+2 tma': 1 } },
  div_8: { add: { '+2 světlo': 1 } },
  div_9: { add: { '↻ obrana 1': 2 } },
  div_10: { add: { '↻ léčení 2 sebe': 2 } },
  div_11: { add: { '↻ kletba': 2 } },
}

export function computeDeck(perksSelected: Record<string, number>): DeckCard[] {
  // Start with base deck copy
  const deck: Record<string, number> = { ...BASE_DECK }

  // Apply each selected perk
  for (const [perkId, count] of Object.entries(perksSelected)) {
    if (count <= 0) continue
    const mod = PERK_MODS[perkId]
    if (!mod) continue

    for (let i = 0; i < count; i++) {
      if (mod.remove) {
        for (const [card, qty] of Object.entries(mod.remove)) {
          deck[card] = Math.max(0, (deck[card] ?? 0) - qty)
          if (deck[card] === 0) delete deck[card]
        }
      }
      if (mod.add) {
        for (const [card, qty] of Object.entries(mod.add)) {
          deck[card] = (deck[card] ?? 0) + qty
        }
      }
    }
  }

  // Convert to sorted array
  const cards: DeckCard[] = []
  for (const [label, count] of Object.entries(deck)) {
    if (count <= 0) continue
    cards.push({ label, count, type: getCardType(label) })
  }

  // Sort: crit, positive (desc), neutral, negative (asc), miss, rolling
  const typeOrder = { crit: 0, positive: 1, neutral: 2, negative: 3, miss: 4, rolling: 5 }
  cards.sort((a, b) => {
    const ta = typeOrder[a.type]
    const tb = typeOrder[b.type]
    if (ta !== tb) return ta - tb
    return b.label.localeCompare(a.label)
  })

  return cards
}

function getCardType(label: string): DeckCard['type'] {
  if (label === 'x2') return 'crit'
  if (label === 'x0') return 'miss'
  if (label.startsWith('↻')) return 'rolling'
  if (label.startsWith('+0')) return 'neutral'
  if (label.startsWith('+')) return 'positive'
  if (label.startsWith('-')) return 'negative'
  return 'neutral'
}

export function getDeckStats(cards: DeckCard[]) {
  const total = cards.reduce((sum, c) => sum + c.count, 0)
  const missCard = cards.find((c) => c.type === 'miss')
  const critCard = cards.find((c) => c.type === 'crit')
  const rollingCount = cards.filter((c) => c.type === 'rolling').reduce((sum, c) => sum + c.count, 0)

  return {
    total,
    missChance: missCard ? (missCard.count / total) * 100 : 0,
    critChance: critCard ? (critCard.count / total) * 100 : 0,
    rollingCount,
    positiveCount: cards.filter((c) => c.type === 'positive' || c.type === 'crit').reduce((sum, c) => sum + c.count, 0),
    negativeCount: cards.filter((c) => c.type === 'negative' || c.type === 'miss').reduce((sum, c) => sum + c.count, 0),
    neutralCount: cards.filter((c) => c.type === 'neutral').reduce((sum, c) => sum + c.count, 0),
  }
}
