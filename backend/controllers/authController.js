const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ReliefCenter = require('../models/ReliefCenter');
const config = require('../config/env');

const generateToken = (userId, role, isGuest = false) => {
  return jwt.sign(
    { userId, role, isGuest },
    config.jwtSecret,
    { expiresIn: isGuest ? '7d' : config.jwtExpire }
  );
};

// Guest Login (Offline-first)
const guestLogin = async (req, res) => {
  try {
    const { deviceId, name } = req.body;
    
    if (!deviceId || !name) {
      return res.status(400).json({ error: 'Device ID and name are required' });
    }

    // Check if guest user already exists
    let user = await User.findOne({ guestId: deviceId });
    
    if (!user) {
      user = new User({
        name,
        guestId: deviceId,
        isGuest: true,
        role: 'Public'
      });
      await user.save();
    }

    const token = generateToken(user._id, user.role, true);

    // Get cached camps for offline use
    const camps = await ReliefCenter.find({}).limit(50);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        isGuest: true,
        permissions: user.permissions
      },
      offlineData: {
        camps,
        lastSync: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Guest login error:', error);
    res.status(500).json({ error: 'Server error during guest login' });
  }
};

// Regular User Registration
const register = async (req, res) => {
  try {
    const { email, phone, name, password, role = 'Public' } = req.body;

    if (!name || !password || (!email && !phone)) {
      return res.status(400).json({ 
        error: 'Name, password, and either email or phone are required' 
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [
        { email: email || null },
        { phone: phone || null }
      ]
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      phone,
      name,
      password: hashedPassword,
      role
    });

    await user.save();

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        role: user.role,
        permissions: user.permissions
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

// User Login
const login = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    if (!password || (!email && !phone)) {
      return res.status(400).json({ error: 'Email/phone and password are required' });
    }

    const user = await User.findOne({
      $or: [
        { email: email || null },
        { phone: phone || null }
      ]
    });

    if (!user || user.isGuest) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    user.lastSyncTimestamp = new Date();
    await user.save();

    const token = generateToken(user._id, user.role);

    let offlineData = {};
    if (user.permissions.canUpdateCamps) {
      const camps = await ReliefCenter.find({}).limit(100);
      offlineData = { camps, lastSync: new Date().toISOString() };
    }

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        role: user.role,
        permissions: user.permissions
      },
      offlineData
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

// Get current user info
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    res.json({
      user: {
        id: user._id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        role: user.role,
        isGuest: user.isGuest,
        permissions: user.permissions,
        lastSyncTimestamp: user.lastSyncTimestamp
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  guestLogin,
  register,
  login,
  getMe
};