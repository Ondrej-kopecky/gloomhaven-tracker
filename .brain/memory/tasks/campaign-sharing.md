# Task: Campaign Sharing (Multiplayer)

**Status:** PLAN
**Priority:** High
**Created:** 2026-03-22

## Popis
Umožnit sdílení kampaně mezi hráči. Jeden hráč je "host", ostatní se připojí 6-místným kódem. Sdílená data (scénáře, blahobyt, reputace, události, úspěchy) se syncují přes cloud. Každý hráč spravuje své postavy.

## Architektura

### Backend (api/main.py)

**Nová tabulka `campaign_members`:**
- campaign_id (FK → campaigns.id, CASCADE delete)
- user_id (FK → users.id)
- joined_at
- UNIQUE(campaign_id, user_id)

**Migrace:**
- ALTER TABLE campaigns ADD COLUMN share_code TEXT UNIQUE

**Nové endpointy:**
- `POST /api/campaigns/{id}/share` → generuje 6-char kód (owner only)
- `DELETE /api/campaigns/{id}/share` → zruší sdílení
- `GET /api/campaigns/{id}/share` → info o sdílení + členové
- `POST /api/campaigns/join` → připojit se kódem
- `POST /api/campaigns/{id}/leave` → opustit sdílenou kampaň
- `DELETE /api/campaigns/{id}/members/{user_id}` → vyhodit člena (owner)

**Úprava existujících:**
- `GET /api/campaigns/` → vracet i kampaně kde jsem member + is_owner flag
- `GET /api/campaigns/{id}` → povolit přístup i memberům
- `POST /api/campaigns/` → povolit save i memberům
- `DELETE /api/campaigns/{id}` → jen owner

**Share code generátor:**
- 6 znaků, uppercase + digits, bez ambiguních (0/O/1/I/L)

### Frontend

**Model (Campaign.ts):**
- shareCode?: string
- isShared?: boolean

**CampaignSummary:**
- isOwner?: boolean
- ownerUsername?: string
- memberCount?: number

**campaignStore.ts:**
- generateShareCode(), revokeShareCode(), joinCampaign(code), leaveCampaign()
- autoSave: pro shared kampaně cloud save je důležitější

**authStore.ts - syncCampaigns():**
- Upload jen owned kampaně
- Download owned + shared

### UI

**SettingsPage → SharePanel:**
- Generovat/zobrazit share kód s copy tlačítkem
- Seznam členů (owner může kicknout)
- "Opustit kampaň" pro non-owners

**CampaignSelectPage:**
- "Připojit se ke kampani" tlačítko + input pro kód
- Badge "sdílená" u shared kampaní

**CharactersPage:**
- ownerUserId na postavách
- Vizuálně odlišit svoje vs cizí postavy

## Soubory k editaci
1. `api/main.py` — backend
2. `src/models/Campaign.ts` — model
3. `src/services/api/campaignApi.ts` — nové API funkce (nebo vytvořit)
4. `src/stores/campaignStore.ts` — sharing stav + akce
5. `src/stores/authStore.ts` — sync úprava
6. `src/pages/SettingsPage.vue` — share panel
7. `src/pages/CampaignSelectPage.vue` — join flow
8. `src/pages/CharactersPage.vue` — character ownership
9. `src/components/layout/AppHeader.vue` — shared badge
