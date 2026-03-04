import { LocalStorageAdapter } from '@/services/storage/LocalStorageAdapter'
import type { StorageAdapter } from '@/services/storage/StorageAdapter'

let adapter: StorageAdapter | null = null

export function useStorage(): StorageAdapter {
  if (!adapter) {
    adapter = new LocalStorageAdapter('default')
  }
  return adapter
}

/** Reset adapter with a new profile prefix — called on profile switch */
export function resetStorageAdapter(profileId: string) {
  adapter = new LocalStorageAdapter(profileId)
}
