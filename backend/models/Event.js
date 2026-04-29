const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, required: true, trim: true, maxlength: 1000 },
  date: { type: Date, required: true },
  time: { type: String, required: true }, // e.g. "10:00 AM"
  venue: { type: String, required: true, trim: true },
  organizer: { type: String, required: true, trim: true },
  tags: [{ type: String, trim: true }],
  image: { type: String, default: '' }, // base64 or URL
  registrationLink: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdByName: { type: String, default: 'Anonymous' },
  isApproved: { type: Boolean, default: true },
}, { timestamps: true });

// Index for sorting by date
eventSchema.index({ date: 1 });

module.exports = mongoose.model('Event', eventSchema);
