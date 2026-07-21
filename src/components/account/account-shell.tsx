"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { User, ShieldCheck, MonitorSmartphone, Bell, Link2, LayoutDashboard, LogOut } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/account", label: "Overview", icon: LayoutDashboard },
  { href: "/account/profile", label: "Profile", icon: User },
  { href: "/account/security", label: "Security", icon: ShieldCheck },
  { href: "/account/sessions", label: "Sessions", icon: MonitorSmartphone },
  { href: "/account/notifications", label: "Notifications", icon: Bell },
  { href: "/account/connections", label: "Connections", icon: Link2 },
];

function initials(name?: string | null, email?: string | null) {
  return (name ?? email ?? "?").charAt(0).toUpperCase();
}

export function AccountShell({
  user,
  children,
}: {
  user: { name?: string | null; email?: string | null; image?: string | null };
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const isActive = (href: string) => (href === "/account" ? pathname === href : pathname.startsWith(href));

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 lg:flex-row">
      <aside className="lg:w-64 lg:shrink-0">
        <div className="mb-6 flex items-center gap-3">
          <Avatar className="size-11 border">
            {user.image && <AvatarImage src={user.image} alt="" />}
            <AvatarFallback>{initials(user.name, user.email)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-semibold">{user.name ?? "Your account"}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible" aria-label="Account">
          {NAV.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-2.5 whitespace-nowrap rounded-[calc(var(--radius)-0.3rem)] px-3 py-2 text-sm font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="account-nav-active"
                    className="absolute inset-0 -z-10 rounded-[calc(var(--radius)-0.3rem)] bg-secondary"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2.5 whitespace-nowrap rounded-[calc(var(--radius)-0.3rem)] px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive lg:mt-2"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </nav>
      </aside>

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
