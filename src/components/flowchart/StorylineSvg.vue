<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useStorylineSvg } from '@/composables/useStorylineSvg'

const containerRef = ref<HTMLElement | null>(null)
const { initSvg, fitView, destroy } = useStorylineSvg(containerRef)

onMounted(() => {
  initSvg()
})

onUnmounted(() => {
  destroy()
})

defineExpose({ fitView })
</script>

<template>
  <div
    ref="containerRef"
    class="storyline-container w-full h-full overflow-hidden"
    style="background: #0a0813;"
  />
</template>
