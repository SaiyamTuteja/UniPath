const User = require('../models/User');
const { generateToken } = require('../utils/jwtHelper');
const { sendPasswordResetEmail } = require('../utils/emailService');
const crypto = require('crypto');

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }
    const user = await User.create({ firstName, lastName, email: email.toLowerCase(), password, role: role || 'student' });
    const token = generateToken({ id: user._id, email: user.email, role: user.role });
    res.status(201).json({ success: true, token, user: user.toPublicJSON() });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const msg = Object.values(err.errors).map(e => e.message).join(', ');
      return res.status(400).json({ success: false, message: msg });
    }
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || user.isGuest) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    const token = generateToken({ id: user._id, email: user.email, role: user.role });
    res.json({ success: true, token, user: user.toPublicJSON() });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

// POST /api/auth/guest
const guestLogin = async (req, res) => {
  try {
    const guestUser = {
      _id: `guest_${Date.now()}`,
      firstName: 'Guest',
      lastName: 'User',
      email: `guest_${Date.now()}@guest.unipath`,
      role: 'guest',
      isGuest: true,
      avatar: '',
      course: '',
      semester: 0,
      section: '',
    };
    const token = generateToken({ id: guestUser._id, email: guestUser.email, role: 'guest', isGuest: true }, '1d');
    res.json({ success: true, token, user: guestUser });
  } catch (err) {
    console.error('Guest login error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user) return res.json({ success: true, message: 'If that email exists, a reset link was sent.' });

    const token = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
    user.passwordResetExpires = Date.now() + 3600000; // 1 hour
    await user.save({ validateBeforeSave: false });

    try {
      await sendPasswordResetEmail(user.email, token, user.firstName);
    } catch (emailErr) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ success: false, message: 'Failed to send reset email.' });
    }
    res.json({ success: true, message: 'Password reset email sent.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ success: false, message: 'Token and new password required.' });
    }
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    const newToken = generateToken({ id: user._id, email: user.email, role: user.role });
    res.json({ success: true, token: newToken, message: 'Password reset successfully.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    if (req.user.isGuest) {
      return res.json({ success: true, user: { ...req.user, isGuest: true, firstName: 'Guest', lastName: 'User' } });
    }
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, user: user.toPublicJSON() });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// PUT /api/auth/me
const updateMe = async (req, res) => {
  try {
    const { course, semester, section, firstName, lastName, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { course, semester, section, firstName, lastName, avatar },
      { new: true, runValidators: false }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, user: user.toPublicJSON() });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// POST /api/auth/logout
const logout = (req, res) => {
  res.json({ success: true, message: 'Logged out successfully.' });
};

module.exports = { register, login, guestLogin, forgotPassword, resetPassword, getMe, updateMe, logout };
