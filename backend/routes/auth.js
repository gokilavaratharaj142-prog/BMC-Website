const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OtpCode = require('../models/OtpCode');
const config = require('../config');
const { generateOtp } = require('../services/otp');
const { sendMail } = require('../services/mailer');
const { logAudit } = require('../services/audit');

const router = express.Router();

async function createOtp(userId, purpose){
  const code = generateOtp();
  const hash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + (config.otpExpiresMinutes * 60 * 1000));
  await OtpCode.create({ userId, purpose, codeHash: hash, expiresAt });
  return code;
}

const { loginLimiter } = require('../middleware/rateLimiter');

router.post('/login', loginLimiter, async (req, res) => {
  try {
    const identity = String(req.body.username || req.body.email || '').trim();
    const password = String(req.body.password || '');
    const user = identity.includes('@')
      ? await User.findOne({ email: identity.toLowerCase() })
      : await User.findOne({ name: new RegExp(`^${identity.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') });
    if (!user || user.status !== 'active') return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const code = await createOtp(user.id, 'login');
    const mailResult = await sendMail({
      to: user.email,
      subject: 'Your BMC login OTP',
      text: `Your OTP is ${code}. It expires in ${config.otpExpiresMinutes} minutes.`
    });

    await logAudit({ userId: user._id, action: 'OTP_SENT', detail: 'Login OTP sent', ip: req.ip });
    const payload = { ok: true, next: 'otp' };
    if (process.env.NODE_ENV !== 'production' && mailResult && mailResult.skipped) {
      payload.devOtp = code;
    }
    return res.json(payload);
  } catch (_err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/verify-otp', async (req, res) => {
  const identity = String(req.body.username || req.body.email || '').trim();
  const otp = String(req.body.otp || '').trim();
  const user = identity.includes('@')
    ? await User.findOne({ email: identity.toLowerCase() })
    : await User.findOne({ name: new RegExp(`^${identity.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') });
  if (!user || user.status !== 'active') return res.status(401).json({ message: 'Invalid user' });

  const row = await OtpCode.findOne({ userId: user._id, purpose: 'login' }).sort({ createdAt: -1 });
  if (!row) return res.status(400).json({ message: 'OTP not found' });
  if (new Date(row.expiresAt).getTime() < Date.now()) return res.status(400).json({ message: 'OTP expired' });

  const ok = await bcrypt.compare(otp, row.codeHash);
  if (!ok) return res.status(400).json({ message: 'Invalid OTP' });

  const token = jwt.sign({ id: user._id, role: user.role }, config.jwtSecret, { expiresIn: '1h' });
  await logAudit({ userId: user._id, action: 'LOGIN', detail: 'OTP verified', ip: req.ip });
  res.json({ token });
});

router.post('/logout', async (_req, res) => {
  res.json({ ok: true });
});

const crypto = require('crypto');

router.post('/forgot', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const user = await User.findOne({ email });
  if (!user || user.status !== 'active') return res.status(200).json({ ok: true });

  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  await user.save();

  const resetUrl = `${config.appUrl}/reset-password/${resetToken}`;

  await sendMail({
    to: user.email,
    subject: 'BMC password reset',
    text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\nPlease click on the following link, or paste this into your browser to complete the process:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.`
  });

  await logAudit({ userId: user._id, action: 'PASSWORD_RESET_REQUEST', detail: 'Password reset token sent', ip: req.ip });
  res.json({ ok: true });
});

router.post('/reset/:token', async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
  }

  const newPassword = String(req.body.newPassword || '');
  if (newPassword.length < 8) {
    return res.status(400).json({ message: 'Password too short' });
  }

  const hash = await bcrypt.hash(newPassword, 10);
  user.passwordHash = hash;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  await logAudit({ userId: user._id, action: 'PASSWORD_RESET', detail: 'Password reset via token', ip: req.ip });
  res.json({ ok: true });
});

module.exports = router;
