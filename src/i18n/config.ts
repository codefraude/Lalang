/** Interface locales. Distinct from the translation `Language` set — this is
 *  the language the *app chrome* is shown in. */
export const LOCALES = ["en", "fr", "mfe"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** localStorage key holding the chosen interface locale. */
export const STORAGE_KEY = "lalang.locale";

export interface LocaleMeta {
  code: Locale;
  label: string;
  flag: string;
}

export const LOCALE_META: Record<Locale, LocaleMeta> = {
  en: { code: "en", label: "English", flag: "🇬🇧" },
  fr: { code: "fr", label: "Français", flag: "🇫🇷" },
  mfe: { code: "mfe", label: "Kreol", flag: "🇲🇺" },
};
