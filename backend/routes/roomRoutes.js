const express = require('express');
const router = express.Router();
const { updateOccupancy, getRoomStats } = require('../controllers/roomController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.put('/:id/occupancy', protect, restrictTo('faculty','staff'), updateOccupancy);
router.get('/stats', protect, restrictTo('faculty','staff'), getRoomStats);

module.exports = router;
