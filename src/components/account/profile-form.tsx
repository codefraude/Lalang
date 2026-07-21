"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { Save, RotateCcw } from "lucide-react";
import { Field } from "@/components/auth/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SettingsSection } from "@/components/account/section";
import { useToast } from "@/components/ui/toast";
import { apiPatch, ApiError } from "@/lib/api-client";
import { useRefreshAccount } from "@/hooks/use-account";
import type { AccountData } from "@/lib/account";
import { SOCIAL_PLATFORM_LIST } from "@/lib/validations/profile";

type FormValues = {
  name: string;
  username: string;
  firstName: string;
  lastName: string;
  bio: string;
  occupation: string;
  website: string;
  birthday: string;
  location: string;
  country: string;
  timezone: string;
  phone: string;
  socials: Record<string, string>;
};

function toDefaults(a: AccountData): FormValues {
  return {
    name: a.user.name ?? "",
    username: a.user.username ?? "",
    firstName: a.profile.firstName ?? "",
    lastName: a.profile.lastName ?? "",
    bio: a.profile.bio ?? "",
    occupation: a.profile.occupation ?? "",
    website: a.profile.website ?? "",
    birthday: a.profile.birthday ?? "",
    location: a.profile.location ?? "",
    country: a.profile.country ?? "",
    timezone: a.profile.timezone ?? "",
    phone: a.profile.phone ?? "",
    socials: Object.fromEntries(SOCIAL_PLATFORM_LIST.map((p) => [p, a.profile.socials[p] ?? ""])) as Record<string, string>,
  };
}

export function ProfileForm({ account }: { account: AccountData }) {
  const toast = useToast();
  const refresh = useRefreshAccount();
  const { register, handleSubmit, reset, setError, formState } = useForm<FormValues>({
    defaultValues: toDefaults(account),
  });

  const onSubmit = async (values: FormValues) => {
    const payload: Record<string, unknown> = { ...values };
    if (!values.username) delete payload.username; // never send an empty username
    try {
      const updated = await apiPatch<AccountData>("/api/profile", payload);
      refresh(updated);
      reset(toDefaults(updated));
      toast({ variant: "success", title: "Profile saved" });
    } catch (err) {
      if (err instanceof ApiError && err.fields) {
        for (const [k, message] of Object.entries(err.fields)) setError(k as never, { message });
        toast({ variant: "error", title: "Please check the highlighted fields" });
      } else {
        toast({ variant: "error", title: "Couldn't save", description: err instanceof ApiError ? err.message : undefined });
      }
    }
  };

  const errs = formState.errors as Record<string, { message?: string }>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <SettingsSection title="Basic information" description="Your public identity on Lalang.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Display name" htmlFor="name" error={errs.name?.message}>
            <Input id="name" {...register("name")} />
          </Field>
          <Field label="Username" htmlFor="username" error={errs.username?.message} hint={<span className="text-xs text-muted-foreground">lalang.mu/@handle</span>}>
            <Input id="username" placeholder="handle" {...register("username")} />
          </Field>
          <Field label="First name" htmlFor="firstName" error={errs.firstName?.message}>
            <Input id="firstName" {...register("firstName")} />
          </Field>
          <Field label="Last name" htmlFor="lastName" error={errs.lastName?.message}>
            <Input id="lastName" {...register("lastName")} />
          </Field>
        </div>
      </SettingsSection>

      <SettingsSection title="About you" description="Tell the community a little about yourself.">
        <div className="space-y-4">
          <Field label="Bio" htmlFor="bio" error={errs.bio?.message}>
            <Textarea id="bio" rows={3} maxLength={280} placeholder="A short introduction…" {...register("bio")} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Occupation" htmlFor="occupation" error={errs.occupation?.message}>
              <Input id="occupation" placeholder="Teacher, student…" {...register("occupation")} />
            </Field>
            <Field label="Website" htmlFor="website" error={errs.website?.message}>
              <Input id="website" placeholder="https://…" {...register("website")} />
            </Field>
            <Field label="Birthday" htmlFor="birthday" error={errs.birthday?.message}>
              <Input id="birthday" type="date" {...register("birthday")} />
            </Field>
            <Field label="Phone" htmlFor="phone" error={errs.phone?.message}>
              <Input id="phone" type="tel" placeholder="+230 …" {...register("phone")} />
            </Field>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Location" description="Where in the world are you?">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Location" htmlFor="location" error={errs.location?.message} className="sm:col-span-1">
            <Input id="location" placeholder="Port Louis" {...register("location")} />
          </Field>
          <Field label="Country" htmlFor="country" error={errs.country?.message}>
            <Input id="country" maxLength={2} placeholder="MU" {...register("country")} />
          </Field>
          <Field label="Timezone" htmlFor="timezone" error={errs.timezone?.message}>
            <Input id="timezone" placeholder="Indian/Mauritius" {...register("timezone")} />
          </Field>
        </div>
      </SettingsSection>

      <SettingsSection title="Social links" description="Connect your profiles.">
        <div className="grid gap-4 sm:grid-cols-2">
          {SOCIAL_PLATFORM_LIST.map((platform) => (
            <Field key={platform} label={platform[0].toUpperCase() + platform.slice(1)} htmlFor={`social-${platform}`} error={(formState.errors.socials as Record<string, { message?: string }> | undefined)?.[platform]?.message}>
              <Input id={`social-${platform}`} placeholder="https://…" {...register(`socials.${platform}` as const)} />
            </Field>
          ))}
        </div>
      </SettingsSection>

      <div className="sticky bottom-4 flex items-center justify-end gap-2 rounded-[var(--radius)] border bg-card/80 p-3 shadow-lg backdrop-blur">
        {formState.isDirty && (
          <Button type="button" variant="ghost" onClick={() => reset()}>
            <RotateCcw className="size-4" /> Discard
          </Button>
        )}
        <Button type="submit" loading={formState.isSubmitting} disabled={!formState.isDirty}>
          <Save className="size-4" /> Save changes
        </Button>
      </div>
    </form>
  );
}
