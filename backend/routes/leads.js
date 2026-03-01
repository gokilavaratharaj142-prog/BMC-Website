const express = require("express");
const Lead = require("../models/Lead");
const { sendContactNotification } = require("../services/mailer");
const { logAudit } = require("../services/audit");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const message = String(req.body.message || '').trim();
    
    // Smart enquiry detection
    const productKeywords = ['price', 'cost', 'quotation', 'quote', 'products', 'product', 'valves', 'valve', 'crucible', 'details', 'specification', 'catalog', 'brochure', 'buy', 'purchase', 'order'];
    const isProductEnquiry = productKeywords.some(keyword => message.toLowerCase().includes(keyword));
    
    const payload = {
      name: String(req.body.name || '').trim(),
      email: String(req.body.email || '').trim().toLowerCase(),
      phone: String(req.body.phone || '').trim(),
      company: String(req.body.company || '').trim(),
      product: String(req.body.product || '').trim(),
      message: message,
      enquiryType: isProductEnquiry ? 'Product Enquiry' : 'General Enquiry',
      timestamp: Date.now()
    };
    const lead = await Lead.create(payload);
    console.log('[LEAD]', { name: lead.name, email: lead.email, phone: lead.phone, company: lead.company, product: lead.product, enquiryType: lead.enquiryType });
    
    // Send email notification
    try {
      await sendContactNotification(lead);
      await logAudit({ 
        userId: null,
        userName: lead.name,
        action: 'CONTACT_SUBMITTED', 
        resource: 'lead',
        resourceId: lead._id.toString(),
        details: `${lead.enquiryType} from ${lead.name} - ${lead.company}`, 
        ip: req.ip 
      });
    } catch(e) {
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
