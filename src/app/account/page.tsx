import type { Metadata } from "next";
import Link from "next/link";
import { Languages, Star, KeyRound, MonitorSmartphone, ArrowRight, Check } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAccount } from "@/lib/account";
import { Card, CardContent } from "@/components/ui/card";
import { CompletionRing } from "@/components/account/completion-ring";
import { VerifyEmailBanner } from "@/components/account/verify-email-banner";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Account overview" };

const STAT_META = [
  { key: "translations", label: "Translations", icon: Languages },
  { key: "favorites", label: "Favourites", icon: Star },
  { key: "passkeys", label: "Passkeys", icon: KeyRound },
  { key: "sessions", label: "Devices", icon: MonitorSmartphone },
] as const;

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default async function AccountOverviewPage() {
  const session = await auth();
  const account = await getAccount(session!.user.id);
  if (!account) return null;

  const recent = await prisma.translation.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div className="space-y-6">
      {!account.user.emailVerified && <VerifyEmailBanner />}

      <div>
        <h1 className="font-display text-display-md font-bold">
          Welcome back{account.user.name ? `, ${account.user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-1 text-muted-foreground">Here's an overview of your Lalang account.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_META.map((stat) => (
          <Card key={stat.key}>
            <CardContent className="flex items-center gap-3 p-5">
              <span className="grid size-10 place-items-center rounded-lg bg-secondary text-secondary-foreground">
                <stat.icon className="size-5" />
              </span>
              <div>
                <p className="font-display text-2xl font-bold leading-none">{account.stats[stat.key]}</p>
                <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardContent className="flex flex-col items-center gap-6 p-6 sm:flex-row sm:items-start">
            <CompletionRing percent={account.completion.percent} />
            <div className="w-full">
              <h2 className="font-semibold">Complete your profile</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">Finish these steps to get the most out of Lalang.</p>
              <ul className="mt-4 space-y-2">
                {account.completion.items.map((item) => (
                  <li key={item.key} className="flex items-center gap-2.5 text-sm">
                    <span
                      className={cn(
                        "grid size-5 shrink-0 place-items-center rounded-full",
                        item.done ? "bg-success text-success-foreground" : "border border-dashed border-muted-foreground/40",
                      )}
                    >
                      {item.done && <Check className="size-3" strokeWidth={3} />}
                    </span>
                    <span className={cn(item.done && "text-muted-foreground line-through")}>{item.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Member since</dt>
                <dd className="font-medium">{formatDate(account.user.createdAt)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Last sign-in</dt>
                <dd className="font-medium">{formatDate(account.user.lastLoginAt)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Two-factor</dt>
                <dd className={cn("font-medium", account.user.twoFactorEnabled ? "text-success" : "text-muted-foreground")}>
                  {account.user.twoFactorEnabled ? "Enabled" : "Off"}
                </dd>
              </div>
            </dl>
            <Link
              href="/account/security"
              className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Manage security <ArrowRight className="size-3.5" />
            </Link>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Recent translations</h2>
        {recent.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              Nothing here yet.{" "}
              <Link href="/translator" className="font-medium text-primary hover:underline">Start translating →</Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {recent.map((t) => (
              <Card key={t.id}>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">{t.sourceText}</p>
                  <p className="mt-1 font-medium">{t.resultText}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
