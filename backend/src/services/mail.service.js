import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

let transporter;

export const mailConfigured = () => Boolean(env.smtp.user && env.smtp.pass);

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      requireTLS: env.smtp.port !== 465,
      auth: { user: env.smtp.user, pass: env.smtp.pass },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    });
  }
  return transporter;
}

const fromAddress = () => env.smtp.from || `"Research Patra" <${env.smtp.user}>`;

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function codeEmailHtml(rawName, code, minutes) {
  const name = esc(rawName);
  return `<!doctype html>
<html><body style="margin:0;background:#f8fafc;font-family:Segoe UI,Helvetica,Arial,sans-serif;color:#0f172a">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:440px;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:32px">
        <tr><td style="font-size:20px;font-weight:800;color:#f97316;padding-bottom:20px">Research Patra</td></tr>
        <tr><td style="font-size:15px;line-height:1.6;padding-bottom:20px">Hi ${name}, use this code to sign in to the admin dashboard.</td></tr>
        <tr><td align="center" style="padding-bottom:20px">
          <div style="display:inline-block;font-size:32px;font-weight:800;letter-spacing:10px;background:#fff7ed;color:#ea580c;border-radius:12px;padding:14px 22px">${code}</div>
        </td></tr>
        <tr><td style="font-size:13px;line-height:1.6;color:#64748b">The code expires in ${minutes} minutes and works once. If you didn't try to sign in, ignore this email.</td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function noticeEmailHtml({ name, message, quote, ctaLabel, ctaUrl }) {
  return `<!doctype html>
<html><body style="margin:0;background:#f8fafc;font-family:Segoe UI,Helvetica,Arial,sans-serif;color:#0f172a">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:32px">
        <tr><td style="font-size:20px;font-weight:800;color:#f97316;padding-bottom:20px">Research Patra</td></tr>
        <tr><td style="font-size:15px;line-height:1.6;padding-bottom:16px">Hi ${esc(name)}, ${esc(message)}</td></tr>
        ${quote ? `<tr><td style="font-size:14px;line-height:1.6;color:#334155;border-left:3px solid #fdba74;padding:4px 0 4px 12px;white-space:pre-line">${esc(quote)}</td></tr><tr><td style="height:16px"></td></tr>` : ''}
        <tr><td><a href="${esc(ctaUrl)}" style="display:inline-block;background:#ea580c;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;border-radius:10px;padding:11px 18px">${esc(ctaLabel)}</a></td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

/** Best-effort workflow email (review requests, feedback). Never throws; without SMTP it only logs. */
export async function sendNotice({ to, name, subject, message, quote = '', ctaLabel, ctaUrl }) {
  if (!mailConfigured()) {
    logger.warn('mail', `SMTP not configured. Notice to ${to}: ${subject}`);
    return;
  }
  try {
    await getTransporter().sendMail({
      from: fromAddress(),
      to,
      subject,
      text: `Hi ${name}, ${message}${quote ? `\n\n"${quote}"` : ''}\n\n${ctaLabel}: ${ctaUrl}`,
      html: noticeEmailHtml({ name, message, quote, ctaLabel, ctaUrl }),
    });
  } catch (err) {
    logger.warn('mail', `notice failed: ${err.message}`);
  }
}

/** Sends a login code. Without SMTP settings, development prints it instead; production throws. */
export async function sendLoginCode({ to, name, code, minutes }) {
  if (!mailConfigured()) {
    if (env.isProd) throw new Error('SMTP is not configured');
    logger.warn('mail', `SMTP not configured. Login code for ${to}: ${code}`);
    return;
  }
  await getTransporter().sendMail({
    from: fromAddress(),
    to,
    subject: `${code} is your Research Patra sign-in code`,
    text: `Hi ${name},\n\nYour Research Patra sign-in code is ${code}.\nIt expires in ${minutes} minutes and works once.\n\nIf you didn't try to sign in, ignore this email.`,
    html: codeEmailHtml(name, code, minutes),
  });
}
