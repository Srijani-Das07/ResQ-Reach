// server.js - Main Express server
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const http = require('http');
require('dotenv').config();

// Import config & services
const connectDB = require('./config/db');
const config = require('./config/env');
const syncService = require('./services/syncService');

// Import routes
const languageRoutes = require('./routes/languageRoutes');
const videoRoutes = require('./routes/videoRoutes');
const syncRoutes = require('./routes/syncRoutes');

// Initialize app
const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Connect to MongoDB
connectDB()
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/languages', languageRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/sync', syncRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('⚠️ Error:', err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    timestamp: new Date().toISOString(),
  });
});

// Start periodic sync service
syncService.startPeriodicSync();

// Start server
server.listen(config.port, () => {
  console.log(`🚀 Emergency Relief Backend running on port ${config.port}`);
  console.log(`📱 Offline-first features enabled`);
  console.log(`🔔 WebSocket notifications enabled (hook ready)`);
  console.log(`📞 Emergency calling system active`);
  console.log(`🔄 Sync service started`);
  console.log(`🔧 Environment: ${config.nodeEnv}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log('❌ Unhandled rejection at:', promise, 'reason:', err.message);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = { app, server };
