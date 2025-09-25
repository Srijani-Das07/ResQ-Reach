const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['Emergency', 'Warning', 'Info', 'Alert'], 
    default: 'Info' 
  },
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Critical'], 
    default: 'Medium' 
  },
  location: {
    area: String,
    district: String,
    state: String,
    coordinates: {
      lat: Number,
      lng: Number
    },
    radius: { type: Number, default: 10 } // km radius
  },
  targetAudience: {
    roles: [{ type: String, enum: ['Public', 'Government', 'Relief_Staff'] }],
    userIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  buzzer: {
    enabled: { type: Boolean, default: true },
    vibration: { type: Boolean, default: true },
    sound: { type: Boolean, default: true },
    duration: { type: Number, default: 5000 }, // milliseconds
    pattern: { type: String, default: 'emergency' } // emergency, warning, info
  },
  expiresAt: { type: Date },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  readBy: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    readAt: { type: Date, default: Date.now }
  }],
  deliveryStatus: {
    sent: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 },
    read: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Index for geolocation-based queries
notificationSchema.index({ "location.coordinates": "2dsphere" });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ type: 1, priority: -1 });

module.exports = mongoose.model('Notification', notificationSchema);