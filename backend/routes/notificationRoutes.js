const express = require('express');
const { 
  getNotifications, 
  createNotification, 
  markAsRead,
  getUrgentAlerts 
} = require('../controllers/notificationController');
const { authenticateToken, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authenticateToken, getNotifications);
router.get('/urgent', authenticateToken, getUrgentAlerts);
router.post('/', authenticateToken, authorize(['Government', 'Relief_Staff']), createNotification);
router.put('/:id/read', authenticateToken, markAsRead);

module.exports = router;