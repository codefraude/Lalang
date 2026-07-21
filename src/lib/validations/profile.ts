import { z } from "zod";
import { usernameSchema } from "@/lib/validations/auth";

/**
 * PATCH-friendly profile schema: an omitted key means "leave unchanged", while
 * an explicit empty string means "clear this field". The route layer maps
 * "" → null so users can actually blank out optional fields.
 */

const text = (max: number) => z.string().trim().max(max).optional();
const clearableUrl = z.string().trim().max(200).url("Enter a valid URL.").optional().or(z.literal(""));

const SOCIAL_PLATFORMS = ["twitter", "github", "linkedin", "instagram", "facebook", "youtube"] as const;

export const socialsSchema = z
  .record(z.enum(SOCIAL_PLATFORMS), z.string().trim().max(200).url("Enter a valid URL.").or(z.literal("")))
  .optional();

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  username: usernameSchema.optional(),
  firstName: text(60),
  lastName: text(60),
  bio: text(280),
  phone: z
    .string()
    .trim()
    .max(30)
    .regex(/^[+()\-\s0-9]*$/, "Enter a valid phone number.")
    .optional(),
  location: text(120),
  country: z.string().trim().length(2).toUpperCase().optional().or(z.literal("")),
  timezone: text(60),
  occupation: text(80),
  website: clearableUrl,
  birthday: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD.")
    .optional()
    .or(z.literal("")),
  socials: socialsSchema,
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export const SOCIAL_PLATFORM_LIST = SOCIAL_PLATFORMS;
