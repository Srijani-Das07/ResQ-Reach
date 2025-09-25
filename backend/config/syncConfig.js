const syncConfig = {
  batchSize: 50,
  maxRetries: 3,
  retryDelayMs: 1000,
  conflictResolutionStrategy: 'latest_wins', // 'latest_wins', 'manual', 'server_wins'
  syncIntervalMs: 5 * 60 * 1000, // 5 minutes
  maxOfflineQueueSize: 1000,
  timestamps: {
    format: 'ISO',
    field: 'lastSyncTimestamp'
  }
};

module.exports = syncConfig;