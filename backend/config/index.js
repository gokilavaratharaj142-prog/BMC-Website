const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '..', '.env') });

let mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bmc_secure';
if (!mongoURI.startsWith('mongodb://') && !mongoURI.startsWith('mongodb+srv://')) {
  mongoURI = 'mongodb://127.0.0.1:27017/bmc_secure';
}

module.exports = {
  port: process.env.BACKEND_PORT || 5000,
  mongoURI,
  jwtSecret: process.env.JWT_SECRET || 'replace-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  otpExpiresMinutes: Number(process.env.OTP_EXPIRES_MINUTES || process.env.OTP_EXPIRES_MIN || 5),
  mail: {
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
};
