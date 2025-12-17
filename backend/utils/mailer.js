const nodemailer = require('nodemailer');

// Simple mailer utility: uses SMTP when configured via env variables, otherwise falls back to console logging.
// Env vars: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM

function isConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS);
}

async function sendMail({ to, subject, text, html }) {
  if (!to) throw new Error('No recipient');

  if (!isConfigured()) {
    // Development fallback: just log the email and resolve
    console.log('📨 Mailer (not configured) - would send to:', to);
    console.log('Subject:', subject);
    console.log('Text:', text);
    if (html) console.log('HTML:', html);
    return { accepted: [to], info: 'console-fallback' };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: String(process.env.SMTP_SECURE || 'false') === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  const info = await transporter.sendMail({ from, to, subject, text, html });
  return info;
}

module.exports = { sendMail, isConfigured };
