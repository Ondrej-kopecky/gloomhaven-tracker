/**
 * Transformační skript: převede zdrojová data z gloomhaven-storyline
 * do našeho formátu s českými překlady.
 *
 * Spuštění: npx tsx scripts/transform-data.ts
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT = resolve(__dirname, '..')
const SOURCE = resolve(ROOT, 'src/data/source')
const OUTPUT = resolve(ROOT, 'src/data')

// ── Helpers ──────────────────────────────────────────────────────────

function readJson(path: string) {
  return JSON.parse(readFileSync(path, 'utf-8'))
}

function writeJson(path: string, data: unknown) {
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf-8')
  console.log(`  ✓ ${path}`)
}

/**
 * Parse JS module export to extract the default export object.
 * The lang files are `export default { ... }` - we eval them.
 */
function readJsExport(path: string): Record<string, any> {
  let content = readFileSync(path, 'utf-8')
  // Remove "export default" and trailing semicolons
  content = content.replace(/^export\s+default\s+/, '').replace(/;\s*$/, '')
  // Use Function constructor to eval safely
  return new Function(`return (${content})`)()
}

// ── Czech scenario names (from our existing data) ─────────────────────

const existingScenarios: any[] = readJson(resolve(OUTPUT, 'scenarios.json'))
const existingNameMap = new Map<string, any>()
for (const s of existingScenarios) {
  existingNameMap.set(String(s.id), s)
}

// ── Czech achievement names (from our existing data) ──────────────────

const existingAchievements = readJson(resolve(OUTPUT, 'achievements.json'))
const existingAchMap = new Map<string, string>()
for (const a of existingAchievements.global) {
  existingAchMap.set(a.id, a.name)
}
for (const a of existingAchievements.party) {
  existingAchMap.set(a.id, a.name)
}

// ── Source data ──────────────────────────────────────────────────────

const sourceData = readJson(resolve(SOURCE, 'scenarios-gh.json'))
const sourceScenarios: any[] = sourceData.scenarios
const sourceChapters: any[] = sourceData.chapters || []
const sourceRegions: any[] = sourceData.regions || []

const sourceAchievements: any[] = readJson(resolve(SOURCE, 'achievements-gh.json'))
const scenarioLang = readJsExport(resolve(SOURCE, 'lang/scenarios-en.js'))
const achievementLang = readJsExport(resolve(SOURCE, 'lang/achievements-en.js'))
const treasureLang = readJsExport(resolve(SOURCE, 'lang/treasures-en.js'))

// ── Achievement ID mapping (their short codes → our readable IDs) ───

const ACHIEVEMENT_ID_MAP: Record<string, string> = {
  PFS: 'first_steps',
  PJP: 'jekserahs_plans',
  PDB: 'dark_bounty',
  PADE: 'a_demons_errand',
  PTTR: 'through_the_ruins',
  PAMTT: 'a_map_to_treasure',
  PTVC: 'the_voice_command',
  PTDC: 'the_drakes_command',
  PFC: 'following_clues',
  PT: 'tremors',
  PTSM: 'the_sinking_market',
  PSR: 'sin_ra',
  PRA: 'redthorns_accounting',
  PATD: 'across_the_divide',
  PTRD: 'the_rift_device',
  PSBC: 'stonebreakers_censer',
  PAI: 'an_invitation',
  PTVT: 'the_voices_trail',
  PTSV: 'the_scepter_and_the_voice',
  PTR: 'the_ruins',
  PSC: 'scrolls_of_corrosion',
  GTMF: 'the_merchant_flees',
  GTDI: 'the_dead_invade',
  GEOI: 'end_of_the_invasion',
  GCRE: 'city_rule_economic',
  GCRM: 'city_rule_militaristic',
  GCRD: 'city_rule_demonic',
  GTPE: 'the_power_of_enhancement',
  GTRN: 'the_rift_neutralized',
  GTRC: 'the_rift_closed',
  GWB: 'water_breathing',
  GTVF: 'the_voice_freed',
  GTVS: 'the_voice_silenced',
  GTDA: 'the_drake_aided',
  GTDS: 'the_drake_slain',
  GTED: 'the_edge_of_darkness',
  GAT: 'ancient_technology',
  GTAR: 'the_artifact_recovered',
  GTAL: 'the_artifact_lost',
  GTAC: 'the_artifact_cleansed',
  GTDD: 'the_demon_dethroned',
  GTIS: 'the_infection_spread',
  GASB: 'a_stronghold_built',
  GEOC1: 'end_of_corruption_1',
  GEOC2: 'end_of_corruption_2',
  GEOC3: 'end_of_corruption_3',
  GEOG: 'end_of_gloom',
  GANOTO: 'annihilation_of_the_order',
  GAR: 'the_artifact_recovered',
  GAR2: 'the_artifact_recovered_2',
  GAL: 'the_artifact_lost',
  GAC: 'the_artifact_cleansed',
  // Party additional
  PBB: 'bad_business',
  PTPS: 'the_poisons_source',
  PWS: 'water_staff',
  PHSE: 'high_sea_escort',
  PGJ: 'grave_job',
  PDC: 'debt_collection',
  PTTN: 'through_the_nest',
  PAMT: 'a_map_to_treasure',
  PNE: 'northern_expedition',
  PFA: 'fishs_aid',
  PHH: 'holding_the_husk',
}

