const nodemailer = require('nodemailer');
const config = require('../config');

let transporter;

function getTransporter(){
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465,
    auth: config.smtp.user ? { user: config.smtp.user, pass: config.smtp.pass } : undefined,
  });
  return transporter;
}

async function sendMail({ to, subject, text }){
  if (!config.smtp.host || !config.smtp.user){
    console.log('[MAIL-DEV]', { to, subject, text });
    return { skipped: true };
  }
  const tx = getTransporter();
  return tx.sendMail({
    from: config.smtp.from,
    to,
    subject,
    text,
  });
}

module.exports = { sendMail };
