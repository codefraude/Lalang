import { z } from "zod";
import { consumeEmailVerification } from "@/lib/tokens";
import { writeAudit } from "@/lib/audit";
import { getClientInfo } from "@/lib/request";
import { assertSameOriginOr403, rateOr429, readJson, jsonOk, jsonError, zodError } from "@/lib/api";

const schema = z.object({ token: z.string().min(1) });

export async function POST(req: Request) {
  const csrf = assertSameOriginOr403(req);
  if (csrf) return csrf;
  const limited = rateOr429(req, "verify-email", 10, 60_000);
  if (limited) return limited;

  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) return zodError(parsed.error);

  const result = await consumeEmailVerification(parsed.data.token);
  if (!result) return jsonError("This verification link is invalid or has expired.", 400);

  await writeAudit("email.verified", { userId: result.userId, client: getClientInfo(req.headers) });
  return jsonOk({ ok: true });
}
