const mongoose = require('mongoose');

const reliefCenterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: {
    address: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    district: { type: String, required: true },
    state: { type: String, required: true }
  },
  capacity: {
    total: { type: Number, required: true },
    occupied: { type: Number, default: 0 },
    available: { type: Number }
  },
  resources: {
    food: {
      available: { type: Number, default: 0 },
      lastUpdated: { type: Date, default: Date.now },
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    },
    water: {
      available: { type: Number, default: 0 },
      lastUpdated: { type: Date, default: Date.now },
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    },
    medical: {
      available: { type: Boolean, default: false },
      supplies: { type: String, default: '' },
      lastUpdated: { type: Date, default: Date.now },
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    },
    shelter: {
      tents: { type: Number, default: 0 },
      blankets: { type: Number, default: 0 },
      lastUpdated: { type: Date, default: Date.now },
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }
  },
  contact: {
    phone: { type: String, required: true },
    inCharge: { type: String, required: true },
    emergencyContact: { type: String }
  },
  status: { 
    type: String, 
    enum: ['Active', 'Full', 'Inactive', 'Emergency'], 
    default: 'Active' 
  },
  lastSyncTimestamp: { type: Date, default: Date.now },
  syncVersion: { type: Number, default: 1 },
  pendingUpdates: [{
    field: String,
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
    timestamp: { type: Date, default: Date.now },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    synced: { type: Boolean, default: false }
  }]
}, {
  timestamps: true
});

// Calculate available capacity before saving
reliefCenterSchema.pre('save', function(next) {
  if (this.capacity) {
    this.capacity.available = this.capacity.total - (this.capacity.occupied || 0);
  }
  next();
});

// Create 2dsphere index for geolocation queries
reliefCenterSchema.index({ "location.coordinates": "2dsphere" });

module.exports = mongoose.model('ReliefCenter', reliefCenterSchema);