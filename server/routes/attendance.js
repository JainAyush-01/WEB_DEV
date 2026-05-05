// Attendance routes
const express = require('express');
const router = express.Router();
const { checkIn, checkOut, getDailyAttendance, getInsights, adminCheckIn, adminCheckOut } = require('../controllers/attendanceController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/checkin', protect, checkIn);
router.post('/checkout', protect, checkOut);
router.get('/daily', protect, getDailyAttendance);
router.get('/insights', protect, getInsights);

router.post('/admin/checkin', protect, adminOnly, adminCheckIn);
router.post('/admin/checkout', protect, adminOnly, adminCheckOut);

module.exports = router;
