const express = require('express');
const router = express.Router();
const { getCurrentClass, getTodaySchedule, getTimetable } = require('../controllers/timetableController');
const { protect } = require('../middleware/authMiddleware');

router.get('/current', protect, getCurrentClass);
router.get('/today', protect, getTodaySchedule);
router.get('/:course/:semester/:section', getTimetable);

module.exports = router;
