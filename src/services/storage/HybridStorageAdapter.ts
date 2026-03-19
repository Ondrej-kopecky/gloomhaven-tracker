import type { CampaignState, CampaignSummary } from '@/models/Campaign'
import type { StorageAdapter } from './StorageAdapter'
import { LocalStorageAdapter } from './LocalStorageAdapter'
import { CloudStorageAdapter } from './CloudStorageAdapter'

export class HybridStorageAdapter implements StorageAdapter {
  private local: LocalStorageAdapter
  private cloud: CloudStorageAdapter

  constructor(profileId: string) {
    this.local = new LocalStorageAdapter(profileId)
    this.cloud = new CloudStorageAdapter()
  }

  async listCampaigns(): Promise<CampaignSummary[]> {
    return this.local.listCampaigns()
  }

  async loadCampaign(id: string): Promise<CampaignState | null> {
    return this.local.loadCampaign(id)
  }

  async saveCampaign(campaign: CampaignState): Promise<void> {
    await this.local.saveCampaign(campaign)
    // Fire-and-forget cloud save
    this.cloud.saveCampaign(campaign).catch(() => {})
  }

  async deleteCampaign(id: string): Promise<void> {
    await this.local.deleteCampaign(id)
    this.cloud.deleteCampaign(id).catch(() => {})
  }

  async exportCampaign(id: string): Promise<string> {
    return this.local.exportCampaign(id)
  }

  async importCampaign(json: string): Promise<CampaignState> {
    return this.local.importCampaign(json)
  }
}
