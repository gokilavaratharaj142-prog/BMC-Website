const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String },
  action: { type: String, required: true },
  resource: { type: String },
  resourceId: { type: String },
  details: { type: String },
  ip: { type: String },
  userAgent: { type: String },
  timestamp: { type: Date, default: Date.now }
});

AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ userId: 1 });
AuditLogSchema.index({ action: 1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
