// Auth routes with Zod validation
const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getAllUsers, makeAdmin, referUser } = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { userRegistrationSchema, userLoginSchema } = require('../validators/schemas');

router.post('/register', validate(userRegistrationSchema), registerUser);
router.post('/login', validate(userLoginSchema), loginUser);
router.get('/users', protect, adminOnly, getAllUsers);
router.put('/users/:id/promote', protect, adminOnly, makeAdmin);
router.post('/refer', protect, referUser);
router.get('/me', protect, require('../controllers/authController').getMe);

module.exports = router;
