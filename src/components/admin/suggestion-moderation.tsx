"use client";

import * as React from "react";
import { Check, X, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { apiGet, apiPatch, ApiError } from "@/lib/api-client";

interface Suggestion {
  id: string;
  sourceText: string;
  suggestedText: string;
  sourceLang: string;
  targetLang: string;
  note: string | null;
  createdAt: string;
  createdBy: { name: string | null; email: string | null };
}

/** Admin/moderator queue: approve or reject community translation suggestions. */
export function SuggestionModeration() {
  const toast = useToast();
  const [items, setItems] = React.useState<Suggestion[] | null>(null);
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    apiGet<{ suggestions: Suggestion[] }>("/api/suggestions")
      .then((d) => setItems(d.suggestions))
      .catch(() => setItems([]));
  }, []);

  const moderate = async (id: string, status: "APPROVED" | "REJECTED") => {
    setPendingId(id);
    try {
      await apiPatch(`/api/suggestions/${id}`, { status });
      setItems((cur) => (cur ? cur.filter((s) => s.id !== id) : cur));
      toast({ variant: "success", title: status === "APPROVED" ? "Approved" : "Rejected" });
    } catch (err) {
      toast({
        variant: "error",
        title: "Action failed",
        description: err instanceof ApiError ? err.message : "Please try again.",
      });
    } finally {
      setPendingId(null);
    }
  };

  if (items === null) {
    return (
      <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Loading…
      </p>
    );
  }

  if (items.length === 0) {
    return <p className="mt-3 text-sm text-muted-foreground">No pending suggestions. 🎉</p>;
  }

  return (
    <div className="mt-3 space-y-3">
      {items.map((s) => (
        <Card key={s.id}>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="rounded bg-muted px-1.5 py-0.5 font-medium">
                {s.sourceLang} → {s.targetLang}
              </span>
              <span>by {s.createdBy.name ?? s.createdBy.email ?? "someone"}</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{s.sourceText}</p>
            <p className="mt-0.5 font-medium">{s.suggestedText}</p>
            {s.note && <p className="mt-1 text-sm italic text-muted-foreground">“{s.note}”</p>}
            <div className="mt-3 flex gap-2">
              <Button size="sm" onClick={() => moderate(s.id, "APPROVED")} loading={pendingId === s.id}>
                <Check className="size-4" /> Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => moderate(s.id, "REJECTED")}
                disabled={pendingId === s.id}
              >
                <X className="size-4" /> Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
