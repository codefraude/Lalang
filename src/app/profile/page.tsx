import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SessionLike {
  user?: { name?: string | null; email?: string | null; id?: string };
}

async function getSessionSafe(): Promise<SessionLike | null> {
  try {
    const { auth } = await import("@/lib/auth");
    return await auth();
  } catch {
    return null;
  }
}

async function getHistorySafe(userId?: string) {
  if (!userId) return [];
  try {
    const { prisma } = await import("@/lib/prisma");
    return await prisma.translation.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
  } catch {
    return [];
  }
}

export default async function ProfilePage() {
  const session = await getSessionSafe();
  const history = await getHistorySafe(session?.user?.id);

  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="font-display text-display-md font-bold">Profile</h1>

        {session?.user ? (
          <Card className="mt-6">
            <CardContent className="flex items-center gap-4 p-6">
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-lg font-semibold text-primary-foreground">
                {(session.user.name ?? session.user.email ?? "?").charAt(0).toUpperCase()}
              </span>
              <div>
                <p className="font-semibold">{session.user.name ?? "Signed in"}</p>
                <p className="text-sm text-muted-foreground">{session.user.email}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mt-6">
            <CardContent className="flex flex-col items-start gap-3 p-6">
              <p className="text-sm text-muted-foreground">
                You&apos;re browsing as a guest. Sign in to save history and favourites.
              </p>
              <Button asChild>
                <Link href="/login">Sign in</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <h2 className="mt-10 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Recent translations
        </h2>
        <div className="mt-3 space-y-2">
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing here yet.</p>
          ) : (
            history.map((h) => (
              <Card key={h.id}>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">{h.sourceText}</p>
                  <p className="mt-1">{h.resultText}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
