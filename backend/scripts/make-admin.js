/**
 * make-admin.js — Run this script to promote a user to admin role
 * Usage: node scripts/make-admin.js your-email@gehu.ac.in
 *        node scripts/make-admin.js your-email@gehu.ac.in faculty
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const [,, email, role = 'admin'] = process.argv;
const ALLOWED = ['student', 'faculty', 'staff', 'admin'];

if (!email) {
  console.error('\n❌  Usage: node scripts/make-admin.js <email> [role]\n');
  console.error('   Roles: student | faculty | staff | admin\n');
  process.exit(1);
}
if (!ALLOWED.includes(role)) {
  console.error(`\n❌  Invalid role "${role}". Choose: ${ALLOWED.join(' | ')}\n`);
  process.exit(1);
}

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/unipath');
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { $set: { role } },
      { new: true }
    );
    if (!user) {
      console.error(`\n❌  No user found with email: ${email}`);
      console.error('    Make sure you have registered first!\n');
      process.exit(1);
    }
    console.log(`\n✅  Success! User promoted:`);
    console.log(`    Name  : ${user.firstName} ${user.lastName}`);
    console.log(`    Email : ${user.email}`);
    console.log(`    Role  : ${user.role}`);
    console.log('\n    👉 Log out and log back in to get a fresh token.\n');
  } catch (err) {
    console.error('\n❌  Error:', err.message, '\n');
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
})();
