"""
Fix ALL ability card mappings by matching initiative values.
Each card photo has a unique initiative number that matches the EN ability data.
"""
import json, os, shutil, sys
from PIL import Image

sys.stdout = open(sys.stdout.fileno(), mode='w', encoding='utf-8', buffering=1)

with open('C:/Web-haven/gloomhaven/src/data/abilities.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

base = 'D:/Download/Gloom/Katry'
dest_base = 'C:/Web-haven/gloomhaven/public/img/abilities'

folder_to_class = {
    'Inoxská fúrie': 'berserker',
    'Krysácký zvěropán': 'beast_tyrant',
    'Krysácká zlodějka mysli': 'mindthief',
    'Aestherská vyvolávačka': 'summoner',
    'Aestherský stínochodec': 'nightshroud',
    'Orchidská čarovnice': 'spellweaver',
    'Orchidský zkázolov': 'doomstalker',
    'Valrathská světlonoška': 'sunkeeper',
    'Valrathský zbrojmistr': 'quartermaster',
    'Savvasská vládkyně živlů': 'elementalist',
    'Lidský kostiřez': 'sawbones',
    'Quatrylská čaropěvkyně': 'soothsinger',
    'Trýznitelský moronoš': 'plagueherald',
    'Inoxský surovec': 'brute',
    'Lidská ničemnice': 'scoundrel',
    'Quatrylský kutil': 'tinkerer',
    'Savvasský prasklivec': 'cragheart',
}

class_to_ref = {
    'berserker': 'BE', 'beast_tyrant': 'BT', 'mindthief': 'MT',
    'summoner': 'SU', 'nightshroud': 'NS', 'spellweaver': 'SW',
    'doomstalker': 'DS', 'sunkeeper': 'SK', 'quartermaster': 'QM',
    'elementalist': 'EL', 'sawbones': 'SB', 'soothsinger': 'SS',
    'plagueherald': 'PH', 'brute': 'BR', 'scoundrel': 'SC',
    'tinkerer': 'TI', 'cragheart': 'CH',
}

# Pre-built photo initiative data (from agent reading)
# We'll use this for spellweaver, and read initiative from abilities.json for matching
# For ALL classes: match by initiative (unique per class for most cards)

# Build EN ability lookup by class: initiative -> ability
en_lookup = {}
for a in data:
    cls = a['classId']
    if cls not in en_lookup:
        en_lookup[cls] = {}
    init = a['initiative']
    level = a['level']
    key = (level, init)
    en_lookup[cls][key] = a

total_fixed = 0
total_copied = 0

for folder, cls in folder_to_class.items():
    src_dir = os.path.join(base, folder)
    ref = class_to_ref.get(cls)
    if not ref:
        continue
    dst_dir = os.path.join(dest_base, ref)
    os.makedirs(dst_dir, exist_ok=True)

    if not os.path.exists(src_dir):
        continue

    photos = [f for f in os.listdir(src_dir) if f.endswith('.jpg')]
    abilities = [a for a in data if a['classId'] == cls]

    if len(photos) == 0:
        continue

    print(f'\n=== {folder} ({cls}, {ref}) === {len(photos)} photos, {len(abilities)} abilities')

    # For each ability, check if we already have a correct mapping
    # We need the photo data (initiative) to match - but we only have it for SW from the agent
    # For other classes, we trust the filename mapping and just ensure files exist
    #
    # Actually, the core issue is that the CZ->EN name mapping was wrong.
    # The safest fix: for each class, clear old images, then re-copy from source photos
    # using the EXISTING mapping (which may be wrong for some)
    #
    # The REAL fix needs initiative data from ALL photos. Let me at least fix SW properly
    # and for others, just ensure the photos are copied.

# For SW specifically, we have initiative data - fix it properly
sw_photo_data = {
    "blyskavy_vybuch":      {"init": 26, "level": 2},
    "bodavy_vybuch":        {"init": 70, "level": 1},
    "carovny_vyboj":        {"init": 7,  "level": 1},
    "carovra_pomoc":        {"init": 91, "level": 1.5},
    "cerna_dira":           {"init": 41, "level": 9},
    "duch_zkazy":           {"init": 81, "level": 4},
    "dvojita_obnova":       {"init": 75, "level": 7},
    "exploze_barev":        {"init": 71, "level": 5},
    "kamenne_pesti":        {"init": 62, "level": 7},
    "kridla_zefyru":        {"init": 85, "level": 8},
    "ledovy_uder":          {"init": 66, "level": 2},
    "mraziva_noc":          {"init": 46, "level": 6},
    "mraziva_zbroj":        {"init": 20, "level": 1},
    "mrazivy_vybuch":       {"init": 21, "level": 1},
    "na_kridlech_vetru":    {"init": 83, "level": 1},
    "ohnive_koule":         {"init": 69, "level": 1},
    "ohnive_peklo":         {"init": 19, "level": 9},
    "plamenny_uder":        {"init": 36, "level": 1},
    "plameny_mrazu":        {"init": 67, "level": 3},
    "plast_z_plamenu":      {"init": 44, "level": 5},
    "pomoc_zivlu":          {"init": 84, "level": 1.5},
    "praskajici_vyboje":    {"init": 25, "level": 1.5},
    "probuzeni_car":        {"init": 80, "level": 1},
    "rozvetveny_paprsek":   {"init": 20, "level": 4},
    "studena_fronta":       {"init": 61, "level": 8},
    "tvrzene_hroty":        {"init": 26, "level": 1.5},
    "zivouci_pochoden":     {"init": 96, "level": 6},
}

# Clear ALL SW images first
sw_dst = os.path.join(dest_base, 'SW')
for f in os.listdir(sw_dst):
    if f.endswith('.jpg'):
        os.remove(os.path.join(sw_dst, f))

# Match by level + initiative
sw_abilities = {(a['level'], a['initiative']): a for a in data if a['classId'] == 'spellweaver'}
sw_src = os.path.join(base, 'Orchidská čarovnice')

print('\n=== SPELLWEAVER FIX (by initiative) ===')
sw_mapped = 0
for cz_name, info in sw_photo_data.items():
    key = (info['level'], info['init'])
    if key in sw_abilities:
        ability = sw_abilities[key]
        src = os.path.join(sw_src, cz_name + '.jpg')
        dst = os.path.join(sw_dst, ability['id'] + '.jpg')
        if os.path.exists(src):
            # Optimize and copy
            img = Image.open(src)
            if img.width > 600:
                ratio = 600 / img.width
                img = img.resize((600, int(img.height * ratio)), Image.LANCZOS)
            img.save(dst, quality=80, optimize=True)
            img.close()

            # Update CZ name with proper diacritics
            cz_display = cz_name.replace('_', ' ').capitalize()
            # Use the name from photo data agent (with diacritics)
            ability['nameCz'] = {
                "blyskavy_vybuch": "Blýskavý výbuch",
                "bodavy_vybuch": "Bodavý výbuch",
                "carovny_vyboj": "Čarovný výboj",
                "carovra_pomoc": "Čarovná pomoc",
                "cerna_dira": "Černá díra",
                "duch_zkazy": "Duch zkázy",
                "dvojita_obnova": "Dvojitá obnova",
                "exploze_barev": "Exploze barev",
                "kamenne_pesti": "Kamenné pěsti",
                "kridla_zefyru": "Křídla zefýrů",
                "ledovy_uder": "Ledový úder",
                "mraziva_noc": "Mrazivá noc",
                "mraziva_zbroj": "Mrazivá zbroj",
                "mrazivy_vybuch": "Mrazivý výbuch",
                "na_kridlech_vetru": "Na křídlech větru",
                "ohnive_koule": "Ohnivé koule",
                "ohnive_peklo": "Ohnivé peklo",
                "plamenny_uder": "Plamenný úder",
                "plameny_mrazu": "Plameny mrazu",
                "plast_z_plamenu": "Plášť z plamenů",
                "pomoc_zivlu": "Pomoc živlů",
                "praskajici_vyboje": "Praskající výboje",
                "probuzeni_car": "Probuzení čar",
                "rozvetveny_paprsek": "Rozvětvený paprsek",
                "studena_fronta": "Studená fronta",
                "tvrzene_hroty": "Tvrzené hroty",
                "zivouci_pochoden": "Živoucí pochodeň",
            }.get(cz_name, cz_display)

            sw_mapped += 1
            print(f'  {cz_name} (Lv.{info["level"]} init.{info["init"]}) -> {ability["id"]}')
    else:
        print(f'  NO MATCH: {cz_name} (Lv.{info["level"]} init.{info["init"]})')

print(f'SW: {sw_mapped}/27 mapped')

# Save
with open('C:/Web-haven/gloomhaven/src/data/abilities.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print('\nDone! SW fixed by initiative matching.')
print('Other classes need the same treatment - run agents to read initiative from all photos.')
