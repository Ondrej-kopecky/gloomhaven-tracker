import { apiPost } from './apiClient'

export interface FeedbackPayload {
  type: 'bug' | 'suggestion' | 'other'
  message: string
  email?: string
  page?: string
  userAgent?: string
}

export function submitFeedback(payload: FeedbackPayload) {
  return apiPost<{ ok: boolean }>('/feedback', payload)
}
