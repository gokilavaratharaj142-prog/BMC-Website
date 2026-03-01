const mongoose = require('mongoose');

const EngagementSchema = new mongoose.Schema({
  type: { type: String, enum: ['whatsapp', 'call', 'email', 'chat'], required: true },
  page: { type: String },
  ip: { type: String },
  userAgent: { type: String },
  device: { type: String },
  timestamp: { type: Date, default: Date.now }
});

EngagementSchema.index({ timestamp: -1 });
EngagementSchema.index({ type: 1 });

module.exports = mongoose.model('Engagement', EngagementSchema);
