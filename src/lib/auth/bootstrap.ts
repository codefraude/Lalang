import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getClientInfo, type ClientInfo } from "@/lib/request";
import { createDeviceSession } from "@/lib/session-store";
import { recordLogin } from "@/lib/audit";
import { enrichGoogleProfile, notifyNewSignIn } from "@/lib/auth/provisioning";
import type { AuthMethod } from "@prisma/client";

const EMPTY_CLIENT: ClientInfo = {
  ip: null,
  userAgent: null,
  browser: null,
  os: null,
  deviceType: "desktop",
};

export function providerToMethod(provider?: string | null): AuthMethod {
  switch (provider) {
    case "google":
      return "GOOGLE";
    case "googleonetap":
      return "ONE_TAP";
    case "passkey":
      return "PASSKEY";
    default:
      return "PASSWORD";
  }
}

/** Read client info from the current request, tolerating non-request contexts. */
export async function clientFromHeaders(): Promise<ClientInfo> {
  try {
    return getClientInfo(await headers());
  } catch {
    return EMPTY_CLIENT;
  }
}

/**
 * On initial sign-in: create the revocable device session, stamp last-login,
 * record the login, enrich Google profiles, and fire a new-device alert.
 * Returns the new session id to embed in the JWT.
 */
export async function bootstrapSignIn(opts: {
  userId: string;
  method: AuthMethod;
  rememberMe: boolean;
  googleProfile?: { given_name?: string; family_name?: string; locale?: string };
}): Promise<string | null> {
  const client = await clientFromHeaders();
  const sid = await createDeviceSession({
    userId: opts.userId,
    method: opts.method,
    client,
    rememberMe: opts.rememberMe,
  });

  await prisma.user
    .update({ where: { id: opts.userId }, data: { lastLoginAt: new Date() } })
    .catch(() => undefined);
  await recordLogin({ userId: opts.userId, method: opts.method, status: "SUCCESS", client });

  if (opts.googleProfile) void enrichGoogleProfile(opts.userId, opts.googleProfile);
  void notifyNewSignIn(opts.userId, sid, client, opts.method);

  return sid;
}
