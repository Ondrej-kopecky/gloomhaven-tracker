<script setup lang="ts">
import { ref, onMounted } from 'vue'
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
  await scenarioStore.loadScenarioData()
})

function handleFitView() {
  flowchartRef.value?.fitView()
}
</script>

<template>
  <div v-if="campaignStore.hasCampaign" class="flex flex-col flowchart-height">
    <!-- Toolbar -->
    <div class="px-4 py-2 flex items-center justify-between border-b border-gh-border bg-gh-dark/50">
      <FlowchartControls @fit-view="handleFitView" />
      <div class="hidden lg:block">
        <FlowchartLegend />
      </div>
    </div>

    <!-- Main content -->
    <div class="flex-1 flex relative overflow-hidden">
      <!-- Flowchart -->
      <div class="flex-1">
        <StorylineSvg ref="flowchartRef" />
      </div>

      <!-- Detail panel -->
      <transition
        enter-active-class="transition-transform duration-200"
        leave-active-class="transition-transform duration-200"
        enter-from-class="translate-x-full"
        leave-to-class="translate-x-full"
      >
        <div
          v-if="flowchartStore.selectedNodeId"
          class="absolute right-0 top-0 bottom-0 z-10 p-2"
        >
          <ScenarioDetail
            :scenario-id="flowchartStore.selectedNodeId"
            @close="flowchartStore.selectNode(null)"
          />
        </div>
      </transition>
    </div>

    <!-- Mobile legend -->
    <div class="lg:hidden px-4 py-2 border-t border-gh-border bg-gh-dark/50">
      <FlowchartLegend />
    </div>
  </div>
</template>

<style scoped>
.flowchart-height {
  height: calc(100dvh - 4rem);
}
@media (max-width: 767px) {
  .flowchart-height {
    height: calc(100dvh - 4rem - 4rem - env(safe-area-inset-bottom, 0px));
  }
}
</style>
