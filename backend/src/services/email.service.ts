import nodemailer, { Transporter } from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../config/logger';

/**
 * Thin email abstraction.
 *
 * - If SMTP is configured we send for real (works with any provider:
 *   Gmail, SES, Mailgun, Resend SMTP, Postmark...).
 * - Otherwise (typical in local dev) we log the message to the console so the
 *   password-reset flow is still fully testable without a mail server.
 */
let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (transporter) return transporter;
  if (!env.SMTP_HOST) return null;
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
  });
  return transporter;
}

interface MailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: MailInput): Promise<void> {
  const t = getTransporter();
  if (!t) {
    logger.info({ to, subject, preview: text ?? html.replace(/<[^>]+>/g, ' ').slice(0, 240) }, '📧 [DEV] Email (SMTP not configured, logged only)');
    return;
  }
  await t.sendMail({ from: env.EMAIL_FROM, to, subject, html, text });
  logger.info({ to, subject }, '📧 Email sent');
}

export function passwordResetEmail(name: string, resetUrl: string): MailInput['html'] {
  return `
  <div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:auto;color:#222">
    <h2 style="color:#0050FF">Reset your password</h2>
    <p>Hi ${name},</p>
    <p>We received a request to reset your Vutto Auctions password. This link expires in 30 minutes.</p>
    <p style="margin:28px 0">
      <a href="${resetUrl}" style="background:#0050FF;color:#fff;padding:12px 22px;border-radius:10px;text-decoration:none;font-weight:600">Reset password</a>
    </p>
    <p style="color:#767676;font-size:13px">If you didn't request this, you can safely ignore this email.</p>
  </div>`;
}
