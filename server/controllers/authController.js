// Handles user registration and login
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

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

    const user = await User.create({
      name,
      collegeId,
      email,
      password,
      role: 'student' // Force role to student for public registration
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      collegeId: user.collegeId,
      level: user.level,
      points: user.points,
      token: generateToken(user._id)
    });
  } catch (error) {
    if (error.code === 11000) {
      if (error.keyPattern.email) return res.status(400).json({ message: 'Email is already registered' });
      if (error.keyPattern.collegeId) return res.status(400).json({ message: 'Roll No is already registered' });
    }
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
        collegeId: user.collegeId,
        level: user.level,
        points: user.points,
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


const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, getAllUsers, makeAdmin, getMe };
