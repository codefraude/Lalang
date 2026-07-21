"use client";

import * as React from "react";
import { signOut } from "next-auth/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Field, PasswordInput } from "@/components/auth/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiPost, ApiError } from "@/lib/api-client";
import { useAccount } from "@/hooks/use-account";

interface ReauthContextValue {
  /** Run an action, transparently prompting for re-auth if the server asks. */
  run: <T>(fn: () => Promise<T>) => Promise<T>;
}

const ReauthContext = React.createContext<ReauthContextValue | null>(null);

export function useReauth(): ReauthContextValue {
  const ctx = React.useContext(ReauthContext);
  if (!ctx) throw new Error("useReauth must be used within <ReauthProvider>");
  return ctx;
}

export function ReauthProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const resolver = React.useRef<((ok: boolean) => void) | null>(null);

  const prompt = React.useCallback(() => {
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const settle = React.useCallback((ok: boolean) => {
    setOpen(false);
    resolver.current?.(ok);
    resolver.current = null;
  }, []);

  const run = React.useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T> => {
      try {
        return await fn();
      } catch (err) {
        if (err instanceof ApiError && err.code === "reauth_required") {
          const ok = await prompt();
          if (!ok) throw err;
          return await fn();
        }
        throw err;
      }
    },
    [prompt],
  );

  return (
    <ReauthContext.Provider value={{ run }}>
      {children}
      <ReauthDialog open={open} onDone={settle} />
    </ReauthContext.Provider>
  );
}

function ReauthDialog({ open, onDone }: { open: boolean; onDone: (ok: boolean) => void }) {
  const { data: account } = useAccount();
  const [password, setPassword] = React.useState("");
  const [totp, setTotp] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      setPassword("");
      setTotp("");
      setError(null);
    }
  }, [open]);

  const hasPassword = account?.user.hasPassword ?? true;
  const twoFactor = account?.user.twoFactorEnabled ?? false;
  const canReauth = hasPassword || twoFactor;

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await apiPost("/api/reauth", { password: hasPassword ? password : undefined, totp: twoFactor ? totp : undefined });
      onDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "That didn't match.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onDone(false)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm it's you</DialogTitle>
          <DialogDescription>For your security, please confirm your identity to continue.</DialogDescription>
        </DialogHeader>

        {canReauth ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
            className="space-y-4"
          >
            {hasPassword && (
              <Field label="Password" htmlFor="reauth-password">
                <PasswordInput id="reauth-password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
              </Field>
            )}
            {twoFactor && (
              <Field label="Authentication code" htmlFor="reauth-totp">
                <Input id="reauth-totp" inputMode="numeric" autoComplete="one-time-code" placeholder="123456" value={totp} onChange={(e) => setTotp(e.target.value)} />
              </Field>
            )}
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onDone(false)}>Cancel</Button>
              <Button type="submit" loading={submitting}>Confirm</Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Please sign in again to continue with this action.</p>
            <DialogFooter>
              <Button variant="ghost" onClick={() => onDone(false)}>Cancel</Button>
              <Button onClick={() => signOut({ callbackUrl: "/login?callbackUrl=/account/security" })}>Sign in again</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
