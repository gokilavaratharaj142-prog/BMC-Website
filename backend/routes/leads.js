const express = require('express');
const { query } = require('../db');
const { sendMail } = require('../services/mailer');
const { logAudit } = require('../services/audit');

const router = express.Router();

router.post('/', async (req, res) => {
  const payload = {
    name: String(req.body.name || '').trim(),
    email: String(req.body.email || '').trim(),
    phone: String(req.body.phone || '').trim(),
    company: String(req.body.company || '').trim(),
    message: String(req.body.message || '').trim(),
    product: String(req.body.product || '').trim(),
  };

  if (!payload.name || payload.name.length < 2) return res.status(400).json({ message: 'Name required' });
  if (!payload.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(payload.email)) return res.status(400).json({ message: 'Valid email required' });

  await query(
    'INSERT INTO leads (name, email, phone, company, message, product, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
    [payload.name, payload.email, payload.phone, payload.company, payload.message, payload.product]
  );

  await sendMail({
    to: payload.email,
    subject: 'BMC Request Received',
    text: 'Thanks for your request. Our team will contact you shortly.'
  });

  await logAudit({ action: 'LEAD_CREATED', detail: payload.email, ip: req.ip });
  res.json({ ok: true });
});

module.exports = router;
