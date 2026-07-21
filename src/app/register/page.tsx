"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Field, PasswordInput } from "@/components/auth/form-field";
import { PasswordStrength } from "@/components/auth/password-strength";
import { GoogleButton, AuthDivider } from "@/components/auth/social-auth";
import { GoogleOneTap } from "@/components/auth/google-one-tap";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { apiPost, ApiError } from "@/lib/api-client";

export default function RegisterPage() {
  const router = useRouter();
  const [formError, setFormError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [done, setDone] = React.useState(false);

  const { register, handleSubmit, control, watch, setError, formState } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { terms: false as unknown as true },
  });
  const password = watch("password") ?? "";

  const onSubmit = async (values: RegisterInput) => {
    setSubmitting(true);
    setFormError(null);
    try {
      await apiPost("/api/register", values);
      setDone(true);
      await signIn("credentials", {
        email: values.email,
        password: values.password,
        rememberMe: "true",
        redirect: false,
      });
      setTimeout(() => {
        router.push("/account");
        router.refresh();
      }, 900);
    } catch (err) {
      setSubmitting(false);
      if (err instanceof ApiError && err.fields) {
        for (const [key, message] of Object.entries(err.fields)) {
          setError(key as keyof RegisterInput, { message });
        }
      } else {
        setFormError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      }
    }
  };

  if (done) {
    return (
      <AuthShell title="Account created" subtitle="Taking you to your dashboard…">
        <div className="flex justify-center py-8">
          <motion.span
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="grid size-20 place-items-center rounded-full bg-success/15 text-success"
          >
            <Check className="size-10" strokeWidth={3} />
          </motion.span>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join Lalang to save translations, track progress and more."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <GoogleOneTap />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Name" htmlFor="name" error={formState.errors.name?.message}>
          <Input id="name" autoComplete="name" placeholder="Your name" {...register("name")} />
        </Field>
        <Field label="Email" htmlFor="email" error={formState.errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" {...register("email")} />
        </Field>
        <Field label="Password" htmlFor="password" error={formState.errors.password?.message}>
          <PasswordInput id="password" autoComplete="new-password" placeholder="Create a password" {...register("password")} />
        </Field>
        <PasswordStrength password={password} />

        <div className="flex items-start gap-2.5">
          <Controller
            control={control}
            name="terms"
            render={({ field }) => (
              <Checkbox
                id="terms"
                className="mt-0.5"
                checked={!!field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <label htmlFor="terms" className="text-sm text-muted-foreground">
            I agree to the{" "}
            <Link href="/terms" className="font-medium text-primary hover:underline">Terms</Link> and{" "}
            <Link href="/privacy" className="font-medium text-primary hover:underline">Privacy Policy</Link>.
          </label>
        </div>
        {formState.errors.terms && (
          <p role="alert" className="text-xs font-medium text-destructive">{formState.errors.terms.message}</p>
        )}

        {formError && (
          <p role="alert" className="rounded-[calc(var(--radius)-0.25rem)] border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {formError}
          </p>
        )}

        <Button type="submit" className="w-full" loading={submitting}>
          Create account
        </Button>

        <AuthDivider />
        <GoogleButton label="Sign up with Google" />
      </form>
    </AuthShell>
  );
}
