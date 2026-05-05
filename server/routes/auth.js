// Auth routes
const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getAllUsers, makeAdmin, changePassword } = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/users', protect, adminOnly, getAllUsers);
router.put('/users/:id/promote', protect, adminOnly, makeAdmin);
router.get('/me', protect, require('../controllers/authController').getMe);
router.post('/change-password', changePassword);

module.exports = router;
