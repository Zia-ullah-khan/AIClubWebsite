const nodemailer = require('nodemailer');

function buildTransport() {
  const service = process.env.SMTP_SERVICE;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS || process.env.GOOGLE_APP_PASSWORD; // allow alias

  // Gmail using OAuth2 (no app password required)
  if (service === 'gmail-oauth2') {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
    if (!user || !clientId || !clientSecret || !refreshToken) {
      throw new Error('Gmail OAuth2 not configured. Set SMTP_USER, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN.');
    }
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user,
        clientId,
        clientSecret,
        refreshToken,
      },
    });
  }

  if (service === 'gmail') {
    if (!user || !pass) {
      throw new Error('Gmail app password not configured. Set SMTP_USER (your Gmail) and SMTP_PASS (app password).');
    }
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
  }

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);

  if (!host || !user || !pass) {
    throw new Error('SMTP credentials are not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS (or use SMTP_SERVICE=gmail).');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

async function sendEmail({ to, subject, html, text }) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const transporter = buildTransport();
  const info = await transporter.sendMail({ from, to, subject, html, text });
  return info;
}

module.exports = { sendEmail };
