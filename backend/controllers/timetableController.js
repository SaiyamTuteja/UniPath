const Room = require('../models/Room');
const { isDbConnected } = require('../config/db');

const getDaySlot = () => {
  const weekdays = ['sun','mon','tue','wed','thu','fri','sat'];
  return weekdays[new Date().getDay()];
};

const getHourSlot = () => {
  const h = new Date().getHours();
  const s = (h > 12 ? h - 12 : h).toString().padStart(2,'0');
  const e = ((h + 1) > 12 ? (h + 1) - 12 : (h + 1)).toString().padStart(2,'0');
  return `${s}-${e}`;
};

// GET /api/timetable/current — current class for a room
const getCurrentClass = async (req, res) => {
  try {
    const { roomId } = req.query;
    if (!roomId) return res.status(400).json({ success: false, message: 'roomId required.' });
    let room;
    if (isDbConnected()) {
      room = await Room.findOne({ roomid: parseInt(roomId) });
    }
    if (!room) return res.json({ success: true, data: null });
    const day = getDaySlot();
    const slot = getHourSlot();
    const current = room.schedule?.[day]?.[slot];
    res.json({ success: true, data: current || null });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/timetable/today
const getTodaySchedule = async (req, res) => {
  try {
    const { roomId } = req.query;
    const day = getDaySlot();
    if (!roomId) return res.status(400).json({ success: false, message: 'roomId required.' });
    let room;
    if (isDbConnected()) {
      room = await Room.findOne({ roomid: parseInt(roomId) });
    }
    if (!room) return res.json({ success: true, data: [] });
    const todaySchedule = room.schedule?.[day] || {};
    res.json({ success: true, data: todaySchedule });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/timetable/:course/:semester/:section
const getTimetable = async (req, res) => {
  try {
    const { course, semester, section } = req.params;
    let rooms;
    if (isDbConnected()) {
      rooms = await Room.find({});
    } else {
      rooms = require('../data/mockRooms');
    }
    // Build timetable for this course/semester/section from room schedules
    const days = ['mon','tue','wed','thu','fri','sat'];
    const slots = ['08-09','09-10','10-11','11-12','12-01','01-02','02-03','03-04','04-05','05-06'];
    const timetable = {};
    days.forEach(day => {
      timetable[day] = {};
      slots.forEach(slot => {
        const match = rooms.find(room => {
          const s = room.schedule?.[day]?.[slot];
          return s && s.course?.toLowerCase() === course.toLowerCase()
            && String(s.semester) === String(semester)
            && s.section?.toLowerCase() === section.toLowerCase();
        });
        if (match) {
          timetable[day][slot] = { ...match.schedule[day][slot], roomid: match.roomid, roomname: match.name };
        }
      });
    });
    res.json({ success: true, data: timetable });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getCurrentClass, getTodaySchedule, getTimetable };
