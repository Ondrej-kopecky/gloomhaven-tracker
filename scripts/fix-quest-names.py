import json

translations = {
    1: "Černá mohyla",
    2: "Jekseřiny karavany",
    3: "Chmur",
    4: "Prastaré krypty",
    6: "Jekseřino tajemství",
    7: "Hon na diamanty",
    8: "Děsivá nora",
    9: "Pátrání po Jekseře",
    10: "Nová pravá ruka",
    11: "Rozpolcenost",
    12: "Volby",
    13: "Aestherská žena",
    14: "Síla a moc",
    15: "Pátrání po dracích",
    16: "Ostrov v Mlžném moři",
    17: "Odporná tekutina",
    18: "Uzavření",
    19: "Vyvolávání duchů",
    20: "Tajemný předmět",
    21: "Hluboký ponor",
    22: "Hlas",
    23: "Studium Hlasu",
    24: "Přerušené vazby",
    25: "Nádoby",
    26: "Zabít či nezabít",
    27: "Prastarý drak",
    28: "Přitažlivost temnoty",
    30: "Potápění",
    31: "Černý les",
    32: "K vrcholkům",
    33: "Prostě buď zticha!",
    34: "Tekoucí voda",
    35: "Svoboda!",
    36: "Povstalci",
    37: "Krveprolití",
    38: "Nová naděje",
    39: "Zkáza",
    72: "Radního nabídka",
    73: "Příběh Aestherky",
    77: "Infiltrace Bdělé hlídky",
}

with open("C:/Web-haven/gloomhaven/src/data/quests.json", "r", encoding="utf-8") as f:
    quests = json.load(f)

for q in quests:
    if q["id"] in translations:
        q["name"] = translations[q["id"]]

with open("C:/Web-haven/gloomhaven/src/data/quests.json", "w", encoding="utf-8") as f:
    json.dump(quests, f, ensure_ascii=False, indent=2)

print(f"Prelozeno {len(translations)} questovych linii")
