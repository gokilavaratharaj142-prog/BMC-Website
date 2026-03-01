const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true },
  loginTime: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now },
  logoutTime: { type: Date },
  ip: { type: String },
  userAgent: { type: String },
  device: { type: String },
  browser: { type: String },
  isActive: { type: Boolean, default: true }
});

SessionSchema.index({ userId: 1, isActive: 1 });
SessionSchema.index({ lastActive: 1 });

module.exports = mongoose.model('Session', SessionSchema);
