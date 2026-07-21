"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Field, PasswordInput } from "@/components/auth/form-field";
import { PasswordStrength } from "@/components/auth/password-strength";
import { Button } from "@/components/ui/button";
import { passwordSchema } from "@/lib/validations/auth";
import { apiPost, ApiError } from "@/lib/api-client";

const schema = z.object({ password: passwordSchema });
type Values = z.infer<typeof schema>;

function ResetForm() {
  const token = useSearchParams().get("token") ?? "";
  const [done, setDone] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const { register, handleSubmit, watch, setError, formState } = useForm<Values>({
    resolver: zodResolver(schema),
  });
  const password = watch("password") ?? "";

  const onSubmit = async (values: Values) => {
    setSubmitting(true);
    setFormError(null);
    try {
      await apiPost("/api/password/reset", { token, password: values.password });
      setDone(true);
    } catch (err) {
      setSubmitting(false);
      if (err instanceof ApiError && err.fields?.password) {
        setError("password", { message: err.fields.password });
      } else {
        setFormError(err instanceof ApiError ? err.message : "Something went wrong.");
      }
    }
  };

  if (done) {
    return (
      <AuthShell
        title="Password updated"
        subtitle="You can now sign in with your new password."
        footer={<Link href="/login" className="font-medium text-primary hover:underline">Go to sign in</Link>}
      >
        <div className="flex justify-center py-6">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 240, damping: 18 }}
            className="grid size-16 place-items-center rounded-full bg-success/15 text-success"
          >
            <Check className="size-8" strokeWidth={3} />
          </motion.span>
        </div>
      </AuthShell>
    );
  }

  if (!token) {
    return (
      <AuthShell
        title="Invalid link"
        subtitle="This password reset link is missing or malformed."
        footer={<Link href="/forgot-password" className="font-medium text-primary hover:underline">Request a new link</Link>}
      >
        <span />
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Choose a new password" subtitle="Make it strong and unique.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="New password" htmlFor="password" error={formState.errors.password?.message}>
          <PasswordInput id="password" autoComplete="new-password" placeholder="New password" {...register("password")} />
        </Field>
        <PasswordStrength password={password} />
        {formError && (
          <p role="alert" className="rounded-[calc(var(--radius)-0.25rem)] border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {formError}
          </p>
        )}
        <Button type="submit" className="w-full" loading={submitting}>
          Reset password
        </Button>
      </form>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <React.Suspense fallback={null}>
      <ResetForm />
    </React.Suspense>
  );
}
