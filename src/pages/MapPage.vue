<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useCampaignStore } from '@/stores/campaignStore'
import { useScenarioStore } from '@/stores/scenarioStore'
import { ScenarioStatus } from '@/models/types'
import panzoom from 'panzoom'
import type { PanZoom } from 'panzoom'

const router = useRouter()
const campaignStore = useCampaignStore()
const scenarioStore = useScenarioStore()

const mapContainer = ref<HTMLElement | null>(null)
const mapElement = ref<HTMLElement | null>(null)
let pz: PanZoom | null = null

const selectedId = ref<string | null>(null)

// Map settings from reference repo (GH map)
const MAP_WIDTH = 2606
const MAP_HEIGHT = 2155
const MAP_Y_OFFSET = 184

// Sticker offset: original stickers are 133x90px scaled 0.79 = ~105x71px
// Coordinates point to top-left corner; offset to align marker with sticker number
const STICKER_OFFSET_X = 20
const STICKER_OFFSET_Y = 12

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

function markerBorder(status: ScenarioStatus): string {
  switch (status) {
    case ScenarioStatus.COMPLETED: return '#166534'
    case ScenarioStatus.AVAILABLE: return '#92722d'
    case ScenarioStatus.ATTEMPTED: return '#b45309'
    case ScenarioStatus.BLOCKED: return '#991b1b'
    case ScenarioStatus.REQUIRED: return '#7e22ce'
    default: return '#374151'
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
  selectedId.value = selectedId.value === id ? null : id
}

function goToScenarios(id: string) {
  router.push({ path: '/scenare', query: { open: id } })
}
</script>

<template>
  <div
    v-if="campaignStore.hasCampaign"
    ref="mapContainer"
    class="relative w-full overflow-hidden bg-gh-dark"
    style="height: calc(100dvh - 4rem)"
    @click="selectedId = null"
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

      <!-- Scenario markers -->
      <div
        v-for="s in visibleScenarios"
        :key="s.id"
        class="absolute"
        :style="{
          left: 'calc(' + s.coordinates.x + '% + ' + STICKER_OFFSET_X + 'px)',
          top: 'calc(' + s.coordinates.y + '% + ' + STICKER_OFFSET_Y + 'px)',
        }"
      >
        <button
          class="flex items-center justify-center rounded-full cursor-pointer transition-transform duration-150 hover:scale-125 focus:outline-none -translate-x-1/2 -translate-y-1/2"
          :style="{
            width: '28px',
            height: '28px',
            backgroundColor: markerColor(s.computedStatus),
            border: '2.5px solid ' + markerBorder(s.computedStatus),
            boxShadow: '0 0 8px ' + markerColor(s.computedStatus) + '80',
            zIndex: selectedId === s.id ? 30 : 10,
          }"
          @click.stop="onMarkerClick(s.id)"
        >
          <span class="text-[10px] font-bold text-white drop-shadow-sm leading-none">{{ s.id }}</span>
        </button>
      </div>
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
                <h3 class="text-sm font-semibold text-gray-200">{{ selectedScenario.name }}</h3>
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
                {{ selectedScenario.rewards.gold }} zl.
              </span>
              <span v-if="selectedScenario.rewards.xp" class="text-[10px] text-blue-400 bg-blue-900/20 px-2 py-0.5 rounded border border-blue-800/30">
                {{ selectedScenario.rewards.xp }} ZK
              </span>
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
      </div>
    </div>
  </div>
</template>

<style scoped>
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
