<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCampaignStore } from '@/stores/campaignStore'
import { usePartyStore } from '@/stores/partyStore'
import { useCharacterStore } from '@/stores/characterStore'
import type { ItemDefinition } from '@/models/Item'
import SlotIcon from '@/components/items/SlotIcon.vue'
import itemsData from '@/data/items.json'

const router = useRouter()
const campaignStore = useCampaignStore()
const partyStore = usePartyStore()
const characterStore = useCharacterStore()

onMounted(() => {
  if (!campaignStore.hasCampaign) {
    router.push('/kampan')
  }
})

const allItems = itemsData as ItemDefinition[]

const search = ref('')
const filterSlot = ref<string>('all')
const filterSource = ref<string>('all')
const showOnlyAvailable = ref(false)

const prosperityLevel = computed(() => partyStore.prosperityLevel)

const slotLabels: Record<string, string> = {
  head: 'Hlava',
  body: 'Tělo',
  legs: 'Nohy',
  one_hand: 'Jedna ruka',
  two_hands: 'Dvě ruce',
  small_item: 'Drobnost',
}

// Primární zdroj = první řádek (před \n)
function primarySource(source: string): string {
  return source.split('\n')[0]!.trim()
}

const sources = computed(() => {
  const s = new Set(allItems.map((i) => primarySource(i.source)))
  return Array.from(s).sort()
})

