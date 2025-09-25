const syncService = require('../services/syncService');
const SyncLog = require('../models/SyncLog');

// Middleware to handle offline sync requests
const handleOfflineSync = async (req, res, next) => {
  try {
    // Check if this is an offline sync request
    if (req.headers['x-offline-sync'] === 'true') {
      const { offlineUpdates } = req.body;
      
      if (offlineUpdates && Array.isArray(offlineUpdates)) {
        // Process offline updates
        for (const update of offlineUpdates) {
          await new SyncLog({
            userId: req.user._id,
            entityType: update.entityType,
            entityId: update.entityId,
            action: update.action,
            changes: update.changes,
            timestamp: new Date(update.timestamp),
            synced: false
          }).save();
        }

        // Trigger sync process
        const syncResult = await syncService.syncQueuedUpdates(req.user._id);
        
        req.syncResult = syncResult;
      }
    }

    next();
  } catch (error) {
    console.error('Offline sync middleware error:', error);
    next(error);
  }
};

// Middleware to add sync metadata to responses
const addSyncMetadata = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    if (typeof data === 'string') {
      try {
        const jsonData = JSON.parse(data);
        jsonData.syncMetadata = {
          timestamp: new Date().toISOString(),
          isOnline: syncService.isOnline,
          syncResult: req.syncResult || null
        };
        data = JSON.stringify(jsonData);
      } catch (e) {
        // Not JSON, send as is
      }
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

module.exports = {
  handleOfflineSync,
  addSyncMetadata
};