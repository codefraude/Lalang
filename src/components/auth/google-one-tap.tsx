"use client";

import * as React from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

interface GoogleIdentity {
  accounts: {
    id: {
      initialize: (config: Record<string, unknown>) => void;
      prompt: () => void;
    };
  };
}
declare global {
  interface Window {
    google?: GoogleIdentity;
  }
}

const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

/**
 * Google One Tap prompt (FedCM-based). Renders nothing when Google isn't
 * configured. On credential, bridges to the `googleonetap` provider.
 */
export function GoogleOneTap({ callbackUrl = "/account" }: { callbackUrl?: string }) {
  const router = useRouter();

  const init = React.useCallback(() => {
    if (!window.google || !clientId) return;
    window.google.accounts.id.initialize({
      client_id: clientId,
      auto_select: false,
      cancel_on_tap_outside: false,
      itp_support: true,
      callback: async (response: { credential: string }) => {
        const result = await signIn("googleonetap", { credential: response.credential, redirect: false });
        if (!result?.error) {
          router.push(callbackUrl);
          router.refresh();
        }
      },
    });
    window.google.accounts.id.prompt();
  }, [router, callbackUrl]);

  React.useEffect(() => {
    if (window.google) init();
  }, [init]);

  if (!clientId) return null;
  return <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onReady={init} />;
}
