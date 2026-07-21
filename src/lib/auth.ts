import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { googleEnabled, isProduction } from "@/lib/env";
import { isDeviceSessionValid, revokeDeviceSession } from "@/lib/session-store";
import { recordLogin, writeAudit } from "@/lib/audit";
import { ensureUserDefaults } from "@/lib/auth/provisioning";
import { authorizePassword } from "@/lib/auth/credentials";
import { authorizePasskey } from "@/lib/auth/passkey";
import { authorizeOneTap } from "@/lib/auth/onetap";
import { providerToMethod, bootstrapSignIn } from "@/lib/auth/bootstrap";
import type { Provider } from "next-auth/providers";

/**
 * Auth.js v5 configuration.
 *
 * Strategy: JWT (required by the Credentials providers). The JWT carries a
 * device-session id (`sid`); the jwt callback re-checks that row on every read,
 * making the stateless token revocable (see lib/session-store). Providers:
 * Google OAuth, email+password (+TOTP), passkey (WebAuthn) and Google One Tap.
 */

const providers: Provider[] = [
  Credentials({
    id: "credentials",
    name: "Email and password",
    credentials: { email: {}, password: {}, rememberMe: {}, totp: {}, backupCode: {} },
    authorize: (raw, req) => authorizePassword(raw, req),
  }),
  Credentials({
    id: "passkey",
    name: "Passkey",
    credentials: { response: {} },
    authorize: (raw, req) => authorizePasskey(raw, req),
  }),
];

if (googleEnabled) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        return {
          id: profile.sub,
          email: profile.email,
          name: profile.name,
          image: profile.picture,
          emailVerified: profile.email_verified ? new Date() : null,
          role: "USER",
        };
      },
    }),
    Credentials({
      id: "googleonetap",
      name: "Google One Tap",
      credentials: { credential: {} },
      authorize: (raw) => authorizeOneTap(raw),
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 30, updateAge: 60 * 60 * 24 },
  useSecureCookies: isProduction,
  trustHost: true,
  pages: { signIn: "/login", error: "/login" },
  providers,
  callbacks: {
    async signIn({ account, profile }) {
      // Only allow Google linking when the provider has verified the email.
      if (account?.provider === "google") return profile?.email_verified === true;
      return true;
    },
    async jwt({ token, user, account, profile, trigger, session }) {
      if (user) {
        token.id = user.id!;
        token.role = (user as { role?: string }).role ?? "USER";
        token.authAt = Math.floor(Date.now() / 1000);
        const method = providerToMethod(account?.provider);
        const rememberMe = (user as { rememberMe?: boolean }).rememberMe ?? method !== "PASSWORD";
        token.rememberMe = rememberMe;
        try {
          const sid = await bootstrapSignIn({
            userId: user.id!,
            method,
            rememberMe,
            googleProfile: account?.provider === "google" ? (profile as never) : undefined,
          });
          if (sid) token.sid = sid;
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error("[auth] sign-in bootstrap failed", err);
        }
        return token;
      }

      if (trigger === "update" && session) {
        const patch = session as { name?: string; image?: string | null; role?: string };
        if (patch.name) token.name = patch.name;
        if (patch.image !== undefined) token.picture = patch.image;
        if (patch.role) token.role = patch.role;
        return token;
      }

      // Subsequent reads: enforce revocation / expiry via the device session.
      const sid = token.sid as string | undefined;
      if (sid) {
        const valid = await isDeviceSessionValid(sid);
        if (!valid) return null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string | undefined) ?? "";
        session.user.role = (token.role as "USER" | "MODERATOR" | "ADMIN" | undefined) ?? "USER";
      }
      session.sid = token.sid as string | undefined;
      session.authAt = token.authAt as number | undefined;
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (user.id) await ensureUserDefaults(user.id);
    },
    async signOut(message) {
      const token = (message as { token?: { sid?: string; id?: string } }).token;
      if (token?.sid && token.id) {
        await revokeDeviceSession(token.sid, token.id).catch(() => undefined);
        await recordLogin({
          userId: token.id,
          method: "PASSWORD",
          status: "LOGOUT",
          client: { ip: null, userAgent: null, browser: null, os: null, deviceType: "desktop" },
        });
        await writeAudit("auth.logout", { userId: token.id });
      }
    },
  },
});
