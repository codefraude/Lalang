"use client";

import * as React from "react";
import { Copy, Download, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

/** One-time display of recovery codes with copy / download actions. */
export function BackupCodes({ codes, onDone }: { codes: string[]; onDone: () => void }) {
  const [copied, setCopied] = React.useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(codes.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const blob = new Blob([`Lalang backup codes\n\n${codes.join("\n")}\n`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lalang-backup-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Save these codes somewhere safe. Each can be used once if you lose access to your authenticator.
        <strong className="text-foreground"> You won't see them again.</strong>
      </p>
      <div className="grid grid-cols-2 gap-2 rounded-[var(--radius)] border bg-muted/40 p-4 font-mono text-sm">
        {codes.map((c) => (
          <span key={c} className="text-center tracking-wider">{c}</span>
        ))}
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={copy}>
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? "Copied" : "Copy"}
        </Button>
        <Button size="sm" variant="outline" onClick={download}>
          <Download className="size-4" /> Download
        </Button>
      </div>
      <Button className="w-full" onClick={onDone}>I've saved my codes</Button>
    </div>
  );
}
