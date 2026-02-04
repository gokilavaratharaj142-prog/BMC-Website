const express = require('express');
const { query } = require('../db');
const { logAudit } = require('../services/audit');

const router = express.Router();

router.post('/', async (req, res) => {
  const payload = {
    name: String(req.body.name || '').trim(),
    company: String(req.body.company || '').trim(),
    rating: Number(req.body.rating || 0),
    message: String(req.body.message || '').trim(),
  };

  if (!payload.name || payload.name.length < 2) return res.status(400).json({ message: 'Name required' });
  if (!payload.message || payload.message.length < 5) return res.status(400).json({ message: 'Feedback required' });
  if (payload.rating && (payload.rating < 1 || payload.rating > 5)) return res.status(400).json({ message: 'Rating must be between 1 and 5' });

  await query(
    'INSERT INTO feedback (name, company, rating, message, created_at) VALUES (?, ?, ?, ?, NOW())',
    [payload.name, payload.company, payload.rating || null, payload.message]
  );

  await logAudit({ action: 'FEEDBACK_CREATED', detail: payload.name, ip: req.ip });
  res.json({ ok: true });
});

router.get('/', async (req, res) => {
  const rows = await query('SELECT name, company, rating, message, created_at FROM feedback ORDER BY created_at DESC LIMIT 6');
  res.json(rows || []);
});

module.exports = router;
