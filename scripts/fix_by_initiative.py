"""Fix ALL ability mappings by matching level+initiative from photo data."""
import json, os, shutil, sys
from PIL import Image

sys.stdout = open(sys.stdout.fileno(), mode='w', encoding='utf-8', buffering=1)

with open('C:/Web-haven/gloomhaven/src/data/abilities.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

base = 'D:/Download/Gloom/Katry'
dest_base = 'C:/Web-haven/gloomhaven/public/img/abilities'

# All photo data from agents: {folder: {filename: {init, level}}}
photo_data = {
    "berserker": {
        "bezhlavy_najezd": {"init": 21, "level": 2},
        "blyskave_rozptyleni": {"init": 8, "level": 4},
        "hrdlo_silenstvi": {"init": 10, "level": 9},
        "kostilam": {"init": 41, "level": 8},
        "krvava_umluva": {"init": 76, "level": 1},
        "mstivy_napor": {"init": 38, "level": 8},
        "neopatrny_vypad": {"init": 20, "level": 7},
        "nesmrtelnost": {"init": 33, "level": 9},
        "nespoutana_sila": {"init": 67, "level": 1.5},
        "nezastavitelna_zkaza": {"init": 57, "level": 6},
        "odhodlany_postoj": {"init": 9, "level": 1},
        "odrazeni": {"init": 14, "level": 1},
        "omracujici_zraneni": {"init": 29, "level": 1},
        "ostnata_zbroj": {"init": 16, "level": 3},
        "posledni_boj": {"init": 89, "level": 5},
        "rohy_demona": {"init": 31, "level": 6},
        "rudy_zavoj": {"init": 22, "level": 5},
        "sila_agonie": {"init": 37, "level": 1},
        "sklenene_kladivo": {"init": 11, "level": 1.5},
        "smrti_navzdory": {"init": 31, "level": 1},
        "smrtici_zurivost": {"init": 34, "level": 3},
        "spalujici_nenavist": {"init": 40, "level": 7},
        "utlumeni_bolesti": {"init": 35, "level": 1.5},
        "utrzena_ze_retezu": {"init": 53, "level": 2},
        "vir_seker": {"init": 27, "level": 4},
        "vybuch_hnevu": {"init": 85, "level": 1},
        "vypaleni_rany": {"init": 40, "level": 1},
        "zmrtvychvstani": {"init": 24, "level": 1},
        "zuriva_pomoc": {"init": 43, "level": 1},
    },
    "beast_tyrant": {
        "celisti_smrti": {"init": 48, "level": 9},
        "hlad_po_krvi": {"init": 42, "level": 6},
        "jedovaty_spojenec": {"init": 79, "level": 1},
        "kruty_spojenec": {"init": 86, "level": 3},
        "kvilejici_strely": {"init": 47, "level": 1},
        "matouci_rev": {"init": 17, "level": 1},
        "mizejici_zraneni": {"init": 23, "level": 1},
        "moc_bice": {"init": 37, "level": 7},
        "mocny_vypad": {"init": 35, "level": 1},
        "neunavny_spojenec": {"init": 81, "level": 1},
        "nezastavitelna_bestie": {"init": 32, "level": 3},
        "ostry_vypad": {"init": 18, "level": 8},
        "plachtici_spojenec": {"init": 77, "level": 1.5},
        "povzbuzujici_uder": {"init": 29, "level": 2},
        "prastary_ochrance": {"init": 19, "level": 4},
        "prirodni_prostredky": {"init": 25, "level": 8},
        "prulom": {"init": 44, "level": 4},
        "prvotni_pozehnani": {"init": 28, "level": 6},
        "soustredena_agrese": {"init": 31, "level": 1.5},
        "soustredeny_hnev": {"init": 51, "level": 1},
        "symbol_kamene": {"init": 95, "level": 5},
        "symbol_klanu": {"init": 91, "level": 9},
        "symbol_vichru": {"init": 93, "level": 7},
        "trhac": {"init": 14, "level": 1},
        "trny_skal": {"init": 11, "level": 2},
        "vymena_dusi": {"init": 22, "level": 1},
        "zapujcena_podstata": {"init": 56, "level": 1.5},
        "zbesilost": {"init": 34, "level": 5},
        "zelezna_srst": {"init": 20, "level": 1},
    },
    "mindthief": {
        "cizopasny_vliv": {"init": 71, "level": 1},
        "hryzava_horda": {"init": 82, "level": 1},
        "kleptomanka": {"init": 68, "level": 4},
        "kruta_krev": {"init": 83, "level": 7},
        "lebecni_pretizeni": {"init": 5, "level": 4},
        "masova_hysterie": {"init": 12, "level": 5},
        "mihnuti": {"init": 20, "level": 1},
        "mnoho_bude_jednim": {"init": 91, "level": 9},
        "mozkova_pijavice": {"init": 16, "level": 3},
        "mrazive_zjeveni": {"init": 29, "level": 1.5},
        "nadvlada": {"init": 13, "level": 8},
        "napor_empatie": {"init": 11, "level": 1},
        "nepratelske_prevzeti": {"init": 9, "level": 2},
        "objeti_zkazenosti": {"init": 39, "level": 6},
        "podrizene_postaveni": {"init": 48, "level": 1},
        "posednuti": {"init": 51, "level": 1.5},
        "psychicka_projekce": {"init": 92, "level": 7},
        "slabina_v_mysli": {"init": 75, "level": 1},
        "spinavy_drap": {"init": 77, "level": 1.5},
        "spolecna_nocni_mura": {"init": 7, "level": 8},
        "strasiva_cepel": {"init": 27, "level": 1},
        "temna_zbesilost": {"init": 10, "level": 6},
        "tichy_vykrik": {"init": 73, "level": 3},
        "vrazedny_prelud": {"init": 67, "level": 9},
        "vstric_noci": {"init": 14, "level": 1},
        "zalostna_stvura": {"init": 84, "level": 2},
        "zamotana_smycka": {"init": 79, "level": 1},
        "zmrazeni_mysli": {"init": 81, "level": 5},
        "zvracene_ostri": {"init": 8, "level": 1},
    },
    "summoner": {
        "etericke_slahouny": {"init": 30, "level": 1.5},
        "hlineny_or": {"init": 13, "level": 2},
        "hnev_z_jineho_sveta": {"init": 35, "level": 8},
        "hul_vizi": {"init": 27, "level": 7},
        "kousavy_vitr": {"init": 25, "level": 1},
        "koznata_kridla": {"init": 90, "level": 1.5},
        "matouci_zjeveni": {"init": 68, "level": 8},
        "mocne_pouto": {"init": 51, "level": 1},
        "negativni_energie": {"init": 95, "level": 7},
        "nekoncici_nadvlada": {"init": 98, "level": 1},
        "nekonecno_hrotu": {"init": 97, "level": 6},
        "neochvejna_paze": {"init": 31, "level": 1},
        "neuprosna_hybnost": {"init": 32, "level": 6},
        "oziveni_divociny": {"init": 92, "level": 1},
        "pani_sfer": {"init": 22, "level": 9},
        "privolana_pomoc": {"init": 81, "level": 5},
        "rohane_velicenstvo": {"init": 80, "level": 9},
        "rozdelena_mysl": {"init": 55, "level": 1},
        "roztrzeni_zavoje": {"init": 41, "level": 3},
        "sila_v_poctu": {"init": 45, "level": 5},
        "slizke_zjeveni": {"init": 86, "level": 3},
        "spoutana_sila": {"init": 61, "level": 1},
        "tekavy_plamen": {"init": 94, "level": 1.5},
        "uchopeni_prazdnoty": {"init": 62, "level": 2},
        "ukovana_zurivost": {"init": 96, "level": 1},
        "zivouci_hora": {"init": 88, "level": 4},
        "zivouci_noc": {"init": 82, "level": 1},
    },
    "nightshroud": {
        "andel_smrti": {"init": 38, "level": 9},
        "cepel_hruzy": {"init": 17, "level": 3},
        "cerne_noze": {"init": 44, "level": 1},
        "cerny_sip": {"init": 11, "level": 5},
        "cihajici_zkaza": {"init": 18, "level": 8},
        "chmurna_sipka": {"init": 78, "level": 8},
        "duch_noci": {"init": 84, "level": 1},
        "hlas_noci": {"init": 6, "level": 9},
        "na_kridlech_noci": {"init": 24, "level": 1.5},
        "nevideny_des": {"init": 5, "level": 6},
        "oci_noci": {"init": 35, "level": 7},
        "plamen_duse": {"init": 85, "level": 2},
        "plast_stinu": {"init": 13, "level": 1},
        "ponura_vyziva": {"init": 29, "level": 4},
        "posilujici_prazdnota": {"init": 21, "level": 1},
        "pozreny_strachem": {"init": 90, "level": 6},
        "priprava_na_vrazdu": {"init": 7, "level": 2},
        "proklety_vanek": {"init": 15, "level": 1},
        "skryta_vyhoda": {"init": 35, "level": 1.5},
        "soumrak": {"init": 73, "level": 4},
        "spary_noci": {"init": 26, "level": 5},
        "tanec_stinu": {"init": 9, "level": 1},
        "temny_oblak": {"init": 74, "level": 1.5},
        "ticha_sila": {"init": 91, "level": 1},
        "ticha_zbesilost": {"init": 19, "level": 7},
        "tichy_jako_kour": {"init": 28, "level": 1},
        "vycerpavajici_zraneni": {"init": 77, "level": 1},
        "zbroj_noci": {"init": 23, "level": 3},
    },
    "doomstalker": {
        "certstve_maso": {"init": 65, "level": 1.5},
        "desiva_kletba": {"init": 37, "level": 1},
        "dest_sipu": {"init": 33, "level": 1},
        "divocina_hladovi": {"init": 82, "level": 6},
        "drtiva_vlna": {"init": 22, "level": 7},
        "chvile_oddechu": {"init": 88, "level": 1},
        "instinkty_selmy": {"init": 35, "level": 8},
        "jatka": {"init": 40, "level": 9},
        "konec_se_blizi": {"init": 47, "level": 7},
        "lov_zacina": {"init": 71, "level": 1.5},
        "lovec_a_korist": {"init": 86, "level": 9},
        "maskovani": {"init": 23, "level": 6},
        "mrzacici_smycka": {"init": 57, "level": 1},
        "nakazlive_zatraceni": {"init": 12, "level": 9},
        "naslapna_mina": {"init": 54, "level": 1},
        "neuprosny_napor": {"init": 52, "level": 2},
        "nezvratny_osud": {"init": 97, "level": 5},
        "ostnata_past": {"init": 53, "level": 4},
        "ostre_klektaky": {"init": 78, "level": 1},
        "pevne_soustredeni": {"init": 28, "level": 4},
        "pevny_luk": {"init": 31, "level": 1},
        "potemnela_obloha": {"init": 25, "level": 3},
        "pytlacke_oko": {"init": 61, "level": 1},
        "rychly_toulec": {"init": 14, "level": 1},
        "rychly_trik": {"init": 11, "level": 1},
        "slabe_misto": {"init": 13, "level": 2},
        "spech_do_hrobu": {"init": 9, "level": 1},
        "stremhlavy_utok": {"init": 75, "level": 1},
        "vysavani_zivota": {"init": 14, "level": 1.5},
        "zesileni_utoku": {"init": 10, "level": 3},
        "zurivy_rozkaz": {"init": 46, "level": 5},
    },
    "sunkeeper": {
        "cesta_slavy": {"init": 48, "level": 5},
        "inspirujici_svatost": {"init": 79, "level": 8},
        "jasna_zastita": {"init": 14, "level": 7},
        "lecive_ruce": {"init": 90, "level": 1},
        "majak_svetla": {"init": 36, "level": 1.5},
        "mobilizujici_postulat": {"init": 23, "level": 3},
        "neochvejna_duvera": {"init": 72, "level": 2},
        "obranny_postoj": {"init": 65, "level": 1},
        "ocistujici_aura": {"init": 21, "level": 1},
        "ochranne_pozehnani": {"init": 61, "level": 1},
        "opatrny_postup": {"init": 23, "level": 1},
        "oslneni": {"init": 91, "level": 6},
        "oslnivy_vypad": {"init": 57, "level": 1},
        "pomoc_shury": {"init": 9, "level": 9},
        "povzbuzujici_rozkaz": {"init": 32, "level": 1},
        "povzneseni_na_nebesa": {"init": 87, "level": 9},
        "prakticke_plany": {"init": 56, "level": 2},
        "sila_ocisty": {"init": 25, "level": 8},
        "spalujici_zablesk": {"init": 51, "level": 3},
        "spravedliva_sila": {"init": 18, "level": 4},
        "svaty_choral": {"init": 11, "level": 6},
        "svaty_uder": {"init": 85, "level": 1},
        "takticky_rozkaz": {"init": 29, "level": 1},
        "uder_kladiva": {"init": 55, "level": 1},
        "usvit": {"init": 85, "level": 1.5},
        "vahy_spravedlnosti": {"init": 68, "level": 5},
        "velkolepy_vyboj": {"init": 39, "level": 1.5},
        "zarici_hav": {"init": 20, "level": 4},
        "zarici_modlitba": {"init": 27, "level": 1},
        "zbran_cistoty": {"init": 73, "level": 7},
    },
    "quartermaster": {
        "dozasobeni": {"init": 73, "level": 1},
        "drobny_vacek": {"init": 84, "level": 4},
        "kalena_ocel": {"init": 12, "level": 5},
        "nabodnuti_na_kopi": {"init": 48, "level": 1},
        "naostreny_bumerang": {"init": 40, "level": 2},
        "obruv_kyj": {"init": 61, "level": 4},
        "odlozena_energie": {"init": 88, "level": 1.5},
        "opevnene_postaveni": {"init": 10, "level": 8},
        "pravidelne_dodavky": {"init": 86, "level": 3},
        "prenosna_balista": {"init": 41, "level": 8},
        "pytel_cennosti": {"init": 91, "level": 9},
        "rozdrceni_kladivem": {"init": 17, "level": 1.5},
        "rozseknutí_sekerou": {"init": 52, "level": 1},
        "sada_brousku": {"init": 23, "level": 1},
        "svitek_blesku": {"init": 77, "level": 3},
        "svitek_blizardu": {"init": 46, "level": 7},
        "svitek_navraceni": {"init": 98, "level": 1.5},
        "svitek_rozsudku": {"init": 66, "level": 5},
        "svitek_smrti": {"init": 56, "level": 9},
        "toulec_plny_sipu": {"init": 31, "level": 6},
        "velky_vak": {"init": 81, "level": 1},
        "vitane_osvezeni": {"init": 89, "level": 7},
        "zbehlost": {"init": 62, "level": 1},
        "zelezna_zed": {"init": 19, "level": 1},
        "zkazonosna_vybusina": {"init": 46, "level": 6},
        "zmrzaceni_sipem": {"init": 44, "level": 1},
        "znovuzkuti": {"init": 95, "level": 2},
        "zrychleny_pochod": {"init": 26, "level": 1},
    },
    "elementalist": {
        "beztvara_sila": {"init": 45, "level": 1},
        "cire_zivly": {"init": 48, "level": 1},
        "erupce_lavy": {"init": 19, "level": 1},
        "jasny_zablesk": {"init": 67, "level": 1.5},
        "kouzlo_protikladu": {"init": 15, "level": 4},
        "krupobitI": {"init": 28, "level": 1},
        "ledove_trny": {"init": 40, "level": 1},
        "mraziva_exploze": {"init": 67, "level": 2},
        "mrazivy_paprsek": {"init": 35, "level": 1},
        "napodobeni": {"init": 94, "level": 6},
        "nezbytne_posileni": {"init": 56, "level": 7},
        "ohnivy_vir": {"init": 17, "level": 1},
        "oko_boure": {"init": 29, "level": 6},
        "ostri_zimy": {"init": 43, "level": 5},
        "pohrbeni_zaziva": {"init": 65, "level": 3},
        "pomsta": {"init": 33, "level": 7},
        "retezovy_blesk": {"init": 41, "level": 3},
        "rovnovaha_zivlu": {"init": 27, "level": 9},
        "sterkove_tornado": {"init": 62, "level": 4},
        "stinovy_zavoj": {"init": 23, "level": 1.5},
        "stit_zivlu": {"init": 14, "level": 8},
        "surove_zivly": {"init": 48, "level": 1},
        "tekavy_zivel": {"init": 64, "level": 8},
        "tvarne_zivly": {"init": 50, "level": 1},
        "tvarovani_hmoty": {"init": 54, "level": 1},
        "ulomky_obsidianu": {"init": 36, "level": 5},
        "virici_cyklon": {"init": 26, "level": 1},
        "vrouci_proud": {"init": 47, "level": 2},
        "zjeveni_zivlu": {"init": 98, "level": 9},
    },
    "sawbones": {
        "amputace": {"init": 86, "level": 5},
        "diagnoza": {"init": 53, "level": 1},
        "eutanazie": {"init": 27, "level": 6},
        "hnev_gentlemana": {"init": 29, "level": 8},
        "hrozivy_uraz": {"init": 81, "level": 9},
        "chirurgicka_brasna": {"init": 10, "level": 7},
        "jehla": {"init": 15, "level": 1},
        "jista_ruka_chirurgova": {"init": 62, "level": 1},
        "krevni_transfuze": {"init": 52, "level": 4},
        "leciva_smes": {"init": 19, "level": 1},
        "lecivy_balicek": {"init": 50, "level": 1.5},
        "lekarsky_recept": {"init": 6, "level": 6},
        "mistrovsky_lecitel": {"init": 49, "level": 7},
        "nepodcenujte_prevenci": {"init": 13, "level": 1.5},
        "nezbytny_uder": {"init": 38, "level": 3},
        "pece_o_nemocne": {"init": 5, "level": 8},
        "polni_medicina": {"init": 83, "level": 1},
        "poruseni_prisahy": {"init": 76, "level": 4},
        "posilujici_injekce": {"init": 42, "level": 1},
        "predbezne_opatreni": {"init": 9, "level": 2},
        "predoperacni_priprava": {"init": 22, "level": 9},
        "prvni_pomoc": {"init": 8, "level": 1},
        "regenerace_tkani": {"init": 46, "level": 3},
        "rychla_pomoc": {"init": 12, "level": 1},
        "skrtidlo": {"init": 62, "level": 2},
        "tymova_prace": {"init": 89, "level": 1.5},
        "vakcina": {"init": 44, "level": 1.5},
        "velky_lecivy_balicek": {"init": 30, "level": 1.5},
        "vyzkum_leku": {"init": 40, "level": 5},
        "zadrzet_bolest": {"init": 57, "level": 1},
        "zkrvavena_pila": {"init": 25, "level": 1},
    },
    "soothsinger": {
        "arie_ozven": {"init": 8, "level": 3},
        "desuplna_reakce": {"init": 60, "level": 6},
        "dunivy_proklamace": {"init": 65, "level": 7},
        "dyka_na_ochranu": {"init": 56, "level": 1},
        "hbity_nuz": {"init": 27, "level": 1.5},
        "inspirujici_hymna": {"init": 50, "level": 4},
        "ladeni_dopadu": {"init": 78, "level": 1},
        "matouci_zalozpev": {"init": 14, "level": 4},
        "melodie_v_harmonii": {"init": 78, "level": 5},
        "mocna_balada": {"init": 19, "level": 1},
        "mrzacici_chor": {"init": 62, "level": 3},
        "nekonecny_napev": {"init": 51, "level": 1},
        "obranny_popevek": {"init": 9, "level": 1},
        "panovacna_pritomnost": {"init": 59, "level": 8},
        "pisen_rychlosti": {"init": 5, "level": 1},
        "podmanivy_predstaveni": {"init": 25, "level": 9},
        "pochodovy_rytmus": {"init": 32, "level": 1},
        "pokojny_trylek": {"init": 10, "level": 8},
        "serenada_z_nocni_mury": {"init": 13, "level": 7},
        "stinove_loutky": {"init": 52, "level": 9},
        "takt_mobilizace": {"init": 6, "level": 5},
        "uklidnujici_ukolebavka": {"init": 11, "level": 2},
        "volani_do_zbrane": {"init": 85, "level": 1},
        "vrzeny_hlas": {"init": 44, "level": 1},
        "zabrnkat_na_struny": {"init": 20, "level": 6},
        "zmena_rytmu": {"init": 91, "level": 2},
        "zpivajici_sip": {"init": 89, "level": 1},
        "zraneni_tesklivosti": {"init": 16, "level": 1.5},
    },
    "plagueherald": {
        "bidny_roj": {"init": 84, "level": 1},
        "boure_kridel": {"init": 91, "level": 4},
        "dobrovolna_obet": {"init": 84, "level": 5},
        "epidemie": {"init": 43, "level": 1.5},
        "hnilobni_cervi": {"init": 69, "level": 2},
        "hromadne_vymirani": {"init": 94, "level": 9},
        "moc_nakazy": {"init": 29, "level": 9},
        "mrak_zihadel": {"init": 66, "level": 6},
        "nakazliva_choroba": {"init": 50, "level": 1.5},
        "nepredstavitelne_utrpeni": {"init": 43, "level": 4},
        "odporna_nakaza": {"init": 61, "level": 1},
        "okridleny_sbor": {"init": 16, "level": 1},
        "pachnouci_vichr": {"init": 26, "level": 3},
        "paralyzujici_kousnuti": {"init": 31, "level": 1},
        "pliziva_kletba": {"init": 72, "level": 1},
        "plynny_jed": {"init": 57, "level": 7},
        "pod_kuzi": {"init": 59, "level": 2},
        "poddej_se_daru": {"init": 70, "level": 3},
        "rozptyleny_des": {"init": 11, "level": 1},
        "shromazdeni_zkazy": {"init": 76, "level": 1},
        "sireni_nakazy": {"init": 27, "level": 1},
        "sirici_se_pohroma": {"init": 71, "level": 8},
        "stipajici_komari": {"init": 47, "level": 1},
        "svirajici_havet": {"init": 69, "level": 1},
        "temna_umluva": {"init": 46, "level": 8},
        "temny_priliv": {"init": 37, "level": 6},
        "urychleny_konec": {"init": 62, "level": 5},
        "vir_puchyru": {"init": 21, "level": 1.5},
        "zhoubna_kletba": {"init": 33, "level": 7},
        "zkazeny_vitr": {"init": 35, "level": 1},
    },
    "spellweaver": {
        "blyskavy_vybuch": {"init": 26, "level": 2},
        "bodavy_vybuch": {"init": 70, "level": 1},
        "carovny_vyboj": {"init": 7, "level": 1},
        "carovra_pomoc": {"init": 91, "level": 1.5},
        "cerna_dira": {"init": 41, "level": 9},
        "duch_zkazy": {"init": 81, "level": 4},
        "dvojita_obnova": {"init": 75, "level": 7},
        "exploze_barev": {"init": 71, "level": 5},
        "kamenne_pesti": {"init": 62, "level": 7},
        "kridla_zefyru": {"init": 85, "level": 8},
        "ledovy_uder": {"init": 66, "level": 2},
        "mraziva_noc": {"init": 46, "level": 6},
        "mraziva_zbroj": {"init": 20, "level": 1},
        "mrazivy_vybuch": {"init": 21, "level": 1},
        "na_kridlech_vetru": {"init": 83, "level": 1},
        "ohnive_koule": {"init": 69, "level": 1},
        "ohnive_peklo": {"init": 19, "level": 9},
        "plamenny_uder": {"init": 36, "level": 1},
        "plameny_mrazu": {"init": 67, "level": 3},
        "plast_z_plamenu": {"init": 44, "level": 5},
        "pomoc_zivlu": {"init": 84, "level": 1.5},
        "praskajici_vyboje": {"init": 25, "level": 1.5},
        "probuzeni_car": {"init": 80, "level": 1},
        "rozvetveny_paprsek": {"init": 20, "level": 4},
        "studena_fronta": {"init": 61, "level": 8},
        "tvrzene_hroty": {"init": 26, "level": 1.5},
        "zivouci_pochoden": {"init": 96, "level": 6},
    },
}

# CZ display names with diacritics (from agent card reading)
cz_display = {}
# We'll load these from the original agent data - for now use the names we already have
# from the card identification agents

folder_map = {
    "berserker": "Inoxská fúrie",
    "beast_tyrant": "Krysácký zvěropán",
    "mindthief": "Krysácká zlodějka mysli",
    "summoner": "Aestherská vyvolávačka",
    "nightshroud": "Aestherský stínochodec",
    "doomstalker": "Orchidský zkázolov",
    "sunkeeper": "Valrathská světlonoška",
    "quartermaster": "Valrathský zbrojmistr",
    "elementalist": "Savvasská vládkyně živlů",
    "sawbones": "Lidský kostiřez",
    "soothsinger": "Quatrylská čaropěvkyně",
    "plagueherald": "Trýznitelský moronoš",
    "spellweaver": "Orchidská čarovnice",
}

ref_map = {
    'berserker': 'BE', 'beast_tyrant': 'BT', 'mindthief': 'MT',
    'summoner': 'SU', 'nightshroud': 'NS', 'spellweaver': 'SW',
    'doomstalker': 'DS', 'sunkeeper': 'SK', 'quartermaster': 'QM',
    'elementalist': 'EL', 'sawbones': 'SB', 'soothsinger': 'SS',
    'plagueherald': 'PH',
}

# Build EN ability lookup: class -> (level, init) -> ability
en_lookup = {}
for a in data:
    cls = a['classId']
    if cls not in en_lookup:
        en_lookup[cls] = {}
    key = (a['level'], a['initiative'])
    en_lookup[cls][key] = a

total_mapped = 0
total_copied = 0
unmatched = []

for cls, photos in photo_data.items():
    ref = ref_map.get(cls)
    folder = folder_map.get(cls)
    if not ref or not folder:
        continue

    src_dir = os.path.join(base, folder)
    dst_dir = os.path.join(dest_base, ref)
    os.makedirs(dst_dir, exist_ok=True)

    # Clear old images for this class
    for f in os.listdir(dst_dir):
        if f.endswith('.jpg') and f != 'back.jpg':
            os.remove(os.path.join(dst_dir, f))

    cls_lookup = en_lookup.get(cls, {})
    mapped = 0

    for cz_name, info in photos.items():
        key = (info['level'], info['init'])
        if key in cls_lookup:
            ability = cls_lookup[key]
            src = os.path.join(src_dir, cz_name + '.jpg')
            dst = os.path.join(dst_dir, ability['id'] + '.jpg')
            if os.path.exists(src):
                img = Image.open(src)
                if img.width > 600:
                    ratio = 600 / img.width
                    img = img.resize((600, int(img.height * ratio)), Image.LANCZOS)
                img.save(dst, quality=80, optimize=True)
                img.close()
                total_copied += 1

            # Set CZ name with simple capitalization from filename
            display = cz_name.replace('_', ' ')
            display = display[0].upper() + display[1:]
            ability['nameCz'] = display
            mapped += 1
            total_mapped += 1
        else:
            unmatched.append(f'{cls}/{cz_name} (Lv.{info["level"]} init.{info["init"]})')

    print(f'{folder} ({cls}): {mapped}/{len(photos)} mapped')

# Save
with open('C:/Web-haven/gloomhaven/src/data/abilities.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f'\nTotal: {total_mapped} mapped, {total_copied} photos copied')
if unmatched:
    print(f'\nUnmatched ({len(unmatched)}):')
    for u in unmatched:
        print(f'  {u}')
