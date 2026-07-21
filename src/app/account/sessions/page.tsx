import type { Metadata } from "next";
import { SessionsList } from "@/components/account/sessions/sessions-list";
import { LoginHistory } from "@/components/account/sessions/login-history";

export const metadata: Metadata = { title: "Sessions & devices" };

export default function SessionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-display-md font-bold">Sessions & devices</h1>
        <p className="mt-1 text-muted-foreground">Review where you're signed in and recent activity.</p>
      </div>
      <SessionsList />
      <LoginHistory />
    </div>
  );
}
