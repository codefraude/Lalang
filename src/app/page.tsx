import Link from "next/link";
import {
  MessagesSquare,
  Mic,
  GraduationCap,
  BookMarked,
  Users,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { TranslatorPanel } from "@/components/translator/translator-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const FEATURES = [
  {
    icon: Sparkles,
    title: "Context-aware AI",
    body: "Pick casual, business, tourism or pure slang. The translation shifts register the way a real speaker would.",
  },
  {
    icon: Mic,
    title: "Speak & listen",
    body: "Talk in English or French, read it back in Creole, and hear the pronunciation.",
  },
  {
    icon: GraduationCap,
    title: "Learn a little daily",
    body: "A word a day, example sentences and short quizzes to build real vocabulary.",
  },
  {
    icon: MessagesSquare,
    title: "Practice with AI",
    body: "Hold a conversation in Kreol Morisien and get gentle corrections.",
  },
  {
    icon: BookMarked,
    title: "Cultural dictionary",
    body: "Food, family, greetings, expressions and slang — with the meaning behind the words.",
  },
  {
    icon: Users,
    title: "Built by the community",
    body: "Suggest better translations and add local expressions. The best ones get approved.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-dvh">
      <SiteHeader />

      {/* Hero */}
      <section className="lagoon-glow relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-16 sm:pt-24">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground shadow-xs backdrop-blur">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/60" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              🇲🇺 Kreol Morisien
            </span>
            <h1 className="mt-6 font-display text-display-lg font-bold">
              Translate the languages
              <br />
              <span className="gradient-text">of our islands</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Not word-for-word. Lalang understands slang, tone and culture — so
              English and French turn into Creole that actually sounds right.
            </p>
          </div>

          {/* Live demo */}
          <div className="mx-auto mt-12 max-w-3xl">
            <TranslatorPanel />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:py-24">
        <div className="max-w-lg">
          <h2 className="font-display text-display-md font-bold">More than a translator</h2>
          <p className="mt-3 text-muted-foreground">
            A full toolkit to translate, learn and keep Kreol Morisien alive.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <Card key={feature.title} interactive className="group">
              <CardContent className="p-6">
                <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <feature.icon className="size-5" />
                </span>
                <h3 className="mt-4 font-semibold">{feature.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {feature.body}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/translator">
              Start translating
              <ArrowRight />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/learn">Learn Creole</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            <span className="font-semibold text-foreground">Lalang</span> — made
            for Mauritius 🇲🇺.
          </p>
          <nav className="flex gap-4">
            <Link href="/translator" className="transition-colors hover:text-foreground">
              Translate
            </Link>
            <Link href="/dictionary" className="transition-colors hover:text-foreground">
              Dictionary
            </Link>
            <Link href="/learn" className="transition-colors hover:text-foreground">
              Learn
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
