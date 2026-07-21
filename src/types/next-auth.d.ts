import type { DefaultSession } from "next-auth";

type Role = "USER" | "MODERATOR" | "ADMIN";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
    /** Device-session id backing this JWT (for revocation & reauth). */
    sid?: string;
    /** Unix seconds of the last full authentication (for sudo/reauth window). */
    authAt?: number;
  }

  interface User {
    role?: Role;
    /** Set by the Credentials provider to control session length. */
    rememberMe?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
    sid?: string;
    rememberMe?: boolean;
    authAt?: number;
  }
}
