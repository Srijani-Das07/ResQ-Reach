require('dotenv').config();

const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/emergency_relief',
  jwtSecret: process.env.JWT_SECRET || 'emergency_relief_secret',
  jwtExpire: process.env.JWT_EXPIRE || '24h',
  corsOrigin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000'],
  
  // Rate limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  
  // Sync configuration
  syncIntervalMs: parseInt(process.env.SYNC_INTERVAL_MS) || 5 * 60 * 1000,
  maxOfflineDays: parseInt(process.env.MAX_OFFLINE_DAYS) || 7,
  cacheTtlHours: parseInt(process.env.CACHE_TTL_HOURS) || 24,

  // Twilio configuration for emergency calls
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
  twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER,
  
  // WebSocket configuration for real-time notifications
  websocketPort: process.env.WEBSOCKET_PORT || 3001,
  
  // Push notification configuration
  firebaseServerKey: process.env.FIREBASE_SERVER_KEY,
  
  // Emergency services configuration
  defaultEmergencyNumbers: {
    police: process.env.POLICE_NUMBER || '100',
    fire: process.env.FIRE_NUMBER || '101',
    ambulance: process.env.AMBULANCE_NUMBER || '102',
    disaster: process.env.DISASTER_NUMBER || '108'
  },
  
  // Buzzer and notification settings
  buzzer: {
    defaultDuration: parseInt(process.env.BUZZER_DURATION) || 5000,
    maxDuration: parseInt(process.env.BUZZER_MAX_DURATION) || 30000,
    vibrationEnabled: process.env.VIBRATION_ENABLED !== 'false',
    soundEnabled: process.env.SOUND_ENABLED !== 'false'
  }
};

module.exports = config;