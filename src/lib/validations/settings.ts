import { z } from "zod";

export const updateSettingsSchema = z.object({
  theme: z.enum(["LIGHT", "DARK", "SYSTEM"]).optional(),
  locale: z.string().trim().min(2).max(10).optional(),
  timezone: z.string().trim().max(60).optional(),
  profileVisibility: z.enum(["PUBLIC", "PRIVATE"]).optional(),
  showEmail: z.boolean().optional(),
  showActivity: z.boolean().optional(),
  reducedMotion: z.boolean().optional(),
});

export const notificationPrefsSchema = z.object({
  productUpdates: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
  weeklyDigest: z.boolean().optional(),
  learningReminders: z.boolean().optional(),
  // securityAlerts is intentionally omitted — it cannot be disabled.
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
export type NotificationPrefsInput = z.infer<typeof notificationPrefsSchema>;
