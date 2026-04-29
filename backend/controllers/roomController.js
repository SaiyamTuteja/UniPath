const Room = require('../models/Room');
const { isDbConnected } = require('../config/db');

// PUT /api/admin/rooms/:id/occupancy
const updateOccupancy = async (req, res) => {
  try {
    const { isOccupied } = req.body;
    const roomId = parseInt(req.params.id);
    let room;
    if (isDbConnected()) {
      room = await Room.findOneAndUpdate({ roomid: roomId }, { isOccupied, updatedAt: new Date() }, { new: true });
    }
    if (!room) return res.status(404).json({ success: false, message: 'Room not found.' });
    res.json({ success: true, data: room });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/admin/rooms/stats
const getRoomStats = async (req, res) => {
  try {
    let stats = { total: 0, occupied: 0, available: 0 };
    if (isDbConnected()) {
      stats.total = await Room.countDocuments();
      stats.occupied = await Room.countDocuments({ isOccupied: true });
      stats.available = stats.total - stats.occupied;
    }
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { updateOccupancy, getRoomStats };
