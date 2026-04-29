const express = require('express');
const router = express.Router();
const { getEvents, createEvent, deleteEvent } = require('../controllers/eventController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

router.get('/', optionalAuth, getEvents);
router.post('/', protect, createEvent);
router.delete('/:id', protect, deleteEvent);

module.exports = router;
