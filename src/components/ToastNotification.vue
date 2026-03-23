<script setup lang="ts">
import { useToastStore } from '@/stores/toastStore'

const toastStore = useToastStore()

const typeStyles = {
  success: {
    border: 'border-gh-primary/40',
    accent: 'bg-green-500',
    icon: 'text-green-400',
    text: 'text-gray-200',
    path: 'M5 13l4 4L19 7',
  },
  error: {
    border: 'border-red-700/40',
    accent: 'bg-red-500',
    icon: 'text-red-400',
    text: 'text-gray-200',
    path: 'M6 18 18 6M6 6l12 12',
  },
  info: {
    border: 'border-gh-primary/30',
    accent: 'bg-gh-primary',
    icon: 'text-gh-primary',
    text: 'text-gray-300',
    path: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  },
}
</script>

<template>
  <div class="fixed bottom-4 right-4 z-[200] flex flex-col gap-2.5 pointer-events-none">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toastStore.toasts"
        :key="toast.id"
        class="pointer-events-auto relative overflow-hidden rounded-xl border bg-gh-dark/95 backdrop-blur-md shadow-2xl shadow-black/50 min-w-[220px] max-w-[360px] cursor-pointer"
        :class="typeStyles[toast.type].border"
        @click="toastStore.dismiss(toast.id)"
      >
        <!-- Left accent bar -->
        <div
          class="absolute left-0 top-0 bottom-0 w-[3px]"
          :class="typeStyles[toast.type].accent"
        />
        <div class="flex items-center gap-3 pl-4 pr-4 py-3">
          <svg
            class="w-5 h-5 shrink-0"
            :class="typeStyles[toast.type].icon"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"
          >
            <path stroke-linecap="round" stroke-linejoin="round" :d="typeStyles[toast.type].path" />
          </svg>
          <span class="text-sm font-medium flex-1" :class="typeStyles[toast.type].text">
            {{ toast.message }}
          </span>
          <button
            v-if="toast.undoAction"
            class="text-xs font-semibold text-gh-primary hover:text-gh-primary-light px-2 py-1 rounded-md bg-gh-primary/10 hover:bg-gh-primary/20 transition-colors shrink-0 ml-1"
            @click.stop="toastStore.undo(toast.id)"
          >
            Zpět
          </button>
        </div>
        <!-- Progress bar -->
        <div class="h-[2px] bg-white/[0.04]">
          <div
            class="h-full toast-progress"
            :class="typeStyles[toast.type].accent"
          />
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-leave-active {
  transition: all 0.25s ease-in;
}
.toast-enter-from {
  transform: translateY(20px) scale(0.95);
  opacity: 0;
}
.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.toast-progress {
  animation: toast-shrink 4s linear forwards;
}

@keyframes toast-shrink {
  from { width: 100%; }
  to { width: 0%; }
}
</style>
