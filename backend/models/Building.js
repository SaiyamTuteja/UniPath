const mongoose = require('mongoose');

const buildingSchema = new mongoose.Schema({
  buildingId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  floors: [String],
  coordinates: { type: mongoose.Schema.Types.Mixed }, // GeoJSON
});

module.exports = mongoose.model('Building', buildingSchema);
