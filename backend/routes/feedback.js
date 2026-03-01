const express = require("express");
const Feedback = require("../models/Feedback");
const { sendFeedbackNotification } = require("../services/mailer");
const { logAudit } = require("../services/audit");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const payload = {
      name: String(req.body.name || '').trim(),
      email: String(req.body.email || '').trim().toLowerCase(),
      phone: String(req.body.phone || '').trim(),
      company: String(req.body.company || '').trim(),
      category: String(req.body.category || '').trim(),
      rating: Number(req.body.rating || req.body.stars || 0),
      stars: Number(req.body.stars || req.body.rating || 0),
      sentiment: String(req.body.sentiment || '').trim(),
      message: String(req.body.message || '').trim(),
      timestamp: Date.now()
    };
    const feedback = await Feedback.create(payload);
    console.log('[FEEDBACK]', { name: feedback.name, email: feedback.email, rating: feedback.rating, category: feedback.category });
    
    // Send email notification
    try {
      await sendFeedbackNotification(feedback);
      await logAudit({ 
        userId: null, 
        userName: feedback.name,
        action: 'FEEDBACK_SUBMITTED', 
        resource: 'feedback',
        resourceId: feedback._id.toString(),
        details: `${feedback.stars}-star feedback from ${feedback.name}`, 
        ip: req.ip 
      });
    } catch(e) {
      console.log('[MAIL/AUDIT]', 'skipped or failed', e.message);
    }
    
    res.json({ success: true, feedback });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const list = await Feedback.find().sort({ createdAt: -1 }).limit(50);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
