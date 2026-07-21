"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Languages, ShieldCheck, KeyRound, Sparkles } from "lucide-react";

const HIGHLIGHTS = [
  { icon: ShieldCheck, title: "Secure by design", text: "Passkeys, 2FA, breach checks and device sessions." },
  { icon: KeyRound, title: "Sign in your way", text: "Email, Google, or a passwordless passkey." },
  { icon: Sparkles, title: "Preserving Kreol", text: "Every account helps grow Mauritian Creole." },
];

/** Split-screen premium shell used by all auth pages. */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_1.05fr]">
      <div className="flex flex-col justify-center px-4 py-10 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto w-full max-w-sm"
        >
          <Link href="/" className="mb-8 inline-flex items-center gap-2 font-semibold">
            <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-primary">
              <Languages className="size-4" />
            </span>
            <span className="text-lg tracking-tight">Lalang</span>
          </Link>

          <h1 className="font-display text-2xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>}

          <div className="mt-7">{children}</div>

          {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
        </motion.div>
      </div>

      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-primary/95 to-accent/90 lg:block">
        <div className="lagoon-glow absolute inset-0 opacity-60" />
        <div
          aria-hidden
          className="absolute -right-24 top-16 size-80 rounded-full bg-white/10 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute bottom-0 left-10 size-72 rounded-full bg-accent/30 blur-3xl"
        />
        <div className="relative flex h-full flex-col justify-center p-12 text-white">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-md font-display text-3xl font-bold leading-tight xl:text-4xl"
          >
            One account for translating, learning and preserving our languages.
          </motion.h2>

          <div className="mt-10 space-y-5">
            {HIGHLIGHTS.map((h, i) => (
              <motion.div
                key={h.title}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-start gap-3.5"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/15 backdrop-blur">
                  <h.icon className="size-5" />
                </span>
                <div>
                  <p className="font-semibold">{h.title}</p>
                  <p className="text-sm text-white/80">{h.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
