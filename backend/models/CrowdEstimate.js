const mongoose = require('mongoose');

const crowdEstimateSchema = new mongoose.Schema({
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
  },
  locationName: { type: String, default: 'Campus' },
  estimatedCount: { type: Number, default: 0 },
  density: { type: String, enum: ['low', 'medium', 'high', 'very_high'], default: 'low' },
  source: { type: String, enum: ['device_report', 'wifi_ap', 'manual', 'simulated'], default: 'simulated' },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

crowdEstimateSchema.index({ createdAt: -1 });
crowdEstimateSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('CrowdEstimate', crowdEstimateSchema);
