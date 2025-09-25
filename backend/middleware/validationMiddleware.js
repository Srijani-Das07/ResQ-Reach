const { body, query, validationResult } = require('express-validator');

// Helper function to validate phone numbers (Indian format)
const validateIndianPhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

// Helper function to validate pincode (Indian format)
const validateIndianPincode = (pincode) => {
  const pincodeRegex = /^[1-9][0-9]{5}$/;
  return pincodeRegex.test(pincode);
};

// User Registration Validation
exports.validateRegistration = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2-50 characters')
    .matches(/^[a-zA-Z\s.]+$/)
    .withMessage('Name can only contain letters, spaces, and dots'),

  body('middleName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Middle name must be less than 50 characters')
    .matches(/^[a-zA-Z\s.]*$/)
    .withMessage('Middle name can only contain letters, spaces, and dots'),

  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('phone')
    .optional()
    .custom((value) => {
      if (value && !validateIndianPhone(value)) {
        throw new Error('Please provide a valid Indian phone number (10 digits starting with 6-9)');
      }
      return true;
    }),

  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date of birth (YYYY-MM-DD)')
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (birthDate > today) {
        throw new Error('Date of birth cannot be in the future');
      }
      if (age > 120) {
        throw new Error('Please provide a valid date of birth');
      }
      return true;
    }),

  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  body('role')
    .optional()
    .isIn(['Public', 'Government', 'Relief_Staff'])
    .withMessage('Invalid role specified'),

  // Location validation
  body('location.village_city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Village/City name must be less than 100 characters')
    .matches(/^[a-zA-Z\s.-]*$/)
    .withMessage('Village/City can only contain letters, spaces, dots, and hyphens'),

  body('location.district')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('District name must be less than 100 characters')
    .matches(/^[a-zA-Z\s.-]*$/)
    .withMessage('District can only contain letters, spaces, dots, and hyphens'),

  body('location.state')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('State name must be less than 100 characters')
    .matches(/^[a-zA-Z\s.-]*$/)
    .withMessage('State can only contain letters, spaces, dots, and hyphens'),

  body('location.pincode')
    .optional()
    .custom((value) => {
      if (value && !validateIndianPincode(value)) {
        throw new Error('Please provide a valid Indian pincode (6 digits, not starting with 0)');
      }
      return true;
    }),

  // Medical information validation
  body('medicalInfo.disabilities.visualImpairment')
    .optional()
    .isBoolean()
    .withMessage('Visual impairment must be true or false'),

  body('medicalInfo.disabilities.hearingImpairment')
    .optional()
    .isBoolean()
    .withMessage('Hearing impairment must be true or false'),

  body('medicalInfo.disabilities.physicalDisability')
    .optional()
    .isBoolean()
    .withMessage('Physical disability must be true or false'),

  body('medicalInfo.disabilities.speechImpairment')
    .optional()
    .isBoolean()
    .withMessage('Speech impairment must be true or false'),

  body('medicalInfo.disabilities.cognitiveDisability')
    .optional()
    .isBoolean()
    .withMessage('Cognitive disability must be true or false'),

  body('medicalInfo.disabilities.multipleDisabilities')
    .optional()
    .isBoolean()
    .withMessage('Multiple disabilities must be true or false'),

  body('medicalInfo.pregnancyNursingStatus')
    .optional()
    .isBoolean()
    .withMessage('Pregnancy/Nursing status must be true or false'),

  body('medicalInfo.chronicHealthConditions')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Chronic health conditions description must be less than 500 characters'),

  // Emergency contacts validation
  body('emergencyContacts.primary.name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Primary contact name must be less than 100 characters')
    .matches(/^[a-zA-Z\s.]*$/)
    .withMessage('Contact name can only contain letters, spaces, and dots'),

  body('emergencyContacts.primary.phone')
    .optional()
    .custom((value) => {
      if (value && !validateIndianPhone(value)) {
        throw new Error('Primary contact phone must be a valid Indian phone number');
      }
      return true;
    }),

  body('emergencyContacts.primary.relationship')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Relationship must be less than 50 characters'),

  body('emergencyContacts.secondary.name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Secondary contact name must be less than 100 characters')
    .matches(/^[a-zA-Z\s.]*$/)
    .withMessage('Contact name can only contain letters, spaces, and dots'),

  body('emergencyContacts.secondary.phone')
    .optional()
    .custom((value) => {
      if (value && !validateIndianPhone(value)) {
        throw new Error('Secondary contact phone must be a valid Indian phone number');
      }
      return true;
    }),

  body('emergencyContacts.secondary.relationship')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Relationship must be less than 50 characters'),

  body('emergencyContacts.medical.name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Medical contact name must be less than 100 characters')
    .matches(/^[a-zA-Z\s.]*$/)
    .withMessage('Contact name can only contain letters, spaces, and dots'),

  body('emergencyContacts.medical.phone')
    .optional()
    .custom((value) => {
      if (value && !validateIndianPhone(value)) {
        throw new Error('Medical contact phone must be a valid Indian phone number');
      }
      return true;
    }),

  body('emergencyContacts.medical.hospital')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Hospital name must be less than 200 characters'),

  // Custom validation to ensure at least email or phone is provided for non-guest users
  body().custom((value, { req }) => {
    if (!req.body.isGuest && !req.body.email && !req.body.phone) {
      throw new Error('Either email or phone number is required for registration');
    }
    return true;
  })
];

