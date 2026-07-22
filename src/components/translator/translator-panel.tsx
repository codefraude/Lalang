"use client";

import * as React from "react";
import { AnimatePresence } from "framer-motion";
import { Bot, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useTranslate } from "@/hooks/use-translate";
import { useSpeak } from "@/hooks/use-speak";
import { useTranslatorHistory, type HistoryItem } from "@/hooks/use-translator-history";
import { LangBar } from "@/components/translator/lang-bar";
import { ModePicker } from "@/components/translator/mode-picker";
import { TranslatorInput } from "@/components/translator/translator-input";
import { TranslatorOutput } from "@/components/translator/translator-output";
import { ResultActions } from "@/components/translator/result-actions";
import { SuggestDialog } from "@/components/translator/suggest-dialog";
import { AssistantPanel, type AssistantMessage } from "@/components/translator/assistant-panel";
import { HistoryDrawer } from "@/components/translator/history-drawer";
import { useI18n } from "@/i18n/provider";
import type { Language, Register, SourceSelection } from "@/types/translation";

const MAX = 2000;
const LABELS: Record<string, string> = { explain: "Explanation", alternatives: "Alternatives", grammar: "Grammar breakdown" };

export function TranslatorPanel() {
  const [source, setSource] = React.useState<SourceSelection>("auto");
  const [target, setTarget] = React.useState<Language>("mfe");
  const [register, setRegister] = React.useState<Register>("casual");
  const [text, setText] = React.useState("");
  const [copied, setCopied] = React.useState(false);
  const [assistantOpen, setAssistantOpen] = React.useState(false);
  const [assistantLoading, setAssistantLoading] = React.useState(false);
  const [messages, setMessages] = React.useState<AssistantMessage[]>([]);
  const [historyOpen, setHistoryOpen] = React.useState(false);

  const { result, loading, error, translate } = useTranslate();
  const { speak, speaking } = useSpeak();
  const toast = useToast();
  const history = useTranslatorHistory();
  const { t } = useI18n();

  const run = (over?: Partial<{ text: string; source: SourceSelection; target: Language; register: Register }>) =>
    translate({ text: over?.text ?? text, source: over?.source ?? source, target: over?.target ?? target, register: over?.register ?? register });

  // Persist each *completed* translation to local history (deduped in the hook).
  // Guarded on !streaming so partial tokens don't create history spam.
  React.useEffect(() => {
    if (result && !result.streaming) {
      history.add({ sourceText: result.sourceText, resultText: result.resultText, source: result.source, target: result.target, register: result.register });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  // Reset the assistant thread when a new translation begins.
  React.useEffect(() => {
    setMessages([]);
    setAssistantOpen(false);
  }, [result?.sourceText]);

  const current = React.useMemo(
    () => (result ? history.items.find((i) => i.resultText === result.resultText && i.source === result.source && i.target === result.target) : undefined),
    [history.items, result],
  );

  const swap = () => {
    if (source === "auto") return;
    setSource(target);
    setTarget(source);
    if (result) setText(result.resultText);
  };

  const copy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.resultText);
    setCopied(true);
    toast({ title: "Copied to clipboard", variant: "success" });
    setTimeout(() => setCopied(false), 1500);
  };

  const askAssistant = async (task: "explain" | "alternatives" | "grammar" | "ask", question?: string) => {
    if (!result) return;
    setAssistantOpen(true);
    setAssistantLoading(true);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task, sourceText: result.sourceText, resultText: result.resultText, source: result.source, target: result.target, question }),
      });
      const data = await res.json();
      const id = `${task}-${Date.now()}`;
      const label = task === "ask" ? question ?? "Question" : LABELS[task];
      if (!res.ok) setMessages((m) => [...m, { id, label, text: data.error ?? "The assistant is unavailable right now." }]);
      else setMessages((m) => [...m, { id, label, text: data.text, alternatives: data.alternatives }]);
    } catch {
      setMessages((m) => [...m, { id: `err-${Date.now()}`, label: "Error", text: "Network error. Please try again." }]);
    } finally {
      setAssistantLoading(false);
    }
  };

  const restore = (item: HistoryItem) => {
    setText(item.sourceText);
    setSource(item.source);
    setTarget(item.target);
    setRegister(item.register);
    setHistoryOpen(false);
    run({ text: item.sourceText, source: item.source, target: item.target, register: item.register });
  };

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setHistoryOpen(true)} className="shrink-0">
          <Clock className="size-4" /> {t("translator.history")}
        </Button>
        <div className="flex-1">
          <LangBar source={source} target={target} onSource={setSource} onTarget={setTarget} onSwap={swap} />
        </div>
        <Button variant={assistantOpen ? "default" : "outline"} size="sm" onClick={() => setAssistantOpen((o) => !o)} disabled={!result} className="shrink-0">
          <Bot className="size-4" /> <span className="hidden sm:inline">{t("translator.assistant")}</span>
        </Button>
      </div>

      <div className="mb-4">
        <ModePicker value={register} onChange={(r) => setRegister(r)} />
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="min-w-0 flex-1">
          <div className="grid gap-4 md:grid-cols-2">
            <TranslatorInput value={text} onChange={setText} sourceLang={source} max={MAX} onSubmit={() => text.trim() && run()} />
            <TranslatorOutput
              result={result}
              loading={loading}
              error={error}
              onRetry={() => run()}
              onExample={setText}
              actions={
                result ? (
                  <ResultActions
                    isFavorite={Boolean(current?.favorite)}
                    copied={copied}
                    speaking={speaking}
                    busy={assistantLoading}
                    onCopy={copy}
                    onSpeak={(rate) => speak(result.resultText, result.target, rate)}
                    onFavorite={() => current && history.toggleFavorite(current.id)}
                    onAgain={() => run()}
                    onRewrite={(r) => { setRegister(r); run({ register: r }); }}
                    onAssistant={askAssistant}
                  />
                ) : null
              }
            />
          </div>

          {result && !result.streaming && (
            <div className="mt-3 flex justify-end">
              <SuggestDialog
                sourceText={result.sourceText}
                currentText={result.resultText}
                source={result.source}
                target={result.target}
              />
            </div>
          )}

          <div className="mt-5 flex justify-center">
            <Button size="lg" onClick={() => run()} loading={loading} disabled={!text.trim()}>
              {!loading && <Sparkles />} {t("translator.translate")}
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {assistantOpen && (
            <AssistantPanel
              open={assistantOpen}
              onClose={() => setAssistantOpen(false)}
              loading={assistantLoading}
              messages={messages}
              onAsk={(q) => askAssistant("ask", q)}
              onUseAlternative={(t) => { navigator.clipboard.writeText(t); toast({ title: "Copied alternative", variant: "success" }); }}
            />
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {historyOpen && (
          <HistoryDrawer
            open={historyOpen}
            onClose={() => setHistoryOpen(false)}
            items={history.items}
            onRestore={restore}
            onToggleFavorite={history.toggleFavorite}
            onRemove={history.remove}
            onClear={history.clear}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
