import type { CampaignState, CampaignSummary, ShareInfo } from '@/models/Campaign'
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

// --- Sharing ---
export function generateShareCode(campaignId: string) {
  return apiPost<{ shareCode: string }>(`/campaigns/${campaignId}/share`)
}

export function revokeShareCode(campaignId: string) {
  return apiDelete(`/campaigns/${campaignId}/share`)
}

export function getShareInfo(campaignId: string) {
  return apiGet<ShareInfo>(`/campaigns/${campaignId}/share`)
}

export function joinCampaign(code: string) {
  return apiPost<{ message: string; campaignId: string; campaignName: string; ownerUsername: string }>('/campaigns/join', { code })
}

export function leaveCampaign(campaignId: string) {
  return apiPost<{ message: string }>(`/campaigns/${campaignId}/leave`)
}

export function kickMember(campaignId: string, userId: number) {
  return apiDelete(`/campaigns/${campaignId}/members/${userId}`)
}
