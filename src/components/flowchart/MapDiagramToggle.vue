<script setup lang="ts">
import { useRoute } from 'vue-router'
/** Přepínač mezi pohledem Mapa světa a Diagram příběhu (redesign Phase 04). */
const route = useRoute()
</script>

<template>
  <div class="flex gap-0.5 bg-black/30 rounded-lg p-0.5 border border-gh-border shrink-0">
    <router-link
      to="/mapa"
      class="px-2.5 py-1 rounded-md text-xs font-medium transition-all whitespace-nowrap"
      :class="route.path === '/mapa' ? 'bg-gh-primary/20 text-gh-primary shadow-sm' : 'text-gray-500 hover:text-gray-300'"
    >Mapa</router-link>
    <router-link
      to="/diagram"
      class="px-2.5 py-1 rounded-md text-xs font-medium transition-all whitespace-nowrap"
      :class="route.path === '/diagram' ? 'bg-gh-primary/20 text-gh-primary shadow-sm' : 'text-gray-500 hover:text-gray-300'"
    >Diagram</router-link>
  </div>
</template>
