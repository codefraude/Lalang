import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getAccount } from "@/lib/account";
import { Preferences } from "@/components/account/notifications/preferences";

export const metadata: Metadata = { title: "Notifications & preferences" };

export default async function NotificationsPage() {
  const session = await auth();
  const account = await getAccount(session!.user.id);
  if (!account) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-display-md font-bold">Notifications & preferences</h1>
        <p className="mt-1 text-muted-foreground">Decide how Lalang keeps in touch and how it looks.</p>
      </div>
      <Preferences initial={account} />
    </div>
  );
}
