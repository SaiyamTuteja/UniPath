const Room = require('../models/Room');
const { isDbConnected } = require('../config/db');
const mapData = require('../data/floorMapData');
const { getCoordinates } = require('../data/pathData');

// GET /api/map/rooms  — returns all rooms with current occupancy computed
const getRooms = async (req, res) => {
  try {
    let rooms;
    if (isDbConnected()) {
      rooms = await Room.find({});
    } else {
      // Mock mode: return static room data from seed file
      rooms = require('../data/mockRooms');
    }
    res.json({ success: true, data: rooms, hitcount: rooms.length });
  } catch (err) {
    console.error('getRooms error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch rooms.' });
  }
};

// GET /api/map/rooms/:id
const getRoomById = async (req, res) => {
  try {
    const roomId = parseInt(req.params.id);
    let room;
    if (isDbConnected()) {
      room = await Room.findOne({ roomid: roomId });
    } else {
      const mockRooms = require('../data/mockRooms');
      room = mockRooms.find(r => r.roomid === roomId);
    }
    if (!room) return res.status(404).json({ success: false, message: 'Room not found.' });
    res.json({ success: true, data: room });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/map/rooms/floor/:floor
const getRoomsByFloor = async (req, res) => {
  try {
    const { floor } = req.params;
    let rooms;
    if (isDbConnected()) {
      rooms = await Room.find({ floor });
    } else {
      const mockRooms = require('../data/mockRooms');
      rooms = mockRooms.filter(r => r.floor === floor);
    }
    res.json({ success: true, data: rooms });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/map/getmap — returns floor-split GeoJSON map data (same format as navit)
const getMap = async (req, res) => {
  try {
    res.json({ success: true, data: mapData, hitcount: mapData.length });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch map data.' });
  }
};

// GET /api/map/getCoordinates?src=X&des=Y — returns pathfinding result
const navigate = async (req, res) => {
  try {
    const { src, des } = req.query;
    if (!src || !des) {
      return res.status(400).json({ success: false, message: 'src and des are required.' });
    }
    const result = getCoordinates(parseInt(src), parseInt(des));
    if (!result) {
      return res.status(404).json({ success: false, message: 'No path found between given rooms.' });
    }
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('navigate error:', err);
    res.status(500).json({ success: false, message: 'Pathfinding error.' });
  }
};

// GET /api/map/buildings
const getBuildings = async (req, res) => {
  res.json({ success: true, data: [
    { buildingId: 'main', name: 'Main Academic Block', floors: ['-1','0','1','2','3','4','5'] },
    { buildingId: 'annex', name: 'Annex Building', floors: ['0','1','2'] },
  ]});
};

module.exports = { getRooms, getRoomById, getRoomsByFloor, getMap, navigate, getBuildings };
