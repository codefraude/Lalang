/**
 * Verified Mauritius facts for the landing page. Sourced from the 2022 Census
 * (Statistics Mauritius), UNESCO, Britannica and Wikipedia — see the research
 * run. Keep figures accurate; this is public-facing.
 */
import type { Stat } from "@/components/island/stats-band";
import type { Milestone } from "@/components/island/heritage-timeline";

export const INTRO =
  "Mauritius is a young republic in the south-western Indian Ocean — barely 2,040 km² of land, and one of the most diverse societies on Earth. Its whole story is written in the languages people speak.";

export const STATS: Stat[] = [
  { value: "1.24M", label: "people call it home", note: "2022 census" },
  { value: "~90%", label: "speak Kreol Morisien", note: "the shared mother tongue" },
  { value: "3", label: "languages, daily", note: "Kreol · French · English" },
  { value: "2", label: "UNESCO heritage sites", note: "Aapravasi Ghat · Le Morne" },
  { value: "1968", label: "independence", note: "a republic since 1992" },
];

export const LANGUAGES = {
  headline: "Three languages, one conversation",
  body: "Mauritius runs on three tongues at once, and no single one is crowned above the rest. Kreol Morisien is the everyday mother tongue almost everyone shares; English is the language of Parliament, law and the classroom; French fills the newspapers and the airwaves. They coexist rather than compete — and Lalang is built for exactly that lived reality.",
  points: [
    "Kreol Morisien is spoken at home by around 90% of Mauritians (2022 census) — a fully French-lexified creole, not “broken French”.",
    "English is the official language of the National Assembly and the main medium of instruction in public schools.",
    "French dominates the press and broadcast media; most Mauritians count themselves French speakers too.",
    "The Akademi Kreol Morisien (2010) gave the language a standard spelling in 2011; it entered primary schools in 2012.",
    "Ancestral languages — Bhojpuri, Hindi, Urdu, Tamil, Telugu, Marathi, Mandarin — are taught as optional subjects.",
  ],
};

export interface Community {
  name: string;
  contribution: string;
}

export const DIVERSITY: Community[] = [
  { name: "Indo-Mauritian", contribution: "The largest community, descended from nearly half a million indentured labourers who arrived from India (1834–1920). They shaped festivals like Maha Shivaratri, Cavadee, Divali and Eid, and languages like Bhojpuri and Tamil." },
  { name: "Creole heritage", contribution: "Mauritians tracing their roots to enslaved East Africans and Malagasy. Their history is honoured at Le Morne, refuge of the maroons, and their culture gave the island Sega Tipik — UNESCO-recognised music sung in Kreol." },
  { name: "Sino-Mauritian", contribution: "Descended from Chinese traders who anchored commerce and built Port Louis's Chinatown. The Chinese Spring Festival is a public holiday, and Mandarin and Hakka are among the taught languages." },
  { name: "Franco-Mauritian", contribution: "Descended from 18th-century French settlers who left a deep mark on the island's language, Roman Catholic faith, place names and sugar-estate landscape." },
];

export const TIMELINE: Milestone[] = [
  { year: "1638", title: "Dutch settlement", detail: "The Dutch settle the uninhabited island, naming it after Prince Maurice of Nassau, and depart by 1710." },
  { year: "1715", title: "French rule & sugar", detail: "France takes the island as Isle de France, founds Port Louis and builds a plantation economy on enslaved African and Malagasy labour." },
  { year: "1810", title: "British takeover", detail: "Britain captures the island; the name Mauritius returns while French language and law endure." },
  { year: "1834", title: "Aapravasi Ghat", detail: "After abolition, Port Louis becomes the depot where ~half a million indentured labourers arrive (1834–1920). Inscribed by UNESCO in 2006." },
  { year: "1968", title: "Independence", detail: "Mauritius gains independence within the Commonwealth on 12 March 1968." },
  { year: "1992", title: "Republic", detail: "On 12 March 1992 the country becomes a republic — exactly 24 years after independence." },
  { year: "2012", title: "Kreol in the classroom", detail: "Following its standard orthography (2011), Kreol Morisien becomes an optional primary-school subject, examined nationally by 2017." },
];

export const QUOTE = {
  text: "Mauritius was made first, and then heaven; and heaven was copied after Mauritius.",
  author: "Mark Twain, recounting a proud Mauritian's boast in “Following the Equator” (1897)",
};

export interface Fact {
  title: string;
  body: string;
}

export const FACTS: Fact[] = [
  { title: "In the middle of the ocean", body: "Mauritius sits ~2,000 km off the south-east coast of Africa and about 900 km east of Madagascar. Its capital, Port Louis, is on the north-west coast." },
  { title: "Ethnicity left off the census — on purpose", body: "Mauritius has not recorded ethnicity in its census since 1972. The widely cited figures are estimates, and that deliberate restraint is itself a point of national pride." },
  { title: "The dodo lived only here", body: "The flightless dodo was found nowhere else on Earth. It went extinct within decades of human settlement — the last accepted sighting was in 1662." },
  { title: "Wildlife pulled back from the brink", body: "Black River Gorges National Park (1994) shelters the island's largest native forest and species like the Mauritius kestrel and pink pigeon, saved from near-extinction." },
  { title: "A calendar shared across faiths", body: "Maha Shivaratri, Cavadee, Divali, Eid and the Chinese Spring Festival are all public holidays. Hundreds of thousands walk to the crater lake of Grand Bassin for Shivaratri." },
  { title: "One plate, many hands", body: "Dholl puri — a soft flatbread filled with spiced split peas — is the beloved national street food: a taste of how Indian, African, Chinese and European cooking became one Mauritian kitchen." },
];
