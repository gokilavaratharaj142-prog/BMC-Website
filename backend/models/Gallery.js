const mongoose = require('mongoose');

const GallerySchema = new mongoose.Schema({
  title: { type: String, trim: true },
  type: { type: String, enum: ['image','video'], default: 'image' },
  url: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Gallery', GallerySchema);
