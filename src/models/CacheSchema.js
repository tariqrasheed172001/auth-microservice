const mongoose = require('mongoose');

const CacheSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String },
  otp: { type: String, },
  createdAt: { type: Date, default: Date.now, expires: '2m' } // Expires after 2 minutes
});

module.exports = mongoose.model('CacheSchema', CacheSchema);
