/**
 * Build processed events data from source events-gh.json
 * Extracts only mechanical effects, translates to Czech labels
 * Run: node scripts/build-events.js
 */

const fs = require('fs')
const path = require('path')

const events = require('../src/data/source/events-gh.json')

const effectLabel = {
  gold: (v) => `+${v[0]} zl. každý`,
  loseGold: (v) => `-${v[0]} zl. každý`,
  collectiveGold: (v) => `+${v[0]} zl. společně`,
  collectiveGoldAdditional: (v) => `+${v[0]} zl. společně (navíc)`,
  loseCollectiveGold: (v) => `-${v[0]} zl. společně`,
  goldAdditional: (v) => `+${v[0]} zl. každý (navíc)`,
  experience: (v) => `+${v[0]} ZK každý`,
  reputation: (v) => `${v[0] > 0 ? '+' : ''}${v[0]} reputace`,
  reputationAdditional: (v) => `${v[0] > 0 ? '+' : ''}${v[0]} reputace (navíc)`,
  loseReputation: (v) => `-${v[0]} reputace`,
  prosperity: (v) => `+${v[0]} blahobyt`,
  loseProsperity: (v) => `-${v[0]} blahobyt`,
  unlockScenario: (v) => `Odemkni scénář #${v[0]}`,
  randomItemDesign: () => `Náhodný design předmětu`,
  itemDesign: (v) => `Design předmětu #${v[0]}`,
  itemCollective: (v) => `Předmět #${v[0]}`,
  globalAchievement: (v) => `Globální úspěch: ${v[0]}`,
  partyAchievement: (v) => `Úspěch družiny: ${v[0]}`,
  event: (v) => `Přidej událost: ${v[0]}`,
  battleGoal: (v) => `+${v[0]} cíl bitvy`,
  loseBattleGoal: (v) => `-${v[0]} cíl bitvy`,
  scenarioDamage: (v) => `${v[0]} zranění na začátku scénáře`,
  scenarioSingleMinus1: () => `Přidej -1 do balíčku modifikátorů`,
  scenarioCondition: (v) => {
    const condCz = {
      muddle: 'zmatení', poison: 'otrava', wound: 'zranění', curse: 'prokletí',
      bless: 'požehnání', stun: 'omráčení', immobilize: 'znehybnění',
      disarm: 'odzbrojení', invisible: 'neviditelnost', strengthen: 'posílení',
    }
    return `Stav na začátku scénáře: ${condCz[v[0]] || v[0]}`
  },
  consumeItem: (v) => `Spotřebuj předmět (malý)`,
  consumeCollectiveItem: (v) => `Spotřebuj předmět společně`,
  discardOne: () => `Odhoď 1 kartu`,
  discard: (v) => `Odhoď ${v[0]} karet`,
  noEffect: () => `Bez efektu`,
}

const conditionLabel = {
  reputationGT: (v) => `Reputace ≥ ${v[0]}`,
  reputationLT: (v) => `Reputace < ${v[0]}`,
  payCollectiveGold: (v) => `Zaplatit ${v[0]} zl. společně`,
  payCollectiveGoldConditional: (v) => `Zaplatit ${v[0]} zl. společně`,
  payGold: (v) => `Zaplatit ${v[0]} zl. každý`,
  payCollectiveItem: (v) => `Odevzdat předmět společně`,
  character: (v) => `Postava: ${v.join(' / ')}`,
  otherwise: () => `Jinak`,
}

function translateEffect(effect) {
  if (effect.type === 'choose') {
    return {
      type: 'choose',
      label: 'Vyber jedno',
      options: (effect.values || []).map(v => {
        const fn = effectLabel[v.type]
        return fn ? fn(v.values || []) : `${v.type}: ${JSON.stringify(v.values)}`
      })
    }
  }
  if (effect.type === 'outcome') {
    // Nested outcome (rare)
    return { type: 'outcome', label: 'Viz podrobnosti' }
  }
  const fn = effectLabel[effect.type]
  return {
    type: effect.type,
    label: fn ? fn(effect.values || []) : `${effect.type}: ${JSON.stringify(effect.values)}`
  }
}

function translateCondition(condition) {
  if (!condition) return null
  const fn = conditionLabel[condition.type]
  return fn ? fn(condition.values || []) : `${condition.type}: ${JSON.stringify(condition.values)}`
}

const result = events.map(ev => ({
  id: parseInt(ev.cardId, 10),
  type: ev.type,
  options: ev.options.map(opt => ({
    label: opt.label,
    choiceText: opt.narrative || '',
    returnToDeck: opt.returnToDeck ?? false,
    outcomes: (opt.outcomes || []).map(out => ({
      condition: translateCondition(out.condition),
      effects: (out.effects || []).map(translateEffect),
      returnToDeck: out.returnToDeck,
    }))
  }))
}))

const outPath = path.join(__dirname, '..', 'src', 'data', 'events.json')
fs.writeFileSync(outPath, JSON.stringify(result, null, 2))
console.log(`Written ${result.length} events to ${outPath}`)

const city = result.filter(e => e.type === 'city')
const road = result.filter(e => e.type === 'road')
console.log(`City: ${city.length}, Road: ${road.length}`)
