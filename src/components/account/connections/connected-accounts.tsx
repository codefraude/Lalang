"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { signIn } from "next-auth/react";
import { Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SettingsSection } from "@/components/account/section";
import { useToast } from "@/components/ui/toast";
import { apiGet, apiDelete, ApiError } from "@/lib/api-client";
import { googleConfigured } from "@/components/auth/social-auth";

interface ConnectedData {
  accounts: { provider: string; connectedAt: string }[];
  hasPassword: boolean;
}

export function ConnectedAccounts() {
  const toast = useToast();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["connected"],
    queryFn: () => apiGet<ConnectedData>("/api/connected-accounts"),
  });

  const google = data?.accounts.find((a) => a.provider === "google");

  const disconnect = async () => {
    try {
      await apiDelete("/api/connected-accounts?provider=google");
      await qc.invalidateQueries({ queryKey: ["connected"] });
      toast({ variant: "success", title: "Google disconnected" });
    } catch (err) {
      toast({
        variant: "error",
        title: "Couldn't disconnect",
        description: err instanceof ApiError ? err.message : undefined,
      });
    }
  };

  return (
    <SettingsSection title="Connected accounts" description="Link providers to sign in faster." icon={Link2}>
      {!googleConfigured ? (
        <p className="text-sm text-muted-foreground">No sign-in providers are configured yet.</p>
      ) : isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="flex items-center justify-between gap-3 rounded-[var(--radius)] border p-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-lg border bg-background">
              <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
                <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" />
              </svg>
            </span>
            <div>
              <p className="text-sm font-medium">Google</p>
              <p className="text-xs text-muted-foreground">
                {google ? `Connected ${new Date(google.connectedAt).toLocaleDateString()}` : "Not connected"}
              </p>
            </div>
          </div>
          {google ? (
            <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={disconnect}>
              Disconnect
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={() => signIn("google", { callbackUrl: "/account/connections" })}>
              Connect
            </Button>
          )}
        </div>
      )}
    </SettingsSection>
  );
}
