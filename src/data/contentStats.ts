/**
 * Počty obsahu pro „stats strip" na landingu a podobné přehledy.
 *
 * Odvozeno z `src/data/*.json` (scenarios/characters/items/quests/personalQuests).
 * Záměrně malý modul s konstantami — ať landing bundle nemusí importovat
 * plné datasety (~200 kB) jen kvůli čtyřem číslům.
 *
 * TODO (redesign): vygenerovat build skriptem (jako `generate-changelog.cjs`),
 * ať se to nikdy nerozjede s daty.
 */
export const contentStats = {
  /** scénáře v `scenarios.json` (Gloomhaven + Forgotten Circles) */
  scenarios: 115,
  /** hratelné třídy v `characters.json` */
  classes: 19,
  /** předměty v `items.json` */
  items: 164,
  /** příběhové questy v `quests.json` */
  quests: 40,
  /** osobní questy v `personalQuests.json` */
  personalQuests: 24,
} as const
