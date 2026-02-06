const express = require('express');
const AuditLog = require('../models/AuditLog');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, requireRole(['admin','manager']), async (req, res) => {
  try{
    const rows = await AuditLog.find().sort({ createdAt: -1 }).limit(200);
    res.json(rows || []);
  }catch(err){
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
