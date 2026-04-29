const User = require('../models/User');
const Event = require('../models/Event');
const LostFound = require('../models/LostFound');

// ── Users ────────────────────────────────────────────────────────────────────

// GET /api/admin/users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ isGuest: { $ne: true } })
      .select('-password -passwordResetToken -passwordResetExpires')
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/admin/users/:id/role
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const allowed = ['student', 'faculty', 'staff', 'admin'];
    if (!allowed.includes(role)) return res.status(400).json({ success: false, message: 'Invalid role' });
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user.toPublicJSON() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    if (String(req.params.id) === String(req.user._id || req.user.id)) {
      return res.status(400).json({ success: false, message: "Can't delete yourself" });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Events ────────────────────────────────────────────────────────────────────

// GET /api/admin/events - all events (no filter)
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 }).limit(500).lean();
    res.json({ success: true, data: events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/admin/events - admin create (same as regular but bypasses user check)
exports.adminCreateEvent = async (req, res) => {
  try {
    const { title, description, date, time, venue, organizer, tags, image, registrationLink } = req.body;
    if (!title || !description || !date || !time || !venue || !organizer) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    const event = await Event.create({
      title, description, date, time, venue, organizer,
      tags: tags || [], image: image || '', registrationLink: registrationLink || '',
      createdBy: req.user?._id || req.user?.id,
      createdByName: req.user ? `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() : 'Admin',
      isApproved: true,
    });
    res.status(201).json({ success: true, data: event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/admin/events/:id - force delete any event
exports.adminDeleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/admin/events/:id - update any event field
exports.adminUpdateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, data: event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Lost & Found ──────────────────────────────────────────────────────────────

// GET /api/admin/lost-found - all items including resolved
exports.getAllLostFound = async (req, res) => {
  try {
    const { flag } = req.query;
    const filter = {};
    if (flag === 'flagged') filter.flagged = true;
    const items = await LostFound.find(filter).sort({ createdAt: -1 }).limit(500).lean();
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/admin/lost-found/:id/flag - flag suspicious item
exports.flagItem = async (req, res) => {
  try {
    const { reason } = req.body;
    const item = await LostFound.findByIdAndUpdate(
      req.params.id,
      { flagged: true, flagReason: reason || 'Suspicious activity', flaggedAt: new Date(), flaggedBy: req.user?.id },
      { new: true }
    );
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/admin/lost-found/:id/unflag
exports.unflagItem = async (req, res) => {
  try {
    const item = await LostFound.findByIdAndUpdate(
      req.params.id,
      { $unset: { flagged: '', flagReason: '', flaggedAt: '', flaggedBy: '' } },
      { new: true }
    );
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/admin/lost-found/:id - force delete any item
exports.adminDeleteItem = async (req, res) => {
  try {
    await LostFound.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/admin/lost-found/:id/resolve
exports.adminResolveItem = async (req, res) => {
  try {
    const item = await LostFound.findByIdAndUpdate(req.params.id, { status: 'resolved' }, { new: true });
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Stats ──────────────────────────────────────────────────────────────────────
exports.getStats = async (req, res) => {
  try {
    const [totalUsers, totalEvents, totalLostFound, openItems, flaggedItems] = await Promise.all([
      User.countDocuments({ isGuest: { $ne: true } }),
      Event.countDocuments(),
      LostFound.countDocuments(),
      LostFound.countDocuments({ status: 'open' }),
      LostFound.countDocuments({ flagged: true }),
    ]);
    res.json({ success: true, data: { totalUsers, totalEvents, totalLostFound, openItems, flaggedItems } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
