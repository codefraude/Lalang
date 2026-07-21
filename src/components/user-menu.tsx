"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { LayoutDashboard, User, ShieldCheck, LogOut } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

/** Auth-aware account control for the site header. */
export function UserMenu() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <span className="size-9 animate-pulse rounded-full bg-muted" aria-hidden />;
  }

  if (!session?.user) {
    return (
      <div className="flex items-center gap-1">
        <Button asChild size="sm" variant="ghost" className="hidden sm:inline-flex">
          <Link href="/login">Sign in</Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/register">Get started</Link>
        </Button>
      </div>
    );
  }

  const { name, email, image } = session.user;
  const initial = (name ?? email ?? "?").charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="rounded-full outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Account menu"
        >
          <Avatar className="size-9 border">
            {image && <AvatarImage src={image} alt="" />}
            <AvatarFallback className="text-sm">{initial}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-foreground">{name ?? "Signed in"}</span>
          <span className="truncate text-xs">{email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/account"><LayoutDashboard /> Overview</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account/profile"><User /> Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account/security"><ShieldCheck /> Security</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-destructive focus:bg-destructive/10 focus:text-destructive [&_svg]:text-destructive"
        >
          <LogOut /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
