const express = require('express');
const router = express.Router();
const { register, login, guestLogin, forgotPassword, resetPassword, getMe, updateMe, logout } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validateEmailDomain } = require('../middleware/domainValidator');

router.post('/register', validateEmailDomain, register);
router.post('/login', login);
router.post('/guest', guestLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.post('/logout', protect, logout);

module.exports = router;
