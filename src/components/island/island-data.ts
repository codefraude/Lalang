/**
 * Curated, real Kreol Morisien content for the immersive landing. Values are
 * taken from the vetted dictionary so the "journey" teaches accurate language.
 */

export const HERO_WORDS = [
  "Bonzour",
  "Ki manier?",
  "Mersi",
  "Mo kontan twa",
  "Lamer",
  "Sega",
  "Lakaz",
  "Dilo",
  "Manze",
  "Fami",
  "Soley",
  "Later",
];

export interface IslandWord {
  word: string;
  meaning: string;
  note: string;
  example?: string;
}

export const VILLAGE_WORDS: IslandWord[] = [
  { word: "Bonzour", meaning: "Good morning / hello", note: "The daily greeting", example: "Bonzour tou dimoun!" },
  { word: "Manze", meaning: "Food / to eat", note: "The centre of island hospitality", example: "Manze la bien bon!" },
  { word: "Lakaz", meaning: "House / home", note: "The family gathering place", example: "Mo pe al lakaz." },
  { word: "Fami", meaning: "Family", note: "The heart of Mauritian life" },
  { word: "Mersi", meaning: "Thank you", note: "Everyday politeness", example: "Mersi boukou!" },
  { word: "Dilo", meaning: "Water", note: "An island essential", example: "Donn mwa enn ver dilo." },
  { word: "Zoli", meaning: "Beautiful / pretty", note: "An everyday compliment", example: "Ki zoli plas!" },
  { word: "Lavi", meaning: "Life", note: "As in “lavi la dou” — life is sweet", example: "Lavi la dou dan Moris." },
  { word: "Zanfan", meaning: "Child / children", note: "The heart of every lakaz", example: "Bann zanfan pe zwe deor." },
];

export interface Region {
  id: string;
  name: string;
  x: number; // % across the map viewBox
  y: number; // % down the map viewBox
  blurb: string;
  note: string;
  words: { word: string; meaning: string }[];
  tags: string[];
}

export const REGIONS: Region[] = [
  {
    id: "portlouis",
    name: "Port Louis",
    x: 40, y: 30,
    blurb: "The capital and harbour on the north-west coast — the island's beating commercial heart.",
    note: "Home to Chinatown, the bustling Central Market, and Aapravasi Ghat — the UNESCO site where nearly half a million indentured labourers first set foot.",
    words: [{ word: "bazar", meaning: "market" }, { word: "lavil", meaning: "town / city" }],
    tags: ["Aapravasi Ghat · UNESCO", "Central Market", "Chinatown"],
  },
  {
    id: "grandbaie",
    name: "Grand Baie",
    x: 60, y: 15,
    blurb: "A turquoise bay in the north, where the lagoon is calmest and the reef closest.",
    note: "The island's seaside social hub — pirogues at anchor, snorkelling over coral, and evening promenades along the water.",
    words: [{ word: "laplaz", meaning: "beach" }, { word: "lamer", meaning: "the sea" }],
    tags: ["Lagoon", "Coral reef", "Pirogues"],
  },
  {
    id: "troucerfs",
    name: "Trou aux Cerfs",
    x: 50, y: 52,
    blurb: "A dormant volcanic crater above Curepipe, in the cool central highlands.",
    note: "A green-rimmed caldera with views over the whole island — a reminder that Mauritius rose from the sea as a volcano.",
    words: [{ word: "volkan", meaning: "volcano" }, { word: "montany", meaning: "mountain" }],
    tags: ["Dormant volcano", "Highlands", "Panorama"],
  },
  {
    id: "grandbassin",
    name: "Grand Bassin",
    x: 45, y: 67,
    blurb: "A sacred crater lake (Ganga Talao) in the southern highlands, ringed by temples.",
    note: "During Maha Shivaratri, hundreds of thousands of pilgrims walk here on foot — one of the largest Hindu gatherings outside India.",
    words: [{ word: "lapriyer", meaning: "prayer" }, { word: "dilo", meaning: "water" }],
    tags: ["Ganga Talao", "Maha Shivaratri", "Pilgrimage"],
  },
  {
    id: "chamarel",
    name: "Chamarel",
    x: 31, y: 71,
    blurb: "The seven-coloured earth and a waterfall, in the lush green south-west.",
    note: "Dunes of naturally red, brown and violet volcanic clay — with some of the island's oldest rum distilleries nearby.",
    words: [{ word: "later", meaning: "earth / land" }, { word: "kouler", meaning: "colour" }],
    tags: ["Seven-coloured earth", "Waterfall", "Rum"],
  },
  {
    id: "lemorne",
    name: "Le Morne",
    x: 23, y: 83,
    blurb: "A sacred basalt mountain on a wild south-western peninsula.",
    note: "A refuge for maroons — escaped enslaved people — and a UNESCO symbol of resistance to slavery. Kitesurfers now ride the same turquoise water.",
    words: [{ word: "montany", meaning: "mountain" }, { word: "liberte", meaning: "freedom" }],
    tags: ["Le Morne · UNESCO", "Maroon heritage", "Kitesurfing"],
  },
];

/** Rotating tips spoken by Lala, the AI guardian. */
export const LALA_TIPS = [
  "Bonzour! Mo apel Lala. Ki manier? 🌺",
  "Try saying “Ki manier?” — it means “How are you?”",
  "In Kreol, “Mo kontan twa” means “I love you”.",
  "Tap a glowing word to discover its story.",
  "“Mersi boukou” — thank you very much.",
];

/** The Mauritius-inspired palette used across the immersive sections. */
export const ISLAND = {
  night: "#020617",
  ocean: "#00D4FF",
  green: "#00A86B",
  sunset: "#FF8C42",
  sand: "#F4D6A0",
};
