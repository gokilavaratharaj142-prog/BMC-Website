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

router.post('/login', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const user = await User.findOne({ email });
  if (!user || user.status !== 'active') return res.status(401).json({ message: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

  const code = await createOtp(user.id, 'login');
  await sendMail({
    to: user.email,
    subject: 'Your BMC login OTP',
    text: `Your OTP is ${code}. It expires in ${config.otpExpiresMinutes} minutes.`
  });

  await logAudit({ userId: user._id, action: 'OTP_SENT', detail: 'Login OTP sent', ip: req.ip });
  res.json({ ok: true, next: 'otp' });
});

router.post('/verify-otp', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const otp = String(req.body.otp || '').trim();
  const user = await User.findOne({ email });
  if (!user || user.status !== 'active') return res.status(401).json({ message: 'Invalid user' });

  const row = await OtpCode.findOne({ userId: user._id, purpose: 'login' }).sort({ createdAt: -1 });
  if (!row) return res.status(400).json({ message: 'OTP not found' });
  if (new Date(row.expiresAt).getTime() < Date.now()) return res.status(400).json({ message: 'OTP expired' });

  const ok = await bcrypt.compare(otp, row.codeHash);
  if (!ok) return res.status(400).json({ message: 'Invalid OTP' });

  const token = jwt.sign({ id: user._id, role: user.role }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
  await logAudit({ userId: user._id, action: 'LOGIN', detail: 'OTP verified', ip: req.ip });
  res.json({ token });
});

router.post('/forgot', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const user = await User.findOne({ email });
  if (!user || user.status !== 'active') return res.status(200).json({ ok: true });

  const code = await createOtp(user.id, 'reset');
  await sendMail({
    to: user.email,
    subject: 'BMC password reset OTP',
    text: `Your OTP is ${code}. It expires in ${config.otpExpiresMinutes} minutes.`
  });

  await logAudit({ userId: user._id, action: 'OTP_SENT', detail: 'Reset OTP sent', ip: req.ip });
  res.json({ ok: true });
});

router.post('/reset', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const otp = String(req.body.otp || '').trim();
  const newPassword = String(req.body.newPassword || '');

  if (newPassword.length < 8) return res.status(400).json({ message: 'Password too short' });

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'Invalid user' });

  const row = await OtpCode.findOne({ userId: user._id, purpose: 'reset' }).sort({ createdAt: -1 });
  if (!row) return res.status(400).json({ message: 'OTP not found' });
  if (new Date(row.expiresAt).getTime() < Date.now()) return res.status(400).json({ message: 'OTP expired' });

  const ok = await bcrypt.compare(otp, row.codeHash);
  if (!ok) return res.status(400).json({ message: 'Invalid OTP' });

  const hash = await bcrypt.hash(newPassword, 10);
  await User.updateOne({ _id: user._id }, { $set: { passwordHash: hash } });
  await logAudit({ userId: user._id, action: 'PASSWORD_RESET', detail: 'Password reset via OTP', ip: req.ip });
  res.json({ ok: true });
});

module.exports = router;
