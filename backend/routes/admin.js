const express = require('express');
const Lead = require('../models/Lead');
const User = require('../models/User');
const { protect, admin } = require('../middleware/auth');
const { getOverview, getLeadsByDay } = require('../services/analytics');

const router = express.Router();

router.get('/overview', protect, admin, async (req, res) => {
  const data = await getOverview();
  res.json(data);
});

router.get('/leads', protect, admin, async (req, res) => {
  const q = String(req.query.q || '').trim();
  const filter = q ? {
    $or: [
      { name: new RegExp(q, 'i') },
      { email: new RegExp(q, 'i') },
      { phone: new RegExp(q, 'i') },
      { company: new RegExp(q, 'i') },
      { message: new RegExp(q, 'i') },
      { product: new RegExp(q, 'i') },
    ]
  } : {};
  const rows = await Lead.find(filter).sort({ createdAt: -1 });
  res.json(rows || []);
});

router.post('/leads/clear', protect, admin, async (req, res) => {
  await Lead.deleteMany({});
  res.json({ ok: true });
});

router.get('/leads.csv', protect, admin, async (req, res) => {
  const rows = await Lead.find().sort({ createdAt: -1 });
  const headers = ['created_at','name','email','phone','company','message','product'];
  const csv = [headers.join(',')]
    .concat(rows.map(r => headers.map(h => {
      const map = {
        created_at: r.createdAt,
        name: r.name,
        email: r.email,
        phone: r.phone,
        company: r.company,
        message: r.message,
        product: r.product
      };
      return `"${String(map[h] ?? '').replace(/"/g, '""')}"`;
    }).join(',')))
    .join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="leads.csv"');
  res.send(csv);
});

router.get('/analytics/leads', protect, admin, async (req, res) => {
  const days = Number(req.query.days || 14);
  const rows = await getLeadsByDay(days);
  res.json(rows || []);
});

router.get('/users', protect, admin, async (req, res) => {
  const rows = await User.find().sort({ createdAt: -1 }).select(['name','email','role','status','createdAt']);
  res.json(rows || []);
});

module.exports = router;
