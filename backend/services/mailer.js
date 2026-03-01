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

async function sendMail({ to, subject, text, html }){
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
    html: html || text,
  });
}

async function sendFeedbackNotification(feedback) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #8D6E63, #4E342E); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px; }
        .field { margin-bottom: 20px; }
        .label { font-size: 12px; text-transform: uppercase; color: #666; font-weight: 600; margin-bottom: 5px; }
        .value { font-size: 16px; color: #333; }
        .rating { font-size: 24px; color: #ffb703; }
        .footer { background: #f9f5eb; padding: 20px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 New Feedback Received</h1>
        </div>
        <div class="content">
          <div class="field">
            <div class="label">From</div>
            <div class="value">${feedback.name}</div>
          </div>
          <div class="field">
            <div class="label">Email</div>
            <div class="value">${feedback.email}</div>
          </div>
          <div class="field">
            <div class="label">Rating</div>
            <div class="rating">${'⭐'.repeat(feedback.stars || 0)} (${feedback.stars}/5)</div>
          </div>
          <div class="field">
            <div class="label">Category</div>
            <div class="value">${feedback.category || 'N/A'}</div>
          </div>
          <div class="field">
            <div class="label">Message</div>
            <div class="value">${feedback.message}</div>
          </div>
          <div class="field">
            <div class="label">Submitted</div>
            <div class="value">${new Date(feedback.timestamp).toLocaleString()}</div>
          </div>
        </div>
        <div class="footer">
          Best Marketing Company - Admin Notification
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendMail({
    to: 'gokilavaratharaj142@gmail.com',
    subject: `New ${feedback.stars}-Star Feedback from ${feedback.name}`,
    html
  });
}

async function sendContactNotification(contact) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #3b82f6, #1e40af); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px; }
        .field { margin-bottom: 20px; }
        .label { font-size: 12px; text-transform: uppercase; color: #666; font-weight: 600; margin-bottom: 5px; }
        .value { font-size: 16px; color: #333; }
        .footer { background: #f9f5eb; padding: 20px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📧 New Contact Inquiry</h1>
        </div>
        <div class="content">
          <div class="field">
            <div class="label">Name</div>
            <div class="value">${contact.name}</div>
          </div>
          <div class="field">
            <div class="label">Email</div>
            <div class="value">${contact.email}</div>
          </div>
          <div class="field">
            <div class="label">Phone</div>
            <div class="value">${contact.phone || 'N/A'}</div>
          </div>
          <div class="field">
            <div class="label">Company</div>
            <div class="value">${contact.company || 'N/A'}</div>
          </div>
          <div class="field">
            <div class="label">Message</div>
            <div class="value">${contact.message}</div>
          </div>
          <div class="field">
            <div class="label">Submitted</div>
            <div class="value">${new Date(contact.timestamp || Date.now()).toLocaleString()}</div>
          </div>
        </div>
        <div class="footer">
          Best Marketing Company - Admin Notification
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendMail({
    to: 'gokilavaratharaj142@gmail.com',
    subject: `New Contact Inquiry from ${contact.name}`,
    html
  });
}

module.exports = { sendMail, sendFeedbackNotification, sendContactNotification };
