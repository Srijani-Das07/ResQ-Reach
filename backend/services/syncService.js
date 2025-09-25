const ReliefCenter = require('../models/ReliefCenter');
const Notification = require('../models/Notification');
const User = require('../models/User');
const SyncLog = require('../models/SyncLog');
const syncConfig = require('../config/syncConfig');

class SyncService {
  constructor() {
    this.isOnline = true;
    this.syncQueue = [];
    this.conflictResolutionStrategies = {
      'latest_wins': this.latestWinsResolution,
      'server_wins': this.serverWinsResolution,
      'manual': this.manualResolution
    };
  }

  // Check connectivity status
  checkConnectivity() {
    // In a real implementation, this would ping the database or external service
    return new Promise((resolve) => {
      const start = Date.now();
      
      // Simple connectivity check - attempt to resolve DNS
      require('dns').resolve('www.google.com', (err) => {
        const duration = Date.now() - start;
        const isOnline = !err && duration < 5000; // 5 second timeout
        
        this.isOnline = isOnline;
        resolve(isOnline);
      });
    });
  }

  // Sync queued updates when connectivity is restored
  async syncQueuedUpdates(userId) {
    try {
      console.log('Starting sync for user:', userId);
      
      // Get all unsynced updates for this user
      const unsyncedLogs = await SyncLog.find({
        userId,
        synced: { $ne: true }
      }).sort({ timestamp: 1 });

      if (unsyncedLogs.length === 0) {
        return { success: true, synced: 0, conflicts: 0 };
      }

      const results = {
        synced: 0,
        conflicts: 0,
        errors: 0
      };

      // Process updates in batches
      const batchSize = syncConfig.batchSize;
      
      for (let i = 0; i < unsyncedLogs.length; i += batchSize) {
        const batch = unsyncedLogs.slice(i, i + batchSize);
        
        for (const log of batch) {
          try {
            const result = await this.syncSingleUpdate(log);
            
            if (result.success) {
              log.synced = true;
              log.syncedAt = new Date();
              await log.save();
              results.synced++;
            } else if (result.conflict) {
              results.conflicts++;
              log.conflictData = result.conflictData;
              await log.save();
            } else {
              results.errors++;
            }
            
          } catch (error) {
            console.error('Error syncing update:', error);
            results.errors++;
          }
        }
      }

      return results;

    } catch (error) {
      console.error('Sync queued updates error:', error);
      return { success: false, error: error.message };
    }
  }

  // Sync a single update with conflict resolution
  async syncSingleUpdate(syncLog) {
    try {
      const { entityType, entityId, action, changes } = syncLog;

      switch (entityType) {
        case 'reliefCenter':
          return await this.syncReliefCenterUpdate(entityId, action, changes, syncLog);
        case 'notification':
          return await this.syncNotificationUpdate(entityId, action, changes, syncLog);
        case 'user':
          return await this.syncUserUpdate(entityId, action, changes, syncLog);
        default:
          throw new Error(`Unknown entity type: ${entityType}`);
      }

    } catch (error) {
      console.error('Sync single update error:', error);
      return { success: false, error: error.message };
    }
  }

  // Sync relief center updates
  async syncReliefCenterUpdate(centerId, action, changes, syncLog) {
    try {
      const center = await ReliefCenter.findById(centerId);
      
      if (!center) {
        return { success: false, error: 'Relief center not found' };
      }

      // Check for conflicts
      const serverTimestamp = new Date(center.lastSyncTimestamp);
      const clientTimestamp = new Date(syncLog.timestamp);

      if (serverTimestamp > clientTimestamp) {
        // Conflict detected - use configured resolution strategy
        const strategy = syncConfig.conflictResolutionStrategy;
        return await this.resolveConflict(strategy, center, changes, syncLog);
      }

      // No conflict - apply changes
      if (action === 'update' && changes.resourceType) {
        center.resources[changes.resourceType] = {
          ...center.resources[changes.resourceType],
          ...changes.newValue,
          lastUpdated: new Date(),
          updatedBy: syncLog.userId
        };
      }

      center.lastSyncTimestamp = new Date();
      center.syncVersion += 1;
      
      await center.save();

      return { success: true };

    } catch (error) {
      console.error('Sync relief center update error:', error);
      return { success: false, error: error.message };
    }
  }

