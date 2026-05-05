// Attendance routes
const express = require('express');
const router = express.Router();
const { checkIn, checkOut, getDailyAttendance, getInsights } = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');

router.post('/checkin', protect, checkIn);
router.post('/checkout', protect, checkOut);
router.get('/daily', protect, getDailyAttendance);
router.get('/insights', protect, getInsights);

module.exports = router;
