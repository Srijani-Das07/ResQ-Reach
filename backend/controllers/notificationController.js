const Notification = require('../models/Notification');
const User = require('../models/User');

// Get notifications for user (with offline support)
const getNotifications = async (req, res) => {
  try {
    const { lastSync, lat, lng, limit = 20 } = req.query;
    
    let query = {
      isActive: true,
      $or: [
        { expiresAt: { $gt: new Date() } },
        { expiresAt: null }
      ],
      $or: [
        { 'targetAudience.roles': req.user.role },
        { 'targetAudience.userIds': req.user._id },
        { 'targetAudience.roles': { $size: 0 } } // Public notifications
      ]
    };

    // Add location filter if provided
    if (lat && lng) {
      query['location.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: 50000 // 50km default radius
        }
      };
    }

    // Add sync filter
    if (lastSync) {
      query.updatedAt = { $gt: new Date(lastSync) };
    }

    const notifications = await Notification.find(query)
      .populate('createdBy', 'name role')
      .sort({ priority: -1, createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      notifications,
      syncTimestamp: new Date().toISOString(),
      hasMore: notifications.length === parseInt(limit)
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Server error fetching notifications' });
  }
};

// Create new notification (Government/Relief Staff only)
const createNotification = async (req, res) => {
  try {
    const notificationData = {
      ...req.body,
      createdBy: req.user._id
    };

    const notification = new Notification(notificationData);
    await notification.save();

    // If this is a critical notification, trigger immediate push
    if (notification.priority === 'Critical') {
      // Trigger push notification service
      // This would integrate with Firebase/WebSocket service
      console.log('Triggering critical notification push:', notification._id);
    }

    res.status(201).json(notification);
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ error: 'Server error creating notification' });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    // Check if user already marked as read
    const alreadyRead = notification.readBy.find(
      r => r.userId.toString() === req.user._id.toString()
    );

    if (!alreadyRead) {
      notification.readBy.push({
        userId: req.user._id,
        readAt: new Date()
      });
      notification.deliveryStatus.read += 1;
      await notification.save();
    }

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Server error marking notification as read' });
  }
};

// Get urgent alerts for offline caching
const getUrgentAlerts = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    
    let query = {
      isActive: true,
      priority: { $in: ['High', 'Critical'] },
      $or: [
        { expiresAt: { $gt: new Date() } },
        { expiresAt: null }
      ]
    };

    // Add location filter if provided
    if (lat && lng) {
      query['location.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: 100000 // 100km for urgent alerts
        }
      };
    }

    const alerts = await Notification.find(query)
      .select('title message type priority buzzer location createdAt')
      .sort({ priority: -1, createdAt: -1 })
      .limit(10);

    res.json({
      alerts,
      cacheTimestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get urgent alerts error:', error);
    res.status(500).json({ error: 'Server error fetching urgent alerts' });
  }
};

module.exports = {
  getNotifications,
  createNotification,
  markAsRead,
  getUrgentAlerts
};