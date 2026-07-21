import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getAccount } from "@/lib/account";
import { Card, CardContent } from "@/components/ui/card";
import { AvatarUploader } from "@/components/account/avatar-uploader";
import { ProfileForm } from "@/components/account/profile-form";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const session = await auth();
  const account = await getAccount(session!.user.id);
  if (!account) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-display-md font-bold">Profile</h1>
        <p className="mt-1 text-muted-foreground">Manage how you appear across Lalang.</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <AvatarUploader image={account.user.image} name={account.user.name} email={account.user.email} />
        </CardContent>
      </Card>

      <ProfileForm account={account} />
    </div>
  );
}
