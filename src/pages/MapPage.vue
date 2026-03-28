<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useCampaignStore } from '@/stores/campaignStore'
import { useScenarioStore } from '@/stores/scenarioStore'
import { useAchievementStore } from '@/stores/achievementStore'
import { ScenarioStatus } from '@/models/types'
import panzoom from 'panzoom'
import type { PanZoom } from 'panzoom'

const router = useRouter()
const campaignStore = useCampaignStore()
const scenarioStore = useScenarioStore()
const achievementStore = useAchievementStore()

const mapContainer = ref<HTMLElement | null>(null)
const mapElement = ref<HTMLElement | null>(null)
let pz: PanZoom | null = null

const selectedId = ref<string | null>(null)
const selectedAchievement = ref<{ id: string; parentId: string; file: string; name: string } | null>(null)

// Map settings from reference repo (GH map)
const MAP_WIDTH = 2606
const MAP_HEIGHT = 2155
const MAP_Y_OFFSET = 184

// Sticker scale from reference project (133x90 stickers scaled to ~105x71)
const STICKER_SCALE = 0.79

onMounted(async () => {
  if (!campaignStore.hasCampaign) {
    router.push('/kampan')
    return
  }
  await scenarioStore.loadScenarioData()
  await nextTick()
  initPanzoom()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  pz?.dispose()
  pz = null
  window.removeEventListener('resize', handleResize)
})

function initPanzoom() {
  if (!mapElement.value) return
  const minZoom = getMinZoom()
  pz = panzoom(mapElement.value, {
    minZoom,
    maxZoom: 4,
    bounds: true,
    boundsPadding: 0.1,
    beforeTouch: function(e: TouchEvent) {
      // Return true to cancel panzoom handling — lets click fire on sticker images
      const target = e.target as HTMLElement
      return target.tagName === 'IMG' && target.classList.contains('cursor-pointer')
    },
  })
  centerMap()
}

function getMinZoom(): number {
  if (!mapContainer.value) return 0.3
  const isLandscape = window.innerWidth > window.innerHeight
  if (isLandscape) {
    return mapContainer.value.clientHeight / MAP_WIDTH
  }
  return mapContainer.value.clientWidth / MAP_WIDTH
}

function centerMap() {
  if (!pz || !mapContainer.value) return
  const scale = getMinZoom()
  pz.zoomTo(0, 0, scale)

  const yOffset = MAP_Y_OFFSET * scale
  const isLandscape = window.innerWidth > window.innerHeight
  if (isLandscape) {
    const mapWidth = MAP_WIDTH * scale
    const x = (mapContainer.value.clientWidth - mapWidth) / 2
    pz.moveTo(x, yOffset + 20 / scale)
  } else {
    const mapHeight = MAP_HEIGHT * scale
    const y = (mapContainer.value.clientHeight - mapHeight) / 2
    pz.moveTo(0, y + yOffset)
  }
}

function handleResize() {
  if (!pz) return
  pz.setMinZoom(getMinZoom())
  centerMap()
}

// Visible scenarios: completed, available, attempted — not locked/hidden
const visibleScenarios = computed(() =>
  scenarioStore.allScenarios.filter((s) => {
    const status = s.computedStatus
    return (
      s.coordinates.x > 0 &&
      s.coordinates.y > 0 &&
      status !== ScenarioStatus.LOCKED &&
      status !== ScenarioStatus.HIDDEN
    )
  })
)

const selectedScenario = computed(() => {
  if (!selectedId.value) return null
  return scenarioStore.allScenarios.find((s) => s.id === selectedId.value) ?? null
})

const mapRequirementLabels = computed(() => {
  const s = selectedScenario.value
  if (!s?.requiredBy?.length) return [] as { text: string; met: boolean }[]
  return s.requiredBy.flatMap((cond) => {
    const labels: { text: string; met: boolean }[] = []
    for (const id of cond.complete ?? []) {
      if (/^\d+$/.test(id)) {
        const name = scenarioStore.getDefinition(id)?.nameCz ?? scenarioStore.getDefinition(id)?.name ?? `#${id}`
        const met = scenarioStore.getScenarioStatus(id) === ScenarioStatus.COMPLETED
        labels.push({ text: `Scénář #${id} ${name}`, met })
      } else {
        const name = achievementStore.getName(id)
        const met = achievementStore.isGlobalAchieved(id) || achievementStore.isPartyAchieved(id)
        labels.push({ text: name, met })
      }
    }
    for (const id of cond.incomplete ?? []) {
      if (/^\d+$/.test(id)) {
        const name = scenarioStore.getDefinition(id)?.nameCz ?? scenarioStore.getDefinition(id)?.name ?? `#${id}`
        const met = scenarioStore.getScenarioStatus(id) !== ScenarioStatus.COMPLETED
        labels.push({ text: `Bez #${id} ${name}`, met })
      } else {
        const name = achievementStore.getName(id)
        const met = !(achievementStore.isGlobalAchieved(id) || achievementStore.isPartyAchieved(id))
        labels.push({ text: `Bez: ${name}`, met })
      }
    }
    return labels
  })
})

