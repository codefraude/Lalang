import { OAuth2Client } from "google-auth-library";
import { prisma } from "@/lib/prisma";
import { googleClientId } from "@/lib/env";
import { ensureUserDefaults, enrichGoogleProfile } from "@/lib/auth/provisioning";
import { WebauthnFailed } from "@/lib/auth/errors";

const client = new OAuth2Client();

/**
 * Verify a Google One Tap ID token server-side and resolve it to a user,
 * creating the account (and linking the Google provider) on first sight.
 * Runs outside the Prisma adapter, so we persist the user/account ourselves.
 */
export async function authorizeOneTap(raw: Partial<Record<string, unknown>>) {
  if (typeof raw.credential !== "string" || !googleClientId) throw new WebauthnFailed();

  let payload;
  try {
    const ticket = await client.verifyIdToken({
      idToken: raw.credential,
      audience: googleClientId,
    });
    payload = ticket.getPayload();
  } catch {
    throw new WebauthnFailed();
  }

  if (!payload?.email || payload.email_verified !== true) throw new WebauthnFailed();

  const email = payload.email.toLowerCase();
  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: payload.name ?? null,
        image: payload.picture ?? null,
        emailVerified: new Date(),
      },
    });
  } else if (!user.emailVerified) {
    await prisma.user.update({ where: { id: user.id }, data: { emailVerified: new Date() } });
  }

  // Link the Google provider account if not already linked.
  await prisma.account.upsert({
    where: { provider_providerAccountId: { provider: "google", providerAccountId: payload.sub! } },
    update: {},
    create: {
      userId: user.id,
      type: "oidc",
      provider: "google",
      providerAccountId: payload.sub!,
    },
  });

  await ensureUserDefaults(user.id);
  await enrichGoogleProfile(user.id, {
    given_name: payload.given_name,
    family_name: payload.family_name,
    locale: payload.locale,
  });

  if (user.status === "DEACTIVATED") {
    await prisma.user.update({
      where: { id: user.id },
      data: { status: "ACTIVE", deactivatedAt: null },
    });
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    role: user.role,
    rememberMe: true,
  };
}
