import type { CampaignState, CampaignSummary } from '@/models/Campaign'
import type { StorageAdapter } from './StorageAdapter'

function getPrefix(profileId: string): string {
  return `gh_tracker_${profileId}_`
}

export class LocalStorageAdapter implements StorageAdapter {
  private prefix: string
  private indexKey: string

  constructor(profileId: string = 'default') {
    this.prefix = getPrefix(profileId)
    this.indexKey = `${this.prefix}campaigns`
  }

  private getCampaignKey(id: string): string {
    return `${this.prefix}campaign_${id}`
  }

  async listCampaigns(): Promise<CampaignSummary[]> {
    const raw = localStorage.getItem(this.indexKey)
    if (!raw) return []
    return JSON.parse(raw) as CampaignSummary[]
  }

  async loadCampaign(id: string): Promise<CampaignState | null> {
    const raw = localStorage.getItem(this.getCampaignKey(id))
    if (!raw) return null
    return JSON.parse(raw) as CampaignState
  }

  async saveCampaign(campaign: CampaignState): Promise<void> {
    localStorage.setItem(this.getCampaignKey(campaign.id), JSON.stringify(campaign))

    const index = await this.listCampaigns()
    const existing = index.findIndex((c) => c.id === campaign.id)
    const summary: CampaignSummary = {
      id: campaign.id,
      name: campaign.name,
      createdAt: campaign.createdAt,
      lastPlayedAt: campaign.lastPlayedAt,
    }

    if (existing >= 0) {
      index[existing] = summary
    } else {
      index.push(summary)
    }

    localStorage.setItem(this.indexKey, JSON.stringify(index))
  }

  async deleteCampaign(id: string): Promise<void> {
    localStorage.removeItem(this.getCampaignKey(id))

    const index = await this.listCampaigns()
    const filtered = index.filter((c) => c.id !== id)
    localStorage.setItem(this.indexKey, JSON.stringify(filtered))
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
