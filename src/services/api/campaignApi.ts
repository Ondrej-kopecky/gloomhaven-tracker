import type { CampaignState, CampaignSummary } from '@/models/Campaign'
import { apiGet, apiPost, apiDelete } from './apiClient'

export function listCampaigns() {
  return apiGet<CampaignSummary[]>('/campaigns/')
}

export function getCampaign(id: string) {
  return apiGet<CampaignState>(`/campaigns/${id}`)
}

export function upsertCampaign(campaign: CampaignState) {
  return apiPost<CampaignState>('/campaigns/', campaign)
}

export function deleteCampaign(id: string) {
  return apiDelete(`/campaigns/${id}`)
}
