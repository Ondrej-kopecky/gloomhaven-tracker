import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
  undoAction?: () => void
}

let nextId = 0

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([])

  function show(message: string, type: Toast['type'] = 'success', undoAction?: () => void) {
    const id = nextId++
    toasts.value.push({ id, message, type, undoAction })
    setTimeout(() => dismiss(id), undoAction ? 6000 : 4000)
  }

  function dismiss(id: number) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  function undo(id: number) {
    const toast = toasts.value.find((t) => t.id === id)
    if (toast?.undoAction) {
      toast.undoAction()
      dismiss(id)
    }
  }

  return { toasts, show, dismiss, undo }
})
