import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getAccount } from "@/lib/account";
import { SecuritySections } from "@/components/account/security/security-sections";

export const metadata: Metadata = { title: "Security" };

export default async function SecurityPage() {
  const session = await auth();
  const account = await getAccount(session!.user.id);
  if (!account) return null;
  return <SecuritySections initial={account} />;
}
