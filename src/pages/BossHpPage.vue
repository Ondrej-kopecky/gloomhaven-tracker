<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useScenarioStore } from '@/stores/scenarioStore'
import { useCharacterStore } from '@/stores/characterStore'
import { useCampaignStore } from '@/stores/campaignStore'
import monstersData from '@/data/source/monsters-gh.json'
import monsterStatsData from '@/data/source/monster-stats-gh.json'
import scenarioMonstersData from '@/data/source/scenario-monsters-gh.json'

const router = useRouter()
const scenarioStore = useScenarioStore()
const characterStore = useCharacterStore()
const campaignStore = useCampaignStore()

onMounted(() => {
  if (!campaignStore.hasCampaign) { router.push('/kampan'); return }
})

const monsterMap = new Map(monstersData.map((m) => [m.id, m]))
const monsterStats = monsterStatsData as Record<string, { stats: { level: number; type: string; health: number | string; movement?: number; attack: number | string; range?: number }[] }>
const allScenarioMonsters = scenarioMonstersData as Record<string, { monsters: string[]; rooms: { roomNumber: number; monster: { name: string; type?: string; player2?: string; player3?: string; player4?: string }[] }[] }>

const playerCount = computed(() => {
  const count = characterStore.activeCharacters.length
  return count >= 2 && count <= 4 ? count : 2
})

const scenarioLevel = computed(() => Math.ceil(characterStore.averageLevel / 2))

function resolveStat(val: number | string | undefined): number {
  if (val == null) return 0
  if (typeof val === 'number') return val
  const pc = playerCount.value
  const s = val.replace(/C/g, String(pc))
  const mulMatch = s.match(/^(\d+)x(\d+)$/)
  if (mulMatch) return Number(mulMatch[1]) * Number(mulMatch[2])
  const addMatch = s.match(/^(\d+)\+(\d+)$/)
  if (addMatch) return Number(addMatch[1]) + Number(addMatch[2])
  return Number(s) || 0
}

// Find all boss scenarios
interface BossInfo {
  id: string
  nameCz: string
  name: string
  scenarioId: string
  scenarioName: string
  maxHp: number
  flies: boolean
}

const allBosses = computed((): BossInfo[] => {
  const result: BossInfo[] = []
  for (const [scenarioId, data] of Object.entries(allScenarioMonsters)) {
    for (const room of data.rooms) {
      for (const m of room.monster) {
        if (m.type === 'boss') {
          const baseId = m.name.replace(/-scenario-\d+$/, '').replace(/:[^:]+$/, '')
          if (result.some((b) => b.id === baseId && b.scenarioId === scenarioId)) continue
          const info = monsterMap.get(baseId)
          const stats = monsterStats[baseId]
          const bossStats = stats?.stats.find((s) => s.level === scenarioLevel.value && s.type === 'boss')
          const def = scenarioStore.getDefinition(scenarioId)
          result.push({
            id: baseId,
            nameCz: info?.nameCz ?? baseId,
            name: info?.name ?? baseId,
            scenarioId,
            scenarioName: def?.nameCz ?? def?.name ?? `Scénář ${scenarioId}`,
            maxHp: resolveStat(bossStats?.health),
            flies: (info as any)?.flies ?? false,
          })
        }
      }
    }
  }
  return result.filter((b) => b.maxHp > 0).sort((a, b) => Number(a.scenarioId) - Number(b.scenarioId))
})

const customHp = ref('')

function selectBoss(boss: BossInfo) {
  router.push(`/boss-hp/${boss.id}/${boss.scenarioId}`)
}

function selectCustom() {
  const hp = Number(customHp.value)
  if (hp > 0) {
    router.push(`/boss-hp/custom/${hp}`)
  }
}
</script>

<template>
  <div>
  <div class="gh-page-header">
    <h1 class="font-display text-xl font-bold text-gh-primary tracking-wider uppercase">Počítadlo HP</h1>
  </div>

  <!-- Boss selector -->
  <div class="space-y-4">
    <p class="text-sm text-gray-500">Vyberte bosse nebo zadejte vlastní počet životů.</p>

    <!-- Custom HP -->
    <div class="gh-card p-4">
      <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Vlastní počet</h3>
      <div class="flex gap-2">
        <input
          v-model="customHp"
          type="number"
          min="1"
          placeholder="Počet HP..."
          class="gh-input flex-1 text-sm"
          @keyup.enter="selectCustom"
        />
        <button
          class="gh-btn-primary px-4 text-sm"
          :disabled="!customHp || Number(customHp) <= 0"
          @click="selectCustom"
        >
          Start
        </button>
      </div>
    </div>

    <!-- Boss list by scenario -->
    <div class="gh-card p-4">
      <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Bossové ze scénářů
        <span class="text-gray-600 normal-case font-normal ml-1">· {{ playerCount }} hráči · úroveň {{ scenarioLevel }}</span>
      </h3>
      <div class="space-y-1.5">
        <button
          v-for="boss in allBosses"
          :key="boss.id + boss.scenarioId"
          class="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-gh-border/30 bg-white/[0.02] hover:bg-white/[0.05] hover:border-red-900/30 transition-colors text-left min-h-[44px]"
          @click="selectBoss(boss)"
        >
          <div class="min-w-0">
            <div class="text-sm text-red-400 font-semibold flex items-center gap-1.5">
              {{ boss.nameCz }}
              <img v-if="boss.flies" src="/img/icons/general/flying.png" alt="Létá" title="Létající" class="w-3.5 h-3.5 opacity-50" />
            </div>
            <div class="text-[11px] text-gray-600">#{{ boss.scenarioId }} {{ boss.scenarioName }}</div>
          </div>
          <div class="flex items-center gap-1 shrink-0">
            <img src="/img/icons/general/heal.png" class="w-4 h-4 opacity-50" alt="" />
            <span class="text-sm font-semibold text-red-400/80">{{ boss.maxHp }}</span>
          </div>
        </button>
      </div>
    </div>
  </div>

  </div>
</template>