// Achievement sticker mapping: our_id -> { file, x (% position on map) }
// Positions from reference project (gloomhaven-storyline)
const ACHIEVEMENT_STICKERS: Record<string, { file: string; x: number }> = {
  // Base Gloomhaven
  the_drake_slain:        { file: 'GTDS', x: 12.389 },
  the_drake_aided:        { file: 'GTDA', x: 12.389 },
  the_voice_freed:        { file: 'GTVF', x: 16.8681 },
  the_voice_silenced:     { file: 'GTVS', x: 16.8681 },
  city_rule_economic:     { file: 'GCRE', x: 21.2519 },
  city_rule_militaristic: { file: 'GCRM', x: 21.2519 },
  city_rule_demonic:      { file: 'GCRD', x: 21.2519 },
  the_artifact_recovered: { file: 'GAR',  x: 26.0169 },
  the_artifact_recovered_2: { file: 'GAR2', x: 26.0169 },
  the_artifact_lost:      { file: 'GAL',  x: 26.0169 },
  the_artifact_cleansed:  { file: 'GAC',  x: 26.0169 },
  the_merchant_flees:     { file: 'GTMF', x: 30.8772 },
  the_dead_invade:        { file: 'GTDI', x: 36.0234 },
  the_edge_of_darkness:   { file: 'GTED', x: 40.7884 },
  the_power_of_enhancement: { file: 'GTPE', x: 45.4581 },
  water_breathing:        { file: 'GWB',  x: 50.3184 },
  the_rift_neutralized:   { file: 'GTRN', x: 55.1787 },
  end_of_the_invasion:    { file: 'GEOI', x: 59.2766 },
  geoc:                   { file: 'GEOC', x: 64.5181 },
  end_of_corruption_2:    { file: 'GEOC2', x: 64.5181 },
  end_of_corruption_3:    { file: 'GEOC3', x: 64.5181 },
  end_of_gloom:           { file: 'GEOG', x: 69.9502 },
  ancient_technology:     { file: 'GAT',  x: 74.334 },
  gat2:                   { file: 'GAT2', x: 74.334 },
  gat3:                   { file: 'GAT3', x: 74.334 },
  gat4:                   { file: 'GAT4', x: 74.334 },
  gat5:                   { file: 'GAT5', x: 74.334 },
  gaoo:                   { file: 'GAOO', x: 79.7661 },
  // Forgotten Circles DLC
  gttp:                   { file: 'GTTP', x: 84.6 },
  gst:                    { file: 'GST',  x: 84.6 },
  gkip:                   { file: 'GKIP', x: 88.4 },
  gkip2:                  { file: 'GKIP2', x: 88.4 },
  gkip3:                  { file: 'GKIP3', x: 88.4 },
  gkip4:                  { file: 'GKIP4', x: 88.4 },
  gpa:                    { file: 'GPA',  x: 92.8 },
  gpa2:                   { file: 'GPA2', x: 92.8 },
  gpa3:                   { file: 'GPA3', x: 92.8 },
  gpa4:                   { file: 'GPA4', x: 92.8 },
  gpoa:                   { file: 'GPOA', x: 96.6 },
  gpoa2:                  { file: 'GPOA2', x: 96.6 },
  gpoa3:                  { file: 'GPOA3', x: 96.6 },
  gms:                    { file: 'GMS',  x: 96.6 },
}

