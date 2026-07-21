"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { Camera, Trash2, Loader2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { apiPost, apiDelete, ApiError } from "@/lib/api-client";
import { useRefreshAccount } from "@/hooks/use-account";
import { cn } from "@/lib/utils";

const MAX_DIM = 512;

/** Center-crop to a square and compress to a small WebP data URL. */
function compress(file: File): Promise<{ dataUrl: string; size: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read failed"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("decode failed"));
      img.onload = () => {
        const side = Math.min(img.width, img.height);
        const dim = Math.min(MAX_DIM, side);
        const canvas = document.createElement("canvas");
        canvas.width = dim;
        canvas.height = dim;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("no canvas"));
        ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, dim, dim);
        const dataUrl = canvas.toDataURL("image/webp", 0.85);
        resolve({ dataUrl, size: dim });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function AvatarUploader({
  image,
  name,
  email,
}: {
  image: string | null;
  name: string | null;
  email: string | null;
}) {
  const { update } = useSession();
  const toast = useToast();
  const refresh = useRefreshAccount();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [preview, setPreview] = React.useState<string | null>(image);
  const [busy, setBusy] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ variant: "error", title: "Not an image", description: "Choose a PNG, JPEG or WebP." });
      return;
    }
    setBusy(true);
    try {
      const { dataUrl, size } = await compress(file);
      setPreview(dataUrl);
      const { image: url } = await apiPost<{ image: string }>("/api/avatar", { dataUrl, width: size, height: size });
      await update({ image: url });
      refresh();
      toast({ variant: "success", title: "Profile picture updated" });
    } catch (err) {
      setPreview(image);
      toast({ variant: "error", title: "Upload failed", description: err instanceof ApiError ? err.message : "Try a smaller image." });
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await apiDelete("/api/avatar");
      setPreview(null);
      await update({ image: null });
      refresh();
      toast({ variant: "success", title: "Profile picture removed" });
    } catch {
      toast({ variant: "error", title: "Couldn't remove picture" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-5">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); void handleFile(e.dataTransfer.files?.[0]); }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "group relative cursor-pointer rounded-full outline-none transition",
          dragging && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        )}
        role="button"
        tabIndex={0}
        aria-label="Upload profile picture"
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }}
      >
        <Avatar className="size-24 border-2 border-card shadow-md">
          {preview && <AvatarImage src={preview} alt="" />}
          <AvatarFallback className="text-2xl">{(name ?? email ?? "?").charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <span className="absolute inset-0 grid place-items-center rounded-full bg-foreground/40 text-background opacity-0 transition-opacity group-hover:opacity-100">
          {busy ? <Loader2 className="size-6 animate-spin" /> : <Camera className="size-6" />}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => inputRef.current?.click()} disabled={busy}>
            Change
          </Button>
          {preview && (
            <Button size="sm" variant="ghost" onClick={remove} disabled={busy} className="text-destructive hover:bg-destructive/10">
              <Trash2 className="size-4" /> Remove
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">Drag & drop or click. JPG, PNG or WebP, up to 1&nbsp;MB.</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
