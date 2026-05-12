import type { CharacterClass } from '@/models/types'

/**
 * Sdílená metadata tříd postav (názvy, barvy, startovní třídy).
 * Jediný zdroj pravdy — CharactersPage / PartyPage / OnboardingPage by sem měly mířit.
 */

/** Oficiální CZ názvy tříd (rasa + třída), klíčované `CharacterClass`. */
export const classNames: Partial<Record<CharacterClass, string>> = {
  brute: 'Inoxský surovec',
  cragheart: 'Savvasský prasklivec',
  mindthief: 'Krysácká zlodějka mysli',
  scoundrel: 'Lidská ničemnice',
  spellweaver: 'Orchidská čarovnice',
  tinkerer: 'Quatrylský kutil',
  beast_tyrant: 'Krysácký zvěropán',
  berserker: 'Inoxská fúrie',
  doomstalker: 'Orchidský zkázolov',
  elementalist: 'Savvasská vládkyně živlů',
  nightshroud: 'Aestherský stínochodec',
  plagueherald: 'Trýznitelský moronoš',
  quartermaster: 'Valrathský zbrojmistr',
  sawbones: 'Lidský kostiřez',
  soothsinger: 'Quatrylská čaropěvkyně',
  summoner: 'Aestherská vyvolávačka',
  sunkeeper: 'Valrathská světlonoška',
  diviner: 'Aestherská věštkyně',
  bladeswarm: 'Roj čepelí',
}

/** Barva třídy (pro akcenty, avatary, ikony). */
export const classColors: Record<string, string> = {
  brute: '#e74c3c',
  cragheart: '#95a5a6',
  mindthief: '#9b59b6',
  scoundrel: '#2ecc71',
  spellweaver: '#3498db',
  tinkerer: '#f39c12',
  beast_tyrant: '#e67e22',
  berserker: '#c0392b',
  doomstalker: '#27ae60',
  elementalist: '#8e44ad',
  nightshroud: '#2c3e50',
  plagueherald: '#16a085',
  quartermaster: '#d4a847',
  sawbones: '#ecf0f1',
  soothsinger: '#e91e8c',
  summoner: '#1abc9c',
  sunkeeper: '#f1c40f',
  diviner: '#a78bfa',
  bladeswarm: '#6b8e23',
}

export function classColor(classId: string): string {
  return classColors[classId] ?? '#c4a35a'
}
export function className(classId: CharacterClass): string {
  return classNames[classId] ?? classId
}

/** 6 startovních tříd Gloomhavenu (krátké jméno, rasa, popis) — pro onboarding wizard ap. */
const STARTING_DATA: { id: CharacterClass; name: string; race: string; desc: string }[] = [
  { id: 'brute' as CharacterClass, name: 'Surovec', race: 'Inox', desc: 'Mlátička zblízka, hodně životů, snadný start.' },
  { id: 'tinkerer' as CharacterClass, name: 'Kutil', race: 'Quatryl', desc: 'Léčení, pasti a podpora — drží družinu naživu.' },
  { id: 'spellweaver' as CharacterClass, name: 'Čarovnice', race: 'Orchid', desc: 'Plošná kouzla a dosah, ale jen málo karet.' },
  { id: 'scoundrel' as CharacterClass, name: 'Ničemnice', race: 'Člověk', desc: 'Jednociloví zabijáci z neviditelnosti, rychlá iniciativa.' },
  { id: 'cragheart' as CharacterClass, name: 'Prasklivec', race: 'Savvas', desc: 'Tvaruje terén, kombinuje útok i podporu.' },
  { id: 'mindthief' as CharacterClass, name: 'Zlodějka mysli', race: 'Krysák', desc: 'Ovládá mysl nepřátel a živly — křehká, ale chytrá.' },
]

export interface StartingClass {
  id: CharacterClass
  name: string
  race: string
  desc: string
  color: string
}

/** Startovní třídy s doplněnou barvou (z `classColors`). */
export function startingClasses(): StartingClass[] {
  return STARTING_DATA.map((c) => ({ ...c, color: classColor(c.id) }))
}

/** Krátký popis třídy (jen u startovních; jinak `undefined`). */
export function classShortDesc(classId: CharacterClass | string): string | undefined {
  return STARTING_DATA.find((c) => c.id === classId)?.desc
}

/** Je to jedna ze 6 startovních tříd? */
export function isStartingClass(classId: CharacterClass | string): boolean {
  return STARTING_DATA.some((c) => c.id === classId)
}
