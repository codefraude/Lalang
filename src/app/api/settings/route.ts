import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAccount } from "@/lib/account";
import { updateSettingsSchema } from "@/lib/validations/settings";
import { assertSameOriginOr403, readJson, jsonOk, zodError, unauthorized } from "@/lib/api";

export async function PATCH(req: Request) {
  const csrf = assertSameOriginOr403(req);
  if (csrf) return csrf;

  const session = await auth();
  if (!session?.user) return unauthorized();

  const parsed = updateSettingsSchema.safeParse(await readJson(req));
  if (!parsed.success) return zodError(parsed.error);

  await prisma.userSettings.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, ...parsed.data },
    update: parsed.data,
  });

  return jsonOk(await getAccount(session.user.id));
}
