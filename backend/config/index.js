require('dotenv').config({ path: '../../.env' });

module.exports = {
  port: process.env.BACKEND_PORT || 5000,
  mongoURI: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN,
  appUrl: process.env.APP_URL,
  otpExpiresMinutes: process.env.OTP_EXPIRES_MINUTES,
  mail: {
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
};
