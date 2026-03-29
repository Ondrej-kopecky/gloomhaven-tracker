import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as authApi from '@/services/api/authApi'
import type { AuthUser } from '@/services/api/authApi'
import * as campaignApiMod from '@/services/api/campaignApi'
import { setToken, clearToken, hasToken } from '@/services/api/apiClient'
import { useStorage, enableCloudSync, disableCloudSync } from '@/composables/useStorage'
import { LocalStorageAdapter } from '@/services/storage/LocalStorageAdapter'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const isLoading = ref(false)
  const error = ref('')

  const isLoggedIn = computed(() => !!user.value)
  const isVerified = computed(() => user.value?.is_verified ?? false)

  async function init() {
    if (!hasToken()) return
    isLoading.value = true
    try {
      const { data, error: err } = await authApi.getMe()
      if (data) {
        user.value = data
        enableCloudSync()
        // Auto-sync on app load
        syncCampaigns().catch(() => {})
      } else {
        // Invalid token
        clearToken()
        if (err) error.value = err
      }
    } finally {
      isLoading.value = false
    }
  }

  async function login(username: string, password: string): Promise<boolean> {
    isLoading.value = true
    error.value = ''
    try {
      const { data, error: err } = await authApi.login(username, password)
      if (!data) {
        error.value = err ?? 'Přihlášení selhalo'
        return false
      }
      setToken(data.access_token)
      // Fetch user profile
      const { data: me } = await authApi.getMe()
      if (me) {
        user.value = me
        enableCloudSync()
      }
      return true
    } finally {
      isLoading.value = false
    }
  }

  async function register(email: string, username: string, password: string): Promise<boolean> {
    isLoading.value = true
    error.value = ''
    try {
      const { error: err } = await authApi.register(email, username, password)
      if (err) {
        error.value = err
        return false
      }
      return true
    } finally {
      isLoading.value = false
    }
  }

  async function verifyEmail(email: string, code: string): Promise<boolean> {
    isLoading.value = true
    error.value = ''
    try {
      const { error: err } = await authApi.verify(email, code)
      if (err) {
        error.value = err
        return false
      }
      return true
    } finally {
      isLoading.value = false
    }
  }

  async function resendCode(email: string): Promise<boolean> {
    error.value = ''
    const { error: err } = await authApi.resendCode(email)
    if (err) {
      error.value = err
      return false
    }
    return true
  }

  function logout() {
    // Switch to local-only FIRST to prevent cloud operations
    disableCloudSync()
    clearToken()
    user.value = null
    error.value = ''
    // Clear only local campaigns — never touch server data on logout
    const local = new LocalStorageAdapter('default')
    local.listCampaigns().then(async (list) => {
      for (const c of list) {
        await local.deleteCampaign(c.id)
      }
    })
  }

  async function deleteAccount(): Promise<boolean> {
    isLoading.value = true
    error.value = ''
    try {
      const { error: err } = await authApi.deleteAccount()
      if (err) {
        error.value = err
        return false
      }
      // Clean up local state
      disableCloudSync()
      clearToken()
      user.value = null
      const local = new LocalStorageAdapter('default')
      const list = await local.listCampaigns()
      for (const c of list) {
        await local.deleteCampaign(c.id)
      }
      return true
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Sync campaigns between local and server.
   * 1. Upload local campaigns missing on server (first login scenario)
   * 2. Clear local campaigns
   * 3. Download all from server → local (single source of truth)
   */
  async function syncCampaigns(): Promise<{ synced: number; error: string | null }> {
    if (!isLoggedIn.value) return { synced: 0, error: 'Nepřihlášen' }

    const storage = useStorage()
    const localList = await storage.listCampaigns()
    const { data: remoteList, error: err } = await campaignApiMod.listCampaigns()

    if (err || !remoteList) {
      return { synced: 0, error: err ?? 'Nelze načíst vzdálené kampaně' }
    }

    // Step 1: Upload local campaigns that don't exist on server (only owned ones)
    for (const local of localList) {
      const remote = remoteList.find((r) => r.id === local.id)
      if (!remote) {
        const campaign = await storage.loadCampaign(local.id)
        if (campaign) {
          await campaignApiMod.upsertCampaign(campaign)
        }
      } else if (remote.isOwner !== false) {
        // Both exist and I'm the owner — push local if newer
        const localCampaign = await storage.loadCampaign(local.id)
        if (localCampaign) {
          const localTime = new Date(local.lastPlayedAt).getTime()
          const remoteTime = new Date(remote.lastPlayedAt).getTime()
          if (localTime > remoteTime) {
            await campaignApiMod.upsertCampaign(localCampaign)
          }
        }
      }
    }

    // Step 2: Clear only local campaigns (never delete from cloud here)
    const localStorage = new LocalStorageAdapter('default')
    for (const local of localList) {
      await localStorage.deleteCampaign(local.id)
    }

    // Step 3: Download everything from server (= single source of truth)
    const { data: fullRemoteList } = await campaignApiMod.listCampaigns()
    let synced = 0

    if (fullRemoteList) {
      for (const remote of fullRemoteList) {
        const { data: remoteCampaign } = await campaignApiMod.getCampaign(remote.id)
        if (remoteCampaign) {
          await storage.saveCampaign(remoteCampaign)
          synced++
        }
      }
    }

    return { synced, error: null }
  }

  return {
    user,
    isLoading,
    error,
    isLoggedIn,
    isVerified,
    init,
    login,
    register,
    verifyEmail,
    resendCode,
    logout,
    deleteAccount,
    syncCampaigns,
  }
})