// Compute visible achievement stickers (only achieved, show highest upgrade)
const visibleAchievementStickers = computed(() => {
  const stickers: { id: string; parentId: string; file: string; x: number; name: string; upgradeLevel: number; upgradeMax: number }[] = []
  const usedPositions = new Set<number>()

  for (const def of achievementStore.globalDefinitions) {
    if (!achievementStore.isGlobalAchieved(def.id)) continue
    if (def.hidden) continue

    const mapping = ACHIEVEMENT_STICKERS[def.id]
    if (!mapping) continue

    // For upgradeable achievements, find the highest achieved upgrade
    let activeFile = mapping.file
    let activeId = def.id
    if (def.upgrades?.length) {
      for (const upgradeId of [...def.upgrades].reverse()) {
        if (achievementStore.isGlobalAchieved(upgradeId) && ACHIEVEMENT_STICKERS[upgradeId]) {
          activeFile = ACHIEVEMENT_STICKERS[upgradeId].file
          activeId = upgradeId
          break
        }
      }
    }

    // Skip if another achievement at this position is already shown (group exclusivity)
    if (usedPositions.has(mapping.x)) continue
    usedPositions.add(mapping.x)

    // Calculate upgrade level
    let upgradeLevel = 0
    let upgradeMax = 0
    if (def.upgrades?.length) {
      upgradeLevel = 1
      for (const uid of def.upgrades) {
        if (achievementStore.isGlobalAchieved(uid)) upgradeLevel++
      }
      upgradeMax = def.upgrades.length + 1
    }

    stickers.push({
      id: activeId,
      parentId: def.id,
      file: activeFile,
      x: mapping.x,
      name: def.name,
      upgradeLevel,
      upgradeMax,
    })
  }

  return stickers
})

// Czech sticker versions available
const CZ_STICKERS = new Set([
  'GTDS', 'GTDA', 'GTVS', 'GTVF', 'GCRM', 'GCRE', 'GCRD',
  'GAR', 'GAR2', 'GAL', 'GAC', 'GTMF', 'GTDI', 'GTPE', 'GTRN',
  'GEOI', 'GEOC', 'GEOG', 'GAT', 'GWB', 'GTED', 'GAOO',
])

// Map upgrade files back to their base sticker for Czech version
const UPGRADE_TO_BASE: Record<string, string> = {
  GAT2: 'GAT', GAT3: 'GAT', GAT4: 'GAT', GAT5: 'GAT',
  GEOC2: 'GEOC', GEOC3: 'GEOC',
  GKIP2: 'GKIP', GKIP3: 'GKIP', GKIP4: 'GKIP',
  GPA2: 'GPA', GPA3: 'GPA', GPA4: 'GPA',
  GPOA2: 'GPOA', GPOA3: 'GPOA',
}

function achievementStickerSrc(file: string): string {
  // Try Czech version of this file or its base
  if (CZ_STICKERS.has(file)) return `/img/achievements/${file}_cz.png`
  const base = UPGRADE_TO_BASE[file]
  if (base && CZ_STICKERS.has(base)) return `/img/achievements/${base}_cz.png`
  return `/img/achievements/${file}.png`
}

function stickerSrc(id: string, status: ScenarioStatus): string {
  const suffix = status === ScenarioStatus.COMPLETED ? '_c' : ''
  return `/img/stickers/${id}${suffix}.png?v=1`
}

function statusGlow(status: ScenarioStatus): string {
  switch (status) {
    case ScenarioStatus.COMPLETED: return 'drop-shadow(0 0 6px rgba(34,197,94,0.6))'
    case ScenarioStatus.AVAILABLE: return 'drop-shadow(0 0 6px rgba(196,163,90,0.5))'
    case ScenarioStatus.ATTEMPTED: return 'drop-shadow(0 0 6px rgba(245,158,11,0.5))'
    case ScenarioStatus.BLOCKED: return 'drop-shadow(0 0 6px rgba(239,68,68,0.5))'
    case ScenarioStatus.REQUIRED: return 'drop-shadow(0 0 6px rgba(168,85,247,0.5))'
    default: return ''
  }
}

function markerColor(status: ScenarioStatus): string {
  switch (status) {
    case ScenarioStatus.COMPLETED: return '#22c55e'
    case ScenarioStatus.AVAILABLE: return '#c4a35a'
    case ScenarioStatus.ATTEMPTED: return '#f59e0b'
    case ScenarioStatus.BLOCKED: return '#ef4444'
    case ScenarioStatus.REQUIRED: return '#a855f7'
    default: return '#6b7280'
  }
}

const statusLabels: Record<string, string> = {
  [ScenarioStatus.COMPLETED]: 'Dokončeno',
  [ScenarioStatus.AVAILABLE]: 'Dostupné',
  [ScenarioStatus.ATTEMPTED]: 'Pokus',
  [ScenarioStatus.BLOCKED]: 'Blokováno',
  [ScenarioStatus.REQUIRED]: 'Vyžadováno',
  [ScenarioStatus.LOCKED]: 'Zamčeno',
}

function onMarkerClick(id: string) {
  selectedAchievement.value = null
  selectedId.value = selectedId.value === id ? null : id
}

function goToScenarios(id: string) {
  router.push({ path: '/scenare', query: { open: id } })
}

function onAchievementClick(a: { id: string; parentId: string; file: string; name: string }) {
  selectedId.value = null
  selectedAchievement.value = selectedAchievement.value?.parentId === a.parentId ? null : a
}

