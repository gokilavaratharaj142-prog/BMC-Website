const express = require('express');
const { query } = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');
const { getOverview, getLeadsByDay } = require('../services/analytics');

const router = express.Router();

router.get('/overview', requireAuth, requireRole(['admin','manager']), async (req, res) => {
  const data = await getOverview();
  res.json(data);
});

router.get('/leads', requireAuth, requireRole(['admin','manager','staff']), async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (q) {
    const like = `%${q}%`;
    const rows = await query(
      'SELECT name, email, phone, company, message, product, created_at FROM leads WHERE name LIKE ? OR email LIKE ? OR phone LIKE ? OR company LIKE ? OR message LIKE ? OR product LIKE ? ORDER BY created_at DESC',
      [like, like, like, like, like, like]
    );
    return res.json(rows || []);
  }
  const rows = await query('SELECT name, email, phone, company, message, product, created_at FROM leads ORDER BY created_at DESC');
  res.json(rows || []);
});

router.post('/leads/clear', requireAuth, requireRole(['admin']), async (req, res) => {
  await query('DELETE FROM leads');
  res.json({ ok: true });
});

router.get('/leads.csv', requireAuth, requireRole(['admin','manager']), async (req, res) => {
  const rows = await query('SELECT name, email, phone, company, message, product, created_at FROM leads ORDER BY created_at DESC');
  const headers = ['created_at','name','email','phone','company','message','product'];
  const csv = [headers.join(',')]
    .concat(rows.map(r => headers.map(h => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(',')))
    .join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="leads.csv"');
  res.send(csv);
});

router.get('/analytics/leads', requireAuth, requireRole(['admin','manager']), async (req, res) => {
  const days = Number(req.query.days || 14);
  const rows = await getLeadsByDay(days);
  res.json(rows || []);
});

router.get('/users', requireAuth, requireRole(['admin']), async (req, res) => {
  const rows = await query('SELECT id, name, email, role, status, created_at FROM users ORDER BY created_at DESC');
  res.json(rows || []);
});

module.exports = router;
