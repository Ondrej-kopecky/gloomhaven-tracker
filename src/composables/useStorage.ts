import { LocalStorageAdapter } from '@/services/storage/LocalStorageAdapter'
import { HybridStorageAdapter } from '@/services/storage/HybridStorageAdapter'
import type { StorageAdapter } from '@/services/storage/StorageAdapter'

let adapter: StorageAdapter | null = null
let currentProfileId = 'default'

export function useStorage(): StorageAdapter {
  if (!adapter) {
    adapter = new LocalStorageAdapter(currentProfileId)
  }
  return adapter
}

/** Reset adapter with a new profile prefix — called on profile switch */
export function resetStorageAdapter(profileId: string) {
  currentProfileId = profileId
  adapter = new LocalStorageAdapter(profileId)
}

/** Switch to hybrid (local + cloud) adapter */
export function enableCloudSync() {
  adapter = new HybridStorageAdapter(currentProfileId)
}

/** Switch back to local-only adapter */
export function disableCloudSync() {
  adapter = new LocalStorageAdapter(currentProfileId)
}
