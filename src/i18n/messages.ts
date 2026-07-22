import type { Locale } from "./config";

/**
 * UI message catalogs. Flat dot-keyed strings, English as the source of truth.
 * The French set is a full translation; the Kreol Morisien set uses Akademi
 * Kreol Morisien orthography and is a first pass — native-speaker review welcome.
 *
 * Interpolation: use {name} placeholders and pass values to `t(key, { name })`.
 * New surfaces adopt i18n by calling `t("some.key")` and adding the key here.
 */

export type Messages = Record<string, string>;

const en: Messages = {
  "nav.translate": "Translate",
  "nav.dictionary": "Dictionary",
  "nav.learn": "Learn",
  "nav.account": "Account",
  "menu.open": "Open menu",
  "menu.close": "Close menu",
  "locale.label": "Interface language",

  "hero.badge": "AI-powered · context-aware · cultural notes",
  "hero.titlePrefix": "Translate with ",
  "hero.titleHighlight": "intelligence",
  "hero.subtitle":
    "Natural translations for Kreol Morisien, French and English — with tone control, pronunciation and a built-in language tutor.",
  "hero.statLanguages": "languages",
  "hero.statWords": "dictionary words",
  "hero.statTones": "tone modes",

  "translator.translate": "Translate",
  "translator.history": "History",
  "translator.assistant": "Assistant",
  "translator.suggest": "Suggest a better translation",
  "translator.translating": "Lalang is translating…",
  "translator.empty": "Your translation will appear here.",
  "translator.inputPlaceholder": "Type or paste text to translate…",
};

const fr: Messages = {
  "nav.translate": "Traduire",
  "nav.dictionary": "Dictionnaire",
  "nav.learn": "Apprendre",
  "nav.account": "Compte",
  "menu.open": "Ouvrir le menu",
  "menu.close": "Fermer le menu",
  "locale.label": "Langue de l'interface",

  "hero.badge": "Propulsé par l'IA · contextuel · notes culturelles",
  "hero.titlePrefix": "Traduire avec ",
  "hero.titleHighlight": "intelligence",
  "hero.subtitle":
    "Des traductions naturelles en créole mauricien, français et anglais — avec contrôle du ton, prononciation et un tuteur linguistique intégré.",
  "hero.statLanguages": "langues",
  "hero.statWords": "mots du dictionnaire",
  "hero.statTones": "tons",

  "translator.translate": "Traduire",
  "translator.history": "Historique",
  "translator.assistant": "Assistant",
  "translator.suggest": "Proposer une meilleure traduction",
  "translator.translating": "Lalang traduit…",
  "translator.empty": "Votre traduction apparaîtra ici.",
  "translator.inputPlaceholder": "Saisissez ou collez du texte à traduire…",
};

// Kreol Morisien (grafi-larmoni) — first pass, pending native-speaker review.
const mfe: Messages = {
  "nav.translate": "Tradir",
  "nav.dictionary": "Diksioner",
  "nav.learn": "Aprann",
  "nav.account": "Kont",
  "menu.open": "Ouver meni",
  "menu.close": "Ferm meni",
  "locale.label": "Lang lenterfas",

  "hero.badge": "Ar IA · konpran kontex · not kiltirel",
  "hero.titlePrefix": "Tradir ar ",
  "hero.titleHighlight": "lintelizans",
  "hero.subtitle":
    "Bann tradiksion natirel an Kreol Morisien, Franse ek Angle — ar kontrol ton, prononsiasion ek enn titer lang integre.",
  "hero.statLanguages": "lang",
  "hero.statWords": "mo dan diksioner",
  "hero.statTones": "ton",

  "translator.translate": "Tradir",
  "translator.history": "Listwar",
  "translator.assistant": "Asistan",
  "translator.suggest": "Propoz enn pli bon tradiksion",
  "translator.translating": "Lalang pe tradir…",
  "translator.empty": "To tradiksion pou aparet isi.",
  "translator.inputPlaceholder": "Tap ouswa kol tex pou tradir…",
};

export const MESSAGES: Record<Locale, Messages> = { en, fr, mfe };
