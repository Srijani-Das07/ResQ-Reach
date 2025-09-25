const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Register new user
exports.register = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      email,
      phone,
      name,
      middleName,
      dateOfBirth,
      password,
      role,
      location,
      medicalInfo,
      emergencyContacts
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: email || null },
        { phone: phone || null }
      ].filter(condition => Object.values(condition)[0] !== null)
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or phone already exists'
      });
    }

    // Hash password if provided (not required for guest users)
    let hashedPassword;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 12);
    }

    // Create new user
    const newUser = new User({
      email,
      phone,
      name,
      middleName,
      dateOfBirth,
      password: hashedPassword,
      role: role || 'Public',
      location: {
        village_city: location?.village_city,
        district: location?.district,
        state: location?.state,
        pincode: location?.pincode
      },
      medicalInfo: {
        disabilities: {
          visualImpairment: medicalInfo?.disabilities?.visualImpairment || false,
          hearingImpairment: medicalInfo?.disabilities?.hearingImpairment || false,
          physicalDisability: medicalInfo?.disabilities?.physicalDisability || false,
          speechImpairment: medicalInfo?.disabilities?.speechImpairment || false,
          cognitiveDisability: medicalInfo?.disabilities?.cognitiveDisability || false,
          multipleDisabilities: medicalInfo?.disabilities?.multipleDisabilities || false
        },
        pregnancyNursingStatus: medicalInfo?.pregnancyNursingStatus || false,
        chronicHealthConditions: medicalInfo?.chronicHealthConditions
      },
      emergencyContacts: {
        primary: {
          name: emergencyContacts?.primary?.name,
          phone: emergencyContacts?.primary?.phone,
          relationship: emergencyContacts?.primary?.relationship
        },
        secondary: {
          name: emergencyContacts?.secondary?.name,
          phone: emergencyContacts?.secondary?.phone,
          relationship: emergencyContacts?.secondary?.relationship
        },
        medical: {
          name: emergencyContacts?.medical?.name,
          phone: emergencyContacts?.medical?.phone,
          hospital: emergencyContacts?.medical?.hospital
        }
      }
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: newUser._id,
        role: newUser.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        age: newUser.age
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// Register guest user (quick emergency access)
exports.registerGuest = async (req, res) => {
  try {
    const { name, phone, location, medicalInfo, emergencyContacts } = req.body;

    // Generate unique guest ID
    const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const guestUser = new User({
      name: name || 'Guest User',
      phone,
      isGuest: true,
      guestId,
      role: 'Public',
      location: location || {},
      medicalInfo: medicalInfo || {},
      emergencyContacts: emergencyContacts || {}
    });

    await guestUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: guestUser._id,
        role: guestUser.role,
        isGuest: true
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' } // Shorter expiry for guest users
    );

    res.status(201).json({
      success: true,
      message: 'Guest user registered successfully',
      user: {
        id: guestUser._id,
        name: guestUser.name,
        phone: guestUser.phone,
        guestId: guestUser.guestId,
        isGuest: true
      },
      token
    });

  } catch (error) {
    console.error('Guest registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during guest registration'
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, phone, password, guestId } = req.body;

    let user;

    // Guest login
    if (guestId) {
      user = await User.findOne({ guestId, isGuest: true });
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid guest ID'
        });
      }
    } else {
      // Regular login
      user = await User.findOne({
        $or: [{ email }, { phone }],
        isGuest: false
      });

      if (!user || !password) {
        return res.status(400).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        role: user.role,
        isGuest: user.isGuest
      },
      process.env.JWT_SECRET,
      { expiresIn: user.isGuest ? '24h' : '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        age: user.age,
        isGuest: user.isGuest
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user.userId;
    const updateData = { ...req.body };

    // Remove fields that shouldn't be updated via this endpoint
    delete updateData.password;
    delete updateData.role;
    delete updateData.isGuest;
    delete updateData.guestId;
    delete updateData.permissions;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during profile update'
    });
  }
};

// Update emergency contacts
exports.updateEmergencyContacts = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { emergencyContacts } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { emergencyContacts },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Emergency contacts updated successfully',
      emergencyContacts: user.emergencyContacts
    });

  } catch (error) {
    console.error('Update emergency contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update medical information
exports.updateMedicalInfo = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { medicalInfo } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { medicalInfo },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Medical information updated successfully',
      medicalInfo: user.medicalInfo
    });

  } catch (error) {
    console.error('Update medical info error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get users by location (for emergency responders)
exports.getUsersByLocation = async (req, res) => {
  try {
    // Check if user has permission to view this data
    if (req.user.role !== 'Government' && req.user.role !== 'Relief_Staff') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { district, state, pincode } = req.query;
    
    const query = {};
    if (district) query['location.district'] = new RegExp(district, 'i');
    if (state) query['location.state'] = new RegExp(state, 'i');
    if (pincode) query['location.pincode'] = pincode;

    const users = await User.find(query)
      .select('name phone location medicalInfo emergencyContacts age')
      .limit(100); // Limit for performance

    res.json({
      success: true,
      users,
      count: users.length
    });

  } catch (error) {
    console.error('Get users by location error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get users with special medical needs (for emergency planning)
exports.getUsersWithSpecialNeeds = async (req, res) => {
  try {
    // Check permissions
    if (req.user.role !== 'Government' && req.user.role !== 'Relief_Staff') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const users = await User.find({
      $or: [
        { 'medicalInfo.disabilities.visualImpairment': true },
        { 'medicalInfo.disabilities.hearingImpairment': true },
        { 'medicalInfo.disabilities.physicalDisability': true },
        { 'medicalInfo.disabilities.speechImpairment': true },
        { 'medicalInfo.disabilities.cognitiveDisability': true },
        { 'medicalInfo.disabilities.multipleDisabilities': true },
        { 'medicalInfo.pregnancyNursingStatus': true },
        { 'medicalInfo.chronicHealthConditions': { $exists: true, $ne: '' } }
      ]
    })
    .select('name phone location medicalInfo emergencyContacts age')
    .limit(200);

    res.json({
      success: true,
      users,
      count: users.length
    });

  } catch (error) {
    console.error('Get users with special needs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = exports;