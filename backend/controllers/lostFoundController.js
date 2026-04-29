const LostFound = require('../models/LostFound');

// GET /api/lost-found
exports.getItems = async (req, res) => {
  try {
    const { type, status, category } = req.query;
    const filter = {};
    if (type && ['lost', 'found'].includes(type)) filter.type = type;
    if (status && ['open', 'resolved'].includes(status)) filter.status = status;
    if (category) filter.category = category;
    const items = await LostFound.find(filter)
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/lost-found
exports.createItem = async (req, res) => {
  try {
    const {
      type, title, description, location, dateLostFound,
      category, image, contactName, contactEmail, contactPhone,
    } = req.body;
    if (!type || !title || !description || !location || !dateLostFound || !contactName || !contactEmail) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    const item = await LostFound.create({
      type, title, description, location, dateLostFound,
      category: category || 'other',
      image: image || '',
      contactName, contactEmail,
      contactPhone: contactPhone || '',
      createdBy: req.user?._id,
    });
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/lost-found/:id/resolve
exports.resolveItem = async (req, res) => {
  try {
    const item = await LostFound.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    item.status = 'resolved';
    await item.save();
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
