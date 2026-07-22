"use client";

import * as React from "react";
import Link from "next/link";
import { MessageSquarePlus } from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { apiPost, ApiError } from "@/lib/api-client";
import { useI18n } from "@/i18n/provider";
import { LANGUAGE_META, type Language } from "@/types/translation";

interface Props {
  sourceText: string;
  currentText: string;
  source: Language;
  target: Language;
}

/** Lets a signed-in user propose a better translation, sent for moderation. */
export function SuggestDialog({ sourceText, currentText, source, target }: Props) {
  const { status } = useSession();
  const { t } = useI18n();
  const toast = useToast();
  const [open, setOpen] = React.useState(false);
  const [suggestion, setSuggestion] = React.useState(currentText);
  const [note, setNote] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  // Seed the draft with the current translation each time the dialog opens.
  React.useEffect(() => {
    if (open) {
      setSuggestion(currentText);
      setNote("");
    }
  }, [open, currentText]);

  const submit = async () => {
    setSaving(true);
    try {
      await apiPost("/api/suggestions", {
        sourceText,
        suggestedText: suggestion,
        sourceLang: source,
        targetLang: target,
        note: note.trim() || undefined,
      });
      toast({ variant: "success", title: "Thanks!", description: "Your suggestion was sent for review." });
      setOpen(false);
    } catch (err) {
      toast({
        variant: "error",
        title: "Couldn't send",
        description: err instanceof ApiError ? err.message : "Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <MessageSquarePlus className="size-3.5" /> {t("translator.suggest")}
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Suggest a better translation</DialogTitle>
          <DialogDescription>
            {LANGUAGE_META[source].nativeLabel} → {LANGUAGE_META[target].nativeLabel}. A moderator will review it.
          </DialogDescription>
        </DialogHeader>

        {status === "authenticated" ? (
          <div className="space-y-3">
            <div className="rounded-lg bg-muted/50 p-3 text-sm">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Original</p>
              <p className="mt-0.5">{sourceText}</p>
            </div>
            <div>
              <label htmlFor="suggestion" className="text-sm font-medium">Your translation</label>
              <Textarea
                id="suggestion"
                value={suggestion}
                onChange={(e) => setSuggestion(e.target.value)}
                className="mt-1 min-h-[90px]"
                placeholder="A more natural translation…"
              />
            </div>
            <div>
              <label htmlFor="note" className="text-sm font-medium">
                Note <span className="font-normal text-muted-foreground">(optional)</span>
              </label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="mt-1 min-h-[60px]"
                placeholder="Why is this better? Any context?"
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost">Cancel</Button>
              </DialogClose>
              <Button onClick={submit} loading={saving} disabled={!suggestion.trim()}>
                Send suggestion
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Sign in to suggest an improvement — it helps make Lalang better for everyone.
            </p>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost">Cancel</Button>
              </DialogClose>
              <Button asChild>
                <Link href="/login">Sign in</Link>
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
