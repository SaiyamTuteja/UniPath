const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  const uri = process.env.MONGODB_URI;
  if (!uri || uri === 'your_mongodb_atlas_uri_here') {
    console.warn('⚠️  MONGODB_URI not configured. Running without database (mock mode).');
    return;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000,
    });
    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    console.warn('⚠️  Server will run in MOCK MODE (no DB). Set MONGODB_URI in .env to use real data.');
  }
};

const isDbConnected = () => isConnected;

module.exports = { connectDB, isDbConnected };
