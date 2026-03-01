const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  email: { type: String, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  company: { type: String, trim: true },
  message: { type: String, trim: true },
  product: { type: String, trim: true },
  enquiryType: { type: String, enum: ['Product Enquiry', 'General Enquiry'], default: 'General Enquiry' },
  status: { type: String, enum: ['new', 'contacted', 'closed'], default: 'new' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Lead', LeadSchema);
