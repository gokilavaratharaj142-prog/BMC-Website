const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  email: { type: String, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  company: { type: String, trim: true },
  category: { type: String, trim: true },
  rating: { type: Number, min: 1, max: 5 },
  stars: { type: Number, min: 1, max: 5 },
  sentiment: { type: String, trim: true },
  message: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feedback', FeedbackSchema);
