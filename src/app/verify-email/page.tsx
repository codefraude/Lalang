"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Check, X, Loader2 } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { apiPost } from "@/lib/api-client";

type Status = "loading" | "success" | "error";

function VerifyEmailInner() {
  const token = useSearchParams().get("token") ?? "";
  const [status, setStatus] = React.useState<Status>("loading");
  const ran = React.useRef(false);

  React.useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    if (!token) {
      setStatus("error");
      return;
    }
    apiPost("/api/verify-email", { token })
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [token]);

  const content = {
    loading: { title: "Verifying your email…", subtitle: "This will only take a moment." },
    success: { title: "Email verified", subtitle: "Your email address is now confirmed." },
    error: { title: "Verification failed", subtitle: "This link is invalid or has expired." },
  }[status];

  return (
    <AuthShell
      title={content.title}
      subtitle={content.subtitle}
      footer={
        <Link href="/account" className="font-medium text-primary hover:underline">
          Go to your account
        </Link>
      }
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

export default function VerifyEmailPage() {
  return (
    <React.Suspense fallback={null}>
      <VerifyEmailInner />
    </React.Suspense>
  );
}
