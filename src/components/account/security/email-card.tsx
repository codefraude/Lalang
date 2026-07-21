"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { AtSign, BadgeCheck } from "lucide-react";
import { Field, PasswordInput } from "@/components/auth/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SettingsSection } from "@/components/account/section";
import { useToast } from "@/components/ui/toast";
import { useReauth } from "@/components/account/reauth-provider";
import { apiPost, ApiError } from "@/lib/api-client";
import type { AccountData } from "@/lib/account";

export function EmailCard({ account }: { account: AccountData }) {
  const toast = useToast();
  const { run } = useReauth();
  const { register, handleSubmit, reset, setError, formState } =
    useForm<{ newEmail: string; password: string }>();

  const onSubmit = handleSubmit(async (values) => {
    try {
      await run(() => apiPost("/api/email/change", values));
      reset();
      toast({ variant: "success", title: "Confirm your new email", description: "We sent a link to the new address." });
    } catch (err) {
      if (err instanceof ApiError && err.fields) {
        for (const [k, message] of Object.entries(err.fields)) setError(k as never, { message });
      } else if (err instanceof ApiError) {
        toast({ variant: "error", title: "Couldn't change email", description: err.message });
      }
    }
  });

  return (
    <SettingsSection title="Email address" description="Change the email you use to sign in and receive notifications." icon={AtSign}>
      <div className="mb-4 flex items-center gap-2 text-sm">
        <span className="font-medium">{account.user.email}</span>
        {account.user.emailVerified ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success">
            <BadgeCheck className="size-3.5" /> Verified
          </span>
        ) : (
          <span className="rounded-full bg-warning/15 px-2 py-0.5 text-xs font-medium text-warning">Unverified</span>
        )}
      </div>
      <form onSubmit={onSubmit} className="max-w-md space-y-4">
        <Field label="New email" htmlFor="newEmail" error={formState.errors.newEmail?.message}>
          <Input id="newEmail" type="email" autoComplete="email" {...register("newEmail")} />
        </Field>
        {account.user.hasPassword && (
          <Field label="Confirm with password" htmlFor="email-password" error={formState.errors.password?.message}>
            <PasswordInput id="email-password" autoComplete="current-password" {...register("password")} />
          </Field>
        )}
        <Button type="submit" loading={formState.isSubmitting}>Send confirmation</Button>
      </form>
    </SettingsSection>
  );
}
