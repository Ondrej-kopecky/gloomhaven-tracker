import json

translations = {
    510: {"name": "Hledač Xorna", "progress": [
        "Úspěšně dokonči 3 scénáře v kryptách.",
        "Zpřístupněte Zamořený sklep (scénář 52) a pokračujte dle instrukcí."
    ]},
    511: {"name": "Kupec", "progress": [
        "Vlastni 2 předměty na tělo.",
        "Vlastni 2 předměty na hlavu.",
        "Vlastni 2 předměty na nohy.",
        "Vlastni 3 předměty na jednu nebo dvě ruce.",
        "Vlastni 4 drobné předměty."
    ]},
    512: {"name": "Chamtivost není hřích", "progress": ["Vlastni 200 zlaťáků."]},
    513: {"name": "Hledání léku", "progress": [
        "Zabij 8 lesních rarachů.",
        "Zpřístupněte Zapomenutý háj (scénář 59) a pokračujte dle instrukcí."
    ]},
    514: {"name": "Studie o krvavé", "progress": ["Členové tvojí družiny se musí 15krát vyčerpat."]},
    515: {"name": "Zákonodárce", "progress": ["Zabij dohromady 20 zbojníků a kultistů."]},
    516: {"name": "Oko za oko", "progress": ["Zabij 15 krysáků."]},
    517: {"name": "Sběratel trofejí", "progress": ["Zabij 20 nestvůr, z nichž každá bude různého typu."]},
    518: {"name": "Věčný poutník", "progress": ["Dokonči 15 různých scénářů."]},
    519: {"name": "Legendární válečník", "progress": ["Získej 15 fajfek za splněné malé úkoly."]},
    520: {"name": "Nástroj světla", "progress": [
        "Najdi v Nekromantčině svatyni Lebkolam.",
        "Zabij s ním 7 živoucích koster, živoucích mrtvol nebo živoucích přízraků."
    ]},
    521: {"name": "Obránce lesa", "progress": [
        "Dokonči 3 scénáře v Dýkovém hvozdě.",
        "Zpřístupněte Mlžné houštiny (scénář 55) a pokračujte dle instrukcí."
    ]},
    522: {"name": "Tenký závoj", "progress": ["Dokonči 6 vedlejších scénářů (číslo vyšší než 51)."]},
    523: {"name": "Lovec démonů", "progress": [
        "Zabij démona plamene.",
        "Zabij démona mrazu.",
        "Zabij démona vichru.",
        "Zabij démona země.",
        "Zabij démona noci.",
        "Zabij démona slunce."
    ]},
    524: {"name": "Bez bázně a hany", "progress": ["Zabij 20 elitních nestvůr."]},
    525: {"name": "Zbožnost nade vše", "progress": ["Přispěj 120 zlaťáky Svatyni Velkého dubu."]},
    526: {"name": "Pomsta", "progress": [
        "Dokonči 4 scénáře v Gloomhavenu.",
        "Zpřístupněte Vyšetřování (scénář 57) a pokračujte dle instrukcí."
    ]},
    527: {"name": "Uctívač Krvavého boha", "progress": ["12krát se vyčerpej."]},
    528: {"name": "Zabiják obrů", "progress": ["Dokonči 4 scénáře s bossem."]},
    529: {"name": "Konec civilizace", "progress": [
        "Dokonči 2 scénáře v Nekonečných močálech.",
        "Zpřístupněte Mizející maják (scénář 61) a pokračujte dle instrukcí."
    ]},
    530: {"name": "Vylepšené schopnosti", "progress": ["Pořiď si 4 vylepšení schopností."]},
    531: {"name": "Vzorky živlů", "progress": [
        "Dokonči scénář v Gloomhavenu.",
        "Dokonči scénář v Dýkovém hvozdě.",
        "Dokonči scénář v Nekonečných močálech.",
        "Dokonči scénář ve Strážných horách.",
        "Dokonči scénář v Měděných horách.",
        "Dokonči scénář u Mlžného moře."
    ]},
    532: {"name": "Pomocná ruka", "progress": ["Další 2 hrdinové musí splnit své velké úkoly."]},
    533: {"name": "Dokonalý jed", "progress": ["Zabij 3 slizy, 3 číhavce a 3 plivající draky."]},
}

with open("C:/Web-haven/gloomhaven/src/data/personalQuests.json", "r", encoding="utf-8") as f:
    quests = json.load(f)

for q in quests:
    if q["id"] in translations:
        t = translations[q["id"]]
        q["name"] = t["name"]
        for i, prog_text in enumerate(t["progress"]):
            if i < len(q["progress"]):
                q["progress"][i]["name"] = prog_text

with open("C:/Web-haven/gloomhaven/src/data/personalQuests.json", "w", encoding="utf-8") as f:
    json.dump(quests, f, ensure_ascii=False, indent=2)

print("Hotovo - 24 questu aktualizovano z oficialnich ceskych karet")
