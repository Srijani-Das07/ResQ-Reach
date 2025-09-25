const express = require('express');
const { 
  getReliefCenters, 
  getReliefCenter, 
  createReliefCenter, 
  updateReliefCenterResources,
  getCentersForCache,
  // NEW: Emergency-specific endpoints
  getCentersByLocation,
  getCentersWithMedicalFacilities,
  assignUserToCenter 
} = require('../controllers/reliefController');
const { bulkSyncCenters } = require('../services/syncService');
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const { validateLocationQuery } = require('../middleware/validationMiddleware');

const router = express.Router();

// Existing routes 
router.get('/', getReliefCenters);
router.get('/cache', authenticateToken, getCentersForCache);
router.get('/:id', getReliefCenter);
router.post('/', authenticateToken, authorize(['Government', 'Relief_Staff']), createReliefCenter);
router.put('/:id/resources', authenticateToken, authorize(['Government', 'Relief_Staff']), updateReliefCenterResources);
router.post('/sync', authenticateToken, authorize(['Government', 'Relief_Staff']), bulkSyncCenters);

// NEW: Emergency integration routes
router.get('/location/:district/:state', validateLocationQuery, getCentersByLocation);
router.get('/medical-facilities', getCentersWithMedicalFacilities);
router.post('/:id/assign-user', authenticateToken, authorize(['Government', 'Relief_Staff']), assignUserToCenter);

module.exports = router;