function mapAchievementId(sourceId: string): string {
  return ACHIEVEMENT_ID_MAP[sourceId] || sourceId.toLowerCase()
}

function mapAchievementIds(ids?: string[]): string[] | undefined {
  if (!ids || ids.length === 0) return undefined
  return ids.map(mapAchievementId)
}

function mapConditions(conditions?: any[]): any[] | undefined {
  if (!conditions || conditions.length === 0) return undefined
  return conditions.map((c: any) => {
    const mapped: any = {}
    if (c.complete) mapped.complete = c.complete.map((id: string) => {
      // Could be a number (scenario ID) or string (achievement ID)
      return typeof id === 'number' || /^\d+$/.test(id) ? id : mapAchievementId(id)
    })
    if (c.incomplete) mapped.incomplete = c.incomplete.map((id: string) => {
      return typeof id === 'number' || /^\d+$/.test(id) ? id : mapAchievementId(id)
    })
    return mapped
  })
}

// ── Czech scenario name translations ────────────────────────────────

const SCENARIO_NAMES_CZ: Record<string, string> = {
  '1': 'Černý kurhan',
  '2': 'Kobka lupičů',
  '3': 'Tábor Inoxů',
  '4': 'Krypta Prokletých',
  '5': 'Zřícená krypta',
  '6': 'Rozpadající se krypta',
  '7': 'Zářivá jeskyně',
  '8': 'Sklad v Gloomhavenu',
  '9': 'Diamantový důl',
  '10': 'Rovina živlové síly',
  '11': 'Náměstí Gloomhavenu A',
  '12': 'Náměstí Gloomhavenu B',
  '13': 'Chrám věštce',
  '14': 'Mrazivá dutina',
  '15': 'Svatyně síly',
  '16': 'Horský průsmyk',
  '17': 'Ztracený ostrov',
  '18': 'Zaplavený útes',
  '19': 'Zapomenutá krypta',
  '20': 'Nekromancerova svatyně',
  '21': 'Pekelný trůn',
  '22': 'Chrám živlů',
  '23': 'Hluboké ruiny',
  '24': 'Ozvěnová komora',
  '25': 'Výstup na Ledový hřeben',
  '26': 'Starodávná cisterna',
  '27': 'Zničená trhlina',
  '28': 'Vnější rituální komora',
  '29': 'Svatyně temnoty',
  '30': 'Svatyně hlubin',
  '31': 'Rovina noci',
  '32': 'Sešlý les',
  '33': 'Savvasská zbrojnice',
  '34': 'Spálený vrchol',
  '35': 'Hradby Gloomhavenu A',
  '36': 'Hradby Gloomhavenu B',
  '37': 'Příkop zkázy',
  '38': 'Otroci',
  '39': 'Zrádný předěl',
  '40': 'Starodávná obranná síť',
  '41': 'Časem ošlehaná hrobka',
  '42': 'Říše Hlasu',
  '43': 'Dračí hnízdo',
  '44': 'Kmenový útok',
  '45': 'Povstalecký mokřad',
  '46': 'Vrchol nočních můr',
  '47': 'Doupě nevidoucího oka',
  '48': 'Stínový hvozd',
  '49': 'Povstání rebelů',
  '50': 'Přízračná pevnost',
  '51': 'Prázdnota',
  '52': 'Suterén krypty',
}

function getScenarioNameCz(id: string | number): string {
  const sid = String(id)
  // First check our existing translations
  const existing = existingNameMap.get(sid)
  if (existing?.name) return existing.name
  // Then check our hardcoded map
  if (SCENARIO_NAMES_CZ[sid]) return SCENARIO_NAMES_CZ[sid]
  // Fallback to English
  const langKey = `gh-${id}`
  return scenarioLang[langKey]?.name || `Scénář ${id}`
}

