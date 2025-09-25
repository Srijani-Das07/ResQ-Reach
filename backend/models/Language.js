// models/Video.js - Video schema with translations
const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['medical', 'emergency'],
    lowercase: true
  },
  priority: {
    type: String,
    required: true,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  urls: {
    type: Map,
    of: String,
    required: true,
    validate: {
      validator: function(urls) {
        return urls.size > 0;
      },
      message: 'At least one URL must be provided'
    }
  },
  duration: {
    type: String,
    required: true,
    match: /^\d{1,2}:\d{2}$/
  },
  fileSize: {
    type: Number, // in MB
    required: true,
    min: 0
  },
  thumbnailUrl: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Thumbnail URL must be a valid HTTP/HTTPS URL'
    }
  },
  tags: {
    type: [String],
    default: []
  },
  ndmaGuidelines: {
    type: String, // Reference to NDMA guidelines URL
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'NDMA Guidelines must be a valid URL'
    }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  downloadCount: {
    type: Number,
    default: 0,
    min: 0
  },
  translations: {
    type: Map,
    of: {
      title: {
        type: String,
        required: true,
        trim: true
      },
      description: {
        type: String,
        required: true,
        trim: true
      },
      keywords: {
        type: [String],
        default: []
      }
    },
    validate: {
      validator: function(translations) {
        return translations.has('en'); // English translation is required
      },
      message: 'English translation is required'
    }
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
videoSchema.index({ category: 1, priority: 1 });
videoSchema.index({ isActive: 1, lastUpdated: -1 });
videoSchema.index({ 'translations.en.title': 'text', 'translations.en.description': 'text' });

// Middleware to update lastUpdated on save
videoSchema.pre('save', function(next) {
  if (this.isModified() && !this.isModified('downloadCount')) {
    this.lastUpdated = new Date();
  }
  next();
});

// Instance method to get translation
videoSchema.methods.getTranslation = function(languageCode = 'en') {
  return this.translations.get(languageCode) || this.translations.get('en');
};

// Static method to get videos by category
videoSchema.statics.getByCategory = function(category, language = 'en') {
  return this.find({ category, isActive: true })
    .sort({ priority: 1, createdAt: -1 });
};

module.exports = mongoose.model('Video', videoSchema);