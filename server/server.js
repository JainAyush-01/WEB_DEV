// Main server file
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Plan = require('./models/Plan');

const authRoutes = require('./routes/auth');
const planRoutes = require('./routes/plans');
const membershipRoutes = require('./routes/memberships');
const notificationRoutes = require('./routes/notifications');
const attendanceRoutes = require('./routes/attendance');

const app = express();
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/memberships', membershipRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/attendance', attendanceRoutes);

// Seed Data — creates admin, student, and default plans if they don't exist
const seedData = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const adminHash = await bcrypt.hash('admin123', salt);
      await User.create({
        name: 'Admin',
        collegeId: 'ADMIN001',
        email: 'admin@lnmiit.ac.in',
        password: adminHash,
        role: 'admin'
      });
      console.log('Admin seeded: admin@lnmiit.ac.in / admin123');
    }

    const studentExists = await User.findOne({ role: 'student' });
    if (!studentExists) {
      const salt = await bcrypt.genSalt(10);
      const studentHash = await bcrypt.hash('student123', salt);
      await User.create({
        name: 'Ayush Student',
        collegeId: '24UCS282',
        email: 'student@lnmiit.ac.in',
        password: studentHash,
        role: 'student'
      });
      console.log('Student seeded: student@lnmiit.ac.in / student123');
    }

    const planCount = await Plan.countDocuments();
    if (planCount === 0) {
      await Plan.create([
        { name: 'Monthly', durationDays: 30, price: 499, description: 'Basic monthly plan', max_users_limit: 100 },
        { name: 'Semester', durationDays: 180, price: 1999, description: '6 months plan', max_users_limit: 80 },
        { name: 'Yearly', durationDays: 365, price: 3499, description: 'Full year plan', max_users_limit: 50 }
      ]);
      console.log('Default plans seeded');
    }
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};

// Database connection
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lnmiit-gym')
  .then(() => {
    console.log('MongoDB Connected');
    seedData();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.log(err));
