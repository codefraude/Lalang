"use client";

import { SelectMenu } from "@/components/ui/select-menu";
import { useI18n } from "@/i18n/provider";
import { LOCALES, LOCALE_META, type Locale } from "@/i18n/config";

const OPTIONS = LOCALES.map((code) => ({
  value: code,
  label: `${LOCALE_META[code].flag} ${LOCALE_META[code].label}`,
}));

/** Switches the interface language (app chrome), separate from what you translate. */
export function LocaleSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();
  return (
    <SelectMenu
      value={locale}
      options={OPTIONS}
      onChange={(v) => setLocale(v as Locale)}
      ariaLabel={t("locale.label")}
      className={className}
    />
  );
}
