/**
 * Pure, dependency-free password strength estimator. Safe to import in the
 * browser (powers the live strength meter) and on the server (final gate).
 */

export interface PasswordChecks {
  length: boolean; // >= 8
  longer: boolean; // >= 12
  lowercase: boolean;
  uppercase: boolean;
  number: boolean;
  symbol: boolean;
  notCommon: boolean;
}

export interface PasswordScore {
  /** 0 (very weak) … 4 (strong). */
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  /** 0–100, for the meter width. */
  percent: number;
  checks: PasswordChecks;
}

const COMMON = [
  "password", "123456", "12345678", "qwerty", "abc123", "password1",
  "111111", "letmein", "welcome", "admin", "iloveyou", "monkey", "dragon",
];

const LABELS = ["Very weak", "Weak", "Fair", "Good", "Strong"] as const;

export function scorePassword(password: string): PasswordScore {
  const value = password ?? "";
  const lower = value.toLowerCase();

  const checks: PasswordChecks = {
    length: value.length >= 8,
    longer: value.length >= 12,
    lowercase: /[a-z]/.test(value),
    uppercase: /[A-Z]/.test(value),
    number: /\d/.test(value),
    symbol: /[^A-Za-z0-9]/.test(value),
    notCommon: value.length > 0 && !COMMON.some((c) => lower.includes(c)),
  };

  if (value.length === 0) {
    return { score: 0, label: LABELS[0], percent: 0, checks };
  }

  let points = 0;
  if (checks.length) points += 1;
  if (checks.longer) points += 1;
  const variety =
    Number(checks.lowercase) +
    Number(checks.uppercase) +
    Number(checks.number) +
    Number(checks.symbol);
  if (variety >= 2) points += 1;
  if (variety >= 3) points += 1;
  if (variety === 4) points += 1;
  if (!checks.notCommon || !checks.length) points = Math.min(points, 1);

  const score = Math.min(4, Math.max(0, points - 1)) as PasswordScore["score"];
  return {
    score,
    label: LABELS[score],
    percent: ((score + 1) / 5) * 100,
    checks,
  };
}
