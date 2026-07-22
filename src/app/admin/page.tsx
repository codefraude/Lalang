import { SiteHeader } from "@/components/site-header";
import { Card, CardContent } from "@/components/ui/card";
import { SuggestionModeration } from "@/components/admin/suggestion-moderation";

interface Stats {
  totalTranslations: number;
  aiCount: number;
  dictionaryCount: number;
  users: number;
  pendingSuggestions: number;
  topPairs: { pair: string; count: number }[];
}

async function getStatsSafe(): Promise<Stats | null> {
  try {
    const { prisma } = await import("@/lib/prisma");
    const [total, ai, dict, users, pending, grouped] = await Promise.all([
      prisma.translation.count(),
      prisma.translation.count({ where: { engine: "AI" } }),
      prisma.translation.count({ where: { engine: "DICTIONARY" } }),
      prisma.user.count(),
      prisma.translationSuggestion.count({ where: { status: "PENDING" } }),
      prisma.translation.groupBy({
        by: ["sourceLang", "targetLang"],
        _count: true,
        orderBy: { _count: { sourceLang: "desc" } },
        take: 5,
      }),
    ]);
    return {
      totalTranslations: total,
      aiCount: ai,
      dictionaryCount: dict,
      users,
      pendingSuggestions: pending,
      topPairs: grouped.map((g) => ({
        pair: `${g.sourceLang} → ${g.targetLang}`,
        count: g._count as number,
      })),
    };
  } catch {
    return null;
  }
}

async function getRoleSafe(): Promise<string> {
  try {
    const { auth } = await import("@/lib/auth");
    const session = await auth();
    return session?.user?.role ?? "GUEST";
  } catch {
    return "GUEST";
  }
}

export default async function AdminPage() {
  const role = await getRoleSafe();
  const stats = await getStatsSafe();

  if (role !== "ADMIN") {
    return (
      <div className="min-h-dvh">
        <SiteHeader />
        <main className="mx-auto max-w-2xl px-4 py-20 text-center">
          <h1 className="font-display text-display-md font-bold">Admin only</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You need an admin account to view this dashboard. Set a user&apos;s
            role to <code className="rounded bg-muted px-1">ADMIN</code> in the
            database (the seed creates one for you).
          </p>
        </main>
      </div>
    );
  }

  const cards = [
    { label: "Total translations", value: stats?.totalTranslations ?? 0 },
    { label: "AI translations", value: stats?.aiCount ?? 0 },
    { label: "Dictionary fallbacks", value: stats?.dictionaryCount ?? 0 },
    { label: "Users", value: stats?.users ?? 0 },
    { label: "Pending suggestions", value: stats?.pendingSuggestions ?? 0 },
  ];

  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="font-display text-display-md font-bold">Admin dashboard</h1>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {cards.map((c) => (
            <Card key={c.label} interactive>
              <CardContent className="p-6">
                <p className="font-display text-4xl font-bold tracking-tight text-primary">
                  {c.value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{c.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <h2 className="mt-10 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Top language pairs
        </h2>
        <div className="mt-3 space-y-2">
          {(stats?.topPairs ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No data yet.</p>
          ) : (
            stats!.topPairs.map((p) => (
              <Card key={p.pair}>
                <CardContent className="flex items-center justify-between p-4">
                  <span className="font-medium">{p.pair}</span>
                  <span className="text-muted-foreground">{p.count}</span>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <h2 className="mt-10 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Pending suggestions
        </h2>
        <SuggestionModeration />
      </main>
    </div>
  );
}
