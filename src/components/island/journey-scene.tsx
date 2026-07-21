"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Layout = "center" | "left" | "split-left" | "split-right";

interface Props {
  id?: string;
  eyebrow?: string;
  title?: React.ReactNode;
  layout?: Layout;
  media?: React.ReactNode; // the visual half in split layouts
  background?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

const EASE = [0.22, 1, 0.36, 1] as const;

/** A full-height journey scene with a chosen composition — centered, left-hugging
 *  editorial, or a two-column split — so no two stops look the same. */
export function JourneyScene({ id, eyebrow, title, layout = "center", media, background, className, children }: Props) {
  const centered = layout === "center";
  const split = layout === "split-left" || layout === "split-right";

  const text = (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 0.6, ease: EASE }}
      className={centered ? "text-center" : "text-left"}
    >
      {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/50">{eyebrow}</p>}
      {title && <h2 className="mt-3 font-display text-3xl font-bold leading-tight sm:text-5xl">{title}</h2>}
      {children && <div className="mt-6">{children}</div>}
    </motion.div>
  );

  const mediaNode = (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 0.6, ease: EASE, delay: 0.12 }}
    >
      {media}
    </motion.div>
  );

  return (
    <section id={id} className={cn("relative flex min-h-[88svh] items-center overflow-hidden px-5 py-24 sm:px-10 text-white", className)}>
      {background}
      <div className={cn("relative z-10 w-full", split ? "mx-auto max-w-6xl" : centered ? "mx-auto max-w-3xl" : "max-w-2xl lg:ml-[8%]")}>
        {split ? (
          <div className="grid items-center gap-10 md:grid-cols-2">
            {layout === "split-right" ? (
              <>
                {mediaNode}
                {text}
              </>
            ) : (
              <>
                {text}
                {mediaNode}
              </>
            )}
          </div>
        ) : (
          text
        )}
      </div>
    </section>
  );
}
