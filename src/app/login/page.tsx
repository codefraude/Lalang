"use client";

import * as React from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async () => {
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password.");
    } else {
      window.location.href = "/profile";
    }
  };

  return (
    <div className="grid min-h-dvh place-items-center px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-6 flex items-center justify-center gap-2 font-semibold">
          <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-primary">
            <Languages className="size-4" />
          </span>
          <span className="text-lg tracking-tight">Lalang</span>
        </Link>

        <Card className="shadow-lg">
          <CardContent className="p-6">
            <h1 className="text-xl font-semibold">Welcome back</h1>
            <p className="mt-1 text-sm text-muted-foreground">Sign in to save your work.</p>

            <div className="mt-5 space-y-3">
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              {error && (
                <p
                  role="alert"
                  className="rounded-[calc(var(--radius)-0.25rem)] border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                  {error}
                </p>
              )}
              <Button className="w-full" onClick={onSubmit} loading={loading}>
                Sign in
              </Button>
            </div>

            <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              or
              <span className="h-px flex-1 bg-border" />
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => signIn("google", { callbackUrl: "/profile" })}
            >
              Continue with Google
            </Button>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
