require('dotenv').config();
const mongoose = require('mongoose');

async function testRegistration() {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('Connected OK');

    const User = require('../models/User');

    // Check if user already exists
    const existing = await User.findOne({ email: 'saiyam@gehu.ac.in' });
    if (existing) {
      console.log('User already exists:', existing.firstName, existing.lastName, '| Role:', existing.role);
      await mongoose.disconnect();
      return;
    }

    // Create the admin user directly
    const user = await User.create({
      firstName: 'Saiyam',
      lastName: 'Tuteja',
      email: 'saiyam@gehu.ac.in',
      password: 'Admin@1234',
      role: 'admin'
    });

    console.log('\n✅ Admin user created successfully!');
    console.log('   Name:', user.firstName, user.lastName);
    console.log('   Email:', user.email);
    console.log('   Role:', user.role);
    console.log('\n   👉 Now go to http://localhost:5173/login');
    console.log('   👉 Email: saiyam@gehu.ac.in');
    console.log('   👉 Password: Admin@1234');
    console.log('   👉 After login, go to http://localhost:5173/admin\n');

  } catch (err) {
    console.error('\n❌ Error:', err.message);
    if (err.errors) {
      Object.values(err.errors).forEach(e => console.error('  -', e.message));
    }
  } finally {
    await mongoose.disconnect();
  }
}

testRegistration();
