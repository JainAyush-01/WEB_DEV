// User schema for storing student and admin accounts
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  collegeId: { type: String, required: false }, // Optional for Admin
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hashed password
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  points: { type: Number, default: 0 },
  level: { type: String, enum: ['Bronze', 'Silver', 'Gold'], default: 'Bronze' },
  referralCode: { type: String, unique: true, sparse: true }, // Sparse allows nulls if not generated immediately
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
