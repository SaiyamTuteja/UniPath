const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Room = require('../models/Room');
const mockRooms = require('../data/mockRooms');

const seed = async () => {
  if (!process.env.MONGODB_URI || process.env.MONGODB_URI === 'your_mongodb_atlas_uri_here') {
    console.error('❌ MONGODB_URI not set in .env. Cannot seed without database.');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    console.log('✅ Connected to MongoDB');

    await Room.deleteMany({});
    console.log('🗑️  Cleared existing rooms');

    const inserted = await Room.insertMany(mockRooms);
    console.log(`✅ Seeded ${inserted.length} rooms`);

    await mongoose.disconnect();
    console.log('✅ Disconnected. Seed complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
};

seed();
