import { PrismaClient } from "@prisma/client";

/**
 * Reuse a single PrismaClient across hot-reloads in development, otherwise
 * Next.js will spawn a new connection pool on every change and exhaust the DB.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
