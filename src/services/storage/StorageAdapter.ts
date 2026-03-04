import type { CampaignState, CampaignSummary } from '@/models/Campaign'

export interface StorageAdapter {
  listCampaigns(): Promise<CampaignSummary[]>
  loadCampaign(id: string): Promise<CampaignState | null>
  saveCampaign(campaign: CampaignState): Promise<void>
  deleteCampaign(id: string): Promise<void>
  exportCampaign(id: string): Promise<string>
  importCampaign(json: string): Promise<CampaignState>
}
