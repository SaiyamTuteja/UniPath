const express = require('express');
const router = express.Router();
const { getRooms, getRoomById, getRoomsByFloor, getMap, navigate, getBuildings } = require('../controllers/mapController');

router.get('/getmap', getMap);
router.get('/getCoordinates', navigate);
router.get('/buildings', getBuildings);
router.get('/rooms', getRooms);
router.get('/rooms/floor/:floor', getRoomsByFloor);
router.get('/rooms/:id', getRoomById);

module.exports = router;
