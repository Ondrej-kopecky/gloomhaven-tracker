<script setup lang="ts">
import { computed } from 'vue'

import BR from '@/assets/characters/BR.svg?raw'
import CH from '@/assets/characters/CH.svg?raw'
import MT from '@/assets/characters/MT.svg?raw'
import SC from '@/assets/characters/SC.svg?raw'
import SW from '@/assets/characters/SW.svg?raw'
import TI from '@/assets/characters/TI.svg?raw'
import BT from '@/assets/characters/BT.svg?raw'
import BE from '@/assets/characters/BE.svg?raw'
import DS from '@/assets/characters/DS.svg?raw'
import EL from '@/assets/characters/EL.svg?raw'
import NS from '@/assets/characters/NS.svg?raw'
import PH from '@/assets/characters/PH.svg?raw'
import QM from '@/assets/characters/QM.svg?raw'
import SB from '@/assets/characters/SB.svg?raw'
import SS from '@/assets/characters/SS.svg?raw'
import SU from '@/assets/characters/SU.svg?raw'
import SK from '@/assets/characters/SK.svg?raw'
import DR from '@/assets/characters/DR.svg?raw'

const props = defineProps<{
  classId: string
  size?: number
}>()

const svgMap: Record<string, string> = {
  brute: BR,
  cragheart: CH,
  mindthief: MT,
  scoundrel: SC,
  spellweaver: SW,
  tinkerer: TI,
  beast_tyrant: BT,
  berserker: BE,
  doomstalker: DS,
  elementalist: EL,
  nightshroud: NS,
  plagueherald: PH,
  quartermaster: QM,
  sawbones: SB,
  soothsinger: SS,
  summoner: SU,
  sunkeeper: SK,
  diviner: DR,
}

const svgContent = computed(() => svgMap[props.classId] ?? '')
const px = computed(() => (props.size ?? 32) + 'px')
</script>

<template>
  <span
    v-if="svgContent"
    class="class-icon inline-flex items-center justify-center shrink-0"
    :style="{ width: px, height: px }"
    v-html="svgContent"
  />
</template>

<style scoped>
.class-icon :deep(svg) {
  width: 100%;
  height: 100%;
}
</style>
