import type { CampaignState, CampaignSummary } from '@/models/Campaign'
import type { StorageAdapter } from './StorageAdapter'
import * as campaignApi from '@/services/api/campaignApi'

export class CloudStorageAdapter implements StorageAdapter {
  async listCampaigns(): Promise<CampaignSummary[]> {
    const { data } = await campaignApi.listCampaigns()
    return data ?? []
  }

  async loadCampaign(id: string): Promise<CampaignState | null> {
    const { data } = await campaignApi.getCampaign(id)
    return data
  }

  async saveCampaign(campaign: CampaignState): Promise<void> {
    await campaignApi.upsertCampaign(campaign)
  }

  async deleteCampaign(id: string): Promise<void> {
    await campaignApi.deleteCampaign(id)
  }

  async exportCampaign(id: string): Promise<string> {
    const campaign = await this.loadCampaign(id)
    if (!campaign) throw new Error(`Kampaň ${id} nenalezena`)
    return JSON.stringify(campaign, null, 2)
  }

  async importCampaign(json: string): Promise<CampaignState> {
    const campaign = JSON.parse(json) as CampaignState
    await this.saveCampaign(campaign)
    return campaign
  }
}
