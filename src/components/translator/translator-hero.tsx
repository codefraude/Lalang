"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { containerStagger, riseItem } from "@/components/learn/motion";
import { LANGUAGE_META, LANGUAGES } from "@/types/translation";
import { useI18n } from "@/i18n/provider";

/** Marketing-grade hero: gradient heading, language badges, live stats. */
export function TranslatorHero({ wordCount }: { wordCount: number }) {
  const { t } = useI18n();
  return (
    <motion.header variants={containerStagger} initial="hidden" animate="show" className="text-center">
      <motion.span
        variants={riseItem}
        className="inline-flex items-center gap-1.5 rounded-full border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground shadow-xs"
      >
        <Sparkles className="size-3.5 text-primary" /> {t("hero.badge")}
      </motion.span>

      <motion.h1 variants={riseItem} className="mt-4 font-display text-display-lg font-bold tracking-tight">
        {t("hero.titlePrefix")}<span className="gradient-text">{t("hero.titleHighlight")}</span>
      </motion.h1>

      <motion.p variants={riseItem} className="mx-auto mt-3 max-w-xl text-balance text-muted-foreground">
        {t("hero.subtitle")}
      </motion.p>

      <motion.div variants={riseItem} className="mt-5 flex flex-wrap items-center justify-center gap-2">
        {LANGUAGES.map((code) => (
          <span key={code} className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-sm shadow-xs">
            <span aria-hidden>{LANGUAGE_META[code].flag}</span>
            {LANGUAGE_META[code].nativeLabel}
          </span>
        ))}
      </motion.div>

      <motion.div variants={riseItem} className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-xs text-muted-foreground">
        <span><span className="font-semibold text-foreground">3</span> {t("hero.statLanguages")}</span>
        <span><span className="font-semibold text-foreground">{wordCount.toLocaleString()}</span> {t("hero.statWords")}</span>
        <span><span className="font-semibold text-foreground">7</span> {t("hero.statTones")}</span>
      </motion.div>
    </motion.header>
  );
}
