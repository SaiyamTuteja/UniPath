require('dotenv').config();
const mongoose = require('mongoose');

async function testRegFlow() {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    await mongoose.connect(uri);
    const User = require('../models/User');

    // Test with a dummy email to see the validation error
    try {
      const u = new User({
        firstName: 'Test', lastName: 'User',
        email: 'test@example.com', password: 'Test1234', role: 'student'
      });
      await u.validate();
      console.log('Validation passed (email check skipped for non-gehu)');
    } catch(ve) {
      console.log('Validation error:', ve.message);
    }

    // Test with valid GEHU email
    try {
      const u = new User({
        firstName: 'Test', lastName: 'User',
        email: 'test@gehu.ac.in', password: 'Test1234', role: 'student'
      });
      await u.validate();
      console.log('GEHU email validation: PASSED');
    } catch(ve) {
      console.log('GEHU email validation error:', ve.message);
    }

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}
testRegFlow();
