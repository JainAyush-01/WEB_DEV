// Handles attendance check-in, check-out, and daily stats
const Attendance = require('../models/Attendance');
const Membership = require('../models/Membership');
const User = require('../models/User');

// POST /api/attendance/checkin
const checkIn = async (req, res) => {
  try {
    // Verify user has an active membership
    const activeMembership = await Membership.findOne({ userId: req.user._id, status: 'active' });
    if (!activeMembership) {
      return res.status(400).json({ message: 'You need an active membership to check in.' });
    }

    // Check if there is already an open session (checked in but not out)
    const openSession = await Attendance.findOne({ user_id: req.user._id, exit_time: null });
    if (openSession) {
      return res.status(400).json({ message: 'You already have an open session. Please check out first.' });
    }

    const attendance = await Attendance.create({
      user_id: req.user._id,
      entry_time: new Date()
    });

    res.status(201).json({ message: 'Checked in successfully.', attendance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/attendance/checkout
const checkOut = async (req, res) => {
  try {
    const openSession = await Attendance.findOne({ user_id: req.user._id, exit_time: null });
    if (!openSession) {
      return res.status(400).json({ message: 'No open session found. Please check in first.' });
    }

    const exitTime = new Date();
    const durationMs = exitTime - new Date(openSession.entry_time);
    const durationMinutes = Math.round(durationMs / (1000 * 60));

    // Ignore sessions shorter than 30 minutes
    if (durationMinutes < 30) {
      await Attendance.findByIdAndDelete(openSession._id);
      return res.json({ message: `Session too short (${durationMinutes} min). Minimum valid session is 30 minutes. Session discarded.` });
    }

    openSession.exit_time = exitTime;
    openSession.duration_minutes = durationMinutes;
    await openSession.save();

    // Gamification: Add points and check level
    const user = await User.findById(req.user._id);
    user.points += 10;
    
    let levelUp = false;
    if (user.points >= 300 && user.level !== 'Gold') {
      user.level = 'Gold';
      levelUp = true;
    } else if (user.points >= 100 && user.points < 300 && user.level !== 'Silver') {
      user.level = 'Silver';
      levelUp = true;
    }
    await user.save();

    res.json({ 
      message: `Checked out. Session: ${durationMinutes} minutes. You earned 10 points!${levelUp ? ` You leveled up to ${user.level}!` : ''}`, 
      attendance: openSession,
      points: user.points,
      level: user.level
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/attendance/daily — get daily attendance for logged-in user
const getDailyAttendance = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const records = await Attendance.find({
      user_id: req.user._id,
      entry_time: { $gte: todayStart, $lte: todayEnd },
      exit_time: { $ne: null }
    });

    const totalMinutes = records.reduce((sum, r) => sum + r.duration_minutes, 0);

    res.json({
      date: todayStart.toISOString().split('T')[0],
      sessions: records.length,
      total_duration_minutes: totalMinutes,
      records
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/attendance/insights — smart attendance analysis
const getInsights = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const records = await Attendance.find({
      user_id: req.user._id,
      entry_time: { $gte: thirtyDaysAgo },
      exit_time: { $ne: null }
    });

    const totalSessions = records.length;
    const totalMinutes = records.reduce((sum, r) => sum + r.duration_minutes, 0);
    const avgMinutesPerSession = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;

    // Smart suggestion
    let suggestion = '';
    let status = 'active';
    if (totalSessions >= 20) {
      suggestion = 'You are a regular! Consider switching to a Yearly plan for the best value.';
    } else if (totalSessions >= 10) {
      suggestion = 'Good consistency! A Semester plan might be ideal for you.';
    } else if (totalSessions >= 3) {
      suggestion = 'You visit occasionally. A Monthly plan is a good fit.';
    } else {
      suggestion = 'Your attendance is very low. Consider visiting more regularly to make the most of your membership.';
      status = 'low_attendance';
    }

    res.json({
      period: '30 days',
      total_sessions: totalSessions,
      total_minutes: totalMinutes,
      avg_minutes_per_session: avgMinutesPerSession,
      status,
      suggestion
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { checkIn, checkOut, getDailyAttendance, getInsights };
