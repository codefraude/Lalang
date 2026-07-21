"use client";

import * as React from "react";
import { signOut } from "next-auth/react";
import { AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { useReauth } from "@/components/account/reauth-provider";
import { apiPost, apiDelete, ApiError } from "@/lib/api-client";
import type { AccountData } from "@/lib/account";

export function DangerZone({ account }: { account: AccountData }) {
  const toast = useToast();
  const { run } = useReauth();
  const [confirm, setConfirm] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const expected = account.user.email ?? "";

  const deactivate = async () => {
    setBusy(true);
    try {
      await run(() => apiPost("/api/account/deactivate"));
      await signOut({ callbackUrl: "/" });
    } catch (err) {
      setBusy(false);
      if (err instanceof ApiError) toast({ variant: "error", title: "Couldn't deactivate", description: err.message });
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await run(() => apiDelete("/api/account", { confirm }));
      await signOut({ callbackUrl: "/" });
    } catch (err) {
      setBusy(false);
      if (err instanceof ApiError) toast({ variant: "error", title: "Couldn't delete account", description: err.message });
    }
  };

  return (
    <Card className="border-destructive/40">
      <div className="p-6">
        <div className="flex items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-destructive/10 text-destructive">
            <AlertTriangle className="size-[1.1rem]" />
          </span>
          <div>
            <h2 className="font-semibold text-destructive">Danger zone</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">Irreversible and destructive actions.</p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <div className="flex flex-col gap-3 rounded-[var(--radius)] border p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">Deactivate account</p>
              <p className="text-sm text-muted-foreground">Hide your profile. Signing in again reactivates it.</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">Deactivate</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Deactivate your account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Your profile will be hidden and you'll be signed out. You can reactivate any time by signing in again.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <Button variant="outline" onClick={deactivate} loading={busy}>Deactivate</Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className="flex flex-col gap-3 rounded-[var(--radius)] border border-destructive/40 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-destructive">Delete account</p>
              <p className="text-sm text-muted-foreground">Permanently erase your account and all data.</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="default" size="sm" className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete your account permanently?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This cannot be undone. All your translations, favourites and settings will be erased.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-1.5">
                  <Label htmlFor="delete-confirm">Type <strong>{expected}</strong> to confirm</Label>
                  <Input id="delete-confirm" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder={expected} autoComplete="off" />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setConfirm("")}>Cancel</AlertDialogCancel>
                  <Button
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={confirm.toLowerCase() !== expected.toLowerCase() || busy}
                    loading={busy}
                    onClick={remove}
                  >
                    Delete forever
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </Card>
  );
}
