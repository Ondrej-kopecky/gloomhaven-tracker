<script setup lang="ts">
/**
 * Společný layout pro Login / Register / ForgotPassword (redesign Phase 02).
 * Středová karta `.gh-card` na atmosférickém pozadí (z body), jednotná hlavička
 * (ikona + titulek + podtitulek) a slot na obsah + slot `footer` na odkazy.
 */
defineProps<{ title: string; subtitle?: string }>()
</script>

<template>
  <div class="relative max-w-sm mx-auto pt-4 sm:pt-10 pb-12">
    <!-- jemný gold glow za kartou -->
    <div
      class="absolute inset-x-0 -top-4 h-44 pointer-events-none"
      style="background: radial-gradient(ellipse at 50% 0%, rgba(196,163,90,0.10), transparent 70%)"
    />
    <div class="relative gh-card p-6 sm:p-8">
      <div class="text-center mb-7">
        <div class="w-14 h-14 rounded-2xl bg-gh-primary/10 border border-gh-primary/20 grid place-items-center mx-auto mb-4 text-gh-primary">
          <slot name="icon">
            <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M14.5 17.5L3 6V3h3l11.5 11.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M13 19l6-6M16 16l3.5 3.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M9.5 17.5L21 6V3h-3L6.5 14.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M11 19l-6-6M8 16l-3.5 3.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </slot>
        </div>
        <h1 class="gh-h1">{{ title }}</h1>
        <p v-if="subtitle" class="text-sm text-gray-500 mt-2">{{ subtitle }}</p>
      </div>

      <slot />
    </div>

    <div v-if="$slots.footer" class="mt-5 text-center text-sm text-gray-500 space-y-2.5">
      <slot name="footer" />
    </div>
  </div>
</template>
