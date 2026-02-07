require('dotenv').config();

const config = {
  port: process.env.BACKEND_PORT || 5000,
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  jwtSecret: process.env.JWT_SECRET || 'replace-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  otpExpiresMinutes: Number(process.env.OTP_EXPIRES_MIN || 10),
  // mysql config removed (MongoDB-only)
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'no-reply@bmc.local',
  },
};

module.exports = config;
