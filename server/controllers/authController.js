// Handles user registration and login
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
};

const registerUser = async (req, res) => {
  try {
    const { name, collegeId, email, password } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const referralCode = crypto.randomBytes(3).toString('hex').toUpperCase();

    const user = await User.create({
      name,
      collegeId,
      email,
      password: hashedPassword,
      role: 'student', // Force role to student for public registration
      referralCode
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const makeAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.role = 'admin';
    await user.save();

    res.json({ message: 'User promoted to admin', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const referUser = async (req, res) => {
  try {
    const { code } = req.body;
    const referrer = await User.findOne({ referralCode: code });
    
    if (!referrer) return res.status(404).json({ message: 'Invalid referral code' });
    if (referrer._id.toString() === req.user._id.toString()) return res.status(400).json({ message: 'Cannot refer yourself' });

    const user = await User.findById(req.user._id);
    if (user.referredBy) return res.status(400).json({ message: 'You have already used a referral code' });

    user.referredBy = referrer._id;
    user.points += 100;
    referrer.points += 100;

    await user.save();
    await referrer.save();

    res.json({ message: 'Referral successful! 100 points awarded.', points: user.points });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, getAllUsers, makeAdmin, referUser };
