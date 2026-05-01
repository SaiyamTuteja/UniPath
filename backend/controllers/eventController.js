const Event = require('../models/Event');

// GET /api/events
exports.getEvents = async (req, res) => {
  try {
    const { upcoming } = req.query;
    const filter = {};
    if (upcoming === 'true') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filter.date = { $gte: today };
    }
    const events = await Event.find(filter)
      .sort({ date: 1 })
      .limit(100)
      .lean();
    res.json({ success: true, data: events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/events
exports.createEvent = async (req, res) => {
  try {
    const { title, description, date, time, venue, organizer, tags, image, registrationLink } = req.body;
    if (!title || !description || !date || !time || !venue || !organizer) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    const event = await Event.create({
      title, description, date, time, venue, organizer,
      tags: tags || [],
      image: image || '',
      registrationLink: registrationLink || '',
      createdBy: req.user?._id,
      createdByName: req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Anonymous',
    });
    res.status(201).json({ success: true, data: event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/events/:id
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    // Allow creator or admin
    if (String(event.createdBy) !== String(req.user?._id) && req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await event.deleteOne();
    res.json({ success: true, message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
