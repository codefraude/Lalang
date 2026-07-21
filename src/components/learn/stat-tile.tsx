"use client";

import { Flame, Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ProgressRing } from "@/components/learn/progress-ring";
import { CountUp } from "@/components/learn/count-up";

type StatTileProps =
  | { variant: "streak"; streak: number; today: number; goal: number }
  | { variant: "mastery"; learned: number; mastered: number; total: number };

/** Compact glass stat tile: a progress ring paired with an animated counter. */
export function StatTile(props: StatTileProps) {
  if (props.variant === "streak") {
    const { streak, today, goal } = props;
    const ratio = goal > 0 ? Math.min(1, today / goal) : 0;
    return (
      <Card className="flex h-full items-center gap-4 p-4">
        <ProgressRing value={ratio} size={64} stroke={6} barClassName="stroke-accent">
          <Flame className="size-6 text-accent" />
        </ProgressRing>
        <div className="min-w-0">
          <p className="text-2xl font-bold leading-none">
            <CountUp to={streak} />
            <span className="ml-1 text-sm font-medium text-muted-foreground">
              day{streak === 1 ? "" : "s"}
            </span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            streak · {today}/{goal} words today
          </p>
        </div>
      </Card>
    );
  }

  const { learned, mastered, total } = props;
  const ratio = total > 0 ? learned / total : 0;
  return (
    <Card className="flex h-full items-center gap-4 p-4">
      <ProgressRing value={ratio} size={64} stroke={6} barClassName="stroke-primary">
        <Trophy className="size-5 text-primary" />
      </ProgressRing>
      <div className="min-w-0">
        <p className="text-2xl font-bold leading-none">
          <CountUp to={learned} />
          <span className="ml-1 text-sm font-medium text-muted-foreground">/ {total}</span>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">learned · {mastered} mastered</p>
      </div>
    </Card>
  );
}
