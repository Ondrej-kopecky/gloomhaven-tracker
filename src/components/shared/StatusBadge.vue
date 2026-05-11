<script setup lang="ts">
import { computed } from 'vue'
import type { ScenarioStatus } from '@/models/types'

/**
 * Jednotný status indikátor scénáře (redesign Phase 01 — Foundations).
 *
 * 4 barvy nesou stav „v jakém stavu se to dá hrát" (zelená/modrá/oranžová/červená),
 * `locked` a `required` mají primárně ikonu (🔒 / !), ne barvu — aby barvy zůstaly
 * silným signálem. `hidden` se chová jako `locked`.
 *
 *   variant="pill"  — kapsle s barvou + ikonou + popiskem (default)
 *   variant="dot"   — barevná tečka + popisek (kompaktní, do legend/řádků)
 *   variant="icon"  — jen ikona nebo tečka (nejúspornější, s title tooltipem)
 */

type State = ScenarioStatus | (string & {})
type Glyph = 'lock' | 'check' | 'required' | 'blocked' | 'attempted' | null

interface Cfg {
  label: string
  pill: string
  dot: string
  text: string
  glyph: Glyph
}

const props = withDefaults(
  defineProps<{
    state: State
    variant?: 'pill' | 'dot' | 'icon'
    /** Přepíše výchozí český popisek. */
    label?: string
  }>(),
  { variant: 'pill' },
)

const CONFIG: Record<string, Cfg> = {
  completed: { label: 'Dokončeno', pill: 'bg-green-900/25 text-green-400 border border-green-800/40', dot: 'bg-green-500', text: 'text-green-400', glyph: 'check' },
  available: { label: 'Dostupné', pill: 'bg-blue-900/25 text-blue-400 border border-blue-800/40', dot: 'bg-blue-500', text: 'text-blue-400', glyph: null },
  attempted: { label: 'Pokus', pill: 'bg-orange-900/25 text-orange-400 border border-orange-800/40', dot: 'bg-orange-500', text: 'text-orange-400', glyph: 'attempted' },
  required: { label: 'Vyžadováno', pill: 'bg-yellow-900/25 text-yellow-400 border border-yellow-800/40', dot: 'bg-yellow-500', text: 'text-yellow-400', glyph: 'required' },
  blocked: { label: 'Blokováno', pill: 'bg-red-900/25 text-red-400 border border-red-800/40', dot: 'bg-red-500', text: 'text-red-400', glyph: 'blocked' },
  locked: { label: 'Zamčeno', pill: 'bg-white/5 text-gray-500 border border-gh-border', dot: 'bg-gray-600', text: 'text-gray-500', glyph: 'lock' },
  hidden: { label: 'Skryto', pill: 'bg-gray-800/40 text-gray-600', dot: 'bg-gray-700', text: 'text-gray-600', glyph: 'lock' },
}

const cfg = computed<Cfg>(() => CONFIG[props.state] ?? { label: String(props.state), pill: 'bg-white/5 text-gray-500', dot: 'bg-gray-600', text: 'text-gray-500', glyph: null })
const label = computed(() => props.label ?? cfg.value.label)
</script>

<template>
  <!-- pill: barva + ikona + popisek -->
  <span v-if="variant === 'pill'" class="gh-badge inline-flex items-center gap-1 align-middle" :class="cfg.pill">
    <svg v-if="cfg.glyph === 'lock'" class="w-3 h-3 -ml-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 1 1 8 0v4" />
    </svg>
    <svg v-else-if="cfg.glyph === 'check'" class="w-3 h-3 -ml-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4.5 12.75l6 6 9-13.5" />
    </svg>
    <svg v-else-if="cfg.glyph === 'attempted'" class="w-3 h-3 -ml-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 12a9 9 0 1 1-3-6.7" /><path d="M21 4v5h-5" />
    </svg>
    <span v-else-if="cfg.glyph === 'required'" class="-ml-0.5 font-bold leading-none">!</span>
    <span v-else-if="cfg.glyph === 'blocked'" class="-ml-0.5 font-bold leading-none">×</span>
    <span>{{ label }}</span>
  </span>

  <!-- dot: tečka + popisek -->
  <span v-else-if="variant === 'dot'" class="inline-flex items-center gap-1.5 text-[11px] align-middle" :class="cfg.text">
    <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="cfg.dot" />
    <span>{{ label }}</span>
  </span>

  <!-- icon: jen ikona / tečka -->
  <span v-else class="inline-flex items-center justify-center align-middle" :class="cfg.text" :title="label" :aria-label="label">
    <svg v-if="cfg.glyph === 'lock'" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 1 1 8 0v4" />
    </svg>
    <svg v-else-if="cfg.glyph === 'check'" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4.5 12.75l6 6 9-13.5" />
    </svg>
    <svg v-else-if="cfg.glyph === 'attempted'" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 12a9 9 0 1 1-3-6.7" /><path d="M21 4v5h-5" />
    </svg>
    <span v-else-if="cfg.glyph === 'required'" class="font-bold text-sm leading-none">!</span>
    <span v-else-if="cfg.glyph === 'blocked'" class="font-bold text-sm leading-none">×</span>
    <span v-else class="w-2 h-2 rounded-full" :class="cfg.dot" />
  </span>
</template>