// ── Transform scenarios ─────────────────────────────────────────────

console.log('Transforming scenarios...')

const ghScenarios = sourceScenarios.filter((s: any) => s.game === 'gh' && !s.solo)
const transformedScenarios = ghScenarios.map((src: any) => {
  const id = String(src.id)
  const existing = existingNameMap.get(id)
  const langKey = `gh-${src.id}`
  const lang = scenarioLang[langKey] || {}

  // Parse reward texts into structured data
  const rewards: any = existing?.rewards || {}
  if (lang.rewards && Array.isArray(lang.rewards)) {
    rewards.text = lang.rewards
  }

  // Build treasure descriptions from lang
  const treasures = (src.treasures || []).map((tid: number) => {
    const tKey = `gh-${tid}`
    const tLang = treasureLang[tKey]
    return {
      id: String(tid),
      description: tLang?.name || `Poklad ${tid}`,
    }
  })

  const scenario: any = {
    id,
    name: getScenarioNameCz(src.id),
    location: src.coordinates?.name || '',
    isSide: src.is_side || false,
    coordinates: {
      name: src.coordinates?.name,
      x: src.coordinates?.x || 0,
      y: src.coordinates?.y || 0,
    },
    linksTo: src.links_to || [],
    linkedFrom: src.linked_from || [],
    treasures,
    rewards,
    summary: existing?.summary || '',
  }

  // Optional fields - only add if present
  if (src.root) scenario.isRoot = true
  if (src.chapter_id) scenario.chapterId = src.chapter_id
  if (src.region_ids?.length) scenario.regionIds = src.region_ids
  if (src.pages?.length) scenario.pages = src.pages
  if (src.choices?.length) scenario.choices = src.choices
  if (src.prompt) scenario.prompt = src.prompt
  if (src.coupled) scenario.coupled = src.coupled
  if (src.required_by?.length) scenario.requiredBy = mapConditions(src.required_by)
  if (src.blocks_on?.length) scenario.blocksOn = mapConditions(src.blocks_on)
  if (src.achievements_awarded?.length) scenario.achievementsAwarded = mapAchievementIds(src.achievements_awarded)
  if (src.achievements_lost?.length) scenario.achievementsLost = mapAchievementIds(src.achievements_lost)
  if (src.achievements_from_treasures) {
    const mapped: Record<string, string[]> = {}
    for (const [tid, aids] of Object.entries(src.achievements_from_treasures)) {
      mapped[tid] = (aids as string[]).map(mapAchievementId)
    }
    scenario.achievementsFromTreasures = mapped
  }
  if (src.treasures_to) scenario.treasuresTo = src.treasures_to
  if (src.treasures_from?.length) scenario.treasuresFrom = src.treasures_from
  if (src.has_boss) scenario.hasBoss = true
  if (src.quests?.length) scenario.quests = src.quests

  return scenario
})

writeJson(resolve(OUTPUT, 'scenarios.json'), transformedScenarios)
console.log(`  → ${transformedScenarios.length} scénářů transformováno`)

// ── Transform chapters & regions ────────────────────────────────────

if (sourceChapters.length) {
  const chapters = sourceChapters.map((c: any) => ({
    id: c.id,
    name: c.name,
    game: c.game,
  }))
  writeJson(resolve(OUTPUT, 'chapters.json'), chapters)
  console.log(`  → ${chapters.length} kapitol`)
}

if (sourceRegions.length) {
  const regions = sourceRegions.map((r: any) => ({
    id: r.id,
    name: r.name,
    game: r.game,
  }))
  writeJson(resolve(OUTPUT, 'regions.json'), regions)
  console.log(`  → ${regions.length} regionů`)
}

// ── Transform achievements ──────────────────────────────────────────

console.log('\nTransforming achievements...')

