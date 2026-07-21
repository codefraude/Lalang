import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SiteHeader } from "@/components/site-header";
import { AccountShell } from "@/components/account/account-shell";
import { ReauthProvider } from "@/components/account/reauth-provider";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/account");

  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <ReauthProvider>
        <AccountShell
          user={{ name: session.user.name, email: session.user.email, image: session.user.image }}
        >
          {children}
        </AccountShell>
      </ReauthProvider>
    </div>
  );
}
