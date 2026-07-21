"use client";

import { useQuery } from "@tanstack/react-query";
import { History, CheckCircle2, XCircle, LogOut } from "lucide-react";
import { SettingsSection } from "@/components/account/section";
import { apiGet } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface Entry {
  id: string;
  method: string;
  status: "SUCCESS" | "FAILED" | "LOGOUT";
  browser: string | null;
  os: string | null;
  ip: string | null;
  country: string | null;
  createdAt: string;
}

const STATUS = {
  SUCCESS: { icon: CheckCircle2, className: "text-success", label: "Signed in" },
  FAILED: { icon: XCircle, className: "text-destructive", label: "Failed attempt" },
  LOGOUT: { icon: LogOut, className: "text-muted-foreground", label: "Signed out" },
} as const;

export function LoginHistory() {
  const { data, isLoading } = useQuery({
    queryKey: ["login-history"],
    queryFn: () => apiGet<{ history: Entry[] }>("/api/login-history"),
  });
  const history = data?.history ?? [];

  return (
    <SettingsSection title="Login history" description="Recent sign-in activity on your account." icon={History}>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : history.length === 0 ? (
        <p className="text-sm text-muted-foreground">No activity yet.</p>
      ) : (
        <ul className="divide-y">
          {history.map((e) => {
            const meta = STATUS[e.status];
            return (
              <li key={e.id} className="flex items-center gap-3 py-2.5 text-sm first:pt-0 last:pb-0">
                <meta.icon className={cn("size-4 shrink-0", meta.className)} />
                <span className="font-medium">{meta.label}</span>
                <span className="text-muted-foreground">
                  {[e.browser, e.os].filter(Boolean).join(" · ") || e.method}
                  {e.country && ` · ${e.country}`}
                </span>
                <time className="ml-auto shrink-0 text-xs text-muted-foreground">
                  {new Date(e.createdAt).toLocaleString()}
                </time>
              </li>
            );
          })}
        </ul>
      )}
    </SettingsSection>
  );
}
