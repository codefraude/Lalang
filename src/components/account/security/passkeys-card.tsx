"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { startRegistration, WebAuthnError } from "@simplewebauthn/browser";
import { Fingerprint, Trash2, Plus, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SettingsSection } from "@/components/account/section";
import { useToast } from "@/components/ui/toast";
import { apiGet, apiPost, apiDelete, ApiError } from "@/lib/api-client";
import { useRefreshAccount } from "@/hooks/use-account";

interface Passkey {
  id: string;
  name: string | null;
  deviceType: string;
  backedUp: boolean;
  createdAt: string;
  lastUsedAt: string | null;
}

export function PasskeysCard() {
  const toast = useToast();
  const qc = useQueryClient();
  const refresh = useRefreshAccount();
  const [adding, setAdding] = React.useState(false);

  const { data } = useQuery({
    queryKey: ["passkeys"],
    queryFn: () => apiGet<{ passkeys: Passkey[] }>("/api/passkeys"),
  });
  const passkeys = data?.passkeys ?? [];

  const addPasskey = async () => {
    setAdding(true);
    try {
      const optionsJSON = await apiPost<Record<string, unknown>>("/api/webauthn/register/options");
      const response = await startRegistration({ optionsJSON: optionsJSON as never });
      await apiPost("/api/webauthn/register/verify", { response });
      await qc.invalidateQueries({ queryKey: ["passkeys"] });
      refresh();
      toast({ variant: "success", title: "Passkey added" });
    } catch (err) {
      if (err instanceof WebAuthnError && err.name === "NotAllowedError") return; // user cancelled
      toast({ variant: "error", title: "Couldn't add passkey", description: err instanceof ApiError ? err.message : undefined });
    } finally {
      setAdding(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await apiDelete(`/api/passkeys/${id}`);
      await qc.invalidateQueries({ queryKey: ["passkeys"] });
      refresh();
      toast({ variant: "success", title: "Passkey removed" });
    } catch {
      toast({ variant: "error", title: "Couldn't remove passkey" });
    }
  };

  return (
    <SettingsSection
      title="Passkeys"
      description="Sign in without a password using Face ID, Touch ID or a security key."
      icon={Fingerprint}
      footer={
        <Button size="sm" variant="outline" onClick={addPasskey} loading={adding}>
          <Plus className="size-4" /> Add a passkey
        </Button>
      }
    >
      {passkeys.length === 0 ? (
        <p className="text-sm text-muted-foreground">No passkeys yet. Add one for faster, phishing-resistant sign-in.</p>
      ) : (
        <ul className="divide-y">
          {passkeys.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-lg bg-secondary text-secondary-foreground">
                  <Fingerprint className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-medium">
                    {p.name ?? "Passkey"}
                    {p.backedUp && (
                      <span className="ml-2 inline-flex items-center gap-1 text-xs text-success">
                        <ShieldCheck className="size-3" /> Synced
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Added {new Date(p.createdAt).toLocaleDateString()}
                    {p.lastUsedAt && ` · last used ${new Date(p.lastUsedAt).toLocaleDateString()}`}
                  </p>
                </div>
              </div>
              <Button size="icon" variant="ghost" onClick={() => remove(p.id)} className="text-muted-foreground hover:text-destructive" aria-label="Remove passkey">
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </SettingsSection>
  );
}
