const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, sparse: true },
  phone: { type: String, unique: true, sparse: true },
  name: { type: String, required: true },
  middleName: { type: String },
  dateOfBirth: { type: Date },
  age: { type: Number },
  role: { 
    type: String, 
    enum: ['Public', 'Government', 'Relief_Staff'], 
    default: 'Public' 
  },
  password: { type: String },
  isGuest: { type: Boolean, default: false },
  guestId: { type: String, unique: true, sparse: true },
  lastSyncTimestamp: { type: Date, default: Date.now },

  // ✅ Location Information
  location: {
    village_city: { type: String },
    district: { type: String },
    state: { type: String },
    pincode: { type: String }
  },

  // ✅ Medical Information
  medicalInfo: {
    disabilities: {
      visualImpairment: { type: Boolean, default: false },
      hearingImpairment: { type: Boolean, default: false },
      physicalDisability: { type: Boolean, default: false },
      speechImpairment: { type: Boolean, default: false },
      cognitiveDisability: { type: Boolean, default: false },
      multipleDisabilities: { type: Boolean, default: false }
    },
    pregnancyNursingStatus: { type: Boolean, default: false },
    chronicHealthConditions: { type: String }
  },

  // ✅ Emergency Contacts
  emergencyContacts: {
    primary: {
      name: { type: String },
      phone: { type: String },
      relationship: { type: String }
    },
    secondary: {
      name: { type: String },
      phone: { type: String },
      relationship: { type: String }
    },
    medical: {
      name: { type: String },
      phone: { type: String },
      hospital: { type: String }
    }
  },
  permissions: {
    canUpdateCamps: { type: Boolean, default: false },
    canViewAnalytics: { type: Boolean, default: false },
    canManageAlerts: { type: Boolean, default: false }
  },
  offlineData: {
    cachedCamps: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ReliefCenter' }],
    lastOfflineAccess: { type: Date, default: Date.now }
  }
}, {
  timestamps: true
});

// Calculate age automatically from date of birth
userSchema.pre('save', function(next) {
  if (this.dateOfBirth && (!this.age || this.isModified('dateOfBirth'))) {
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    this.age = age;
  }
  
  next();
});

// Set permissions based on role
userSchema.pre('save', function(next) {
  if (this.isModified('role')) {
    switch (this.role) {
      case 'Relief_Staff':
        this.permissions.canUpdateCamps = true;
        break;
      case 'Government':
        this.permissions.canUpdateCamps = true;
        this.permissions.canViewAnalytics = true;
        this.permissions.canManageAlerts = true;
        break;
      default:
        // Public user - no special permissions
        break;
    }
  }
  next();
});

module.exports = mongoose.model('User', userSchema);