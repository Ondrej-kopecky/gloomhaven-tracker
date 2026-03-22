# Task: Campaign Sharing (Multiplayer)

**Status:** ACCEPTED
**Priority:** High
**Created:** 2026-03-22
**Completed:** 2026-03-22
**Version:** 3.0.0

## Výsledek
Implementováno a nasazeno. Owner vygeneruje 6-místný kód, ostatní se připojí. Sdílí se celý CampaignState (scénáře, blahobyt, reputace, úspěchy, události, postavy). Last-write-wins, bez realtime sync.

## Poučení z nasazení
- SQLite nepodporuje `ALTER TABLE ADD COLUMN ... UNIQUE` — nutné přidat sloupec a index zvlášť
- `databases` knihovna mapuje sloupce jen z SQLAlchemy Table definice — nový sloupec musí být i tam
- Pojmenování: helper funkce nesmí mít stejný název jako endpoint (Python scope)
- `HybridStorageAdapter.listCampaigns()` čte jen z localStorage — po join nutné stáhnout data z API manuálně
- Re-join po lokálním smazání: endpoint musí tolerovat existující membership

## Co nebylo implementováno (budoucí rozšíření)
- Realtime sync (WebSocket/polling)
- Rozlišení vlastních vs cizích postav na CharactersPage
- Konfliktní řešení (merge vs last-write-wins)
