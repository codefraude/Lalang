import { prisma } from "@/lib/prisma";

/** Serve a user's uploaded avatar bytes. Public and cacheable. */
export async function GET(_req: Request, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const avatar = await prisma.avatar.findUnique({ where: { userId } });
  if (!avatar) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(avatar.data), {
    headers: {
      "Content-Type": avatar.mimeType,
      "Content-Length": String(avatar.size),
      // Content is versioned via ?v=, so it can be cached aggressively.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
