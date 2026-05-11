<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCampaignStore } from '@/stores/campaignStore'
import { useCharacterStore } from '@/stores/characterStore'
import ClassIcon from '@/components/characters/ClassIcon.vue'
import type { CharacterClass } from '@/models/types'

/** Onboarding wizard (redesign Phase 02): pojmenuj družinu → vyber 2–4 startovní třídy → hotovo. */

const router = useRouter()
const campaignStore = useCampaignStore()
const characterStore = useCharacterStore()

onMounted(() => {
  if (campaignStore.hasCampaign) router.replace('/prehled')
})

interface StartingClass {
  id: CharacterClass
  name: string
  race: string
  color: string
  desc: string
}
const STARTING: StartingClass[] = [
  { id: 'brute' as CharacterClass, name: 'Surovec', race: 'Inox', color: '#e74c3c', desc: 'Mlátička zblízka, hodně životů, snadný start.' },
  { id: 'tinkerer' as CharacterClass, name: 'Kutil', race: 'Quatryl', color: '#f39c12', desc: 'Léčení, pasti a podpora — drží družinu naživu.' },
  { id: 'spellweaver' as CharacterClass, name: 'Čarovnice', race: 'Orchid', color: '#3498db', desc: 'Plošná kouzla a dosah, ale jen málo karet.' },
  { id: 'scoundrel' as CharacterClass, name: 'Ničemnice', race: 'Člověk', color: '#2ecc71', desc: 'Jednociloví zabijáci z neviditelnosti, rychlá iniciativa.' },
  { id: 'cragheart' as CharacterClass, name: 'Prasklivec', race: 'Savvas', color: '#95a5a6', desc: 'Tvaruje terén, kombinuje útok i podporu.' },
  { id: 'mindthief' as CharacterClass, name: 'Zlodějka mysli', race: 'Krysák', color: '#9b59b6', desc: 'Ovládá mysl nepřátel a živly — křehká, ale chytrá.' },
]

const step = ref<1 | 2>(1)
const partyName = ref('')
const selected = ref<Set<CharacterClass>>(new Set())
const creating = ref(false)

const canContinue = computed(() => partyName.value.trim().length >= 2)
const canFinish = computed(() => selected.value.size >= 2 && selected.value.size <= 4)

function isSelected(id: CharacterClass) {
  return selected.value.has(id)
}
function toggle(id: CharacterClass) {
  const s = new Set(selected.value)
  if (s.has(id)) s.delete(id)
  else if (s.size < 4) s.add(id)
  selected.value = s
}

function goStep2() {
  if (canContinue.value) step.value = 2
}

async function finish() {
  if (!canFinish.value || creating.value) return
  creating.value = true
  const name = partyName.value.trim()
  await campaignStore.createCampaign(name)
  if (campaignStore.currentCampaign) {
    campaignStore.currentCampaign.party.name = name
  }
  for (const id of selected.value) {
    const cls = STARTING.find((c) => c.id === id)
    characterStore.createCharacter(id, cls?.name ?? id)
  }
  campaignStore.autoSave()
  router.push('/prehled')
}

function skip() {
  router.push('/kampan')
}
</script>

