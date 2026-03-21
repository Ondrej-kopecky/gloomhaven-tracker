import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/prehled',
    },
    {
      path: '/prehled',
      name: 'flowchart',
      component: () => import('@/pages/FlowchartPage.vue'),
      meta: { title: 'Přehled scénářů', icon: 'flowchart' },
    },
    {
      path: '/mapa',
      name: 'map',
      component: () => import('@/pages/MapPage.vue'),
      meta: { title: 'Mapa světa', icon: 'map' },
    },
    {
      path: '/druzina',
      name: 'party',
      component: () => import('@/pages/PartyPage.vue'),
      meta: { title: 'Družina', icon: 'users' },
    },
    {
      path: '/postavy',
      name: 'characters',
      component: () => import('@/pages/CharactersPage.vue'),
      meta: { title: 'Postavy', icon: 'user' },
    },
    {
      path: '/achievementy',
      name: 'achievements',
      component: () => import('@/pages/AchievementsPage.vue'),
      meta: { title: 'Achievementy', icon: 'trophy' },
    },
    {
      path: '/scenare',
      name: 'scenarios',
      component: () => import('@/pages/ScenariosPage.vue'),
      meta: { title: 'Scénáře', icon: 'list' },
    },
    {
      path: '/predmety',
      name: 'items',
      component: () => import('@/pages/ItemsPage.vue'),
      meta: { title: 'Předměty', icon: 'items' },
    },
    {
      path: '/pribeh',
      name: 'story',
      component: () => import('@/pages/StoryPage.vue'),
      meta: { title: 'Příběh', icon: 'book' },
    },
    {
      path: '/nastaveni',
      name: 'settings',
      component: () => import('@/pages/SettingsPage.vue'),
      meta: { title: 'Nastavení', icon: 'settings' },
    },
    {
      path: '/kampan',
      name: 'campaign-select',
      component: () => import('@/pages/CampaignSelectPage.vue'),
      meta: { title: 'Výběr kampaně' },
    },
    {
      path: '/prihlaseni',
      name: 'login',
      component: () => import('@/pages/LoginPage.vue'),
      meta: { title: 'Přihlášení' },
    },
    {
      path: '/registrace',
      name: 'register',
      component: () => import('@/pages/RegisterPage.vue'),
      meta: { title: 'Registrace' },
    },
    {
      path: '/zapomenute-heslo',
      name: 'forgot-password',
      component: () => import('@/pages/ForgotPasswordPage.vue'),
      meta: { title: 'Zapomenuté heslo' },
    },
  ],
})

// GoatCounter SPA tracking
router.afterEach((to) => {
  if (typeof window !== 'undefined' && (window as any).goatcounter) {
    ;(window as any).goatcounter.count({ path: to.fullPath })
  }
})

export default router
