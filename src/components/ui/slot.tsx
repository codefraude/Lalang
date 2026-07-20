"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Minimal `asChild` slot — merges the given props/className/ref onto a single
 * child element instead of rendering a wrapper. Lets `<Button asChild>` render
 * a real `<a>` (via next/link) so we never nest `<button>` inside `<a>`.
 * A dependency-free stand-in for @radix-ui/react-slot for our needs.
 */

type ChildWithClassName = React.ReactElement<{ className?: string }>;

function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  return (node: T) => {
    for (const ref of refs) {
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<T | null>).current = node;
    }
  };
}

export const Slot = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ children, className, ...props }, ref) => {
    if (!React.isValidElement(children)) return null;
    const child = children as ChildWithClassName;
    const childRef = (child as { ref?: React.Ref<HTMLElement> }).ref;
    return React.cloneElement(child, {
      ...props,
      ...child.props,
      className: cn(className, child.props.className),
      ref: mergeRefs(ref, childRef),
    } as React.HTMLAttributes<HTMLElement>);
  },
);
Slot.displayName = "Slot";
