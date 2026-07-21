import { prisma } from "@/lib/prisma";

/** One checklist item contributing to the account-completion ring. */
export interface CompletionItem {
  key: string;
  label: string;
  done: boolean;
}

export interface AccountData {
  user: {
    id: string;
    name: string | null;
    username: string | null;
    email: string | null;
    emailVerified: boolean;
    image: string | null;
    role: string;
    status: string;
    twoFactorEnabled: boolean;
    hasPassword: boolean;
    lastLoginAt: string | null;
    createdAt: string;
  };
  profile: {
    firstName: string | null;
    lastName: string | null;
    bio: string | null;
    phone: string | null;
    location: string | null;
    country: string | null;
    timezone: string | null;
    occupation: string | null;
    website: string | null;
    birthday: string | null;
    socials: Record<string, string>;
  };
  settings: {
    theme: string;
    locale: string;
    timezone: string | null;
    profileVisibility: string;
    showEmail: boolean;
    showActivity: boolean;
    reducedMotion: boolean;
  };
  notifications: {
    productUpdates: boolean;
    securityAlerts: boolean;
    marketingEmails: boolean;
    weeklyDigest: boolean;
    learningReminders: boolean;
  };
  stats: { translations: number; favorites: number; passkeys: number; sessions: number };
  completion: { percent: number; items: CompletionItem[] };
}

function completion(input: {
  name: string | null;
  emailVerified: boolean;
  hasAvatar: boolean;
  bio: string | null;
  location: string | null;
  twoFactor: boolean;
  hasPasskey: boolean;
}): AccountData["completion"] {
  const items: CompletionItem[] = [
    { key: "name", label: "Add your name", done: !!input.name },
    { key: "email", label: "Verify your email", done: input.emailVerified },
    { key: "avatar", label: "Upload a profile picture", done: input.hasAvatar },
    { key: "bio", label: "Write a short bio", done: !!input.bio },
    { key: "location", label: "Add your location", done: !!input.location },
    { key: "2fa", label: "Enable two-factor auth", done: input.twoFactor },
    { key: "passkey", label: "Add a passkey", done: input.hasPasskey },
  ];
  const done = items.filter((i) => i.done).length;
  return { percent: Math.round((done / items.length) * 100), items };
}

/** Full account aggregate used by the dashboard and the profile API. */
export async function getAccount(userId: string): Promise<AccountData | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      settings: true,
      notificationPrefs: true,
      avatar: { select: { id: true } },
      _count: { select: { translations: true, favorites: true, authenticators: true, deviceSessions: true } },
    },
  });
  if (!user) return null;

  const socials =
    user.profile?.socials && typeof user.profile.socials === "object"
      ? (user.profile.socials as Record<string, string>)
      : {};

  return {
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      emailVerified: !!user.emailVerified,
      image: user.image,
      role: user.role,
      status: user.status,
      twoFactorEnabled: user.twoFactorEnabled,
      hasPassword: !!user.passwordHash,
      lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
      createdAt: user.createdAt.toISOString(),
    },
    profile: {
      firstName: user.profile?.firstName ?? null,
      lastName: user.profile?.lastName ?? null,
      bio: user.profile?.bio ?? null,
      phone: user.profile?.phone ?? null,
      location: user.profile?.location ?? null,
      country: user.profile?.country ?? null,
      timezone: user.profile?.timezone ?? null,
      occupation: user.profile?.occupation ?? null,
      website: user.profile?.website ?? null,
      birthday: user.profile?.birthday ? user.profile.birthday.toISOString().slice(0, 10) : null,
      socials,
    },
    settings: {
      theme: user.settings?.theme ?? "SYSTEM",
      locale: user.settings?.locale ?? "en",
      timezone: user.settings?.timezone ?? null,
      profileVisibility: user.settings?.profileVisibility ?? "PRIVATE",
      showEmail: user.settings?.showEmail ?? false,
      showActivity: user.settings?.showActivity ?? true,
      reducedMotion: user.settings?.reducedMotion ?? false,
    },
    notifications: {
      productUpdates: user.notificationPrefs?.productUpdates ?? true,
      securityAlerts: user.notificationPrefs?.securityAlerts ?? true,
      marketingEmails: user.notificationPrefs?.marketingEmails ?? false,
      weeklyDigest: user.notificationPrefs?.weeklyDigest ?? false,
      learningReminders: user.notificationPrefs?.learningReminders ?? true,
    },
    stats: {
      translations: user._count.translations,
      favorites: user._count.favorites,
      passkeys: user._count.authenticators,
      sessions: user._count.deviceSessions,
    },
    completion: completion({
      name: user.name,
      emailVerified: !!user.emailVerified,
      hasAvatar: !!user.avatar,
      bio: user.profile?.bio ?? null,
      location: user.profile?.location ?? null,
      twoFactor: user.twoFactorEnabled,
      hasPasskey: user._count.authenticators > 0,
    }),
  };
}
