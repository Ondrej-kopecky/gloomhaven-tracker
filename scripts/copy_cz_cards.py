import json, os, shutil, sys

sys.stdout = open(sys.stdout.fileno(), mode='w', encoding='utf-8', buffering=1)

with open('C:/Web-haven/gloomhaven/src/data/abilities.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

mappings = {
    'scoundrel': {
        'bodnuti_do_zad': 'backstab',
        'horici_olej': 'burning-oil',
        'mazacici_jed': 'crippling-poison',
        'cistka': 'cull-the-weak',
        'dulantuv_postoj': 'duelists-advance',
        'uder_z_boku': 'flanking-strike',
        'vystrel_z_bambitky': 'flintlock',
        'vjejir_nozu': 'flurry-of-blades',
        'strasliva_vyhoda': 'gruesome-advantage',
        'skryte_ceplele': 'hidden-daggers',
        'velky_podfuk': 'long-con',
        'otevrena_rana': 'open-wound',
        'konec_bolesti': 'pains-end',
        'rychle_prsty': 'quick-hands',
        'vyber_cile': 'single-out',
        'zaludna_prilezitost': 'sinister-opportunity',
        'kourova_bomba': 'smoke-bomb',
        'zvlasni_mast': 'special-mixture',
        'spusteni_pasti': 'spring-the-trap',
        'ukryt_ve_stinech': 'stick-to-the-shadows',
        'dykova_bouře': 'stiletto-storm',
        'svizna_lukostrelba': 'swift-bow',
        'zlodejska_zrucnost': 'thiefs-knack',
        'vrhaci_noze': 'throwing-knives',
        'podvodnikovo_odhaleni': 'tricksters-reversal',
        'otravena_dyka': 'venom-shiv',
        'tvari_v_tvar_nevyhnutelny': 'visage-of-the-inevitable',
        'videt_svet_v_plamenech': 'watch-it-burn',
    },
    'brute': {
        'vyvyzeny_ustup': 'balanced-measure',
        'surova_sila': 'brute-force',
        'mrazici_udery': 'crippling-offensive',
        'obranna_strategie': 'defensive-tactics',
        'znicujici_seknuti': 'devastating-hack',
        'oko_za_oko': 'eye-for-an-eye',
        'tvar_smrti': 'face-your-end',
        'smrtici_postup': 'fatal-advance',
        'sileny_napor': 'frenzied-onslaught',
        'vezmi_to_a_zmiz': 'grab-and-go',
        'retez_z_haky': 'hook-and-chain',
        'falanga': 'immovable-phalanx',
        'kolos': 'juggernaut',
        'pravo_silnejsiho': 'king-of-the-hill',
        'sek_ve_vyskoku': 'leaping-cleave',
        'mocny_rozmach': 'overwhelming-assault',
        'vyvyazeny_rev': 'provoking-roar',
        'utiseni': 'quietus',
        'sobeca_odplata': 'selfish-retribution',
        'uder_stitem': 'shield-bash',
        'spiz': 'skewer',
        'utocny_manevr': 'skirmishing-maneuver',
        'zalozni_dyka': 'spare-dagger',
        'zaplava_uderu': 'sweeping-blow',
        'zaslapani': 'trample',
        'nezastavitelny_vypad': 'unstoppable-charge',
        'zed_zkazy': 'wall-of-doom',
        'strazna_moc': 'warding-strength',
        'vir_cepeli': 'whirlwind',
    },
    'tinkerer': {
        'automaticka_strelba': 'auto-turret',
        'přizbůsobiva_chemiaklie': 'chimeric-formula',
        'klatkovy_luk': 'crank-bow',
        'lecivy_aerosol': 'curative-aerosol',
        'nebezpecne_zarizeni': 'dangerous-contraption',
        'paprsek_rozkaldu': 'disintegration-beam',
        'matoucí_zablesk': 'disorienting-flash',
        'probuzujici_tonikum': 'energizing-tonic',
        'zesilujici_pole': 'enhancement-field',
        'plamenout': 'flamethrower',
        'nadoba_s_plynem': 'gas-canister',
        'neskodne_zarizeni': 'harmless-contraption',
        'nebezpecny_stimulovat': 'harsh-stimulants',
        'vystrelovaci_hak': 'hook-gun',
        'imkoustova_bomba': 'ink-bomb',
        'pravdyvy_pohon': 'jet-propulsion',
        'smrtici_injekce': 'lethal-injection',
        'mikroboti': 'micro-bots',
        'smrtici_zarizeni': 'murderous-contraption',
        'sitostrel': 'net-shooter',
        'jedova_ampule': 'noxious-vials',
        'mocny_elixir': 'potent-potables',
        'naslapna_mina': 'proximity-mine',
        'elixir_obrany': 'reinvigorating-elixir',
        'leciva_malba': 'restorative-mist',
        'ozivujici_naboj': 'reviving-shock',
        'probuzovac_vydrze': 'stamina-booster',
        'omracujici_vystrel': 'stun-shot',
        'kutilovo_naradi': 'tinkerers-tools',
        'toxicka_sipka': 'toxic-bolt',
        'nestabilni_smes': 'volatile-concoction',
    },
    'cragheart': {
        'lavina': 'avalanche',
        'založni_strelivo': 'backup-ammunition',
        'bezohledna_zkaza': 'blind-destruction',
        'hruba_sila': 'blunt-force',
        'smrtici_setrvacnost': 'brutal-momentum',
        'kataklizma': 'cataclysm',
        'z_cesty!': 'clear-the-way',
        'krater': 'crater',
        'drtivny_stisk': 'crushing-grasp',
        'jama': 'dig-pit',
        'prasny_vir': 'dirt-tornado',
        'hruba_hlina': 'earthen-clod',
        'vybusny_uder': 'explosive-punch',
        'mocna_boure': 'forceful-storm',
        'drevorubecuv_sek': 'heaving-swing',
        'velici_se_kameni': 'kinetic-assault',
        'drtic': 'lumbering-bash',
        'vrh_kamenem': 'massive-boulder',
        'meteorit': 'meteor',
        'prirodni_povzbuzeni': 'natures-lift',
        'odvetny_uder': 'opposing-strike',
        'zkameneni': 'petrify',
        'odestepek': 'pulverize',
        'sesuv_pudy': 'rock-slide',
        'skrz_skalu': 'rock-tunnel',
        'kamenne_pesti': 'rocky-end',
        'buracivy_postup': 'rumbling-advance',
        'chytry_rust': 'sentient-growth',
        'odhozeni': 'stone-pummel',
        'nestabilni_otresy': 'unstable-upheaval',
    }
}

ref_map = {'scoundrel': 'SC', 'brute': 'BR', 'tinkerer': 'TI', 'cragheart': 'CH'}
base = 'D:/Download/Gloom/Katry'
dest_base = 'C:/Web-haven/gloomhaven/public/img/abilities'

folders = {
    'scoundrel': 'Lidská ničemnice',
    'brute': 'Inoxský surovec',
    'tinkerer': 'Quatrylský kutil',
    'cragheart': 'Savvasský prasklivec',
}

copied = 0
errors = []
for cls, mapping in mappings.items():
    ref = ref_map[cls]
    folder = folders[cls]
    src_dir = os.path.join(base, folder)
    dst_dir = os.path.join(dest_base, ref)

    for cz_name, en_id in mapping.items():
        src = os.path.join(src_dir, cz_name + '.jpg')
        dst = os.path.join(dst_dir, en_id + '.jpg')
        if os.path.exists(src):
            shutil.copy2(src, dst)
            copied += 1
        else:
            errors.append(f'Missing: {src}')

print(f'Copied {copied} photos')
if errors:
    print(f'Errors ({len(errors)}):')
    for e in errors:
        print(f'  {e}')
