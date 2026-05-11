import type { CharacterClass } from '@/models/types'

/**
 * Sdílená metadata tříd postav (názvy + barvy).
 * Dřív byly tyhle mapy duplikované v CharactersPage / PartyPage — postupně
 * migrovat na tenhle modul.
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
