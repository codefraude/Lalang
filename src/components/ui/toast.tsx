"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "default" | "success" | "warning" | "error" | "info";

interface ToastItem {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastInput {
  title: string;
  description?: string;
  variant?: ToastVariant;
}

const ToastContext = React.createContext<((t: ToastInput) => void) | null>(null);

const DISMISS_MS = 4000;

const VARIANT_META: Record<
  ToastVariant,
  { icon: typeof Info; accent: string }
> = {
  default: { icon: Info, accent: "text-foreground" },
  success: { icon: CheckCircle2, accent: "text-success" },
  warning: { icon: AlertTriangle, accent: "text-warning" },
  error: { icon: XCircle, accent: "text-destructive" },
  info: { icon: Info, accent: "text-info" },
};

export function useToast() {
  const toast = React.useContext(ToastContext);
  if (!toast) throw new Error("useToast must be used within <ToastProvider>");
  return toast;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  const idRef = React.useRef(0);

  const dismiss = React.useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = React.useCallback((input: ToastInput) => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, variant: "default", ...input }]);
    setTimeout(() => dismiss(id), DISMISS_MS);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 p-4 sm:items-end"
        role="region"
        aria-label="Notifications"
      >
        <AnimatePresence initial={false}>
          {toasts.map((t) => {
            const { icon: Icon, accent } = VARIANT_META[t.variant];
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-[calc(var(--radius)-0.15rem)] border bg-popover p-4 text-popover-foreground shadow-lg"
                role="status"
              >
                <Icon className={cn("mt-0.5 size-5 shrink-0", accent)} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{t.title}</p>
                  {t.description && (
                    <p className="mt-0.5 text-sm text-muted-foreground">{t.description}</p>
                  )}
                </div>
                <button
                  onClick={() => dismiss(t.id)}
                  className="rounded-md p-0.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Dismiss notification"
                >
                  <X className="size-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