  // Conflict resolution strategies
  async resolveConflict(strategy, serverEntity, clientChanges, syncLog) {
    const resolver = this.conflictResolutionStrategies[strategy];
    
    if (!resolver) {
      throw new Error(`Unknown conflict resolution strategy: ${strategy}`);
    }

    return await resolver.call(this, serverEntity, clientChanges, syncLog);
  }

  // Latest timestamp wins resolution
  async latestWinsResolution(serverEntity, clientChanges, syncLog) {
    // Server data is newer, keep it
    return {
      success: false,
      conflict: true,
      conflictData: {
        resolution: 'server_wins',
        serverData: serverEntity,
        clientData: clientChanges,
        message: 'Server data is more recent'
      }
    };
  }

  // Server always wins resolution
  async serverWinsResolution(serverEntity, clientChanges, syncLog) {
    return {
      success: false,
      conflict: true,
      conflictData: {
        resolution: 'server_wins',
        message: 'Server data preserved'
      }
    };
  }

  // Manual resolution (requires user intervention)
  async manualResolution(serverEntity, clientChanges, syncLog) {
    return {
      success: false,
      conflict: true,
      conflictData: {
        resolution: 'manual',
        serverData: serverEntity,
        clientData: clientChanges,
        message: 'Manual resolution required',
        syncLogId: syncLog._id
      }
    };
  }

  // Sync translations and videos (Part 1 & 2 integration)
  async syncContent(lastSyncTimestamp) {
    try {
      const results = {
        translations: [],
        videos: [],
        notifications: []
      };

      // Sync notifications
      const query = lastSyncTimestamp ? 
        { updatedAt: { $gt: new Date(lastSyncTimestamp) } } : {};

      const notifications = await Notification.find({
        ...query,
        isActive: true
      }).limit(20);

      results.notifications = notifications;

      return {
        success: true,
        data: results,
        syncTimestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Sync content error:', error);
      return { success: false, error: error.message };
    }
  }

  // Handle offline queue for emergency calls
  async queueEmergencyCall(callData) {
    try {
      const queueItem = {
        type: 'emergency_call',
        data: callData,
        timestamp: new Date(),
        priority: 'critical',
        retries: 0,
        maxRetries: 3
      };

      this.syncQueue.unshift(queueItem); // Add to front of queue (high priority)
      
      // If online, try to process immediately
      if (this.isOnline) {
        await this.processEmergencyQueue();
      }

      return { success: true, queued: true };

    } catch (error) {
      console.error('Queue emergency call error:', error);
      return { success: false, error: error.message };
    }
  }

  // Process emergency call queue
  async processEmergencyQueue() {
    const emergencyItems = this.syncQueue.filter(item => 
      item.type === 'emergency_call' && item.retries < item.maxRetries
    );

    for (const item of emergencyItems) {
      try {
        // Process emergency call (would integrate with Twilio service)
        console.log('Processing emergency call:', item.data);
        
        // Remove from queue on success
        const index = this.syncQueue.indexOf(item);
        if (index > -1) {
          this.syncQueue.splice(index, 1);
        }

      } catch (error) {
        console.error('Process emergency call error:', error);
        item.retries++;
        item.lastError = error.message;
      }
    }
  }

  // Start periodic sync
  startPeriodicSync(intervalMs = syncConfig.syncIntervalMs) {
    setInterval(async () => {
      const isOnline = await this.checkConnectivity();
      
      if (isOnline && this.syncQueue.length > 0) {
        console.log('Processing sync queue...');
        await this.processEmergencyQueue();
      }
    }, intervalMs);
  }
}

// Export singleton instance
module.exports = new SyncService();