// Guest Registration Validation (relaxed requirements)
exports.validateGuestRegistration = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2-50 characters')
    .matches(/^[a-zA-Z\s.]*$/)
    .withMessage('Name can only contain letters, spaces, and dots'),

  body('phone')
    .optional()
    .custom((value) => {
      if (value && !validateIndianPhone(value)) {
        throw new Error('Please provide a valid Indian phone number');
      }
      return true;
    }),

  // Location validation (same as regular registration)
  body('location.pincode')
    .optional()
    .custom((value) => {
      if (value && !validateIndianPincode(value)) {
        throw new Error('Please provide a valid Indian pincode');
      }
      return true;
    })
];

// Login Validation
exports.validateLogin = [
  body().custom((value, { req }) => {
    const { email, phone, guestId } = req.body;
    
    if (guestId) {
      // Guest login - only guestId required
      if (!guestId.trim()) {
        throw new Error('Guest ID is required for guest login');
      }
    } else {
      // Regular login - email or phone + password required
      if (!email && !phone) {
        throw new Error('Email or phone number is required');
      }
      if (!req.body.password) {
        throw new Error('Password is required');
      }
    }
    return true;
  }),

  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address'),

  body('phone')
    .optional()
    .custom((value) => {
      if (value && !validateIndianPhone(value)) {
        throw new Error('Please provide a valid Indian phone number');
      }
      return true;
    }),

  body('password')
    .optional()
    .notEmpty()
    .withMessage('Password cannot be empty')
];

// Profile Update Validation
exports.validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2-50 characters')
    .matches(/^[a-zA-Z\s.]+$/)
    .withMessage('Name can only contain letters, spaces, and dots'),

  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address'),

  body('phone')
    .optional()
    .custom((value) => {
      if (value && !validateIndianPhone(value)) {
        throw new Error('Please provide a valid Indian phone number');
      }
      return true;
    }),

  // Include all the location and medical validations from registration
  // (same validation rules apply)
];

// Emergency Contacts Update Validation
exports.validateEmergencyContacts = [
  body('emergencyContacts.primary.phone')
    .optional()
    .custom((value) => {
      if (value && !validateIndianPhone(value)) {
        throw new Error('Primary contact phone must be a valid Indian phone number');
      }
      return true;
    }),

  body('emergencyContacts.secondary.phone')
    .optional()
    .custom((value) => {
      if (value && !validateIndianPhone(value)) {
        throw new Error('Secondary contact phone must be a valid Indian phone number');
      }
      return true;
    }),

  body('emergencyContacts.medical.phone')
    .optional()
    .custom((value) => {
      if (value && !validateIndianPhone(value)) {
        throw new Error('Medical contact phone must be a valid Indian phone number');
      }
      return true;
    })
];

// Location Query Validation (for emergency responders)
exports.validateLocationQuery = [
  query('district')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('District name must be less than 100 characters'),

  query('state')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('State name must be less than 100 characters'),

  query('pincode')
    .optional()
    .custom((value) => {
      if (value && !validateIndianPincode(value)) {
        throw new Error('Please provide a valid Indian pincode');
      }
      return true;
    })
];

// Validation Error Handler Middleware
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};