"use client";

import { Sparkles } from "lucide-react";

/** A mock translator card that previews the product inside the journey. */
export function TranslatePreview() {
  return (
    <div className="mx-auto w-full max-w-sm rounded-3xl border border-white/12 bg-white/[0.05] p-5 shadow-xl backdrop-blur">
      <div className="rounded-2xl bg-black/25 p-4">
        <p className="text-[11px] uppercase tracking-wide text-white/40">English</p>
        <p className="mt-1 text-white/90">I&apos;m very tired today.</p>
      </div>
      <div className="my-2 flex items-center justify-center gap-1.5 text-xs font-medium text-[#7ff0ff]">
        <Sparkles className="size-3.5" /> AI · casual tone
      </div>
      <div className="rounded-2xl bg-[#00D4FF]/10 p-4">
        <p className="text-[11px] uppercase tracking-wide text-[#7ff0ff]">Kreol Morisien</p>
        <p className="mt-1 text-lg font-semibold text-white">Mo bien fatige zordi.</p>
      </div>
      <p className="mt-3 rounded-xl bg-white/[0.04] px-3 py-2 text-xs text-white/60">
        💡 “fatige” carries the everyday, worn-out feeling — not just physically tired.
      </p>
    </div>
  );
}
