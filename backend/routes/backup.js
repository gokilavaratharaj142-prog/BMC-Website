const express = require('express');
const { query } = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, requireRole(['admin']), async (req, res) => {
  const leads = await query('SELECT * FROM leads');
  const feedback = await query('SELECT * FROM feedback');
  const users = await query('SELECT id, name, email, role, status, created_at FROM users');
  const gallery = await query('SELECT * FROM gallery');

  res.json({
    createdAt: new Date().toISOString(),
    data: { leads, feedback, users, gallery }
  });
});

router.post('/restore', requireAuth, requireRole(['admin']), async (req, res) => {
  const data = req.body && req.body.data ? req.body.data : null;
  if (!data) return res.status(400).json({ message: 'Invalid backup payload' });

  // Simple restore: clear and reinsert
  await query('DELETE FROM leads');
  await query('DELETE FROM feedback');
  await query('DELETE FROM gallery');

  for (const row of data.leads || []) {
    await query(
      'INSERT INTO leads (name, email, phone, company, message, product, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [row.name, row.email, row.phone, row.company, row.message, row.product, row.created_at]
    );
  }
  for (const row of data.feedback || []) {
    await query(
      'INSERT INTO feedback (name, company, rating, message, created_at) VALUES (?, ?, ?, ?, ?)',
      [row.name, row.company, row.rating, row.message, row.created_at]
    );
  }
  for (const row of data.gallery || []) {
    await query(
      'INSERT INTO gallery (title, type, url, created_at) VALUES (?, ?, ?, ?)',
      [row.title, row.type, row.url, row.created_at]
    );
  }

  res.json({ ok: true });
});

module.exports = router;
