"use client";

import { useAccount } from "@/hooks/use-account";
import { PasswordCard } from "@/components/account/security/password-card";
import { EmailCard } from "@/components/account/security/email-card";
import { TwoFactorCard } from "@/components/account/security/two-factor-card";
import { PasskeysCard } from "@/components/account/security/passkeys-card";
import { DangerZone } from "@/components/account/security/danger-zone";
import type { AccountData } from "@/lib/account";

export function SecuritySections({ initial }: { initial: AccountData }) {
  const { data } = useAccount(initial);
  const account = data ?? initial;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-display-md font-bold">Security</h1>
        <p className="mt-1 text-muted-foreground">Protect your account and manage how you sign in.</p>
      </div>
      <PasswordCard account={account} />
      <EmailCard account={account} />
      <TwoFactorCard account={account} />
      <PasskeysCard />
      <DangerZone account={account} />
    </div>
  );
}
