const express = require('express');
const router = express.Router();
const { getItems, createItem, resolveItem } = require('../controllers/lostFoundController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.get('/', getItems);
router.post('/', optionalAuth, createItem);
router.patch('/:id/resolve', optionalAuth, resolveItem);

module.exports = router;
