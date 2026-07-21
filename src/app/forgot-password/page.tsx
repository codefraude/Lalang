"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { MailCheck } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Field } from "@/components/auth/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { apiPost } from "@/lib/api-client";
import { z } from "zod";

type Values = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const { register, handleSubmit, getValues, formState } = useForm<Values>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (values: Values) => {
    setSubmitting(true);
    await apiPost("/api/password/forgot", values).catch(() => undefined);
    setSubmitting(false);
    setSent(true);
  };

  if (sent) {
    return (
      <AuthShell
        title="Check your email"
        subtitle={`If an account exists for ${getValues("email")}, we've sent a link to reset your password.`}
        footer={
          <Link href="/login" className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        }
      >
        <div className="flex justify-center py-6">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 240, damping: 18 }}
            className="grid size-16 place-items-center rounded-full bg-primary/10 text-primary"
          >
            <MailCheck className="size-8" />
          </motion.span>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a reset link."
      footer={
        <Link href="/login" className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Email" htmlFor="email" error={formState.errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" {...register("email")} />
        </Field>
        <Button type="submit" className="w-full" loading={submitting}>
          Send reset link
        </Button>
      </form>
    </AuthShell>
  );
}
