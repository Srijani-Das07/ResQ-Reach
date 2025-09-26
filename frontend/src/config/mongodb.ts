// MongoDB configuration for disaster management system

import { getEnvVar } from '../utils/envUtils';

export const mongoConfig = {
  // MongoDB connection settings
  connection: {
    uri: getEnvVar('MONGODB_URI') || 'mongodb://localhost:27017/disaster-management',
    dbName: getEnvVar('MONGODB_DB_NAME') || 'disaster-management',
    options: {
      retryWrites: true,
      w: 'majority',
      authSource: 'admin',
    }
  },
  
  // Collection names
  collections: {
    users: 'users',
    rescueCenters: 'rescueCenters',
    guests: 'guests',
    governmentUsers: 'governmentUsers',
    rescueCenterUsers: 'rescueCenterUsers',
    auditLogs: 'auditLogs',
    notifications: 'notifications',
  },
  
  // Connection settings
  settings: {
    connectionTimeout: 30000, // 30 seconds
    retryAttempts: 3,
    poolSize: 10,
    ssl: getEnvVar('MONGODB_SSL') === 'true',
  },
  
  // Indexes to be created
  indexes: [
    // Users
    { collection: 'users', index: { email: 1 }, unique: true },
    { collection: 'users', index: { role: 1 } },
    
    // Rescue Centers
    { collection: 'rescueCenters', index: { location: '2dsphere' } },
    { collection: 'rescueCenters', index: { status: 1 } },
    { collection: 'rescueCenters', index: { 'lat': 1, 'lng': 1 } },
    
    // Guests
    { collection: 'guests', index: { centerId: 1 } },
    { collection: 'guests', index: { mobilePhone: 1 } },
    { collection: 'guests', index: { firstName: 'text', lastName: 'text' } },
    
    // Government Users
    { collection: 'governmentUsers', index: { employeeId: 1 }, unique: true },
    
    // Rescue Center Users  
    { collection: 'rescueCenterUsers', index: { centerId: 1 }, unique: true },
    
    // Audit Logs
    { collection: 'auditLogs', index: { userId: 1, timestamp: -1 } },
    { collection: 'auditLogs', index: { action: 1, timestamp: -1 } },
  ]
};

// Data validation schemas
export const mongoSchemas = {
  user: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "role", "createdAt"],
      properties: {
        _id: { bsonType: "objectId" },
        email: { bsonType: "string" },
        firstName: { bsonType: "string" },
        lastName: { bsonType: "string" },
        role: { enum: ["citizen", "government", "rescue-center"] },
        employeeId: { bsonType: "string" },
        centerId: { bsonType: "string" },
        profile: { bsonType: "object" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  },
  
  rescueCenter: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "lat", "lng", "totalCapacity", "createdAt"],
      properties: {
        _id: { bsonType: "objectId" },
        name: { bsonType: "string" },
        lat: { bsonType: "double" },
        lng: { bsonType: "double" },
        totalCapacity: { bsonType: "int", minimum: 1 },
        currentGuests: { bsonType: "int", minimum: 0 },
        availableCapacity: { bsonType: "int", minimum: 0 },
        waterLevel: { bsonType: "int", minimum: 0, maximum: 100 },
        foodLevel: { bsonType: "int", minimum: 0, maximum: 100 },
        phone: { bsonType: "string" },
        address: { bsonType: "string" },
        facilities: { bsonType: "array", items: { bsonType: "string" } },
        status: { enum: ["active", "inactive", "full", "maintenance"] },
        lastUpdated: { bsonType: "date" },
        emergencyContacts: { bsonType: "object" },
        supplies: { bsonType: "object" },
        staffCount: { bsonType: "int", minimum: 0 },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  },
  
  guest: {
    $jsonSchema: {
      bsonType: "object",
      required: ["firstName", "lastName", "mobilePhone", "centerId", "createdAt"],
      properties: {
        _id: { bsonType: "objectId" },
        firstName: { bsonType: "string" },
        middleName: { bsonType: "string" },
        lastName: { bsonType: "string" },
        gender: { bsonType: "string" },
        dateOfBirth: { bsonType: "date" },
        age: { bsonType: "string" },
        mobilePhone: { bsonType: "string" },
        alternateMobile: { bsonType: "string" },
        email: { bsonType: "string" },
        permanentAddress: { bsonType: "string" },
        familyMembers: { bsonType: "string" },
        emergencyContactName: { bsonType: "string" },
        emergencyContactPhone: { bsonType: "string" },
        emergencyContactRelation: { bsonType: "string" },
        dependents: { bsonType: "string" },
        medicalConditions: { bsonType: "string" },
        currentMedications: { bsonType: "string" },
        allergies: { bsonType: "string" },
        disabilityStatus: { bsonType: "string" },
        specialNeeds: { bsonType: "string" },
        centerId: { bsonType: "string" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
};