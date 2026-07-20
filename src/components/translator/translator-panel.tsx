"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeftRight, Copy, Check, Volume2, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { useTranslate } from "@/hooks/use-translate";
import { cn } from "@/lib/utils";
import {
  LANGUAGES,
  LANGUAGE_META,
  REGISTERS,
  REGISTER_META,
  type Language,
  type Register,
  type SourceSelection,
} from "@/types/translation";

const MAX = 1000;

const SPEECH_LOCALE: Record<Language, string> = {
  en: "en-GB",
  fr: "fr-FR",
  mfe: "fr-FR", // best-available proxy for browser TTS
};

function LanguageSelect({
  value,
  onChange,
  includeAuto,
}: {
  value: SourceSelection;
  onChange: (v: SourceSelection) => void;
  includeAuto?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as SourceSelection)}
      className="h-9 rounded-lg border border-input bg-background px-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {includeAuto && <option value="auto">🌐 Detect language</option>}
      {LANGUAGES.map((code) => (
        <option key={code} value={code}>
          {LANGUAGE_META[code].flag} {LANGUAGE_META[code].nativeLabel}
        </option>
      ))}
    </select>
  );
}

export function TranslatorPanel() {
  const [source, setSource] = React.useState<SourceSelection>("auto");
  const [target, setTarget] = React.useState<Language>("mfe");
  const [register, setRegister] = React.useState<Register>("casual");
  const [text, setText] = React.useState("I'm very tired today");
  const [copied, setCopied] = React.useState(false);

  const { result, loading, error, translate } = useTranslate();
  const toast = useToast();

  const swap = () => {
    if (source === "auto") return;
    const prevSource = source;
    setSource(target);
    setTarget(prevSource);
    if (result) setText(result.resultText);
  };

  const onTranslate = () => translate({ text, source, target, register });

  const copy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.resultText);
    setCopied(true);
    toast({ title: "Copied to clipboard", variant: "success" });
    setTimeout(() => setCopied(false), 1500);
  };

  const speak = () => {
    if (!result || typeof window === "undefined") return;
    const utter = new SpeechSynthesisUtterance(result.resultText);
    utter.lang = SPEECH_LOCALE[result.target];
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  };

  return (
    <div className="w-full">
      {/* Language bar */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <LanguageSelect value={source} onChange={setSource} includeAuto />
        <Button
          variant="ghost"
          size="icon"
          aria-label="Swap languages"
          onClick={swap}
          disabled={source === "auto"}
          className="shrink-0"
        >
          <ArrowLeftRight />
        </Button>
        <LanguageSelect
          value={target}
          onChange={(v) => setTarget(v as Language)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Input */}
        <Card>
          <CardContent className="p-4">
            <Textarea
              value={text}
              maxLength={MAX}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type something in English, French or Creole…"
              className="min-h-[180px] border-0 p-0 focus-visible:ring-0"
            />
            <div className="mt-3 flex items-center justify-between border-t pt-3">
              <span className="text-xs text-muted-foreground">
                {text.length}/{MAX}
              </span>
              <RegisterSelect value={register} onChange={setRegister} />
            </div>
          </CardContent>
        </Card>

        {/* Output */}
        <Card className="relative bg-muted/40 shadow-md">
          <CardContent className="flex min-h-[180px] flex-col p-4">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-1 items-center justify-center text-muted-foreground"
                >
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Translating…
                </motion.div>
              ) : result ? (
                <motion.div
                  key={result.resultText}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-1 flex-col"
                >
                  <p className="flex-1 text-lg leading-relaxed">{result.resultText}</p>
                  {result.culturalNote && (
                    <p className="mt-3 rounded-lg bg-accent/10 px-3 py-2 text-sm text-muted-foreground">
                      💡 {result.culturalNote}
                    </p>
                  )}
                </motion.div>
              ) : (
                <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
                  Your translation will appear here.
                </div>
              )}
            </AnimatePresence>

            {result && !loading && (
              <div className="mt-3 flex items-center justify-between border-t pt-3">
                <EngineBadge engine={result.engine} />
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" aria-label="Listen" onClick={speak}>
                    <Volume2 />
                  </Button>
                  <Button variant="ghost" size="icon" aria-label="Copy" onClick={copy}>
                    {copied ? <Check className="text-primary" /> : <Copy />}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-3 rounded-[calc(var(--radius)-0.25rem)] border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      <div className="mt-5 flex justify-center">
        <Button size="lg" onClick={onTranslate} loading={loading} disabled={!text.trim()}>
          {!loading && <Sparkles />}
          Translate
        </Button>
      </div>
    </div>
  );
}

function RegisterSelect({
  value,
  onChange,
}: {
  value: Register;
  onChange: (v: Register) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as Register)}
      className="h-8 rounded-lg border border-input bg-background px-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      title="Translation context"
    >
      {REGISTERS.map((r) => (
        <option key={r} value={r}>
          {REGISTER_META[r].label}
        </option>
      ))}
    </select>
  );
}

function EngineBadge({ engine }: { engine: "ai" | "dictionary" }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[11px] font-medium",
        engine === "ai"
          ? "bg-primary/10 text-primary"
          : "bg-secondary text-secondary-foreground",
      )}
    >
      {engine === "ai" ? "✨ AI translation" : "📖 Dictionary"}
    </span>
  );
}
