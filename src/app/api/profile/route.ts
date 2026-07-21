import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAccount } from "@/lib/account";
import { updateProfileSchema } from "@/lib/validations/profile";
import { writeAudit } from "@/lib/audit";
import { getClientInfo } from "@/lib/request";
import { assertSameOriginOr403, readJson, jsonOk, jsonError, zodError, unauthorized } from "@/lib/api";
import type { Prisma } from "@prisma/client";

/** "" clears a field, undefined leaves it unchanged. */
function clearable(value: string | undefined): string | null | undefined {
  if (value === undefined) return undefined;
  return value === "" ? null : value;
}

export async function PATCH(req: Request) {
  const csrf = assertSameOriginOr403(req);
  if (csrf) return csrf;

  const session = await auth();
  if (!session?.user) return unauthorized();

  const parsed = updateProfileSchema.safeParse(await readJson(req));
  if (!parsed.success) return zodError(parsed.error);
  const d = parsed.data;
  const userId = session.user.id;

  if (d.username !== undefined) {
    const owner = await prisma.user.findUnique({ where: { username: d.username }, select: { id: true } });
    if (owner && owner.id !== userId) {
      return jsonError("That username is taken.", 409, { fields: { username: "Taken." } });
    }
  }

  const userData: Prisma.UserUpdateInput = {};
  if (d.name !== undefined) userData.name = d.name;
  if (d.username !== undefined) userData.username = d.username;
  if (Object.keys(userData).length) await prisma.user.update({ where: { id: userId }, data: userData });

  const socials = d.socials
    ? Object.fromEntries(Object.entries(d.socials).filter(([, v]) => v && v.length > 0))
    : undefined;

  const profileData: Prisma.UserProfileUpsertArgs["create"] = { userId };
  const patch: Prisma.UserProfileUpdateInput = {};
  const setField = <K extends keyof Prisma.UserProfileUpdateInput>(key: K, value: unknown) => {
    if (value !== undefined) (patch as Record<string, unknown>)[key as string] = value;
  };
  setField("firstName", clearable(d.firstName));
  setField("lastName", clearable(d.lastName));
  setField("bio", clearable(d.bio));
  setField("phone", clearable(d.phone));
  setField("location", clearable(d.location));
  setField("country", clearable(d.country));
  setField("timezone", clearable(d.timezone));
  setField("occupation", clearable(d.occupation));
  setField("website", clearable(d.website));
  setField("birthday", d.birthday === undefined ? undefined : d.birthday === "" ? null : new Date(d.birthday));
  if (socials !== undefined) setField("socials", socials);

  await prisma.userProfile.upsert({
    where: { userId },
    create: { ...profileData, ...(patch as object) },
    update: patch,
  });

  await writeAudit("profile.update", { userId, client: getClientInfo(req.headers) });
  return jsonOk(await getAccount(userId));
}
