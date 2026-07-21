import {
  BookOpen,
  Hand,
  Landmark,
  MessageCircle,
  Sparkles,
  Users,
  Utensils,
  type LucideIcon,
} from "lucide-react";
import type { DictionaryCategory } from "@/services/translation";

/**
 * One fixed identity (icon + label + token-based tint) per category, reused on
 * journey nodes, the mastery dashboard, and the reference deck so the whole page
 * reads as a single system. Tints use design tokens → automatic light/dark.
 */
export interface CategoryStyle {
  icon: LucideIcon;
  label: string;
  tint: string; // text color
  chip: string; // background + text for pills/badges
}

export const CATEGORY_KIT: Record<DictionaryCategory, CategoryStyle> = {
  greetings: { icon: Hand, label: "Greetings", tint: "text-primary", chip: "bg-primary/10 text-primary" },
  family: { icon: Users, label: "Family", tint: "text-info", chip: "bg-info/10 text-info" },
  food: { icon: Utensils, label: "Food", tint: "text-accent", chip: "bg-accent/10 text-accent" },
  traditional: { icon: Landmark, label: "Traditional", tint: "text-warning", chip: "bg-warning/10 text-warning" },
  expressions: { icon: MessageCircle, label: "Expressions", tint: "text-success", chip: "bg-success/10 text-success" },
  slang: { icon: Sparkles, label: "Slang", tint: "text-accent", chip: "bg-accent/10 text-accent" },
  general: { icon: BookOpen, label: "General", tint: "text-foreground", chip: "bg-secondary text-secondary-foreground" },
};

export function categoryStyle(category: DictionaryCategory): CategoryStyle {
  return CATEGORY_KIT[category] ?? CATEGORY_KIT.general;
}
