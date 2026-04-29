const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName:  { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: (v) => /^[^\s@]+@(gehu|geu)\.ac\.in$/i.test(v),
      message: 'Only @gehu.ac.in or @geu.ac.in emails are allowed.'
    }
  },
  password: { type: String, required: function() { return !this.isGuest; } },
  role: { type: String, enum: ['student', 'faculty', 'staff', 'admin', 'guest'], default: 'student' },
  avatar: { type: String, default: '' },
  course: { type: String, default: '' },
  semester: { type: Number, default: 0 },
  section: { type: String, default: '' },
  isGuest: { type: Boolean, default: false },
  passwordResetToken: String,
  passwordResetExpires: Date,
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toPublicJSON = function() {
  return {
    _id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    email: this.email,
    role: this.role,
    avatar: this.avatar,
    course: this.course,
    semester: this.semester,
    section: this.section,
    isGuest: this.isGuest,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);
