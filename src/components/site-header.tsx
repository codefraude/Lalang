"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Languages, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/user-menu";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/translator", label: "Translate" },
  { href: "/dictionary", label: "Dictionary" },
  { href: "/learn", label: "Learn" },
];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-semibold">
      <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-primary">
        <Languages className="size-4" />
      </span>
      <span className="text-lg tracking-tight">Lalang</span>
    </Link>
  );
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname() ?? "";
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b glass">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Logo />

        <nav className="hidden items-center gap-1 sm:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-[calc(var(--radius)-0.35rem)] px-3 py-2 text-sm font-medium transition-colors",
                isActive(pathname, item.href)
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="hidden sm:block">
            <UserMenu />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t sm:hidden"
          >
            <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-[calc(var(--radius)-0.35rem)] px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive(pathname, item.href)
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <Button asChild variant="outline" className="mt-1 w-full">
                <Link href="/account">Account</Link>
              </Button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
