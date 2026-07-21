import { Resend } from "resend";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { emailFrom, resendEnabled, isProduction } from "@/lib/env";
import type { EmailContent } from "@/lib/mail/templates";

/**
 * Send transactional email through Resend. When no RESEND_API_KEY is set the
 * message is instead logged to the server console AND written to `.dev-mail/`
 * as an openable .html file — so verification / reset flows are fully testable
 * in local development without configuring an email provider.
 */

const resend = resendEnabled ? new Resend((process.env.RESEND_API_KEY ?? "").trim()) : null;

async function writeDevMail(to: string, content: EmailContent, actionLink?: string): Promise<string | null> {
  if (isProduction) return null;
  try {
    const dir = join(process.cwd(), ".dev-mail");
    await mkdir(dir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const file = join(dir, `${stamp}.html`);
    const header = `<!-- To: ${to} | Subject: ${content.subject}${actionLink ? ` | Link: ${actionLink}` : ""} -->\n`;
    await writeFile(file, header + content.html, "utf8");
    await writeFile(join(dir, "latest.html"), header + content.html, "utf8");
    return file;
  } catch {
    return null;
  }
}

export async function sendEmail(to: string, content: EmailContent): Promise<{ ok: boolean }> {
  if (!resend) {
    const links = content.html.match(/https?:\/\/[^"'\s]+/g) ?? [];
    const actionLink = links.find((l) => l.includes("token=")) ?? links[0];
    const file = await writeDevMail(to, content, actionLink);
    // eslint-disable-next-line no-console
    console.info(
      [
        "",
        "┌─────────────────────────────────────────────────────────────",
        "│ 📧  DEV EMAIL (RESEND_API_KEY not set — nothing was sent)",
        `│  To:      ${to}`,
        `│  Subject: ${content.subject}`,
        actionLink ? `│  👉 Link: ${actionLink}` : "",
        file ? `│  Saved:   ${file}` : "",
        "│  Set RESEND_API_KEY in .env to send real emails.",
        "└─────────────────────────────────────────────────────────────",
        "",
      ]
        .filter(Boolean)
        .join("\n"),
    );
    return { ok: true };
  }

  const { data, error } = await resend.emails.send({
    from: emailFrom,
    to: [to],
    subject: content.subject,
    html: content.html,
    text: content.text,
  });

  if (error) {
    // eslint-disable-next-line no-console
    console.error(`[mail] Resend failed to send "${content.subject}" to ${to}: ${error.name} — ${error.message}`);
    return { ok: false };
  }
  // eslint-disable-next-line no-console
  console.info(`[mail] Sent "${content.subject}" to ${to} (id: ${data?.id})`);
  return { ok: true };
}
