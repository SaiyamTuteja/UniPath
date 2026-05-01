const CrowdEstimate = require('../models/CrowdEstimate');
const Event = require('../models/Event');
const LostFound = require('../models/LostFound');
const User = require('../models/User');

// GET /api/crowd/estimate
exports.getEstimate = async (req, res) => {
  try {
    // Try to get the latest real estimate
    const latest = await CrowdEstimate.findOne().sort({ createdAt: -1 }).lean();

    if (latest && (Date.now() - new Date(latest.createdAt).getTime()) < 5 * 60 * 1000) {
      return res.json({ success: true, data: latest });
    }

    // Simulate crowd data based on time of day
    const hour = new Date().getHours();
    let estimatedCount, density;

    if (hour >= 9 && hour <= 11) {
      estimatedCount = Math.floor(Math.random() * 200) + 300; // 300-500
      density = 'high';
    } else if (hour >= 12 && hour <= 14) {
      estimatedCount = Math.floor(Math.random() * 150) + 200; // 200-350
      density = 'medium';
    } else if (hour >= 14 && hour <= 17) {
      estimatedCount = Math.floor(Math.random() * 200) + 250; // 250-450
      density = 'high';
    } else if (hour >= 7 && hour <= 9) {
      estimatedCount = Math.floor(Math.random() * 100) + 100; // 100-200
      density = 'medium';
    } else {
      estimatedCount = Math.floor(Math.random() * 80) + 20; // 20-100
      density = 'low';
    }

    res.json({
      success: true,
      data: {
        estimatedCount,
        density,
        locationName: 'GEHU Campus',
        source: 'simulated',
        updatedAt: new Date().toISOString(),
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/crowd/report
exports.reportCrowd = async (req, res) => {
  try {
    const { latitude, longitude, locationName } = req.body;
    const estimate = await CrowdEstimate.create({
      location: {
        type: 'Point',
        coordinates: [longitude || 0, latitude || 0],
      },
      locationName: locationName || 'Campus',
      estimatedCount: 1,
      density: 'low',
      source: 'device_report',
      reportedBy: req.user?._id,
    });
    res.status(201).json({ success: true, data: estimate });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/stats/home — dashboard stats for home page
exports.getHomeStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalEvents,
      upcomingEvents,
      thisMonthEvents,
      openLostItems,
      openFoundItems,
      totalUsers,
    ] = await Promise.all([
      Event.countDocuments().catch(() => 0),
      Event.countDocuments({ date: { $gte: now } }).catch(() => 0),
      Event.countDocuments({ date: { $gte: startOfMonth } }).catch(() => 0),
      LostFound.countDocuments({ type: 'lost', status: 'open' }).catch(() => 0),
      LostFound.countDocuments({ type: 'found', status: 'open' }).catch(() => 0),
      User.countDocuments().catch(() => 0),
    ]);

    res.json({
      success: true,
      data: {
        totalEvents,
        upcomingEvents,
        thisMonthEvents,
        openLostItems,
        openFoundItems,
        totalUsers,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
