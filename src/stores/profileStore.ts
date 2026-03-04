import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { resetStorageAdapter } from '@/composables/useStorage'

export interface ProfileState {
  id: string
  name: string
  createdAt: string
}

const PROFILES_KEY = 'gh_tracker_profiles'
const ACTIVE_KEY = 'gh_tracker_active_profile'
const DEFAULT_PROFILE_ID = 'default'

function loadProfiles(): ProfileState[] {
  const raw = localStorage.getItem(PROFILES_KEY)
  if (!raw) return []
  return JSON.parse(raw) as ProfileState[]
}

function saveProfiles(profiles: ProfileState[]) {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles))
}

export const useProfileStore = defineStore('profile', () => {
  const profiles = ref<ProfileState[]>([])
  const activeProfileId = ref<string>(DEFAULT_PROFILE_ID)

  const activeProfile = computed(() =>
    profiles.value.find((p) => p.id === activeProfileId.value) ?? null
  )

  /** Initialize profile system — call once at app startup */
  function init() {
    profiles.value = loadProfiles()

    if (profiles.value.length === 0) {
      // First run: create default profile and migrate existing data
      const defaultProfile: ProfileState = {
        id: DEFAULT_PROFILE_ID,
        name: 'Hráč',
        createdAt: new Date().toISOString(),
      }
      profiles.value = [defaultProfile]
      saveProfiles(profiles.value)
      migrateExistingData()
    }

    const savedActive = localStorage.getItem(ACTIVE_KEY)
    if (savedActive && profiles.value.some((p) => p.id === savedActive)) {
      activeProfileId.value = savedActive
    } else {
      activeProfileId.value = profiles.value[0]!.id
    }
    localStorage.setItem(ACTIVE_KEY, activeProfileId.value)

    // Set storage adapter prefix for active profile
    resetStorageAdapter(activeProfileId.value)
  }

  /** Migrate pre-profile data to the default profile namespace */
  function migrateExistingData() {
    const oldIndex = localStorage.getItem('gh_tracker_campaigns')
    if (!oldIndex) return

    // Copy index to default profile namespace
    localStorage.setItem(`gh_tracker_${DEFAULT_PROFILE_ID}_campaigns`, oldIndex)

    // Copy each campaign
    const campaigns = JSON.parse(oldIndex) as { id: string }[]
    for (const c of campaigns) {
      const data = localStorage.getItem(`gh_tracker_campaign_${c.id}`)
      if (data) {
        localStorage.setItem(`gh_tracker_${DEFAULT_PROFILE_ID}_campaign_${c.id}`, data)
      }
    }

    // Remove old keys
    localStorage.removeItem('gh_tracker_campaigns')
    for (const c of campaigns) {
      localStorage.removeItem(`gh_tracker_campaign_${c.id}`)
    }
  }

  function createProfile(name: string): ProfileState {
    const profile: ProfileState = {
      id: crypto.randomUUID(),
      name: name.trim(),
      createdAt: new Date().toISOString(),
    }
    profiles.value.push(profile)
    saveProfiles(profiles.value)
    return profile
  }

  function switchProfile(id: string) {
    if (!profiles.value.some((p) => p.id === id)) return
    activeProfileId.value = id
    localStorage.setItem(ACTIVE_KEY, id)
    resetStorageAdapter(id)
  }

  function renameProfile(name: string) {
    const profile = profiles.value.find((p) => p.id === activeProfileId.value)
    if (!profile) return
    profile.name = name.trim()
    saveProfiles(profiles.value)
  }

  function deleteProfile(id: string): boolean {
    if (profiles.value.length <= 1) return false
    const idx = profiles.value.findIndex((p) => p.id === id)
    if (idx < 0) return false

    // Remove profile's campaigns from localStorage
    const prefix = `gh_tracker_${id}_`
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(prefix)) keysToRemove.push(key)
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k))

    profiles.value.splice(idx, 1)
    saveProfiles(profiles.value)

    // Switch to first remaining profile if active was deleted
    if (activeProfileId.value === id) {
      switchProfile(profiles.value[0]!.id)
    }
    return true
  }

  return {
    profiles,
    activeProfileId,
    activeProfile,
    init,
    createProfile,
    switchProfile,
    renameProfile,
    deleteProfile,
  }
})
