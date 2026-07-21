import { prisma } from "@/lib/prisma";
import type { AuthMethod } from "@prisma/client";
import type { ClientInfo } from "@/lib/request";
import { describeDevice } from "@/lib/request";
import { sendEmail } from "@/lib/mail/send";
import { securityAlertEmail } from "@/lib/mail/templates";

/** Create the profile / settings / notification rows for a user if missing. */
export async function ensureUserDefaults(userId: string): Promise<void> {
  await Promise.all([
    prisma.userProfile.upsert({ where: { userId }, update: {}, create: { userId } }),
    prisma.userSettings.upsert({ where: { userId }, update: {}, create: { userId } }),
    prisma.notificationPreference.upsert({ where: { userId }, update: {}, create: { userId } }),
  ]);
}

/** Populate first/last name + locale from a Google profile (best-effort). */
export async function enrichGoogleProfile(
  userId: string,
  profile: { given_name?: string; family_name?: string; locale?: string },
): Promise<void> {
  try {
    await ensureUserDefaults(userId);
    await prisma.userProfile.update({
      where: { userId },
      data: {
        firstName: profile.given_name ?? undefined,
        lastName: profile.family_name ?? undefined,
      },
    });
    if (profile.locale) {
      await prisma.userSettings.update({ where: { userId }, data: { locale: profile.locale } });
    }
  } catch {
    // best-effort enrichment; never block sign-in
  }
}

/**
 * Email a "new sign-in" alert when a device we haven't seen before signs in
 * (and the user hasn't opted out). Fire-and-forget — never blocks sign-in.
 */
export async function notifyNewSignIn(
  userId: string,
  sid: string,
  client: ClientInfo,
  method: AuthMethod,
): Promise<void> {
  try {
    const [user, prefs, priorLogins, sameDevice] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { email: true } }),
      prisma.notificationPreference.findUnique({ where: { userId }, select: { securityAlerts: true } }),
      prisma.loginHistory.count({ where: { userId, status: "SUCCESS" } }),
      prisma.deviceSession.count({
        where: {
          userId,
          id: { not: sid },
          browser: client.browser,
          os: client.os,
          revokedAt: null,
        },
      }),
    ]);
    if (!user?.email) return;
    if (prefs && !prefs.securityAlerts) return;
    // Skip the very first sign-in (account creation) and known devices.
    if (priorLogins <= 1 || sameDevice > 0) return;

    await sendEmail(
      user.email,
      securityAlertEmail({
        device: `${describeDevice(client)}${method !== "PASSWORD" ? ` (${method})` : ""}`,
        ip: client.ip,
        when: new Date().toUTCString(),
      }),
    );
  } catch {
    // best-effort
  }
}
