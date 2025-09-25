const express = require('express');
const { 
  register, 
  registerGuest, 
  login, 
  getProfile,
  updateProfile,
  updateEmergencyContacts,
  updateMedicalInfo,
  getUsersByLocation,
  getUsersWithSpecialNeeds 
} = require('../controllers/userController');

const { 
  validateRegistration,
  validateGuestRegistration, 
  validateLogin,
  validateProfileUpdate,
  validateEmergencyContacts,
  validateLocationQuery,
  handleValidationErrors 
} = require('../middleware/validationMiddleware');

const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Authentication
router.post('/register', validateRegistration, handleValidationErrors, register);
router.post('/guest-register', validateGuestRegistration, handleValidationErrors, registerGuest);
router.post('/login', validateLogin, handleValidationErrors, login);

// Profile Management
router.get('/profile', authenticateToken, getProfile); 
router.put('/profile', authenticateToken, validateProfileUpdate, handleValidationErrors, updateProfile);

// Emergency Information
router.put('/emergency-contacts', authenticateToken, validateEmergencyContacts, handleValidationErrors, updateEmergencyContacts);
router.put('/medical-info', authenticateToken, updateMedicalInfo);

// Emergency Responder Endpoints
router.get('/users/location', authenticateToken, validateLocationQuery, handleValidationErrors, getUsersByLocation);
router.get('/users/special-needs', authenticateToken, getUsersWithSpecialNeeds);

module.exports = router;