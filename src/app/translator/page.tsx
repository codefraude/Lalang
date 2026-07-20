import { SiteHeader } from "@/components/site-header";
import { TranslatorPanel } from "@/components/translator/translator-panel";

const PIPELINE = [
  "Detect language",
  "Analyse context",
  "AI translate",
  "Fix grammar",
  "Adapt culturally",
];

export default function TranslatorPage() {
  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="font-display text-display-md font-bold">Translator</h1>
        <p className="mt-2 text-muted-foreground">English · French · Kreol Morisien</p>

        <div className="mt-8">
          <TranslatorPanel />
        </div>

        <div className="mt-10">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            How it works
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {PIPELINE.map((step, i) => (
              <span key={step} className="flex items-center gap-2">
                <span className="rounded-full border bg-muted/60 px-2.5 py-1">{step}</span>
                {i < PIPELINE.length - 1 && <span aria-hidden>→</span>}
              </span>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
