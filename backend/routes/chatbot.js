const express = require('express');

const router = express.Router();

router.post('/', async (req, res) => {
  const message = String(req.body.message || '').trim();
  if (!message) return res.status(400).json({ message: 'Message required' });

  // Placeholder AI chatbot response (hook to real AI later)
  const reply = 'Thanks for contacting BMC. Our team will respond soon.';
  res.json({ reply });
});

module.exports = router;
