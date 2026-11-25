// SMTP through the shop's mailbox (D-011). Locally Mailpit on port 1025.
import nodemailer from "nodemailer";
import type { Mailer } from "./order-emails.js";

export type SmtpSettings = {
  host: string;
  port: number;
  user?: string;
  pass?: string;
  from: string;
};

export function smtpSettingsFromEnv(
  env: Record<string, string | undefined> = process.env,
): SmtpSettings | null {
  if (!env.SMTP_HOST || !env.MAIL_FROM) return null;
  return {
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT ?? 587),
    user: env.SMTP_USER || undefined,
    pass: env.SMTP_PASS || undefined,
    from: env.MAIL_FROM,
  };
}

export function smtpMailer(settings: SmtpSettings): Mailer {
  const transport = nodemailer.createTransport({
    host: settings.host,
    port: settings.port,
    secure: settings.port === 465,
    auth: settings.user
      ? { user: settings.user, pass: settings.pass }
      : undefined,
  });
  return {
    async send(mail) {
      await transport.sendMail({ from: settings.from, ...mail });
    },
  };
}
