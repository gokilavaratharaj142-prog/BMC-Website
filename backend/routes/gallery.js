const express = require('express');
const { query } = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  const rows = await query('SELECT id, title, type, url, created_at FROM gallery ORDER BY created_at DESC');
  res.json(rows || []);
});

router.post('/', requireAuth, requireRole(['admin','manager']), async (req, res) => {
  const payload = {
    title: String(req.body.title || '').trim(),
    type: String(req.body.type || 'image').trim(),
    url: String(req.body.url || '').trim(),
  };
  if (!payload.url) return res.status(400).json({ message: 'URL required' });
  await query('INSERT INTO gallery (title, type, url, created_at) VALUES (?, ?, ?, NOW())', [payload.title, payload.type, payload.url]);
  res.json({ ok: true });
});

module.exports = router;
