<script setup lang="ts">
const props = defineProps<{
  slot: string
  size?: number
}>()

const slotFiles: Record<string, string> = {
  head: 'head',
  body: 'body',
  legs: 'legs',
  one_hand: 'one-hand',
  two_hands: 'two-hands',
  small_item: 'small-item',
}

const src = `/img/icons/equipment/${slotFiles[props.slot] ?? 'small-item'}.png`
</script>

<template>
  <img
    :src="src"
    :alt="slot"
    :width="size ?? 22"
    :height="size ?? 22"
    class="slot-icon inline-block"
    draggable="false"
  />
</template>

<style scoped>
.slot-icon {
  flex-shrink: 0;
  filter: brightness(0.85);
}
</style>
