const express = require('express');
const { 
  getEmergencyContacts, 
  updateEmergencyContacts, 
  logEmergencyCall,
  getEmergencyServices,
  // NEW: Medical emergency features
  getUserMedicalInfo,
  triggerMedicalAlert
} = require('../controllers/emergencyController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Existing routes 
router.get('/contacts', authenticateToken, getEmergencyContacts);
router.put('/contacts', authenticateToken, updateEmergencyContacts);
router.post('/call/log', authenticateToken, logEmergencyCall);
router.get('/services', getEmergencyServices);

// NEW: Medical emergency routes
router.get('/medical-info', authenticateToken, getUserMedicalInfo);
router.post('/medical-alert', authenticateToken, triggerMedicalAlert);

module.exports = router;