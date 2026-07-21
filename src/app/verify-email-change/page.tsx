"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Check, X, Loader2 } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { apiPost } from "@/lib/api-client";

type Status = "loading" | "success" | "error";

function VerifyChangeInner() {
  const token = useSearchParams().get("token") ?? "";
  const [status, setStatus] = React.useState<Status>("loading");
  const [email, setEmail] = React.useState<string | null>(null);
  const ran = React.useRef(false);

  React.useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    if (!token) {
      setStatus("error");
      return;
    }
    apiPost<{ email?: string }>("/api/email/verify-change", { token })
      .then((data) => {
        setEmail(data.email ?? null);
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  }, [token]);

  const content = {
    loading: { title: "Confirming your new email…", subtitle: "One moment." },
    success: { title: "Email updated", subtitle: email ? `You'll now sign in with ${email}.` : "Your email has been updated." },
    error: { title: "Couldn't confirm", subtitle: "This link is invalid, expired, or the email is no longer available." },
  }[status];

  return (
    <AuthShell
      title={content.title}
      subtitle={content.subtitle}
      footer={<Link href="/account/security" className="font-medium text-primary hover:underline">Back to security settings</Link>}
    >
      <div className="flex justify-center py-6">
        {status === "loading" && <Loader2 className="size-10 animate-spin text-primary" />}
        {status === "success" && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 240, damping: 18 }} className="grid size-16 place-items-center rounded-full bg-success/15 text-success">
            <Check className="size-8" strokeWidth={3} />
          </motion.span>
        )}
        {status === "error" && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 240, damping: 18 }} className="grid size-16 place-items-center rounded-full bg-destructive/15 text-destructive">
            <X className="size-8" strokeWidth={3} />
          </motion.span>
        )}
      </div>
    </AuthShell>
  );
}

export default function VerifyEmailChangePage() {
  return (
    <React.Suspense fallback={null}>
      <VerifyChangeInner />
    </React.Suspense>
  );
}
