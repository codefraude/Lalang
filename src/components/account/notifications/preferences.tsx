"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Bell, Lock, Palette, Monitor, Moon, Sun } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { SettingsSection } from "@/components/account/section";
import { useToast } from "@/components/ui/toast";
import { useAccount, useRefreshAccount } from "@/hooks/use-account";
import { apiPatch } from "@/lib/api-client";
import type { AccountData } from "@/lib/account";
import { cn } from "@/lib/utils";

function ToggleRow({
  id,
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <Label htmlFor={id} className="cursor-pointer">{label}</Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch id={id} checked={checked} disabled={disabled} onCheckedChange={onChange} />
    </div>
  );
}

const THEMES = [
  { value: "SYSTEM", label: "System", icon: Monitor },
  { value: "LIGHT", label: "Light", icon: Sun },
  { value: "DARK", label: "Dark", icon: Moon },
] as const;

export function Preferences({ initial }: { initial: AccountData }) {
  const { data } = useAccount(initial);
  const account = data ?? initial;
  const toast = useToast();
  const refresh = useRefreshAccount();
  const { setTheme } = useTheme();

  const save = async (endpoint: "/api/notifications" | "/api/settings", patch: Record<string, unknown>) => {
    try {
      const updated = await apiPatch<AccountData>(endpoint, patch);
      refresh(updated);
    } catch {
      refresh();
      toast({ variant: "error", title: "Couldn't save preference" });
    }
  };

  const n = account.notifications;
  const s = account.settings;

  return (
    <div className="space-y-6">
      <SettingsSection title="Email notifications" description="Choose what we email you about." icon={Bell}>
        <div className="divide-y">
          <ToggleRow id="productUpdates" label="Product updates" description="New features and improvements." checked={n.productUpdates} onChange={(v) => save("/api/notifications", { productUpdates: v })} />
          <ToggleRow id="weeklyDigest" label="Weekly digest" description="A summary of your learning progress." checked={n.weeklyDigest} onChange={(v) => save("/api/notifications", { weeklyDigest: v })} />
          <ToggleRow id="learningReminders" label="Learning reminders" description="Gentle nudges to keep your streak." checked={n.learningReminders} onChange={(v) => save("/api/notifications", { learningReminders: v })} />
          <ToggleRow id="marketingEmails" label="Marketing" description="Occasional news and offers." checked={n.marketingEmails} onChange={(v) => save("/api/notifications", { marketingEmails: v })} />
          <ToggleRow id="securityAlerts" label="Security alerts" description="Always on to keep your account safe." checked disabled onChange={() => undefined} />
        </div>
      </SettingsSection>

      <SettingsSection title="Privacy" description="Control what others can see." icon={Lock}>
        <div className="divide-y">
          <ToggleRow id="profileVisibility" label="Public profile" description="Let others view your profile." checked={s.profileVisibility === "PUBLIC"} onChange={(v) => save("/api/settings", { profileVisibility: v ? "PUBLIC" : "PRIVATE" })} />
          <ToggleRow id="showEmail" label="Show email" description="Display your email on your public profile." checked={s.showEmail} onChange={(v) => save("/api/settings", { showEmail: v })} />
          <ToggleRow id="showActivity" label="Show activity" description="Show your recent learning activity." checked={s.showActivity} onChange={(v) => save("/api/settings", { showActivity: v })} />
        </div>
      </SettingsSection>

      <SettingsSection title="Appearance" description="Personalise how Lalang looks and feels." icon={Palette}>
        <div className="space-y-4">
          <div>
            <Label className="mb-2 block">Theme</Label>
            <div className="grid grid-cols-3 gap-2">
              {THEMES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => {
                    setTheme(t.value.toLowerCase());
                    void save("/api/settings", { theme: t.value });
                  }}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-[calc(var(--radius)-0.2rem)] border p-3 text-sm transition-colors",
                    s.theme === t.value ? "border-primary bg-secondary" : "hover:bg-muted",
                  )}
                  aria-pressed={s.theme === t.value}
                >
                  <t.icon className="size-5" />
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="border-t pt-2">
            <ToggleRow id="reducedMotion" label="Reduced motion" description="Minimise animations across the app." checked={s.reducedMotion} onChange={(v) => save("/api/settings", { reducedMotion: v })} />
          </div>
        </div>
      </SettingsSection>
    </div>
  );
}
