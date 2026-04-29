const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomid: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  floor: { type: String, required: true }, // "G", "1", "2", etc.
  building: { type: String, default: 'Main' },
  type: {
    type: String,
    enum: ['class', 'lab', 'computerlab', 'washroom', 'ladieswashroom', 'gentswashroom',
           'office', 'staffroom', 'library', 'cafeteria', 'other'],
    default: 'class'
  },
  capacity: { type: Number, default: 60 },
  // Timetable schedule: { mon: { "08-09": { section, course, subjectcode, semester }, ... }, ... }
  schedule: { type: mongoose.Schema.Types.Mixed, default: {} },
  isOccupied: { type: Boolean, default: false },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Room', roomSchema);
