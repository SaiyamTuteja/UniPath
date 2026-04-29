require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI)
  .then(async () => {
    const users = await User.find({ isGuest: { $ne: true } }).select('email firstName lastName role');
    if (users.length === 0) {
      console.log('\n📭  No registered users found in the database.\n');
      console.log('    👉 Please register first at http://localhost:5173/register\n');
    } else {
      console.log('\n👥  Registered Users:\n');
      users.forEach(u => console.log(`   • ${u.firstName} ${u.lastName} | ${u.email} | role: ${u.role}`));
      console.log('');
    }
    process.exit(0);
  })
  .catch(e => { console.error('DB Error:', e.message); process.exit(1); });
