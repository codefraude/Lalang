import type { ComponentProps } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

function Spinner({ className, ...props }: ComponentProps<typeof Loader2>) {
  return (
    <Loader2
      className={cn("size-4 animate-spin text-muted-foreground", className)}
      role="status"
      aria-label="Loading"
      {...props}
    />
  );
}

export { Spinner };
