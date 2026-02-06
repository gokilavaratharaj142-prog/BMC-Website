const express = require("express");
const Lead = require("../models/Lead");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const lead = await Lead.create(req.body);
    res.json({ success: true, lead });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const q = String(req.query.q || '').trim();
    const filter = q ? {
      $or: [
        { name: new RegExp(q, 'i') },
        { email: new RegExp(q, 'i') },
        { phone: new RegExp(q, 'i') },
        { company: new RegExp(q, 'i') },
        { message: new RegExp(q, 'i') },
        { product: new RegExp(q, 'i') },
      ]
    } : {};
    const list = await Lead.find(filter).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
