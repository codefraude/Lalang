import { redirect } from "next/navigation";

/** The profile experience now lives under the full account dashboard. */
export default function ProfileRedirect() {
  redirect("/account");
}
