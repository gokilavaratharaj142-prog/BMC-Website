const express = require("express");
const Feedback = require("../models/Feedback");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const feedback = await Feedback.create(req.body);
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
