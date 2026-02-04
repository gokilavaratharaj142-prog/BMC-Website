const express = require('express');

const router = express.Router();

router.post('/follow-up', async (req, res) => {
  // Placeholder for RPA automation hook
  res.json({ ok: true, status: 'queued' });
});

router.post('/report', async (req, res) => {
  // Placeholder for report automation
  res.json({ ok: true, status: 'queued' });
});

module.exports = router;
