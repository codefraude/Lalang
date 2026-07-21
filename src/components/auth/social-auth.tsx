"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { startAuthentication, WebAuthnError } from "@simplewebauthn/browser";
import { Fingerprint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { apiPost } from "@/lib/api-client";

export const googleConfigured = !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" />
    </svg>
  );
}

export function GoogleButton({ callbackUrl = "/account", label = "Continue with Google" }: { callbackUrl?: string; label?: string }) {
  const [loading, setLoading] = React.useState(false);
  if (!googleConfigured) return null;
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      loading={loading}
      onClick={() => {
        setLoading(true);
        signIn("google", { callbackUrl });
      }}
    >
      {!loading && <GoogleIcon />}
      {label}
    </Button>
  );
}

export function PasskeyButton({ callbackUrl = "/account" }: { callbackUrl?: string }) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = React.useState(false);

  const onClick = async () => {
    setLoading(true);
    try {
      const optionsJSON = await apiPost<Record<string, unknown>>("/api/webauthn/authenticate/options");
      const response = await startAuthentication({ optionsJSON: optionsJSON as never });
      const result = await signIn("passkey", { response: JSON.stringify(response), redirect: false });
      if (result?.error) {
        toast({ variant: "error", title: "Passkey sign-in failed", description: "Please try another method." });
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      if (!(err instanceof WebAuthnError && err.name === "NotAllowedError")) {
        toast({ variant: "error", title: "Couldn't use a passkey", description: "No passkey available on this device." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button type="button" variant="outline" className="w-full" loading={loading} onClick={onClick}>
      {!loading && <Fingerprint className="size-4" />}
      Sign in with a passkey
    </Button>
  );
}

export function AuthDivider({ children = "or" }: { children?: React.ReactNode }) {
  return (
    <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
      <span className="h-px flex-1 bg-border" />
      {children}
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
