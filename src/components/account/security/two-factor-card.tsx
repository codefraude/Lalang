"use client";

import * as React from "react";
import Image from "next/image";
import { ShieldCheck, ShieldAlert } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Field } from "@/components/auth/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SettingsSection } from "@/components/account/section";
import { BackupCodes } from "@/components/account/security/backup-codes";
import { useToast } from "@/components/ui/toast";
import { useReauth } from "@/components/account/reauth-provider";
import { apiPost, ApiError } from "@/lib/api-client";
import { useRefreshAccount } from "@/hooks/use-account";
import type { AccountData } from "@/lib/account";

type Setup = { secret: string; qrDataUrl: string };

export function TwoFactorCard({ account }: { account: AccountData }) {
  const toast = useToast();
  const { run } = useReauth();
  const refresh = useRefreshAccount();
  const enabled = account.user.twoFactorEnabled;

  const [open, setOpen] = React.useState(false);
  const [setup, setSetup] = React.useState<Setup | null>(null);
  const [codes, setCodes] = React.useState<string[] | null>(null);
  const [token, setToken] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const startSetup = async () => {
    try {
      const data = await run(() => apiPost<Setup>("/api/mfa/totp/setup"));
      setSetup(data);
      setCodes(null);
      setToken("");
      setError(null);
      setOpen(true);
    } catch (err) {
      if (err instanceof ApiError) toast({ variant: "error", title: "Couldn't start setup", description: err.message });
    }
  };

  const verify = async () => {
    setBusy(true);
    setError(null);
    try {
      const { backupCodes } = await run(() => apiPost<{ backupCodes: string[] }>("/api/mfa/totp/enable", { token }));
      setCodes(backupCodes);
      refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Verification failed.");
    } finally {
      setBusy(false);
    }
  };

  const disable = async () => {
    try {
      await run(() => apiPost("/api/mfa/totp/disable"));
      refresh();
      toast({ variant: "success", title: "Two-factor disabled" });
    } catch (err) {
      if (err instanceof ApiError) toast({ variant: "error", title: "Couldn't disable", description: err.message });
    }
  };

  const regenerate = async () => {
    try {
      const { backupCodes } = await run(() => apiPost<{ backupCodes: string[] }>("/api/mfa/backup-codes"));
      setSetup(null);
      setCodes(backupCodes);
      setOpen(true);
    } catch (err) {
      if (err instanceof ApiError) toast({ variant: "error", title: "Couldn't regenerate", description: err.message });
    }
  };

  return (
    <>
      <SettingsSection
        title="Two-factor authentication"
        description="Add a one-time code from an authenticator app to your sign-in."
        icon={enabled ? ShieldCheck : ShieldAlert}
        footer={
          enabled ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success">
                <ShieldCheck className="size-4" /> Two-factor is on
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={regenerate}>Regenerate codes</Button>
                <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={disable}>Disable</Button>
              </div>
            </div>
          ) : (
            <Button size="sm" onClick={startSetup}>Enable two-factor</Button>
          )
        }
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          {codes ? (
            <>
              <DialogHeader>
                <DialogTitle>Save your backup codes</DialogTitle>
              </DialogHeader>
              <BackupCodes codes={codes} onDone={() => { setOpen(false); toast({ variant: "success", title: "Two-factor enabled" }); }} />
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Set up two-factor</DialogTitle>
                <DialogDescription>Scan the QR code with your authenticator app, then enter the 6-digit code.</DialogDescription>
              </DialogHeader>
              {setup && (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <Image src={setup.qrDataUrl} alt="TOTP QR code" width={200} height={200} className="rounded-lg border" unoptimized />
                  </div>
                  <details className="text-center text-xs text-muted-foreground">
                    <summary className="cursor-pointer">Can't scan? Enter this key manually</summary>
                    <code className="mt-2 block break-all font-mono text-foreground">{setup.secret}</code>
                  </details>
                  <Field label="Verification code" htmlFor="totp-code" error={error ?? undefined}>
                    <Input id="totp-code" inputMode="numeric" autoComplete="one-time-code" placeholder="123456" value={token} onChange={(e) => setToken(e.target.value)} className="text-center text-lg tracking-[0.3em]" />
                  </Field>
                  <Button className="w-full" onClick={verify} loading={busy} disabled={token.length < 6}>Verify and enable</Button>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
