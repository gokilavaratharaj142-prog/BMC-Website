const express = require('express');
const Lead = require('../models/Lead');
const Feedback = require('../models/Feedback');
const User = require('../models/User');
const Gallery = require('../models/Gallery');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, requireRole(['admin']), async (req, res) => {
  const leads = await Lead.find().sort({ createdAt: -1 });
  const feedback = await Feedback.find().sort({ createdAt: -1 });
  const users = await User.find().sort({ createdAt: -1 });
  const gallery = await Gallery.find().sort({ createdAt: -1 });

  res.json({
    createdAt: new Date().toISOString(),
    data: { leads, feedback, users, gallery }
  });
});

router.post('/restore', requireAuth, requireRole(['admin']), async (req, res) => {
  const data = req.body && req.body.data ? req.body.data : null;
  if (!data) return res.status(400).json({ message: 'Invalid backup payload' });

  await Lead.deleteMany({});
  await Feedback.deleteMany({});
  await Gallery.deleteMany({});

  if (Array.isArray(data.leads)) await Lead.insertMany(data.leads.map(r => ({ ...r })));
  if (Array.isArray(data.feedback)) await Feedback.insertMany(data.feedback.map(r => ({ ...r })));
  if (Array.isArray(data.gallery)) await Gallery.insertMany(data.gallery.map(r => ({ ...r })));

  res.json({ ok: true });
});

module.exports = router;
