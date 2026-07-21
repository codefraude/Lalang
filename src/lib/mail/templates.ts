import { APP_NAME } from "@/lib/env";

/** Rendered email ready to send. */
export interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

const BRAND = "#0d9488"; // lagoon teal
const ACCENT = "#f97316"; // volcanic amber

function layout(opts: {
  heading: string;
  intro: string;
  cta?: { label: string; url: string };
  outro?: string;
  footnote?: string;
}): string {
  const { heading, intro, cta, outro, footnote } = opts;
  return `<!doctype html><html><body style="margin:0;background:#f4f5f7;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
  <div style="max-width:520px;margin:0 auto;padding:32px 16px;">
    <div style="background:linear-gradient(100deg,${BRAND},${ACCENT});border-radius:16px 16px 0 0;padding:24px 28px;">
      <span style="color:#fff;font-size:20px;font-weight:700;letter-spacing:-0.02em;">${APP_NAME}</span>
    </div>
    <div style="background:#fff;border-radius:0 0 16px 16px;padding:28px;box-shadow:0 4px 14px rgba(15,23,42,0.06);">
      <h1 style="margin:0 0 12px;font-size:20px;font-weight:700;">${heading}</h1>
      <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#334155;">${intro}</p>
      ${
        cta
          ? `<a href="${cta.url}" style="display:inline-block;background:${BRAND};color:#fff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 22px;border-radius:10px;">${cta.label}</a>
      <p style="margin:20px 0 0;font-size:13px;color:#64748b;">Or paste this link into your browser:<br><a href="${cta.url}" style="color:${BRAND};word-break:break-all;">${cta.url}</a></p>`
          : ""
      }
      ${outro ? `<p style="margin:20px 0 0;font-size:14px;line-height:1.6;color:#334155;">${outro}</p>` : ""}
      ${footnote ? `<p style="margin:24px 0 0;padding-top:16px;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8;">${footnote}</p>` : ""}
    </div>
    <p style="text-align:center;margin:16px 0 0;font-size:12px;color:#94a3b8;">© ${APP_NAME} · Preserving Kreol Morisien</p>
  </div></body></html>`;
}

export function verificationEmail(url: string): EmailContent {
  return {
    subject: `Verify your ${APP_NAME} email`,
    text: `Welcome to ${APP_NAME}! Confirm your email address: ${url}`,
    html: layout({
      heading: "Confirm your email",
      intro: `Welcome to ${APP_NAME}! Please confirm this is your email address to secure your account and unlock everything.`,
      cta: { label: "Verify email", url },
      footnote: "This link expires in 24 hours. If you didn't create an account, you can ignore this email.",
    }),
  };
}

export function passwordResetEmail(url: string): EmailContent {
  return {
    subject: `Reset your ${APP_NAME} password`,
    text: `Reset your password: ${url} (expires in 30 minutes)`,
    html: layout({
      heading: "Reset your password",
      intro: "We received a request to reset your password. Choose a new one using the button below.",
      cta: { label: "Reset password", url },
      footnote: "This link expires in 30 minutes and can be used once. If you didn't request this, ignore this email — your password is unchanged.",
    }),
  };
}

export function passwordChangedEmail(): EmailContent {
  return {
    subject: `Your ${APP_NAME} password was changed`,
    text: `Your password was just changed. If this wasn't you, reset it immediately and revoke your sessions.`,
    html: layout({
      heading: "Your password was changed",
      intro: "This is a confirmation that the password for your account was just changed.",
      outro: "If this wasn't you, reset your password immediately and review your active sessions in Account → Security.",
    }),
  };
}

export function emailChangeEmail(url: string): EmailContent {
  return {
    subject: `Confirm your new ${APP_NAME} email`,
    text: `Confirm your new email address: ${url} (expires in 1 hour)`,
    html: layout({
      heading: "Confirm your new email",
      intro: "Please confirm you want to use this address as your new sign-in email.",
      cta: { label: "Confirm new email", url },
      footnote: "This link expires in 1 hour. If you didn't request this change, ignore this email.",
    }),
  };
}

export function securityAlertEmail(detail: {
  device: string;
  ip: string | null;
  when: string;
}): EmailContent {
  const where = detail.ip ? ` from ${detail.ip}` : "";
  return {
    subject: `New sign-in to your ${APP_NAME} account`,
    text: `New sign-in on ${detail.device}${where} at ${detail.when}. If this wasn't you, revoke the session and change your password.`,
    html: layout({
      heading: "New sign-in detected",
      intro: `Your account was just accessed on <strong>${detail.device}</strong>${where} at ${detail.when}.`,
      outro: "If this was you, no action is needed. Otherwise, revoke the session in Account → Security and change your password.",
    }),
  };
}
