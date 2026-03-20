<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import StorylineSvg from '@/components/flowchart/StorylineSvg.vue'
import FlowchartControls from '@/components/flowchart/FlowchartControls.vue'
import FlowchartLegend from '@/components/flowchart/FlowchartLegend.vue'
import ScenarioDetail from '@/components/scenarios/ScenarioDetail.vue'
import { useScenarioStore } from '@/stores/scenarioStore'
import { useFlowchartStore } from '@/stores/flowchartStore'
import { useCampaignStore } from '@/stores/campaignStore'

const router = useRouter()
const scenarioStore = useScenarioStore()
const flowchartStore = useFlowchartStore()
const campaignStore = useCampaignStore()

const flowchartRef = ref<InstanceType<typeof StorylineSvg> | null>(null)

onMounted(async () => {
  if (!campaignStore.hasCampaign) {
    router.push('/kampan')
    return
  }
  // Prevent body scroll — keeps header fixed, prevents browser chrome shifts
  document.body.style.overflow = 'hidden'
  await scenarioStore.loadScenarioData()
})

onUnmounted(() => {
  document.body.style.overflow = ''
})

function handleFitView() {
  flowchartRef.value?.fitView()
}
</script>

<template>
  <div v-if="campaignStore.hasCampaign" class="fixed inset-0 top-16 z-40 flex flex-col bg-gh-dark">
    <!-- Toolbar -->
    <div class="px-2 py-1.5 border-b border-gh-border bg-gh-dark shrink-0">
      <!-- Desktop -->
      <div class="hidden md:flex items-center justify-between">
        <FlowchartControls @fit-view="handleFitView" />
        <div class="hidden lg:block"><FlowchartLegend /></div>
      </div>
      <!-- Mobile: all filters in one scrollable row -->
      <div class="md:hidden flex items-center gap-1 overflow-x-auto scrollbar-hide">
        <FlowchartControls @fit-view="handleFitView" />
      </div>
    </div>

    <!-- Main content -->
    <div class="flex-1 flex relative overflow-hidden">
      <!-- Flowchart -->
      <div class="flex-1">
        <StorylineSvg ref="flowchartRef" />
      </div>

      <!-- Detail panel: side on desktop, bottom sheet on mobile -->
      <transition
        enter-active-class="transition-all duration-200"
        leave-active-class="transition-all duration-200"
        enter-from-class="translate-x-full md:translate-x-full"
        leave-to-class="translate-x-full md:translate-x-full"
      >
        <div
          v-if="flowchartStore.selectedNodeId"
          class="absolute right-0 top-0 bottom-0 z-10 p-2 hidden md:block"
        >
          <ScenarioDetail
            :scenario-id="flowchartStore.selectedNodeId"
            @close="flowchartStore.selectNode(null)"
          />
        </div>
      </transition>
    </div>

    <!-- Mobile detail: fullscreen overlay -->
    <Teleport to="body">
      <transition name="sheet">
        <div
          v-if="flowchartStore.selectedNodeId"
          class="fixed inset-0 z-50 flex flex-col md:hidden"
        >
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="flowchartStore.selectNode(null)" />
          <div class="relative flex-1 flex flex-col mt-12 bg-gh-card rounded-t-2xl border-t border-gh-border overflow-hidden safe-area-bottom">
            <div class="flex justify-center pt-3 pb-1 shrink-0" @click="flowchartStore.selectNode(null)">
              <div class="w-10 h-1 rounded-full bg-white/20"></div>
            </div>
            <div class="flex-1 overflow-hidden">
              <ScenarioDetail
                :scenario-id="flowchartStore.selectedNodeId"
                class="!rounded-none !border-0 !shadow-none !bg-transparent"
                @close="flowchartStore.selectNode(null)"
              />
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

  </div>
</template>

<style scoped>
.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.2s ease;
}
.sheet-enter-active > :last-child,
.sheet-leave-active > :last-child {
  transition: transform 0.25s ease;
}
.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}
.sheet-enter-from > :last-child,
.sheet-leave-to > :last-child {
  transform: translateY(100%);
}
</style>
