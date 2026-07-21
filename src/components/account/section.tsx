import * as React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** A titled settings section card with optional icon and footer bar. */
export function SettingsSection({
  title,
  description,
  icon: Icon,
  children,
  footer,
  className,
}: {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="p-6">
        <div className="flex items-start gap-3">
          {Icon && (
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-secondary text-secondary-foreground">
              <Icon className="size-[1.1rem]" />
            </span>
          )}
          <div className="min-w-0">
            <h2 className="font-semibold leading-tight">{title}</h2>
            {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
          </div>
        </div>
        {children && <div className="mt-5">{children}</div>}
      </div>
      {footer && <div className="border-t bg-muted/30 px-6 py-3.5">{footer}</div>}
    </Card>
  );
}
