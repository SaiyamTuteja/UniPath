const mongoose = require('mongoose');

const periodSchema = new mongoose.Schema({
  timeStart: String,
  timeEnd: String,
  subject: String,
  subjectCode: String,
  roomId: String,
  facultyName: String,
  section: String,
  course: String,
  semester: Number,
});

const daySchema = new mongoose.Schema({
  day: { type: String, enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'] },
  periods: [periodSchema],
});

const timetableSchema = new mongoose.Schema({
  course: { type: String, required: true },
  semester: { type: Number, required: true },
  section: { type: String, required: true },
  schedule: [daySchema],
}, { timestamps: true });

module.exports = mongoose.model('Timetable', timetableSchema);
