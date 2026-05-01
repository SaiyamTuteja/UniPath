const express = require('express');
const router = express.Router();
const { getEstimate, reportCrowd, getHomeStats } = require('../controllers/crowdController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.get('/estimate', getEstimate);
router.post('/report', optionalAuth, reportCrowd);
router.get('/home-stats', getHomeStats);

module.exports = router;
