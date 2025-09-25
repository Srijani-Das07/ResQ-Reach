const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const rateLimit = require('express-rate-limit');
const config = require('./config/env');
const errorHandler = require('./middleware/errorHandler');
const { handleOfflineSync, addSyncMetadata } = require('./middleware/offlineSyncMiddleware');
const pushService = require('./services/pushService');
const jwt = require('jsonwebtoken'); // <-- ADD THIS LINE

// Import routes
const authRoutes = require('./routes/authRoutes');
// ... other routes

const app = express();
const server = http.createServer(app);

// WebSocket server for real-time notifications
const wss = new WebSocket.Server({ server, path: '/ws' });

// SECURE WEBSOCKET CONNECTION HANDLING WITH JWT AUTHENTICATION
wss.on('connection', (ws, req) => {
  console.log('New WebSocket connection opened.');
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      // Expect an 'auth' message containing the user's JWT
      if (data.type === 'auth' && data.token) {
        
        // Use the same logic as your authMiddleware to verify the token
        try {
          // 1. Verify the token using your secret key
          const decoded = jwt.verify(data.token, process.env.JWT_SECRET);
          
          // 2. Extract the userId from the DECODED token, not from client input
          // Note: Ensure your JWT payload contains the user ID as 'id' or adjust accordingly.
          const userId = decoded.id; 
          
          if (!userId) {
              throw new Error('Token payload is missing user ID.');
          }
          
          // 3. Register the connection with the VERIFIED userId
          pushService.registerConnection(userId, ws);
          
          console.log(`WebSocket authenticated for user: ${userId}`);
          ws.send(JSON.stringify({
            type: 'auth_success',
            message: 'Connection registered for notifications'
          }));

        } catch (err) {
          // This will catch errors from jwt.verify (e.g., invalid signature, expired token)
          console.error('WebSocket authentication error:', err.message);
          ws.send(JSON.stringify({ type: 'auth_failed', message: 'Invalid or expired token.' }));
          ws.close(); // IMPORTANT: Close unauthenticated connections
        }
      }
      
    } catch (error) {
      // This will catch errors from JSON.parse
      console.error('WebSocket message parsing error:', error);
    }
  });
  
  ws.on('close', () => {
    console.log('WebSocket connection closed');
    // The pushService should handle cleanup internally
  });
});

// Middleware
app.use(cors({
  origin: config.corsOrigin,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  skip: (req) => {
    // Skip rate limiting for emergency endpoints
    return req.path.includes('/emergency/');
  }
});
app.use('/api', limiter);

// Offline sync middleware
app.use('/api', handleOfflineSync);
app.use('/api', addSyncMetadata);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/centers', reliefRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/emergency', emergencyRoutes);

// Health check with connectivity status
app.get('/api/health', async (req, res) => {
  const syncService = require('./services/syncService');
  const isOnline = await syncService.checkConnectivity();
  
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    services: {
      database: 'connected',
      connectivity: isOnline ? 'online' : 'offline',
      websocket: wss.clients.size + ' connections'
    }
  });
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = { app, server, wss };