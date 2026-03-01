const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  email: { type: String, trim: true, lowercase: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['super_admin','manager','staff'], default: 'staff' },
  status: { type: String, enum: ['active','disabled'], default: 'active' },
  lastActive: { type: Date, default: Date.now },
  loginCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
