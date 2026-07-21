"use client";

import * as React from "react";
import { MailWarning } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { apiPost, ApiError } from "@/lib/api-client";

/** Amber nudge shown until the user confirms their email. */
export function VerifyEmailBanner() {
  const toast = useToast();
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  const resend = async () => {
    setLoading(true);
    try {
      await apiPost("/api/verify-email/resend");
      setSent(true);
      toast({ variant: "success", title: "Verification email sent", description: "Check your inbox." });
    } catch (err) {
      toast({
        variant: "error",
        title: "Couldn't resend",
        description: err instanceof ApiError ? err.message : "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-[var(--radius)] border border-warning/40 bg-warning/10 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <MailWarning className="mt-0.5 size-5 shrink-0 text-warning" />
        <div>
          <p className="text-sm font-medium">Verify your email address</p>
          <p className="text-sm text-muted-foreground">Confirm your email to secure your account.</p>
        </div>
      </div>
      <Button size="sm" variant="outline" onClick={resend} loading={loading} disabled={sent} className="shrink-0">
        {sent ? "Email sent" : "Resend email"}
      </Button>
    </div>
  );
}
