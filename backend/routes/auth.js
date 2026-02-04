const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../db');
const config = require('../config');
const { generateOtp } = require('../services/otp');
const { sendMail } = require('../services/mailer');
const { logAudit } = require('../services/audit');

const router = express.Router();

async function createOtp(userId, purpose){
  const code = generateOtp();
  const hash = await bcrypt.hash(code, 10);
  await query(
    'INSERT INTO otp_codes (user_id, purpose, code_hash, expires_at, created_at) VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE), NOW())',
    [userId, purpose, hash, config.otpExpiresMinutes]
  );
  return code;
}

router.post('/login', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const [user] = await query('SELECT id, email, password_hash, role, status FROM users WHERE email = ?', [email]);
  if (!user || user.status !== 'active') return res.status(401).json({ message: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

  const code = await createOtp(user.id, 'login');
  await sendMail({
    to: user.email,
    subject: 'Your BMC login OTP',
    text: `Your OTP is ${code}. It expires in ${config.otpExpiresMinutes} minutes.`
  });

  await logAudit({ userId: user.id, action: 'OTP_SENT', detail: 'Login OTP sent', ip: req.ip });
  res.json({ ok: true, next: 'otp' });
});

router.post('/verify-otp', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const otp = String(req.body.otp || '').trim();
  const [user] = await query('SELECT id, email, role, status FROM users WHERE email = ?', [email]);
  if (!user || user.status !== 'active') return res.status(401).json({ message: 'Invalid user' });

  const [row] = await query(
    'SELECT id, code_hash, expires_at FROM otp_codes WHERE user_id = ? AND purpose = ? ORDER BY created_at DESC LIMIT 1',
    [user.id, 'login']
  );
  if (!row) return res.status(400).json({ message: 'OTP not found' });
  if (new Date(row.expires_at).getTime() < Date.now()) return res.status(400).json({ message: 'OTP expired' });

  const ok = await bcrypt.compare(otp, row.code_hash);
  if (!ok) return res.status(400).json({ message: 'Invalid OTP' });

  const token = jwt.sign({ id: user.id, role: user.role }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
  await logAudit({ userId: user.id, action: 'LOGIN', detail: 'OTP verified', ip: req.ip });
  res.json({ token });
});

router.post('/forgot', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const [user] = await query('SELECT id, email, status FROM users WHERE email = ?', [email]);
  if (!user || user.status !== 'active') return res.status(200).json({ ok: true });

  const code = await createOtp(user.id, 'reset');
  await sendMail({
    to: user.email,
    subject: 'BMC password reset OTP',
    text: `Your OTP is ${code}. It expires in ${config.otpExpiresMinutes} minutes.`
  });

  await logAudit({ userId: user.id, action: 'OTP_SENT', detail: 'Reset OTP sent', ip: req.ip });
  res.json({ ok: true });
});

router.post('/reset', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const otp = String(req.body.otp || '').trim();
  const newPassword = String(req.body.newPassword || '');

  if (newPassword.length < 8) return res.status(400).json({ message: 'Password too short' });

  const [user] = await query('SELECT id, email FROM users WHERE email = ?', [email]);
  if (!user) return res.status(400).json({ message: 'Invalid user' });

  const [row] = await query(
    'SELECT id, code_hash, expires_at FROM otp_codes WHERE user_id = ? AND purpose = ? ORDER BY created_at DESC LIMIT 1',
    [user.id, 'reset']
  );
  if (!row) return res.status(400).json({ message: 'OTP not found' });
  if (new Date(row.expires_at).getTime() < Date.now()) return res.status(400).json({ message: 'OTP expired' });

  const ok = await bcrypt.compare(otp, row.code_hash);
  if (!ok) return res.status(400).json({ message: 'Invalid OTP' });

  const hash = await bcrypt.hash(newPassword, 10);
  await query('UPDATE users SET password_hash = ? WHERE id = ?', [hash, user.id]);
  await logAudit({ userId: user.id, action: 'PASSWORD_RESET', detail: 'Password reset via OTP', ip: req.ip });
  res.json({ ok: true });
});

module.exports = router;
