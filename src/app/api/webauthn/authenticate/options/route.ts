import { buildAuthenticationOptions, persistChallenge } from "@/lib/webauthn";
import { jsonOk } from "@/lib/api";

export const runtime = "nodejs";

/**
 * Options for passwordless passkey login (usernameless / discoverable). The
 * assertion is verified later by the `passkey` credentials provider. Public —
 * it only mints a single-use challenge cookie.
 */
export async function POST() {
  const options = await buildAuthenticationOptions();
  await persistChallenge(options.challenge);
  return jsonOk(options);
}
