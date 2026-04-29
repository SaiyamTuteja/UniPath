const mongoose = require('mongoose');

const lostFoundSchema = new mongoose.Schema({
  type: { type: String, enum: ['lost', 'found'], required: true },
  title: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, required: true, trim: true, maxlength: 500 },
  location: { type: String, required: true, trim: true },
  dateLostFound: { type: Date, required: true },
  category: {
    type: String,
    enum: ['electronics', 'clothing', 'stationery', 'accessories', 'documents', 'keys', 'bags', 'other'],
    default: 'other',
  },
  image: { type: String, default: '' }, // base64
  contactName: { type: String, required: true, trim: true },
  contactEmail: { type: String, required: true, trim: true },
  contactPhone: { type: String, default: '' },
  status: { type: String, enum: ['open', 'resolved'], default: 'open' },
  flagged: { type: Boolean, default: false },
  flagReason: { type: String, default: '' },
  flaggedAt: { type: Date },
  flaggedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

lostFoundSchema.index({ type: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('LostFound', lostFoundSchema);
