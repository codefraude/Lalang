import type { Metadata } from "next";
import { ConnectedAccounts } from "@/components/account/connections/connected-accounts";

export const metadata: Metadata = { title: "Connections" };

export default function ConnectionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-display-md font-bold">Connections</h1>
        <p className="mt-1 text-muted-foreground">Manage the accounts linked to your Lalang profile.</p>
      </div>
      <ConnectedAccounts />
    </div>
  );
}
