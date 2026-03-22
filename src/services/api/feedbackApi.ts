import { apiPost } from './apiClient'

export interface FeedbackPayload {
  type: 'bug' | 'suggestion' | 'other'
  message: string
  email?: string
  page?: string
  userAgent?: string
  screenSize?: string
  username?: string
  campaignName?: string
  appVersion?: string
}

export function submitFeedback(payload: FeedbackPayload) {
  return apiPost<{ ok: boolean }>('/feedback', payload)
}
