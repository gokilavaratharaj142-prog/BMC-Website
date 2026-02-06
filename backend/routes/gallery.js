const express = require('express');
const Gallery = require('../models/Gallery');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try{
    const rows = await Gallery.find().sort({ createdAt: -1 });
    res.json(rows || []);
  }catch(err){
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', requireAuth, requireRole(['admin','manager']), async (req, res) => {
  try{
    const payload = {
      title: String(req.body.title || '').trim(),
      type: String(req.body.type || 'image').trim(),
      url: String(req.body.url || '').trim(),
    };
    if (!payload.url) return res.status(400).json({ message: 'URL required' });
    await Gallery.create(payload);
    res.json({ ok: true });
  }catch(err){
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
