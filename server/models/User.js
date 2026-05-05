// User schema for storing student and admin accounts
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  collegeId: { type: String, required: false }, // Optional for Admin
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hashed password
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  points: { type: Number, default: 0 },
  level: { type: String, enum: ['Bronze', 'Silver', 'Gold'], default: 'Bronze' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
