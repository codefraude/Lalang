import { prisma } from "@/lib/prisma";
import type { AuthMethod, AuthEventStatus, Prisma } from "@prisma/client";
import type { ClientInfo } from "@/lib/request";

/**
 * Sensitive-action audit trail. All writes are best-effort — auditing must
 * never break the user-facing action, so failures are swallowed after logging.
 */
export async function writeAudit(
  action: string,
  opts: {
    userId?: string | null;
    metadata?: Prisma.InputJsonValue;
    client?: Pick<ClientInfo, "ip" | "userAgent"> | null;
  } = {},
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        userId: opts.userId ?? null,
        metadata: opts.metadata,
        ip: opts.client?.ip ?? null,
        userAgent: opts.client?.userAgent ?? null,
      },
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[audit] failed to write", action, err);
  }
}

/** Append an entry to the login history (successful or failed sign-in). */
export async function recordLogin(opts: {
  userId?: string | null;
  email?: string | null;
  method: AuthMethod;
  status: AuthEventStatus;
  reason?: string | null;
  client: ClientInfo;
}): Promise<void> {
  try {
    await prisma.loginHistory.create({
      data: {
        userId: opts.userId ?? null,
        email: opts.email ?? null,
        method: opts.method,
        status: opts.status,
        reason: opts.reason ?? null,
        ip: opts.client.ip,
        userAgent: opts.client.userAgent,
        browser: opts.client.browser,
        os: opts.client.os,
        deviceType: opts.client.deviceType,
      },
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[audit] failed to record login", err);
  }
}
