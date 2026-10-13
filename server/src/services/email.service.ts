import nodemailer, { type Transporter } from 'nodemailer';
import { emailSettingsService } from './emailSettings.service.js';

// Applies {{variable}} style substitution. Unknown variables become ''.
function renderTemplate(template: string, vars: Record<string, string | undefined | null>): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => {
    const value = vars[key];
    return value == null ? '' : String(value);
  });
}

let cachedTransporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (cachedTransporter) return cachedTransporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    console.warn('[email] SMTP_HOST/PORT/USER/PASS not configured — emails will be skipped');
    return null;
  }

  cachedTransporter = nodemailer.createTransport({
    host,
    port: parseInt(port, 10),
    secure: parseInt(port, 10) === 465,
    auth: { user, pass },
  });
  return cachedTransporter;
}

export const emailService = {
  /**
   * Fire-and-forget notification to the ticket submitter when an admin
   * marks a ticket as 'closed'. Silently no-ops if email is disabled in
   * settings or if SMTP env vars aren't configured.
   */
  async sendTicketClosed(ticket: {
    id: string;
    name: string;
    email: string;
    subject: string;
    adminNotes?: string | null;
  }) {
    try {
      const settings = await emailSettingsService.get();
      if (!settings.enabled) {
        console.log('[email] ticket-closed skipped — emails disabled in settings');
        return;
      }

      const transporter = getTransporter();
      if (!transporter) return;

      const vars = {
        name: ticket.name,
        email: ticket.email,
        subject: ticket.subject,
        adminNotes: ticket.adminNotes || '',
        ticketRef: ticket.id.slice(0, 8),
        fromName: settings.fromName,
      };

      const subject = renderTemplate(settings.closeSubject, vars);
      const body = renderTemplate(settings.closeBody, vars);

      const from = process.env.EMAIL_FROM
        ? `${settings.fromName} <${process.env.EMAIL_FROM}>`
        : (process.env.SMTP_USER || 'no-reply@example.com');

      await transporter.sendMail({
        from,
        to: ticket.email,
        subject,
        text: body,
        // Simple HTML wrap — line breaks become <br> for readability
        html: `<div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:14px;line-height:1.6;color:#222;">${body
          .split('\n')
          .map((line) => (line.trim() === '' ? '<br>' : line.replace(/&/g, '&amp;').replace(/</g, '&lt;')))
          .join('<br>')}</div>`,
      });
      console.log(`[email] sent ticket-closed notification to ${ticket.email}`);
    } catch (err: any) {
      console.error(`[email] send failed: ${err?.message || err}`);
    }
  },
};
