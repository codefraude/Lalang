import { prisma } from "@/lib/prisma";
import type { AuthMethod } from "@prisma/client";
import type { ClientInfo } from "@/lib/request";

/**
 * Device sessions make the stateless JWT revocable. The JWT carries a session
 * id (`sid`); every session read re-checks the matching row, so revoking it (or
 * letting it expire) logs that device out on its next request.
 */

const DAY = 24 * 60 * 60 * 1000;
export const REMEMBER_TTL = 30 * DAY;
export const DEFAULT_TTL = 12 * 60 * 60 * 1000; // 12h
const TOUCH_INTERVAL = 5 * 60 * 1000; // throttle lastActiveAt writes

export async function createDeviceSession(opts: {
  userId: string;
  method: AuthMethod;
  client: ClientInfo;
  rememberMe: boolean;
}): Promise<string> {
  const ttl = opts.rememberMe ? REMEMBER_TTL : DEFAULT_TTL;
  const row = await prisma.deviceSession.create({
    data: {
      userId: opts.userId,
      method: opts.method,
      rememberMe: opts.rememberMe,
      ip: opts.client.ip,
      userAgent: opts.client.userAgent,
      browser: opts.client.browser,
      os: opts.client.os,
      deviceType: opts.client.deviceType,
      expiresAt: new Date(Date.now() + ttl),
    },
  });
  return row.id;
}

/**
 * True if the session is still active. Also refreshes `lastActiveAt` at most
 * once per {@link TOUCH_INTERVAL} to avoid a write on every request.
 */
export async function isDeviceSessionValid(sid: string): Promise<boolean> {
  const row = await prisma.deviceSession.findUnique({
    where: { id: sid },
    select: { revokedAt: true, expiresAt: true, lastActiveAt: true },
  });
  if (!row) return false;
  const now = Date.now();
  if (row.revokedAt || row.expiresAt.getTime() < now) return false;

  if (now - row.lastActiveAt.getTime() > TOUCH_INTERVAL) {
    await prisma.deviceSession
      .update({ where: { id: sid }, data: { lastActiveAt: new Date() } })
      .catch(() => undefined);
  }
  return true;
}

/** Revoke a single session, scoped to its owner. Returns true if it revoked. */
export async function revokeDeviceSession(sid: string, userId: string): Promise<boolean> {
  const result = await prisma.deviceSession.updateMany({
    where: { id: sid, userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  return result.count > 0;
}

/** Revoke all of a user's sessions except (optionally) the current one. */
export async function revokeAllDeviceSessions(userId: string, exceptSid?: string): Promise<number> {
  const result = await prisma.deviceSession.updateMany({
    where: { userId, revokedAt: null, ...(exceptSid ? { id: { not: exceptSid } } : {}) },
    data: { revokedAt: new Date() },
  });
  return result.count;
}

/** List active sessions for a user, most-recently-active first. */
export async function listDeviceSessions(userId: string) {
  return prisma.deviceSession.findMany({
    where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { lastActiveAt: "desc" },
  });
}