function isItemAvailable(item: ItemDefinition): boolean {
  // Manuálně odemčené designy (náhodné odměny ze scénářů)
  if (campaignStore.unlockedItemDesigns.includes(item.id)) return true

  const src = item.source

  // Prosperity X → potřeba úroveň blahobytu >= X
  const prosMatch = src.match(/[Pp]rosperity\s+(\d+)/)
  if (prosMatch) {
    return prosperityLevel.value >= parseInt(prosMatch[1]!)
  }

  // Random Item → vždy dostupné (základní obchod)
  if (src.includes('Random Item')) return true

  // City/Road Event → nelze trackovat, vždy zobrazit
  if (/City Event|Road Event/i.test(src)) return true

  // Scénářové předměty: poklady, odměny, volby
  // Najdi VŠECHNY zmínky scénářů ve zdroji
  const scenarioMatches = src.matchAll(/\{?SCENARIO\s+#?0*(\d+)\}?/gi)
  for (const m of scenarioMatches) {
    const scenarioId = m[1]!
    const state = campaignStore.currentCampaign?.scenarios[scenarioId]
    if (state?.status === 'completed') return true
  }
  // Pokud byly zmínky scénářů ale žádný není splněný → nedostupné
  if (/SCENARIO/i.test(src)) return false

  // Solo Scenario → dostupné jen pokud třída je odemčená (zjednodušeně: vždy skrýt ve spoiler módu)
  if (/Solo Scenario/i.test(src)) return false

  // Section/FC Challenge/Rift Card → specifický obsah, skrýt
  if (/Section \d|FC Challenge|Rift Card/i.test(src)) return false

  // Unknown → skrýt
  if (src.trim() === 'Unknown') return false

  return true
}

const filteredItems = computed(() => {
  return allItems.filter((item) => {
    if (filterSlot.value !== 'all' && item.slot !== filterSlot.value) return false
    if (filterSource.value !== 'all' && primarySource(item.source) !== filterSource.value) return false
    if ((showOnlyAvailable.value || campaignStore.hideSpoilers) && !isItemAvailable(item)) return false
    if (search.value) {
      const q = search.value.toLowerCase()
      return (
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        String(item.id).includes(q)
      )
    }
    return true
  })
})

const stats = computed(() => ({
  total: allItems.length,
  available: allItems.filter(isItemAvailable).length,
  shown: filteredItems.value.length,
}))

// Zkratky tříd → plain text (pro option i pro source řádek)
function translateClassAbbr(s: string): string {
  return s
    .replace(/\{BR\}/g, 'Zvěř').replace(/\{TI\}/g, 'Nástěnka').replace(/\{SW\}/g, 'Vír')
    .replace(/\{SC\}/g, 'Šmejd').replace(/\{CH\}/g, 'Bouřňák').replace(/\{MT\}/g, 'Mystiček')
    .replace(/\{SK\}/g, 'Slunečňák').replace(/\{QM\}/g, 'Čtvrťák').replace(/\{SU\}/g, 'Přívolávač')
    .replace(/\{NS\}/g, 'Noční můra').replace(/\{PH\}/g, 'Travič').replace(/\{BE\}/g, 'Berserk')
    .replace(/\{SS\}/g, 'Zvukomág').replace(/\{DS\}/g, 'Osudovač').replace(/\{SB\}/g, 'Mastičkář')
    .replace(/\{EL\}/g, 'Elementál').replace(/\{BT\}/g, 'Zvířátor').replace(/\{BS\}/g, 'Krveprolévač')
    .replace(/\{DR\}/g, 'Drakáč')
}

function translateSource(source: string): string {
  return translateClassAbbr(source
    .replace(/\{SCENARIO\s+(\d+)\}/gi, 'Scénář $1')
    .replace(/Prosperity/gi, 'Blahobyt')
    .replace(/Scenario/gi, 'Scénář')
    .replace(/Reward [Ff]rom/g, 'Odměna z')
    .replace(/Option from/g, 'Volba z')
    .replace(/Random Item/g, 'Náhodný předmět')
    .replace(/Treasure/g, 'Poklad')
    .replace(/Road Event/g, 'Cestovní událost')
    .replace(/City Event/g, 'Městská událost')
    .replace(/Solo Scenario/g, 'Sólo scénář')
    .replace(/Unknown/g, 'Neznámý')
    .replace(/Section/g, 'Sekce')
    .replace(/in book/g, 'v knize')
    .replace(/FC Challenge/g, 'FC výzva')
    .replace(/Rift Card/g, 'Trhlina'))
}

// Barevné kolečko pro živel (inline HTML)
const elementColors: Record<string, string> = {
  FIRE: '#e25822',
  ICE: '#5bc0de',
  WIND: '#8fbc8f',
  EARTH: '#8b6914',
  LIGHT: '#f0c040',
  DARK: '#4a4a6a',
  ANY: 'linear-gradient(135deg, #e25822, #5bc0de, #8fbc8f, #8b6914)',
}

function elDot(key: string, consume = false): string {
  const c = elementColors[key] ?? '#888'
  const bg = c.startsWith('linear') ? `background:${c}` : `background:${c}`
  const x = consume ? '<span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#fff;font-size:8px;font-weight:700;">✕</span>' : ''
  return `<span style="display:inline-flex;align-items:center;justify-content:center;width:14px;height:14px;border-radius:50%;${bg};vertical-align:middle;position:relative;margin:0 1px;">${x}</span>`
}

// AOE hex grid SVGs
// Flat-top hexagon: center (cx,cy), radius r
// Hex coords use offset coords; convert to pixel for flat-top:
//   px = x * 1.5 * r
//   py = y * sqrt(3) * r + (x % 2 ? sqrt(3)/2 * r : 0)
function hexPath(cx: number, cy: number, r: number): string {
  const pts: string[] = []
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 180) * (60 * i)
    pts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`)
  }
  return pts.join(' ')
}

interface HexCell { q: number; r: number; type: 'player' | 'hit' }

// AOE patterns: q,r offset coords, player at origin
const aoePatterns: Record<string, { cells: HexCell[]; label: string }> = {
  'AOE.CONE_0_1': {
    label: 'Kužel',
    cells: [
      { q: 0, r: 0, type: 'player' },
      { q: 0, r: -1, type: 'hit' },
      { q: 1, r: -1, type: 'hit' },
    ],
  },
  'AOE.CONE_1_1': {
    label: 'Kužel',
    cells: [
      { q: 0, r: 0, type: 'player' },
      { q: 0, r: -1, type: 'hit' },
      { q: 1, r: -1, type: 'hit' },
      { q: 1, r: 0, type: 'hit' },
    ],
  },
  'AOE.LINE_0_1_1': {
    label: 'Linie',
    cells: [
      { q: 0, r: 0, type: 'player' },
      { q: 0, r: -1, type: 'hit' },
      { q: 0, r: -2, type: 'hit' },
    ],
  },
  'AOE.CUBE_2_2': {
    label: 'Oblast',
    cells: [
      { q: 0, r: 0, type: 'player' },
      { q: 0, r: -1, type: 'hit' },
      { q: 1, r: -1, type: 'hit' },
      { q: 0, r: -2, type: 'hit' },
      { q: 1, r: -2, type: 'hit' },
    ],
  },
  'AOE.CLEAVE_0_1': {
    label: 'Rozseknutí',
    cells: [
      { q: 0, r: 0, type: 'player' },
      { q: -1, r: -1, type: 'hit' },
      { q: 0, r: -1, type: 'hit' },
    ],
  },
}

function aoeHexSvg(key: string): string {
  const pattern = aoePatterns[key]
  if (!pattern) return 'Oblast'

  const R = 10 // hex radius
  const sqrt3 = Math.sqrt(3)

  // Convert offset to pixel
  function toPixel(q: number, r: number): [number, number] {
    const px = q * 1.5 * R
    const py = r * sqrt3 * R + (q % 2 !== 0 ? sqrt3 / 2 * R : 0)
    return [px, py]
  }

  const pixels = pattern.cells.map(c => ({ ...c, px: toPixel(c.q, c.r) }))

  // Bounding box
  const xs = pixels.map(p => p.px[0])
  const ys = pixels.map(p => p.px[1])
  const minX = Math.min(...xs) - R - 1
  const maxX = Math.max(...xs) + R + 1
  const minY = Math.min(...ys) - R - 1
  const maxY = Math.max(...ys) + R + 1
  const w = maxX - minX
  const h = maxY - minY

  let hexes = ''
  for (const p of pixels) {
    const fill = p.type === 'player' ? '#c4a35a' : '#dc2626'
    const stroke = p.type === 'player' ? '#8b7340' : '#991b1b'
    const pts = hexPath(p.px[0] - minX, p.px[1] - minY, R * 0.9)
    hexes += `<polygon points="${pts}" fill="${fill}" stroke="${stroke}" stroke-width="0.8" opacity="0.85"/>`
  }

  const svgW = Math.round(w * 1.2)
  const svgH = Math.round(h * 1.2)

  return `<span style="display:inline-block;vertical-align:middle;margin:2px 4px;" title="${pattern.label}"><svg width="${svgW}" height="${svgH}" viewBox="0 0 ${w.toFixed(1)} ${h.toFixed(1)}" xmlns="http://www.w3.org/2000/svg">${hexes}</svg></span>`
}

function translateDescription(desc: string): string {
  const result = desc
    // Stavy
    .replace(/\{SHIELD\}/g, 'Štít')
    .replace(/\{INVISIBLE\}/g, 'Neviditelnost')
    .replace(/\{STUN\}/g, 'Omráčení')
    .replace(/\{POISON\}/g, 'Otrava')
    .replace(/\{WOUND\}/g, 'Krvácení')
    .replace(/\{MUDDLE\}/g, 'Zmatení')
    .replace(/\{IMMOBILIZE\}/g, 'Znehybnění')
    .replace(/\{CURSE\}/g, 'Prokletí')
    .replace(/\{STRENGTHEN\}/g, 'Posílení')
    .replace(/\{REGENERATE\}/g, 'Regenerace')
    .replace(/\{FLYING\}/g, 'Let')
    // Akce
    .replace(/\{MOVE\}/g, 'Pohyb')
    .replace(/\{ATTACK\}/g, 'Útok')
    .replace(/\{RANGE\}/g, 'Dosah')
    .replace(/\{HEAL\}/g, 'Léčení')
    .replace(/\{JUMP\}/g, 'Skok')
    .replace(/\{PUSH\}/g, 'Odtlačení')
    .replace(/\{PULL\}/g, 'Přitažení')
    .replace(/\{PIERCE\}/g, 'Průraz')
    .replace(/\{RETALIATE\}/g, 'Odveta')
    .replace(/\{RECOVER\}/g, 'Obnov')
    .replace(/\{REFRESH\}/g, 'Obnov')
    .replace(/\{TELEPORT\}/g, 'Teleportuj se')
    // Předměty / speciální
    .replace(/\{SMALL-ITEM\}/g, 'Drobnost')
    .replace(/\{CONSUMED\}/g, 'Spotřeba')
    .replace(/\{2X_WHITE\}/g, '2X')
    .replace(/\{\+0_WHITE\}/g, '+0')
    .replace(/\{LOOT\s+(\d+)\}/g, 'Kořist $1')
    .replace(/\{exp(\d+)\}/g, '$1 XP')
    .replace(/\{-1\}/g, '×(−1)')
    // Spotřeba živlů (X suffix) — kolečko s ✕ — MUSÍ být před živly!
    .replace(/\{FIRE_X\}/g, elDot('FIRE', true))
    .replace(/\{ICE_X\}/g, elDot('ICE', true))
    .replace(/\{WIND_X\}/g, elDot('WIND', true))
    .replace(/\{EARTH_X\}/g, elDot('EARTH', true))
    .replace(/\{LIGHT_X\}/g, elDot('LIGHT', true))
    .replace(/\{DARK_X\}/g, elDot('DARK', true))
    .replace(/\{ANY_X\}/g, elDot('ANY', true))
    // Živly — barevné kolečko
    .replace(/\{FIRE\}/g, elDot('FIRE'))
    .replace(/\{ICE\}/g, elDot('ICE'))
    .replace(/\{WIND\}/g, elDot('WIND'))
    .replace(/\{EARTH\}/g, elDot('EARTH'))
    .replace(/\{LIGHT\}/g, elDot('LIGHT'))
    .replace(/\{DARK\}/g, elDot('DARK'))
    .replace(/\{ANY\}/g, elDot('ANY'))
    // AOE vzory — konkrétní popis
    .replace(/\{(AOE\.[A-Z_0-9]+)\}/g, (_m, key: string) => aoeHexSvg(key))
    // Schopnosti tříd
    .replace(/\{AUGMENT\}/g, 'Vylepšení')
    .replace(/\{SONG\}/g, 'Píseň')
    .replace(/\{DOOM\}/g, 'Zkáza')
    .replace(/\{COMMAND\}/g, 'Příkaz')
  return translateClassAbbr(result)
}

// --- Detail modal ---
const detailItem = ref<ItemDefinition | null>(null)

// Lock body scroll when detail modal is open
watch(detailItem, (val) => {
  document.body.style.overflow = val ? 'hidden' : ''
})

function openDetail(item: ItemDefinition) {
  detailItem.value = item
}

// --- Buy / Add flow ---
const buyingItem = ref<ItemDefinition | null>(null)

// Lock body scroll when buy modal is open
watch(buyingItem, (val) => {
  // Only restore if detailItem isn't also open
  if (val) {
    document.body.style.overflow = 'hidden'
  } else if (!detailItem.value) {
    document.body.style.overflow = ''
  }
})
const buyForCharacter = ref('')
const buyMode = ref<'buy' | 'free'>('buy')

const buyPrice = computed(() => {
  if (!buyingItem.value) return 0
  return Math.max(0, buyingItem.value.cost + partyStore.shopPriceModifier)
})

const buyValidation = computed(() => {
  if (!buyingItem.value || !buyForCharacter.value) return { ok: false, reason: '', warning: '' }
  const itemId = String(buyingItem.value.id)
  const check = characterStore.canEquipItem(buyForCharacter.value, itemId)
  if (!check.ok) return { ok: false, reason: check.reason ?? '', warning: '' }
  if (buyMode.value === 'buy') {
    const char = characterStore.getCharacter(buyForCharacter.value)
    if (char && char.gold < buyPrice.value) return { ok: false, reason: 'Nedostatek zlaťáků', warning: '' }
  }
  return { ok: true, warning: check.warning ?? '' }
})

function openBuy(item: ItemDefinition, mode: 'buy' | 'free' = 'buy') {
  buyingItem.value = item
  buyForCharacter.value = ''
  buyMode.value = mode
}

function confirmBuy() {
  if (!buyingItem.value || !buyForCharacter.value) return
  const itemId = String(buyingItem.value.id)
  let ok: boolean
  if (buyMode.value === 'free') {
    ok = characterStore.addItemFree(buyForCharacter.value, itemId)
  } else {
    ok = characterStore.buyItem(buyForCharacter.value, itemId, partyStore.shopPriceModifier)
  }
  if (ok) {
    buyingItem.value = null
    buyForCharacter.value = ''
  }
}
</script>

<template>
  <div v-if="campaignStore.hasCampaign" class="max-w-6xl mx-auto">
    <div class="gh-page-header">
      <h1 class="font-display text-2xl font-bold text-gh-primary tracking-wide">Předměty</h1>
    </div>

    <!-- Filters -->
    <div class="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-3 mb-5">
      <div class="relative">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <input
          v-model="search"
          type="text"
          placeholder="Hledat předmět..."
          class="gh-input w-full !pl-10"
        />
      </div>
      <select v-model="filterSlot" class="gh-input min-w-[140px]">
        <option value="all">Všechny sloty</option>
        <option v-for="(label, key) in slotLabels" :key="key" :value="key">
          {{ label }}
        </option>
      </select>
      <select v-model="filterSource" class="gh-input min-w-[160px]">
        <option value="all">Všechny zdroje</option>
        <option v-for="s in sources" :key="s" :value="s">{{ translateSource(s) }}</option>

      </select>
    </div>

    <!-- Toggle & Stats -->
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
      <div class="flex gap-5 text-sm">
        <span class="text-gray-600">Celkem: <span class="text-gray-400">{{ stats.total }}</span></span>
        <span class="text-green-500/60">Dostupné: <span class="text-green-400">{{ stats.available }}</span></span>
        <span v-if="stats.shown !== stats.total" class="text-blue-500/60">Zobrazeno: <span class="text-blue-400">{{ stats.shown }}</span></span>
      </div>
      <label class="flex items-center gap-2 text-sm cursor-pointer transition-colors" :class="campaignStore.hideSpoilers ? 'text-gh-primary' : 'text-gray-400 hover:text-gray-300'">
        <input
          v-model="showOnlyAvailable"
          type="checkbox"
          class="accent-gh-primary"
          :disabled="campaignStore.hideSpoilers"
          :checked="showOnlyAvailable || campaignStore.hideSpoilers"
        />
        Jen dostupné
        <span v-if="campaignStore.hideSpoilers" class="text-[10px] text-gh-primary/60">(spoiler mód)</span>
      </label>
    </div>

    <!-- Items Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div
        v-for="item in filteredItems"
        :key="item.id"
        class="item-card group cursor-pointer"
        :class="{ 'unavailable': !isItemAvailable(item) }"
        @click="openDetail(item)"
      >
        <!-- Card photo -->
        <div class="item-card-photo">
          <img
            :src="`/img/items/${item.id}.jpg?v=3`"
            :alt="item.name"
            class="w-full h-32 object-cover rounded-t-xl"
            loading="lazy"
            @error="($event.target as HTMLImageElement).style.display = 'none'"
          />
        </div>

        <!-- Card header - parchment style -->
        <div class="item-card-header">
          <div class="flex items-center justify-between mb-2">
            <!-- Item ID + Slot icon -->
            <div class="flex items-center gap-2">
              <span class="font-display text-base font-bold text-gh-primary/80">{{ item.id }}</span>
              <div class="flex items-center gap-1.5" :title="slotLabels[item.slot]">
                <SlotIcon :slot="item.slot" :size="20" class="text-amber-600/70" />
                <span class="text-[10px] text-gray-500">{{ slotLabels[item.slot] }}</span>
              </div>
            </div>
            <!-- Price coin -->
            <div class="item-price" :title="item.cost + ' zlaťáků'">
              <span>{{ item.cost }}</span>
            </div>
          </div>

          <!-- Item name -->
          <h3 class="font-display text-[13px] font-bold text-item-name tracking-wide leading-snug">
            {{ item.name }}
          </h3>
        </div>

        <!-- Card body - description -->
        <div class="item-card-body">
          <p class="text-[12px] text-gray-300 leading-relaxed" v-html="translateDescription(item.description)"></p>
        </div>

        <!-- Card footer -->
        <div class="item-card-footer">
          <!-- Top row: source + count -->
          <div class="flex items-center justify-between mb-1">
            <span class="text-[10px] text-gray-500">{{ item.source.split('\n').map(s => translateSource(s.trim())).join(' · ') }}</span>
            <span class="text-[10px] text-gray-500">{{ item.count }}x ve hře</span>
          </div>
          <!-- Bottom row: usage type icons -->
          <div v-if="item.spent || item.consumed" class="flex items-center gap-3 mt-1">
            <div v-if="item.spent" class="flex items-center gap-1" title="Obnova - po odpočinku se vrátí">
              <!-- Refresh/recycle icon -->
              <svg class="w-3.5 h-3.5 text-blue-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182M2.985 19.644l3.181-3.183" />
              </svg>
              <span class="text-[10px] text-blue-400/60">Obnova</span>
            </div>
            <div v-if="item.consumed" class="flex items-center gap-1" title="Spotřeba - po použití zmizí">
              <!-- X/consumed icon -->
              <svg class="w-3.5 h-3.5 text-red-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <span class="text-[10px] text-red-400/60">Spotřeba</span>
            </div>
          </div>
        </div>

        <!-- FAQ section -->
        <div v-if="item.faq" class="item-card-faq">
          <div class="flex items-start gap-1.5">
            <svg class="w-3 h-3 text-amber-400/50 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
            </svg>
            <p class="text-[10px] text-amber-400/40 italic leading-relaxed">{{ item.faq }}</p>
          </div>
        </div>

        <!-- Buy section -->
        <div class="item-card-buy">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1 flex-wrap min-h-[20px]">
              <span
                v-for="owner in characterStore.getItemOwners(String(item.id))"
                :key="owner.uuid"
                class="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.06] text-gray-400 border border-white/[0.05]"
              >
                {{ owner.playerName }}
              </span>
              <span class="text-[9px] text-gray-600">
                {{ characterStore.getAvailableCount(String(item.id)) }}/{{ item.count }} volných
              </span>
            </div>
            <div v-if="characterStore.activeCharacters.length > 0 && characterStore.getAvailableCount(String(item.id)) > 0" class="flex gap-1.5 shrink-0">
              <button
                class="text-[10px] font-semibold py-1 px-2.5 rounded-md transition-all bg-gh-primary/20 text-gh-primary hover:bg-gh-primary/30 border border-gh-primary/30"
                @click.stop="openBuy(item, 'buy')"
              >
                Koupit
              </button>
              <button
                class="text-[10px] py-1 px-2 rounded-md transition-all text-gray-500 hover:text-gray-300 hover:bg-white/[0.06] border border-white/[0.05]"
                @click.stop="openBuy(item, 'free')"
                title="Přidat zdarma (odměna ze scénáře, eventu...)"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Detail modal -->
    <Teleport to="body">
      <div v-if="detailItem" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm" @click.self="detailItem = null">
        <div class="detail-modal w-full max-h-[85vh] rounded-t-2xl sm:rounded-2xl sm:max-w-lg mx-0 sm:mx-4 overflow-y-auto overscroll-contain" @keydown.escape="detailItem = null">
          <!-- Swipe indicator (mobile) -->
          <div class="flex justify-center pt-3 pb-1 sm:hidden" @click="detailItem = null">
            <div class="w-10 h-1 rounded-full bg-white/20"></div>
          </div>

          <!-- Item photo in detail -->
          <div class="flex justify-center px-6 pt-2">
            <img
              :src="`/img/items/${detailItem.id}.jpg?v=3`"
              :alt="detailItem.name"
              class="max-h-64 rounded-xl shadow-lg"
              loading="lazy"
              @error="($event.target as HTMLImageElement).style.display = 'none'"
            />
          </div>

          <!-- Header -->
          <div class="detail-header">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-3">
                <span class="font-display text-2xl font-bold text-gh-primary/80">{{ detailItem.id }}</span>
                <div class="flex items-center gap-2">
                  <SlotIcon :slot="detailItem.slot" :size="26" class="text-amber-600/70" />
                  <span class="text-sm text-gray-400">{{ slotLabels[detailItem.slot] }}</span>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="detail-price">
                  <span>{{ detailItem.cost }}</span>
                </div>
                <button
                  class="w-8 h-8 flex items-center justify-center rounded-full bg-white/[0.08] text-gray-400 hover:text-white hover:bg-white/[0.15] transition-all"
                  @click="detailItem = null"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <h2 class="font-display text-xl font-bold text-item-name tracking-wide">
              {{ detailItem.name }}
            </h2>
          </div>

          <!-- Description -->
          <div class="detail-body">
            <p class="text-sm text-gray-200 leading-relaxed" v-html="translateDescription(detailItem.description)"></p>
          </div>

          <!-- FAQ -->
          <div v-if="detailItem.faq" class="detail-faq">
            <div class="flex items-start gap-2">
              <svg class="w-4 h-4 text-amber-400/50 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
              </svg>
              <p class="text-xs text-amber-400/50 italic leading-relaxed">{{ detailItem.faq }}</p>
            </div>
          </div>

          <!-- Info rows -->
          <div class="detail-info">
            <!-- Source -->
            <div class="detail-row">
              <span class="detail-label">Zdroj</span>
              <span class="detail-value">{{ detailItem.source.split('\n').map(s => translateSource(s.trim())).join(' · ') }}</span>
            </div>

            <!-- Count -->
            <div class="detail-row">
              <span class="detail-label">Ve hře</span>
              <span class="detail-value">{{ detailItem.count }}× &nbsp;({{ characterStore.getAvailableCount(String(detailItem.id)) }} volných)</span>
            </div>

            <!-- Usage type -->
            <div v-if="detailItem.spent || detailItem.consumed" class="detail-row">
              <span class="detail-label">Typ použití</span>
              <div class="flex items-center gap-3">
                <div v-if="detailItem.spent" class="flex items-center gap-1.5">
                  <svg class="w-4 h-4 text-blue-400/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182M2.985 19.644l3.181-3.183" />
                  </svg>
                  <span class="text-sm text-blue-400/70">Obnova</span>
                </div>
                <div v-if="detailItem.consumed" class="flex items-center gap-1.5">
                  <svg class="w-4 h-4 text-red-400/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  <span class="text-sm text-red-400/70">Spotřeba</span>
                </div>
              </div>
            </div>

            <!-- Owners -->
            <div class="detail-row">
              <span class="detail-label">Vlastníci</span>
              <div class="flex items-center gap-2 flex-wrap">
                <span
                  v-for="owner in characterStore.getItemOwners(String(detailItem.id))"
                  :key="owner.uuid"
                  class="text-xs px-2 py-0.5 rounded bg-white/[0.06] text-gray-300 border border-white/[0.05]"
                >
                  {{ owner.playerName }}
                </span>
                <span v-if="characterStore.getItemOwners(String(detailItem.id)).length === 0" class="text-xs text-gray-600">
                  Nikdo
                </span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div v-if="characterStore.activeCharacters.length > 0 && characterStore.getAvailableCount(String(detailItem.id)) > 0" class="detail-actions">
            <button
              class="gh-btn-primary text-sm flex-1"
              @click="detailItem && openBuy(detailItem, 'buy'); detailItem = null"
            >
              Koupit ({{ Math.max(0, detailItem.cost + partyStore.shopPriceModifier) }} zl.)
            </button>
            <button
              class="gh-btn-secondary text-sm"
              @click="detailItem && openBuy(detailItem, 'free'); detailItem = null"
            >
              Přidat zdarma
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Buy modal -->
    <Teleport to="body">
      <div v-if="buyingItem" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" @click.self="buyingItem = null">
        <div class="gh-card p-6 max-w-sm w-full mx-4 border border-gh-primary/20">
          <h3 class="font-display text-lg text-gh-primary mb-1">
            {{ buyMode === 'free' ? 'Přidat předmět' : 'Koupit předmět' }}
          </h3>
          <p class="font-display text-sm text-gray-300 mb-4">{{ buyingItem.name }}</p>

          <div v-if="buyMode === 'buy'" class="flex items-center gap-2 mb-4">
            <span class="text-sm text-gray-400">Cena:</span>
            <span class="font-display font-bold text-yellow-400">{{ buyPrice }} zl.</span>
            <span v-if="partyStore.shopPriceModifier !== 0" class="text-[10px] text-gray-600">
              ({{ buyingItem.cost }} {{ partyStore.shopPriceModifier >= 0 ? '+' : '' }}{{ partyStore.shopPriceModifier }})
            </span>
          </div>
          <p v-else class="text-xs text-gray-500 mb-4">
            Odměna ze scénáře, eventu nebo jiného zdroje (bez platby)
          </p>

          <select v-model="buyForCharacter" class="gh-input w-full mb-3">
            <option value="" disabled>Vyberte postavu...</option>
            <option
              v-for="c in characterStore.activeCharacters"
              :key="c.uuid"
              :value="c.uuid"
            >
              {{ c.playerName }} ({{ c.gold }} zl.)
            </option>
          </select>

          <p v-if="buyForCharacter && buyValidation.reason" class="text-red-400 text-xs mb-3">
            {{ buyValidation.reason }}
          </p>
          <p v-if="buyForCharacter && buyValidation.warning" class="text-yellow-400/80 text-xs mb-3">
            {{ buyValidation.warning }}
          </p>

          <div class="flex gap-2 mt-4">
            <button
              class="gh-btn-primary flex-1 text-sm"
              :disabled="!buyValidation.ok"
              :class="{ 'opacity-40 cursor-not-allowed': !buyValidation.ok }"
              @click="confirmBuy"
            >
              {{ buyMode === 'free' ? 'Přidat' : 'Potvrdit nákup' }}
            </button>
            <button class="gh-btn-ghost text-sm" @click="buyingItem = null">
              Zrušit
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Empty state -->
    <div v-if="filteredItems.length === 0" class="text-center py-16">
      <div class="inline-block p-4 rounded-2xl bg-white/[0.02] mb-4">
        <svg class="w-12 h-12 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
          <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
      </div>
      <p class="text-gray-500 font-display tracking-wide">Žádné předměty neodpovídají filtru</p>
    </div>
  </div>
</template>

<style scoped>
/* Item card - inspired by real Gloomhaven item cards */
.item-card {
  border-radius: 0.75rem;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(120, 90, 40, 0.18);
  background: linear-gradient(180deg, #1c1710 0%, #13112a 40%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.item-card:hover {
  border-color: rgba(196, 163, 90, 0.35);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4), 0 0 25px rgba(196, 163, 90, 0.07);
  transform: translateY(-2px);
}

.item-card.unavailable {
  opacity: 0.5;
  filter: grayscale(0.3);
}
.item-card.unavailable:hover {
  transform: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

/* Parchment-style header */
.item-card-header {
  padding: 0.75rem 0.875rem 0.5rem;
  background:
    linear-gradient(180deg,
      rgba(180, 140, 70, 0.10) 0%,
      rgba(140, 105, 50, 0.04) 100%
    );
  border-bottom: 1px solid rgba(120, 90, 40, 0.10);
  position: relative;
}

.item-card-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 10%;
  right: 10%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(196, 163, 90, 0.15), transparent);
}

.text-item-name {
  color: #d4c4a0;
}

/* Gold coin price */
.item-price {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #d4a843, #8b6914);
  color: #1a1000;
  font-family: 'Cinzel', Georgia, serif;
  font-weight: 700;
  font-size: 0.75rem;
  box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.3), 0 2px 4px rgba(0, 0, 0, 0.4);
  border: 1.5px solid rgba(180, 140, 50, 0.5);
  flex-shrink: 0;
}

/* Description body */
.item-card-body {
  padding: 0.625rem 0.875rem;
  flex: 1;
  background: linear-gradient(180deg, rgba(19, 17, 42, 0.5) 0%, rgba(19, 17, 42, 0.9) 100%);
}

/* Footer with wood-like tint */
.item-card-footer {
  padding: 0.5rem 0.875rem;
  background: linear-gradient(180deg, rgba(60, 40, 20, 0.12) 0%, rgba(50, 30, 15, 0.20) 100%);
  border-top: 1px solid rgba(120, 90, 40, 0.08);
}

/* FAQ section */
.item-card-faq {
  padding: 0.5rem 0.75rem;
  background: rgba(120, 90, 40, 0.03);
  border-top: 1px solid rgba(120, 90, 40, 0.06);
}

/* Buy section */
.item-card-buy {
  padding: 0.5rem 0.875rem;
  border-top: 1px solid rgba(120, 90, 40, 0.08);
  background: linear-gradient(180deg, rgba(40, 30, 15, 0.10) 0%, rgba(30, 20, 10, 0.18) 100%);
}

/* ===== Detail Modal ===== */
.detail-modal {
  position: relative;
  max-width: 28rem;
  width: 100%;
  border-radius: 1rem;
  overflow: hidden;
  border: 1px solid rgba(196, 163, 90, 0.25);
  background: linear-gradient(180deg, #1c1710 0%, #13112a 30%, #0f0c1e 100%);
  box-shadow:
    0 0 60px rgba(196, 163, 90, 0.08),
    0 25px 60px rgba(0, 0, 0, 0.6);
  animation: detail-in 0.2s ease-out;
}

@keyframes detail-in {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.detail-header {
  padding: 1.25rem 1.5rem 1rem;
  background:
    linear-gradient(180deg,
      rgba(180, 140, 70, 0.12) 0%,
      rgba(140, 105, 50, 0.04) 100%
    );
  border-bottom: 1px solid rgba(120, 90, 40, 0.12);
}

.detail-price {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #d4a843, #8b6914);
  color: #1a1000;
  font-family: 'Cinzel', Georgia, serif;
  font-weight: 700;
  font-size: 1rem;
  box-shadow: inset 0 1px 3px rgba(255, 255, 255, 0.3), 0 3px 8px rgba(0, 0, 0, 0.5);
  border: 2px solid rgba(180, 140, 50, 0.5);
  flex-shrink: 0;
}

.detail-body {
  padding: 1rem 1.5rem;
}

.detail-faq {
  padding: 0.75rem 1.5rem;
  background: rgba(120, 90, 40, 0.04);
  border-top: 1px solid rgba(120, 90, 40, 0.08);
}

.detail-info {
  padding: 0.75rem 1.5rem;
  border-top: 1px solid rgba(120, 90, 40, 0.08);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-row {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
}

.detail-label {
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #64748b;
  min-width: 5.5rem;
  flex-shrink: 0;
}

.detail-value {
  font-size: 0.8125rem;
  color: #cbd5e1;
}

.detail-actions {
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(120, 90, 40, 0.10);
  display: flex;
  gap: 0.75rem;
  background: linear-gradient(180deg, rgba(40, 30, 15, 0.08) 0%, rgba(30, 20, 10, 0.15) 100%);
}
</style>
