const express = require("express");
const Feedback = require("../models/Feedback");
const { sendMail } = require("../services/mailer");
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
    };
    const feedback = await Feedback.create(payload);
    console.log('[FEEDBACK]', { name: feedback.name, email: feedback.email, rating: feedback.rating, category: feedback.category });
    try{
      if (feedback.email) {
        await sendMail({
          to: feedback.email,
          subject: 'Thanks for your feedback',
          text: `Hello ${feedback.name || ''}, thanks for sharing your feedback on "${feedback.category}". We appreciate it!`
        });
      }
      await sendMail({
        to: process.env.ADMIN_EMAIL || 'admin@bmc.local',
        subject: 'New feedback received',
        text: `Feedback: ${feedback.name} <${feedback.email}> | ${feedback.company}\nCategory: ${feedback.category}\nRating: ${feedback.rating}\nMessage: ${feedback.message}`
      });
      await logAudit({ userId: null, action: 'FEEDBACK_CREATED', detail: `${feedback.email || feedback.name}`, ip: '' });
    }catch(e){
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
