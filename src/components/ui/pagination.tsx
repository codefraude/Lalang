"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Builds a compact page list with ellipses: 1 … 4 5 6 … 20 */
function getPageItems(page: number, pageCount: number): (number | "ellipsis")[] {
  const delta = 1;
  const pages: number[] = [];
  for (let i = 1; i <= pageCount; i++) {
    if (i === 1 || i === pageCount || (i >= page - delta && i <= page + delta)) {
      pages.push(i);
    }
  }
  const items: (number | "ellipsis")[] = [];
  let previous: number | undefined;
  for (const current of pages) {
    if (previous !== undefined) {
      if (current - previous === 2) items.push(previous + 1);
      else if (current - previous > 2) items.push("ellipsis");
    }
    items.push(current);
    previous = current;
  }
  return items;
}

interface PaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ page, pageCount, onPageChange, className }: PaginationProps) {
  if (pageCount <= 1) return null;
  const items = getPageItems(page, pageCount);

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex items-center justify-center gap-1", className)}
    >
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft />
      </Button>

      {items.map((item, index) =>
        item === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            className="px-1.5 text-sm text-muted-foreground"
            aria-hidden="true"
          >
            …
          </span>
        ) : (
          <Button
            key={item}
            variant={item === page ? "default" : "outline"}
            size="icon"
            onClick={() => onPageChange(item)}
            aria-current={item === page ? "page" : undefined}
            aria-label={`Page ${item}`}
          >
            {item}
          </Button>
        ),
      )}

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pageCount}
        aria-label="Next page"
      >
        <ChevronRight />
      </Button>
    </nav>
  );
}
