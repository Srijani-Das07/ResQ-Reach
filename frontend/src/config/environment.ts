// Environment configuration for API endpoints and settings

import { getEnvVar } from '../utils/envUtils';

export const config = {
  // Backend API configuration - offline-first mode
  api: {
    baseUrl: 'offline-mode',
    timeout: 0,
    retryAttempts: 0,
    // Offline-first configuration - no external backends
    externalBackendUrl: '',
    productionBackendUrl: '',
    backendType: 'offline',
  },
  
  // Authentication settings
  auth: {
    tokenKey: 'authToken',
    userKey: 'user',
  },
  
  // Map settings
  map: {
    defaultCenter: {
      lat: 12.9716,
      lng: 77.5946
    },
    defaultZoom: 12,
    searchRadius: 50, // kilometers
  },
  
  // Emergency settings
  emergency: {
    defaultContactNumber: '8838724140',
    buzzerDuration: 30000, // 30 seconds
  },
  
  // Language settings
  languages: {
    default: 'en',
    supported: [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
      { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
      { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
      { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
      { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
      { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
      { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
      { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া' },
      { code: 'mr', name: 'Marathi', nativeName: 'मराठी' }
    ]
  },
  
  // Development settings
  development: {
    enableMockData: true,
    enableLogging: true,
    mockOtp: '123456',
  }
};