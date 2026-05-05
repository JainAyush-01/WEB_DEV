require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Plan = require('../models/Plan');
const Membership = require('../models/Membership');
const Attendance = require('../models/Attendance');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lnmiit-gym');
    console.log('Connected to MongoDB for Seeding...');

    // 1. Create Plans (including a Combo)
    await Plan.deleteMany({});
    console.log('Cleared existing plans.');

    const monthlyPlan = await Plan.create({ name: 'Monthly', durationDays: 30, price: 499, description: 'Basic monthly plan', max_users_limit: 100 });
    const semesterPlan = await Plan.create({ name: 'Semester', durationDays: 180, price: 1999, description: '6 months plan', max_users_limit: 80 });
    const comboPlan = await Plan.create({ name: 'Yearly Combo', durationDays: 365, price: 3499, description: 'Full year plan with perks', max_users_limit: 50, isCombo: true, comboIncludes: ['Gym', 'Yoga', 'Zumba'] });

    console.log('Plans created.');

    const salt = await bcrypt.genSalt(10);
    const passHash = await bcrypt.hash('student123', salt);

    // Helper to create users
    const createUser = async (name, rollNo, email, points, level) => {
      // Remove existing if any
      await User.deleteOne({ email });
      return await User.create({
        name, collegeId: rollNo, email, password: passHash, role: 'student', referralCode: rollNo.toUpperCase() + 'REF', points, level
      });
    };

    // 2. Create Users
    const u1 = await createUser('Alice Gold', '22ucs001', '22ucs001@lnmiit.ac.in', 350, 'Gold');
    const u2 = await createUser('Bob Silver', '23mec050', '23mec050@lnmiit.ac.in', 150, 'Silver');
    const u3 = await createUser('Charlie Bronze', '24cce110', '24cce110@lnmiit.ac.in', 50, 'Bronze');
    const u4 = await createUser('Dave Expired', '21ece012', '21ece012@lnmiit.ac.in', 0, 'Bronze');
    
    console.log('Users created.');

    // 3. Create Memberships
    await Membership.deleteMany({});
    
    // Alice has a combo plan that is active
    await Membership.create({
      userId: u1._id,
      planId: comboPlan._id,
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 365)),
      amountPaid: 3499,
      status: 'active'
    });

    // Bob has an active semester plan and a queued monthly plan
    const bobActiveEnd = new Date(new Date().setDate(new Date().getDate() + 10)); // expires in 10 days
    await Membership.create({
      userId: u2._id,
      planId: semesterPlan._id,
      startDate: new Date(new Date().setDate(new Date().getDate() - 170)),
      endDate: bobActiveEnd,
      amountPaid: 1999,
      status: 'active'
    });
    // Queued
    await Membership.create({
      userId: u2._id,
      planId: monthlyPlan._id,
      startDate: bobActiveEnd,
      endDate: new Date(bobActiveEnd.getTime() + (30 * 24 * 60 * 60 * 1000)),
      amountPaid: 499,
      status: 'active' // technically queued because startDate is future
    });

    // Charlie has a frozen plan
    await Membership.create({
      userId: u3._id,
      planId: monthlyPlan._id,
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 30)),
      amountPaid: 499,
      status: 'frozen'
    });

    // Dave has an expired plan
    await Membership.create({
      userId: u4._id,
      planId: monthlyPlan._id,
      startDate: new Date(new Date().setDate(new Date().getDate() - 40)),
      endDate: new Date(new Date().setDate(new Date().getDate() - 10)),
      amountPaid: 499,
      status: 'expired'
    });

    console.log('Memberships created.');

    // 4. Create high attendance for Alice (Gold user) to trigger insights
    await Attendance.deleteMany({});
    for (let i = 0; i < 25; i++) {
      const entryTime = new Date();
      entryTime.setDate(entryTime.getDate() - (i + 1)); // past 25 days
      const exitTime = new Date(entryTime.getTime() + (60 * 60 * 1000)); // 1 hour later
      await Attendance.create({
        user_id: u1._id,
        entry_time: entryTime,
        exit_time: exitTime,
        duration_minutes: 60
      });
    }
    console.log('Attendance created.');

    console.log('\n--- SEED COMPLETE ---');
    console.log('Test Accounts (Password for all is: student123)');
    console.log('1. Gold User (Active Combo Plan, High Attendance): 22ucs001@lnmiit.ac.in');
    console.log('2. Silver User (Active Plan + Queued Plan): 23mec050@lnmiit.ac.in');
    console.log('3. Bronze User (Frozen Plan): 24cce110@lnmiit.ac.in');
    console.log('4. Expired User: 21ece012@lnmiit.ac.in');
    console.log('---------------------');

    process.exit(0);
  } catch (error) {
    console.error('Seed Error:', error);
    process.exit(1);
  }
};

seedData();
