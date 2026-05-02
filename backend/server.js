require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express(); // ✅ ONLY ONCE

app.set('trust proxy', 1); // ✅ correct place

const { connectDB } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const mapRoutes = require('./routes/mapRoutes');
const roomRoutes = require('./routes/roomRoutes');
const timetableRoutes = require('./routes/timetableRoutes');
const eventRoutes = require('./routes/eventRoutes');
const lostFoundRoutes = require('./routes/lostFoundRoutes');
const adminRoutes = require('./routes/adminRoutes');
const crowdRoutes = require('./routes/crowdRoutes');

const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'https://saiyamtuteja.github.io',
    'https://uni--path.vercel.app',
    'https://saiyamtuteja.me',
    // ...(process.env.CLIENT_URL?.split(',') || [])
    process.env.CLIENT_URL,
  ].filter(Boolean),
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: { success: false, message: 'Too many requests.' } });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { success: false, message: 'Too many auth attempts.' } });
app.use('/api', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ─── Routes ──────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/admin/rooms', roomRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/lost-found', lostFoundRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/crowd', crowdRoutes);

// Legacy navit-compatible endpoints (so frontend works without changes)
const mapController = require('./controllers/mapController');
app.get('/getmap', mapController.getMap);
app.get('/getCoordinates', mapController.navigate);
app.get('/room/getall', (req, res) => {
  const mockRooms = require('./data/mockRooms');
  res.json({ success: true, data: mockRooms });
});

// ─── Health Check ─────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0', app: 'UniPath' });
});

app.get('/', (req, res) => {
  res.json({ message: '🗺️ UniPath API — GEHU Campus Navigation', version: '1.0.0', docs: '/health' });
});

// ─── 404 Handler ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found.` });
});

// ─── Global Error Handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('💥 Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

// ─── Start ────────────────────────────────────────────────────
const start = async () => {
  await connectDB(); // gracefully handles missing/bad URI
  app.listen(PORT, () => {
    console.log(`\n🚀 UniPath backend running on http://localhost:${PORT}`);
    console.log(`📡 Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log('─'.repeat(50));
  });
};

start();
