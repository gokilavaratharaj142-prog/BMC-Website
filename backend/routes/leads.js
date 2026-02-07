const express = require("express");
const Lead = require("../models/Lead");
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
      product: String(req.body.product || '').trim(),
      message: String(req.body.message || '').trim(),
    };
    const lead = await Lead.create(payload);
    console.log('[LEAD]', { name: lead.name, email: lead.email, phone: lead.phone, company: lead.company, product: lead.product });
    try{
      if (lead.email) {
        await sendMail({
          to: lead.email,
          subject: 'Thanks for contacting BMC',
          text: `Hello ${lead.name || ''}, we received your enquiry about "${lead.product || 'our products'}". Our team will reach out shortly.`
        });
      }
      await sendMail({
        to: process.env.ADMIN_EMAIL || 'admin@bmc.local',
        subject: 'New lead received',
        text: `Lead: ${lead.name} <${lead.email}> | ${lead.phone}\nCompany: ${lead.company}\nProduct: ${lead.product}\nMessage: ${lead.message}`
      });
      await logAudit({ userId: null, action: 'LEAD_CREATED', detail: `${lead.email || lead.phone || lead.name}`, ip: '' });
    }catch(e){
      console.log('[MAIL/AUDIT]', 'skipped or failed', e.message);
    }
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
