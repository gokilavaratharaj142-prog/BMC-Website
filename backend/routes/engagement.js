const express = require('express');
const Engagement = require('../models/Engagement');
const { protect, superAdmin } = require('../middleware/auth');

const router = express.Router();

// Track engagement (public endpoint)
router.post('/track', async (req, res) => {
  try {
    const { type, page } = req.body;
    
    if (!['whatsapp', 'call', 'email', 'chat'].includes(type)) {
      return res.status(400).json({ message: 'Invalid engagement type' });
    }
    
    const engagement = await Engagement.create({
      type,
      page: page || 'unknown',
      ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      device: getDeviceType(req.headers['user-agent']),
      timestamp: new Date()
    });
    
    res.json({ ok: true, id: engagement._id });
  } catch (err) {
    console.error('Engagement tracking error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get engagement stats (admin only)
router.get('/stats', protect, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const query = {};
    if (startDate && endDate) {
      query.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const engagements = await Engagement.find(query).sort({ timestamp: -1 });
    
    const stats = {
      total: engagements.length,
      whatsapp: engagements.filter(e => e.type === 'whatsapp').length,
      call: engagements.filter(e => e.type === 'call').length,
      email: engagements.filter(e => e.type === 'email').length,
      chat: engagements.filter(e => e.type === 'chat').length,
      byDate: {}
    };
    
    engagements.forEach(e => {
      const date = e.timestamp.toISOString().split('T')[0];
      if (!stats.byDate[date]) {
        stats.byDate[date] = { whatsapp: 0, call: 0, email: 0, chat: 0 };
      }
      stats.byDate[date][e.type]++;
    });
    
    res.json(stats);
  } catch (err) {
    console.error('Engagement stats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

function getDeviceType(userAgent) {
  if (!userAgent) return 'unknown';
  if (/mobile/i.test(userAgent)) return 'mobile';
  if (/tablet/i.test(userAgent)) return 'tablet';
  return 'desktop';
}

module.exports = router;