const ACHIEVEMENT_NAMES_CZ: Record<string, string> = {
  PFS: 'První kroky',
  PJP: 'Plány Jekserah',
  PDB: 'Temná odměna',
  PADE: 'Démonův úkol',
  PTTR: 'Přes ruiny',
  PAMTT: 'Mapa k pokladu',
  PTVC: 'Příkaz Hlasu',
  PTDC: 'Příkaz Draka',
  PFC: 'Sledování stop',
  PT: 'Otřesy',
  PTSM: 'Potápějící se trh',
  PSR: 'Sin-Ra',
  PRA: 'Účtování Rudého trnu',
  PATD: 'Přes propast',
  PTRD: 'Přístroj trhliny',
  PSBC: 'Kadidelnice Lámače kamenů',
  PAI: 'Pozvání',
  PTVT: 'Stopa Hlasu',
  PTSV: 'Žezlo a Hlas',
  PTR: 'Ruiny',
  PSC: 'Svitky koroze',
  GTMF: 'Obchodník utíká',
  GTDI: 'Mrtví vtrhli',
  GEOI: 'Konec invaze',
  GCRE: 'Ekonomická vláda',
  GCRM: 'Militaristická vláda',
  GCRD: 'Démonická vláda',
  GTPE: 'Síla vylepšení',
  GTRN: 'Trhlina neutralizována',
  GTRC: 'Trhlina uzavřena',
  GWB: 'Dýchání pod vodou',
  GTVF: 'Hlas osvobozen',
  GTVS: 'Hlas umlčen',
  GTDA: 'Drakovi pomoženo',
  GTDS: 'Drak zabit',
  GTED: 'Na okraji tmy',
  GAT: 'Starověká technologie',
  GTAR: 'Artefakt nalezen',
  GTAL: 'Artefakt ztracen',
  GTAC: 'Artefakt očištěn',
  GTDD: 'Démon svržen',
  GTIS: 'Nákaza se šíří',
  GASB: 'Pevnost postavena',
  GEOC1: 'Konec korupce 1',
  GEOC2: 'Konec korupce 2',
  GEOC3: 'Konec korupce 3',
  GEOG: 'Konec temnoty',
  GANOTO: 'Zničení řádu',
  PBB: 'Špatný obchod',
  PTPS: 'Zdroj jedu',
  PWS: 'Vodní hůl',
  PHSE: 'Doprovod na moři',
  PGJ: 'Hrobní práce',
  PDC: 'Vymáhání dluhů',
  PTTN: 'Skrz hnízdo',
  PNE: 'Severní expedice',
  PFA: 'Rybí pomoc',
}

function getAchievementNameCz(sourceId: string, sourceName: string): string {
  if (ACHIEVEMENT_NAMES_CZ[sourceId]) return ACHIEVEMENT_NAMES_CZ[sourceId]
  // Check existing data
  const ourId = mapAchievementId(sourceId)
  if (existingAchMap.has(ourId)) return existingAchMap.get(ourId)!
  return sourceName
}

const ghAchievements = sourceAchievements.filter((a: any) => a.game === 'gh')
const globalAch = ghAchievements.filter((a: any) => a.type === 'Global')
const partyAch = ghAchievements.filter((a: any) => a.type === 'Party')

function transformAchievement(src: any) {
  const result: any = {
    id: mapAchievementId(src.id),
    name: getAchievementNameCz(src.id, src.name),
    type: src.type.toLowerCase(),
  }
  if (src.group) result.group = src.group.toLowerCase()
  if (src.upgrades?.length) result.upgrades = src.upgrades.map(mapAchievementId)
  if (src.is_manual) result.isManual = true
  if (src.requirement) result.requirement = mapAchievementId(src.requirement)
  if (src.hidden) result.hidden = true
  return result
}

const transformedAchievements = {
  global: globalAch.map(transformAchievement),
  party: partyAch.map(transformAchievement),
}

writeJson(resolve(OUTPUT, 'achievements.json'), transformedAchievements)
console.log(`  → ${globalAch.length} global + ${partyAch.length} party achievementů`)

// ── Transform items ─────────────────────────────────────────────────

console.log('\nTransforming items...')

const sourceItems: any[] = readJson(resolve(SOURCE, 'items-gh.json'))
const itemLang = readJsExport(resolve(SOURCE, 'lang/items-en.js'))

const SLOT_MAP: Record<string, string> = {
  'Legs': 'legs',
  'Body': 'body',
  'Head': 'head',
  'One Hand': 'one_hand',
  'Two Hands': 'two_hands',
  'Small Item': 'small_item',
}

const transformedItems = sourceItems.map((src: any) => {
  const langKey = `gh-${src.id}`
  const lang = itemLang[langKey] || {}

  const item: any = {
    id: src.id,
    name: lang.name || src.name,
    cost: src.cost,
    count: src.count || 1,
    slot: SLOT_MAP[src.slot] || src.slot?.toLowerCase(),
    source: src.source || '',
    description: lang.desc || src.desc || '',
  }
  if (src.spent) item.spent = true
  if (src.consumed) item.consumed = true
  if (src.faq || lang.faq) item.faq = lang.faq || src.faq
  return item
})

writeJson(resolve(OUTPUT, 'items.json'), transformedItems)
console.log(`  → ${transformedItems.length} předmětů`)

// ── Done ─────────────────────────────────────────────────────────────

console.log('\n✅ Transformace dokončena!')
