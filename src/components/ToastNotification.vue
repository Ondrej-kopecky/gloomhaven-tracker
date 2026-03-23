<script setup lang="ts">
import { useToastStore } from '@/stores/toastStore'

const toastStore = useToastStore()

const typeClasses = {
  success: 'bg-green-900/90 border-green-700/50 text-green-200',
  error: 'bg-red-900/90 border-red-700/50 text-red-200',
  info: 'bg-blue-900/90 border-blue-700/50 text-blue-200',
}

const typeIcons = {
  success: 'M5 13l4 4L19 7',
  error: 'M6 18 18 6M6 6l12 12',
  info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
}
</script>

<template>
  <div class="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toastStore.toasts"
        :key="toast.id"
        class="pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl border backdrop-blur-sm shadow-lg shadow-black/30 min-w-[200px] max-w-[340px] cursor-pointer"
        :class="typeClasses[toast.type]"
        @click="toastStore.dismiss(toast.id)"
      >
        <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" :d="typeIcons[toast.type]" />
        </svg>
        <span class="text-sm">{{ toast.message }}</span>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active {
  transition: all 0.3s ease;
}
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}
.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
