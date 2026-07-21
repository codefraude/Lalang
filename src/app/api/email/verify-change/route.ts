import { z } from "zod";
import { consumeEmailChange } from "@/lib/tokens";
import { writeAudit } from "@/lib/audit";
import { getClientInfo } from "@/lib/request";
import { assertSameOriginOr403, rateOr429, readJson, jsonOk, jsonError, zodError } from "@/lib/api";

const schema = z.object({ token: z.string().min(1) });

export async function POST(req: Request) {
  const csrf = assertSameOriginOr403(req);
  if (csrf) return csrf;
  const limited = rateOr429(req, "email-verify-change", 10, 60_000);
  if (limited) return limited;

  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) return zodError(parsed.error);

  const result = await consumeEmailChange(parsed.data.token);
  if (!result) return jsonError("This link is invalid, expired, or the email is no longer available.", 400);

  await writeAudit("email.change.confirm", {
    userId: result.userId,
    metadata: { newEmail: result.newEmail },
    client: getClientInfo(req.headers),
  });
  return jsonOk({ ok: true, email: result.newEmail });
}
