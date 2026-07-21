import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";
import { assertSameOriginOr403, readJson, jsonOk, jsonError, zodError, unauthorized } from "@/lib/api";

const MAX_BYTES = 1_000_000; // 1 MB after client-side compression
const ALLOWED = { png: "image/png", jpeg: "image/jpeg", webp: "image/webp" } as const;

const schema = z.object({
  dataUrl: z.string().regex(/^data:image\/(png|jpeg|webp);base64,/, "Unsupported image format."),
  width: z.number().int().positive().max(4096).optional(),
  height: z.number().int().positive().max(4096).optional(),
});

/** Upload (replace) the user's avatar. Expects a compressed data URL. */
export async function POST(req: Request) {
  const csrf = assertSameOriginOr403(req);
  if (csrf) return csrf;

  const session = await auth();
  if (!session?.user) return unauthorized();

  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) return zodError(parsed.error);

  const match = parsed.data.dataUrl.match(/^data:(image\/(png|jpeg|webp));base64,(.+)$/);
  if (!match) return jsonError("Unsupported image format.", 422);
  const mimeType = match[1];
  const data = Buffer.from(match[3], "base64");
  if (data.byteLength === 0) return jsonError("The image is empty.", 422);
  if (data.byteLength > MAX_BYTES) return jsonError("Image is too large (max 1 MB).", 413);
  if (!Object.values(ALLOWED).includes(mimeType as (typeof ALLOWED)[keyof typeof ALLOWED])) {
    return jsonError("Unsupported image format.", 422);
  }

  const avatar = await prisma.avatar.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      data,
      mimeType,
      size: data.byteLength,
      width: parsed.data.width,
      height: parsed.data.height,
    },
    update: { data, mimeType, size: data.byteLength, width: parsed.data.width, height: parsed.data.height },
  });

  const image = `/api/avatar/${session.user.id}?v=${avatar.updatedAt.getTime()}`;
  await prisma.user.update({ where: { id: session.user.id }, data: { image } });
  await writeAudit("avatar.upload", { userId: session.user.id });

  return jsonOk({ image });
}

/** Remove the uploaded avatar. */
export async function DELETE(req: Request) {
  const csrf = assertSameOriginOr403(req);
  if (csrf) return csrf;

  const session = await auth();
  if (!session?.user) return unauthorized();

  await prisma.avatar.deleteMany({ where: { userId: session.user.id } });
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { image: true },
  });
  // Only clear the image if it pointed at our uploaded avatar (keep OAuth pics).
  if (user?.image?.startsWith("/api/avatar/")) {
    await prisma.user.update({ where: { id: session.user.id }, data: { image: null } });
  }
  await writeAudit("avatar.remove", { userId: session.user.id });

  return jsonOk({ ok: true });
}