<template>
  <div class="relative max-w-2xl mx-auto pt-4 sm:pt-8 pb-16">
    <div
      class="absolute inset-x-0 -top-4 h-44 pointer-events-none"
      style="background: radial-gradient(ellipse at 50% 0%, rgba(196,163,90,0.10), transparent 70%)"
    />

    <!-- progress -->
    <div class="relative flex items-center justify-center gap-3 mb-7 text-xs">
      <div class="flex items-center gap-2" :class="step === 1 ? 'text-gh-primary' : 'text-gh-completed'">
        <span class="w-5 h-5 rounded-full grid place-items-center text-[11px] font-bold border" :class="step === 1 ? 'border-gh-primary bg-gh-primary/10' : 'border-gh-completed bg-gh-completed/10'">
          <template v-if="step > 1">✓</template><template v-else>1</template>
        </span>
        <span class="font-medium">Družina</span>
      </div>
      <div class="w-10 h-px bg-gh-border" />
      <div class="flex items-center gap-2" :class="step === 2 ? 'text-gh-primary' : 'text-gh-dim'">
        <span class="w-5 h-5 rounded-full grid place-items-center text-[11px] font-bold border" :class="step === 2 ? 'border-gh-primary bg-gh-primary/10' : 'border-gh-border'">2</span>
        <span class="font-medium">Postavy</span>
      </div>
    </div>

    <div class="relative gh-card p-6 sm:p-8">
      <!-- ── STEP 1: party name ── -->
      <template v-if="step === 1">
        <div class="text-center mb-7">
          <div class="w-14 h-14 rounded-2xl bg-gh-primary/10 border border-gh-primary/20 grid place-items-center mx-auto mb-4 text-gh-primary">
            <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <h1 class="gh-h1">Nová kampaň</h1>
          <p class="text-sm text-gray-500 mt-2">Jak se jmenuje vaše družina dobrodruhů?</p>
        </div>

        <form @submit.prevent="goStep2" class="space-y-4">
          <div>
            <label class="gh-micro mb-1.5 block">Jméno družiny</label>
            <input
              v-model="partyName"
              type="text"
              maxlength="40"
              class="gh-input w-full text-lg"
              placeholder="např. Hrdinové z Gloomhavenu"
              autofocus
            />
          </div>
          <button
            type="submit"
            class="gh-btn-primary w-full transition-opacity flex items-center justify-center gap-2"
            :class="{ 'opacity-40 cursor-not-allowed': !canContinue }"
            :disabled="!canContinue"
          >
            Pokračovat
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </button>
        </form>
      </template>

      <!-- ── STEP 2: pick starting classes ── -->
      <template v-else>
        <div class="text-center mb-6">
          <h1 class="gh-h1">Startovní postavy</h1>
          <p class="text-sm text-gray-500 mt-2">
            Vyberte <span class="text-gray-300 font-medium">2–4</span> startovní třídy.
            Další (i odemykatelné) přidáte kdykoli později.
          </p>
        </div>

        <div class="grid sm:grid-cols-2 gap-2.5">
          <button
            v-for="c in STARTING"
            :key="c.id"
            type="button"
            class="text-left rounded-xl border p-3.5 transition-all flex gap-3 items-start"
            :class="isSelected(c.id)
              ? 'border-gh-primary/60 bg-gh-primary/[0.07]'
              : (selected.size >= 4 ? 'border-gh-border opacity-50 cursor-not-allowed' : 'border-gh-border hover:border-gh-border-light hover:bg-white/[0.02]')"
            @click="toggle(c.id)"
          >
            <span class="w-10 h-10 rounded-lg grid place-items-center shrink-0" :style="{ background: c.color + '22', border: '1px solid ' + c.color + '55' }">
              <ClassIcon :class-id="c.id" :size="26" />
            </span>
            <span class="min-w-0 flex-1">
              <span class="flex items-center gap-2">
                <span class="font-display font-semibold text-sm" :style="{ color: c.color }">{{ c.name }}</span>
                <span class="text-[10px] text-gh-dim uppercase tracking-wider">{{ c.race }}</span>
                <svg v-if="isSelected(c.id)" class="ml-auto w-4 h-4 text-gh-primary shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.75l6 6 9-13.5" /></svg>
              </span>
              <span class="block text-xs text-gray-500 leading-snug mt-0.5">{{ c.desc }}</span>
            </span>
          </button>
        </div>

        <div class="mt-5 flex items-center gap-3">
          <button type="button" class="gh-btn-ghost px-4" @click="step = 1">Zpět</button>
          <button
            type="button"
            class="gh-btn-primary flex-1 transition-opacity flex items-center justify-center gap-2"
            :class="{ 'opacity-40 cursor-not-allowed': !canFinish || creating }"
            :disabled="!canFinish || creating"
            @click="finish"
          >
            {{ creating ? 'Zakládám…' : `Vytvořit družinu (${selected.size})` }}
          </button>
        </div>
        <p class="mt-2 text-center text-[11px] text-gh-dim">
          {{ selected.size === 0 ? 'Vyberte aspoň 2 třídy' : (selected.size === 1 ? 'Ještě aspoň jednu třídu' : (selected.size >= 4 ? 'Maximum 4 — víc přidáte později' : 'Můžete přidat ještě další')) }}
        </p>
      </template>
    </div>

    <p class="relative mt-5 text-center text-sm text-gray-500">
      <button type="button" class="text-xs text-gray-600 hover:text-gray-400 transition-colors" @click="skip">
        Mám už kampaň · přejít na výběr
      </button>
    </p>
  </div>
</template>
