"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { z } from "zod";
import { AuthShell } from "@/components/auth/auth-shell";
import { Field, PasswordInput } from "@/components/auth/form-field";
import { GoogleButton, PasskeyButton, AuthDivider } from "@/components/auth/social-auth";
import { GoogleOneTap } from "@/components/auth/google-one-tap";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email: z.string().email("Enter a valid email."),
  password: z.string().min(1, "Enter your password."),
  rememberMe: z.boolean().optional(),
});
type Values = z.infer<typeof schema>;

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/account";

  const [step, setStep] = React.useState<"credentials" | "twofactor">("credentials");
  const [useBackup, setUseBackup] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [formError, setFormError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const { register, handleSubmit, getValues, control, formState } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { rememberMe: true },
  });

  const attempt = async (values: Values) => {
    setSubmitting(true);
    setFormError(null);
    const res = await signIn("credentials", {
      email: values.email,
      password: values.password,
      rememberMe: String(values.rememberMe ?? false),
      totp: step === "twofactor" && !useBackup ? code : undefined,
      backupCode: step === "twofactor" && useBackup ? code : undefined,
      redirect: false,
    });
    setSubmitting(false);

    const errorCode = (res as { code?: string } | undefined)?.code || res?.error || "";
    if (res?.error) {
      if (errorCode.includes("totp_required")) {
        setStep("twofactor");
      } else if (errorCode.includes("totp_invalid")) {
        setFormError("That code is incorrect. Try again.");
      } else {
        setFormError("Invalid email or password.");
        setStep("credentials");
      }
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <AuthShell
      title={step === "credentials" ? "Welcome back" : "Two-factor authentication"}
      subtitle={
        step === "credentials"
          ? "Sign in to continue to your account."
          : useBackup
            ? "Enter one of your backup codes."
            : "Enter the 6-digit code from your authenticator app."
      }
      footer={
        step === "credentials" ? (
          <>
            New to Lalang?{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Create an account
            </Link>
          </>
        ) : null
      }
    >
      <GoogleOneTap callbackUrl={callbackUrl} />
      <AnimatePresence mode="wait">
        {step === "credentials" ? (
          <motion.form
            key="credentials"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            onSubmit={handleSubmit(attempt)}
            className="space-y-4"
          >
            <Field label="Email" htmlFor="email" error={formState.errors.email?.message}>
              <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" {...register("email")} />
            </Field>
            <Field
              label="Password"
              htmlFor="password"
              error={formState.errors.password?.message}
              hint={
                <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">
                  Forgot password?
                </Link>
              }
            >
              <PasswordInput id="password" autoComplete="current-password" placeholder="••••••••" {...register("password")} />
            </Field>

            <div className="flex items-center gap-2">
              <Controller
                control={control}
                name="rememberMe"
                render={({ field }) => (
                  <Checkbox id="rememberMe" checked={!!field.value} onCheckedChange={field.onChange} />
                )}
              />
              <Label htmlFor="rememberMe" className="cursor-pointer text-sm font-normal text-muted-foreground">
                Keep me signed in for 30 days
              </Label>
            </div>

            {formError && (
              <p role="alert" className="rounded-[calc(var(--radius)-0.25rem)] border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {formError}
              </p>
            )}

            <Button type="submit" className="w-full" loading={submitting}>
              Sign in
            </Button>

            <AuthDivider />
            <div className="space-y-2">
              <GoogleButton callbackUrl={callbackUrl} />
              <PasskeyButton callbackUrl={callbackUrl} />
            </div>
          </motion.form>
        ) : (
          <motion.form
            key="twofactor"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            onSubmit={(e) => {
              e.preventDefault();
              void attempt(getValues());
            }}
            className="space-y-4"
          >
            <Field label={useBackup ? "Backup code" : "Authentication code"} htmlFor="code">
              <Input
                id="code"
                inputMode={useBackup ? "text" : "numeric"}
                autoComplete="one-time-code"
                autoFocus
                placeholder={useBackup ? "xxxxx-xxxxx" : "123456"}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="text-center text-lg tracking-[0.3em]"
              />
            </Field>
            {formError && (
              <p role="alert" className="text-sm text-destructive">{formError}</p>
            )}
            <Button type="submit" className="w-full" loading={submitting} disabled={code.length < 6}>
              Verify and sign in
            </Button>
            <div className="flex items-center justify-between text-xs">
              <button type="button" className="text-muted-foreground hover:text-foreground" onClick={() => { setStep("credentials"); setCode(""); setFormError(null); }}>
                ← Back
              </button>
              <button type="button" className="font-medium text-primary hover:underline" onClick={() => { setUseBackup((v) => !v); setCode(""); }}>
                {useBackup ? "Use authenticator app" : "Use a backup code"}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={null}>
      <LoginForm />
    </React.Suspense>
  );
}
