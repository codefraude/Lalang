"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { signOut } from "next-auth/react";
import { Monitor, Smartphone, Tablet, LogOut, MonitorSmartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SettingsSection } from "@/components/account/section";
import { useToast } from "@/components/ui/toast";
import { apiGet, apiDelete } from "@/lib/api-client";

function describeDevice(s: { browser: string | null; os: string | null }): string {
  if (s.browser && s.os) return `${s.browser} on ${s.os}`;
  return s.browser ?? s.os ?? "Unknown device";
}

interface DeviceSession {
  id: string;
  method: string;
  browser: string | null;
  os: string | null;
  deviceType: string | null;
  ip: string | null;
  city: string | null;
  country: string | null;
  createdAt: string;
  lastActiveAt: string;
  current: boolean;
}

function DeviceIcon({ type }: { type: string | null }) {
  if (type === "mobile") return <Smartphone className="size-4" />;
  if (type === "tablet") return <Tablet className="size-4" />;
  return <Monitor className="size-4" />;
}

export function SessionsList() {
  const toast = useToast();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["sessions"],
    queryFn: () => apiGet<{ sessions: DeviceSession[] }>("/api/sessions"),
  });
  const sessions = data?.sessions ?? [];
  const others = sessions.filter((s) => !s.current).length;

  const revoke = async (s: DeviceSession) => {
    const res = await apiDelete<{ self: boolean }>(`/api/sessions/${s.id}`).catch(() => null);
    if (!res) return toast({ variant: "error", title: "Couldn't revoke session" });
    if (res.self) return void signOut({ callbackUrl: "/login" });
    await qc.invalidateQueries({ queryKey: ["sessions"] });
    toast({ variant: "success", title: "Session revoked" });
  };

  const revokeOthers = async () => {
    await apiDelete("/api/sessions").catch(() => null);
    await qc.invalidateQueries({ queryKey: ["sessions"] });
    toast({ variant: "success", title: "Signed out other devices" });
  };

  return (
    <SettingsSection
      title="Active sessions"
      description="Devices currently signed in to your account."
      icon={MonitorSmartphone}
      footer={
        others > 0 ? (
          <Button size="sm" variant="outline" onClick={revokeOthers}>
            <LogOut className="size-4" /> Sign out {others} other {others === 1 ? "device" : "devices"}
          </Button>
        ) : undefined
      }
    >
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <ul className="divide-y">
          {sessions.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-lg bg-secondary text-secondary-foreground">
                  <DeviceIcon type={s.deviceType} />
                </span>
                <div>
                  <p className="text-sm font-medium">
                    {describeDevice(s)}
                    {s.current && (
                      <span className="ml-2 rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success">This device</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {[s.city, s.country, s.ip].filter(Boolean).join(" · ") || "Unknown location"} · active {new Date(s.lastActiveAt).toLocaleString()}
                  </p>
                </div>
              </div>
              {!s.current && (
                <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-destructive" onClick={() => revoke(s)}>
                  Revoke
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </SettingsSection>
  );
}
