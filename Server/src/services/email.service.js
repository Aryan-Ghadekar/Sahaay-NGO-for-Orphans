import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

// No real SMTP credentials exist for every deployment of this app — rather
// than fail startup or fail the approval flow it's attached to, this
// degrades gracefully: skip sending and log a warning when unconfigured.
const isConfigured = Boolean(env.smtp.host);

let transporter = null;
function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
    });
  }
  return transporter;
}

// Sent when a volunteer's application is approved — the QR (their
// applications.id, rendered as a PNG buffer by the caller) is what NGO
// staff scan at the venue to check them in and out. Attached by CID, not
// embedded as a data: URI — many email clients block inline data: images.
export async function sendApprovalQrEmail({ to, volunteerName, eventTitle, eventDate, qrBuffer }) {
  if (!isConfigured) {
    console.warn('[email] SMTP not configured — skipping approval QR email to', to);
    return;
  }

  await getTransporter().sendMail({
    from: env.smtp.from,
    to,
    subject: `You're confirmed for ${eventTitle}`,
    html: `
      <p>Hi ${volunteerName || 'there'},</p>
      <p>Your application for <strong>${eventTitle}</strong>${eventDate ? ` on ${eventDate}` : ''} has been approved.</p>
      <p>Show this QR code to NGO staff at the venue — they'll scan it once when you arrive and once when you leave, and your volunteer hours will be recorded automatically.</p>
      <p><img src="cid:checkin-qr" alt="Check-in QR code" width="240" height="240" /></p>
      <p>Thanks for volunteering with Sahaay!</p>
    `,
    attachments: [{ filename: 'checkin-qr.png', content: qrBuffer, cid: 'checkin-qr' }],
  });
}
