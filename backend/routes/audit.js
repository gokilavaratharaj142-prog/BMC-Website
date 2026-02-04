const express = require('express');
const { query } = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, requireRole(['admin','manager']), async (req, res) => {
  const rows = await query('SELECT user_id, action, detail, ip, created_at FROM audit_logs ORDER BY created_at DESC LIMIT 200');
  res.json(rows || []);
});

module.exports = router;
