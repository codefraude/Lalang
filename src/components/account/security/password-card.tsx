"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { KeyRound } from "lucide-react";
import { Field, PasswordInput } from "@/components/auth/form-field";
import { PasswordStrength } from "@/components/auth/password-strength";
import { Button } from "@/components/ui/button";
import { SettingsSection } from "@/components/account/section";
import { useToast } from "@/components/ui/toast";
import { useReauth } from "@/components/account/reauth-provider";
import { apiPost, ApiError } from "@/lib/api-client";
import type { AccountData } from "@/lib/account";

export function PasswordCard({ account }: { account: AccountData }) {
  const toast = useToast();
  const { run } = useReauth();
  const [emailed, setEmailed] = React.useState(false);
  const { register, handleSubmit, watch, reset, setError, formState } =
    useForm<{ currentPassword: string; newPassword: string }>();
  const newPassword = watch("newPassword") ?? "";

  if (!account.user.hasPassword) {
    return (
      <SettingsSection
        title="Password"
        description="You currently sign in with a linked account. Add a password to also sign in with email."
        icon={KeyRound}
        footer={
          <Button
            size="sm"
            variant="outline"
            disabled={emailed || !account.user.email}
            onClick={async () => {
              await apiPost("/api/password/forgot", { email: account.user.email }).catch(() => undefined);
              setEmailed(true);
              toast({ variant: "success", title: "Check your email", description: "We sent a link to set your password." });
            }}
          >
            {emailed ? "Email sent" : "Email me a set-up link"}
          </Button>
        }
      />
    );
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      await run(() => apiPost("/api/password/change", values));
      reset();
      toast({ variant: "success", title: "Password changed", description: "Other devices were signed out." });
    } catch (err) {
      if (err instanceof ApiError && err.fields) {
        for (const [k, message] of Object.entries(err.fields)) setError(k as never, { message });
      } else if (err instanceof ApiError) {
        toast({ variant: "error", title: "Couldn't change password", description: err.message });
      }
    }
  });

  return (
    <SettingsSection title="Password" description="Change your password. This signs out your other devices." icon={KeyRound}>
      <form onSubmit={onSubmit} className="max-w-md space-y-4">
        <Field label="Current password" htmlFor="currentPassword" error={formState.errors.currentPassword?.message}>
          <PasswordInput id="currentPassword" autoComplete="current-password" {...register("currentPassword")} />
        </Field>
        <Field label="New password" htmlFor="newPassword" error={formState.errors.newPassword?.message}>
          <PasswordInput id="newPassword" autoComplete="new-password" {...register("newPassword")} />
        </Field>
        <PasswordStrength password={newPassword} />
        <Button type="submit" loading={formState.isSubmitting}>Update password</Button>
      </form>
    </SettingsSection>
  );
}
