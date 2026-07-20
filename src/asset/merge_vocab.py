"""
One-off helper: merge curated vocabulary (sourced from the MIE Kreol Morisien
grade textbooks in this folder) into src/data/dictionary.json.

Only the WORD FORMS come from the textbooks (used as a frequency/grade signal);
the English/French meanings are authored here, not copied from the books, which
are monolingual and copyrighted (c) Mauritius Institute of Education.
Grade 1 -> beginner, Grade 3 -> intermediate, Grade 4 -> advanced.
"""
import json
import os

DICT_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "dictionary.json")

# headword, partOfSpeech, meaningEn, meaningFr, category, level, [example_mfe, example_en]
NEW = [
    # --- Beginner (Grade 1) ---
    ("laniverser", "noun", "Birthday", "Anniversaire", "general", "beginner", ["Zordi mo laniverser.", "Today is my birthday."]),
    ("liniver", "noun", "Universe", "Univers", "general", "beginner", None),
    ("soulie", "noun", "Shoe / shoes", "Chaussure", "general", "beginner", None),
    ("kreyon", "noun", "Pencil", "Crayon", "general", "beginner", None),
    ("gato", "noun", "Cake", "Gâteau", "food", "beginner", ["Enn gato laniverser.", "A birthday cake."]),
    ("desin", "noun", "Drawing", "Dessin", "general", "beginner", None),
    ("dile", "noun", "Milk", "Lait", "food", "beginner", None),
    ("dimounn", "noun", "Person / people", "Personne / gens", "general", "beginner", None),
    ("ledwa", "noun", "Finger", "Doigt", "general", "beginner", None),
    ("kado", "noun", "Gift / present", "Cadeau", "general", "beginner", None),
    ("liv", "noun", "Book", "Livre", "general", "beginner", None),
    ("kari", "noun", "Curry", "Cari", "food", "beginner", ["Kari poul ek diri.", "Chicken curry with rice."]),
    ("klas", "noun", "Class / classroom", "Classe", "general", "beginner", None),
    ("panie", "noun", "Basket", "Panier", "general", "beginner", None),
    ("piknik", "noun", "Picnic", "Pique-nique", "general", "beginner", None),
    ("lake", "noun", "Tail", "Queue", "general", "beginner", None),
    ("bwat", "noun", "Box", "Boîte", "general", "beginner", None),
    ("lagitar", "noun", "Guitar", "Guitare", "general", "beginner", None),
    ("sapo", "noun", "Hat", "Chapeau", "general", "beginner", None),
    ("sokola", "noun", "Chocolate", "Chocolat", "food", "beginner", None),
    ("zanimo", "noun", "Animal", "Animal", "general", "beginner", None),
    ("kamera", "noun", "Camera", "Caméra", "general", "beginner", None),
    ("gro", "adjective", "Big / fat", "Gros", "general", "beginner", None),
    ("baton", "noun", "Stick", "Bâton", "general", "beginner", None),
    # --- Intermediate (Grade 3) ---
    ("pie", "noun", "Tree / plant", "Arbre / plante", "general", "intermediate", ["Enn pie mang.", "A mango tree."]),
    ("kanet", "noun", "Marble (toy)", "Bille", "general", "intermediate", None),
    ("zistwar", "noun", "Story", "Histoire", "general", "intermediate", ["Rakont mwa enn zistwar.", "Tell me a story."]),
    ("bato", "noun", "Boat / ship", "Bateau", "general", "intermediate", None),
    ("bonnfam", "noun", "Woman / old lady (informal)", "Femme / vieille dame", "general", "intermediate", None),
    ("reponn", "verb", "To answer / to reply", "Répondre", "general", "intermediate", None),
    ("konpran", "verb", "To understand", "Comprendre", "general", "intermediate", None),
    ("sorsier", "noun", "Witch", "Sorcière", "traditional", "intermediate", None),
    ("zour", "noun", "Day", "Jour", "general", "intermediate", None),
    ("pran", "verb", "To take", "Prendre", "general", "intermediate", None),
    ("fini", "verb", "To finish / finished", "Finir", "general", "intermediate", None),
    ("pavion", "noun", "Flag", "Drapeau", "general", "intermediate", None),
    ("demann", "verb", "To ask (for)", "Demander", "general", "intermediate", None),
    ("ros", "noun", "Rock / stone", "Roche / pierre", "general", "intermediate", None),
    ("vie", "adjective", "Old", "Vieux", "general", "intermediate", None),
    ("lil", "noun", "Island", "Île", "traditional", "intermediate", ["Moris se enn zoli lil.", "Mauritius is a beautiful island."]),
    ("madam", "noun", "Lady / madam / Mrs", "Madame", "family", "intermediate", None),
    ("frer", "noun", "Brother", "Frère", "family", "intermediate", None),
    ("pwason", "noun", "Fish", "Poisson", "food", "intermediate", None),
    ("fet", "noun", "Party / celebration / festival", "Fête", "traditional", "intermediate", None),
    ("tann", "verb", "To hear", "Entendre", "general", "intermediate", None),
    ("zoli", "adjective", "Pretty / beautiful", "Joli / beau", "general", "intermediate", None),
    # --- Advanced (Grade 4) ---
    ("servolan", "noun", "Kite", "Cerf-volant", "general", "advanced", ["Zanfan pe fer vole servolan.", "The children are flying a kite."]),
    ("laplaz", "noun", "Beach", "Plage", "traditional", "advanced", ["Nou al laplaz dimans.", "We go to the beach on Sundays."]),
    ("boukou", "adverb", "A lot / many", "Beaucoup", "general", "advanced", None),
    ("long", "adjective", "Long", "Long", "general", "advanced", None),
    ("kourt", "adjective", "Short", "Court", "general", "advanced", None),
    ("marse", "verb", "To walk", "Marcher", "general", "advanced", None),
    ("bienveni", "interjection", "Welcome", "Bienvenue", "greetings", "advanced", None),
    ("larenion", "noun", "Réunion (island)", "La Réunion", "traditional", "advanced", None),
    ("komie", "adverb", "How much / how many", "Combien", "general", "advanced", None),
    ("karanbol", "noun", "Carambola / star fruit", "Carambole", "food", "advanced", None),
    ("letan", "noun", "Time / weather", "Le temps", "general", "advanced", None),
    ("vwayaz", "noun", "Trip / journey", "Voyage", "general", "advanced", None),
    ("konte", "verb", "To count / to tell", "Compter", "general", "advanced", None),
    ("sinp", "adjective", "Simple / easy", "Simple", "general", "advanced", None),
    ("laboutik", "noun", "Shop / small grocery", "Boutique", "general", "advanced", None),
    ("koumans", "verb", "To begin / to start", "Commencer", "general", "advanced", None),
    ("ansam", "adverb", "Together", "Ensemble", "general", "advanced", None),
    ("piti", "adjective", "Small / little / child", "Petit", "general", "advanced", None),
    ("lekip", "noun", "Team", "Équipe", "general", "advanced", None),
    ("plizier", "determiner", "Several", "Plusieurs", "general", "advanced", None),
]


def main() -> None:
    with open(DICT_PATH, encoding="utf-8") as handle:
        entries = json.load(handle)

    existing = {(e["headword"], e["language"]) for e in entries}
    added = 0
    for headword, pos, en, fr, category, level, example in NEW:
        if (headword, "mfe") in existing:
            continue
        entry = {
            "headword": headword,
            "language": "mfe",
            "partOfSpeech": pos,
            "meaningEn": en,
            "meaningFr": fr,
            "category": category,
            "level": level,
        }
        if example:
            entry["examples"] = example
        entries.append(entry)
        existing.add((headword, "mfe"))
        added += 1

    with open(DICT_PATH, "w", encoding="utf-8") as handle:
        json.dump(entries, handle, ensure_ascii=False, indent=2)
        handle.write("\n")

    print(f"added {added} new entries; total now {len(entries)}")


if __name__ == "__main__":
    main()