function achievementUpgradeLevel(parentId: string): { current: number; max: number } | null {
  const def = achievementStore.globalDefinitions.find(d => d.id === parentId)
  if (!def?.upgrades?.length) return null
  let level = achievementStore.isGlobalAchieved(def.id) ? 1 : 0
  for (const uid of def.upgrades) {
    if (achievementStore.isGlobalAchieved(uid)) level++
  }
  return { current: level, max: def.upgrades.length + 1 }
}
</script>

<template>
  <div
    v-if="campaignStore.hasCampaign"
    ref="mapContainer"
    class="relative w-full overflow-hidden bg-gh-dark map-height"
    @click="selectedId = null; selectedAchievement = null"
  >
    <!-- Pan-zoom map -->
    <div
      ref="mapElement"
      class="relative"
      :style="{ width: MAP_WIDTH + 'px', height: MAP_HEIGHT + 'px' }"
    >
      <!-- Map image -->
      <img
        src="/img/maps/gh-map.jpg"
        alt="Mapa Gloomhavenu"
        class="absolute left-0 pointer-events-none select-none"
        draggable="false"
        :style="{ top: -MAP_Y_OFFSET + 'px', width: '100%' }"
      />

      <!-- Global achievement stickers -->
      <div
        v-for="a in visibleAchievementStickers"
        :key="'ach-' + a.id"
        class="absolute select-none cursor-pointer transition-transform duration-150 hover:scale-110"
        :style="{
          left: a.x + '%',
          top: '-174px',
          width: '108px',
          zIndex: 5,
        }"
        @click.stop="onAchievementClick(a)"
        @touchend.stop.prevent="onAchievementClick(a)"
      >
        <img
          :src="achievementStickerSrc(a.file)"
          :alt="a.name"
          :title="a.name"
          class="w-full"
        />
      </div>

      <!-- Scenario stickers (positioned exactly like reference project) -->
      <img
        v-for="s in visibleScenarios"
        :key="s.id"
        :src="stickerSrc(s.id, s.computedStatus)"
        :alt="s.displayName"
        class="absolute cursor-pointer transition-transform duration-150 hover:scale-110"
        :style="{
          left: s.coordinates.x + '%',
          top: s.coordinates.y + '%',
          transform: 'scale(' + STICKER_SCALE + ')',
          filter: statusGlow(s.computedStatus),
          zIndex: selectedId === s.id ? 30 : 10,
        }"
        @click.stop="onMarkerClick(s.id)"
        @touchend.stop.prevent="onMarkerClick(s.id)"
      />
    </div>

    <!-- Tooltip popup -->
    <Teleport to="body">
      <transition name="popup">
        <div
          v-if="selectedScenario"
          class="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] w-[min(360px,calc(100vw-2rem))]"
          @click.stop
        >
          <div class="gh-card p-4 relative overflow-hidden shadow-2xl border border-white/[0.08]">
            <!-- Status accent -->
            <div
              class="absolute left-0 top-0 bottom-0 w-[3px]"
              :style="{ backgroundColor: markerColor(selectedScenario.computedStatus) }"
            />

            <!-- Header -->
            <div class="flex items-start justify-between gap-3 mb-2">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-display text-gh-primary text-lg font-bold">#{{ selectedScenario.id }}</span>
                  <span
                    class="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    :style="{
                      backgroundColor: markerColor(selectedScenario.computedStatus) + '20',
                      color: markerColor(selectedScenario.computedStatus),
                    }"
                  >
                    {{ statusLabels[selectedScenario.computedStatus] ?? selectedScenario.computedStatus }}
                  </span>
                </div>
                <h3 class="text-sm font-semibold text-gray-200">{{ selectedScenario.displayName }}</h3>
                <span v-if="selectedScenario.location" class="text-[11px] text-gray-500">{{ selectedScenario.location }}</span>
              </div>
              <button
                class="p-1 text-gray-600 hover:text-gray-300 transition-colors shrink-0"
                @click="selectedId = null"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Rewards preview -->
            <div v-if="selectedScenario.rewards.gold || selectedScenario.rewards.xp" class="flex gap-2 mb-3">
              <span v-if="selectedScenario.rewards.gold" class="text-[10px] text-yellow-400 bg-yellow-900/20 px-2 py-0.5 rounded border border-yellow-800/30">
                {{ selectedScenario.rewards.gold }} zl. {{ selectedScenario.rewards.goldType === 'collective' ? 'celkem' : 'každý' }}
              </span>
              <span v-if="selectedScenario.rewards.xp" class="text-[10px] text-blue-400 bg-blue-900/20 px-2 py-0.5 rounded border border-blue-800/30">
                {{ selectedScenario.rewards.xp }} ZK
              </span>
            </div>

            <!-- Requirements -->
            <div v-if="mapRequirementLabels.length > 0" class="mb-3">
              <div v-for="(req, i) in mapRequirementLabels" :key="i" class="flex items-center gap-1.5 text-[11px] py-0.5">
                <svg v-if="req.met" class="w-3 h-3 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <svg v-else class="w-3 h-3 text-yellow-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
                <span :class="req.met ? 'text-green-400/80' : 'text-yellow-400/80'">{{ req.text }}</span>
              </div>
            </div>

            <!-- Summary -->
            <p v-if="selectedScenario.summary" class="text-xs text-gray-400 leading-relaxed line-clamp-2 mb-3">
              {{ selectedScenario.summary }}
            </p>

            <!-- Action -->
            <button
              class="w-full text-xs text-gh-primary hover:text-gh-primary-light py-2 rounded-lg bg-gh-primary/10 hover:bg-gh-primary/15 transition-all font-medium"
              @click="goToScenarios(selectedScenario?.id ?? '')"
            >
              Zobrazit detail
            </button>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- Achievement popup -->
    <Teleport to="body">
      <transition name="popup">
        <div
          v-if="selectedAchievement"
          class="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] w-[min(340px,calc(100vw-2rem))]"
          @click.stop
        >
          <div class="gh-card p-4 relative overflow-hidden shadow-2xl border border-white/[0.08]">
            <div class="absolute left-0 top-0 bottom-0 w-[3px] bg-green-500" />

            <div class="flex items-start gap-3 mb-3">
              <img
                :src="achievementStickerSrc(selectedAchievement.file)"
                :alt="selectedAchievement.name"
                class="w-12 shrink-0"
              />
              <div class="flex-1 min-w-0">
                <h3 class="text-sm font-semibold text-gray-200">{{ selectedAchievement.name }}</h3>
                <span class="text-[10px] px-2 py-0.5 rounded-full font-medium bg-green-500/20 text-green-400">
                  Splněno
                </span>
                <div v-if="achievementUpgradeLevel(selectedAchievement.parentId)" class="mt-1.5">
                  <div class="flex items-center gap-1">
                    <span class="text-[10px] text-gray-500">Úroveň:</span>
                    <span
                      v-for="i in achievementUpgradeLevel(selectedAchievement.parentId)!.max"
                      :key="i"
                      class="w-2.5 h-2.5 rounded-sm"
                      :class="i <= achievementUpgradeLevel(selectedAchievement.parentId)!.current
                        ? 'bg-green-500'
                        : 'bg-white/[0.08] border border-white/[0.06]'"
                    />
                  </div>
                </div>
              </div>
              <button
                class="p-1 text-gray-600 hover:text-gray-300 transition-colors shrink-0"
                @click="selectedAchievement = null"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <button
              class="w-full text-xs text-gh-primary hover:text-gh-primary-light py-2 rounded-lg bg-gh-primary/10 hover:bg-gh-primary/15 transition-all font-medium"
              @click="router.push({ path: '/achievementy', query: { highlight: selectedAchievement?.parentId } })"
            >
              Zobrazit na stránce úspěchů
            </button>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- Legend -->
    <div class="absolute top-3 right-3 bg-gh-dark/90 backdrop-blur-sm rounded-xl p-3 border border-white/[0.06] z-20">
      <div class="text-[9px] text-gray-500 uppercase tracking-wider font-semibold mb-2">Legenda</div>
      <div class="space-y-1.5">
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full" :style="{ backgroundColor: markerColor(ScenarioStatus.COMPLETED) }" />
          <span class="text-[10px] text-gray-400">Dokončeno</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full" :style="{ backgroundColor: markerColor(ScenarioStatus.AVAILABLE) }" />
          <span class="text-[10px] text-gray-400">Dostupné</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full" :style="{ backgroundColor: markerColor(ScenarioStatus.ATTEMPTED) }" />
          <span class="text-[10px] text-gray-400">Pokus</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full" :style="{ backgroundColor: markerColor(ScenarioStatus.BLOCKED) }" />
          <span class="text-[10px] text-gray-400">Blokováno</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full" :style="{ backgroundColor: markerColor(ScenarioStatus.REQUIRED) }" />
          <span class="text-[10px] text-gray-400">Vyžadováno</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.map-height {
  height: calc(100dvh - 4rem);
}

.popup-enter-active,
.popup-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.popup-enter-from,
.popup-leave-to {
  opacity: 0;
  transform: translate(-50%, 12px);
}
</style>
