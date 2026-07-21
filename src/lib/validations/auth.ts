import { z } from "zod";

/** bcrypt truncates past 72 bytes; cap length so long passphrases aren't cut. */
export const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(72, "Keep it under 72 characters.");

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email address.")
  .max(254);

export const nameSchema = z
  .string()
  .trim()
  .min(1, "Enter your name.")
  .max(80, "That name is too long.");

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "At least 3 characters.")
  .max(20, "At most 20 characters.")
  .regex(/^[a-z0-9_]+$/, "Only letters, numbers and underscores.");

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  terms: z.literal(true, { errorMap: () => ({ message: "Please accept the terms to continue." }) }),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password."),
  rememberMe: z.boolean().optional().default(false),
  totp: z.string().trim().optional(),
  backupCode: z.string().trim().optional(),
});

export const forgotPasswordSchema = z.object({ email: emailSchema });

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password."),
  newPassword: passwordSchema,
});

export const changeEmailSchema = z.object({
  newEmail: emailSchema,
  password: z.string().min(1, "Confirm with your password."),
});

export const reauthSchema = z.object({
  password: z.string().optional(),
  totp: z.string().trim().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ChangeEmailInput = z.infer<typeof changeEmailSchema>;
