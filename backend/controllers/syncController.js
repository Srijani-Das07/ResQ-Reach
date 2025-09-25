// controllers/syncController.js - Sync functionality
const Video = require('../models/Video');
const Language = require('../models/Language');

const syncController = {
  // Get sync data - videos updated since last sync
  getSyncData: async (req, res) => {
    try {
      const { 
        lastSync, 
        language = 'en',
        categories = 'medical,emergency',
        deviceId,
        appVersion
      } = req.query;

      const categoriesArray = categories.split(',').map(cat => cat.trim().toLowerCase());
      const filter = { 
        isActive: true,
        category: { $in: categoriesArray }
      };

      // If lastSync is provided, only get updated videos
      if (lastSync) {
        try {
          const lastSyncDate = new Date(lastSync);
          if (isNaN(lastSyncDate.getTime())) {
            return res.status(400).json({
              success: false,
              error: 'Invalid lastSync date format',
              message: 'lastSync must be a valid ISO date string'
            });
          }
          filter.lastUpdated = { $gt: lastSyncDate };
        } catch (error) {
          return res.status(400).json({
            success: false,
            error: 'Invalid lastSync parameter',
            message: error.message
          });
        }
      }

      const [videos, languageData] = await Promise.all([
        Video.find(filter).sort({ priority: 1, category: 1 }),
        Language.findOne({ code: language, isActive: true })
      ]);

      const syncData = {
        videos: videos.map(video => {
          const translation = video.getTranslation(language);
          return {
            id: video.id,
            category: video.category,
            priority: video.priority,
            title: translation?.title || video.id,
            description: translation?.description || 'No description available',
            keywords: translation?.keywords || [],
            url: video.urls.get('youtube') || video.urls.get('default') || [...video.urls.values()][0],
            duration: video.duration,
            fileSize: video.fileSize,
            thumbnailUrl: video.thumbnailUrl,
            tags: video.tags,
            ndmaGuidelines: video.ndmaGuidelines,
            lastUpdated: video.lastUpdated
          };
        }),
        language: languageData ? {
          code: languageData.code,
          name: languageData.name,
          nativeName: languageData.nativeName,
          rtl: languageData.rtl,
          ui: languageData.getUITranslations()
        } : null,
        metadata: {
          syncTimestamp: new Date().toISOString(),
          hasUpdates: videos.length > 0,
          updateCount: videos.length,
          requestedLanguage: language,
          requestedCategories: categoriesArray,
          deviceId: deviceId || 'unknown',
          appVersion: appVersion || 'unknown'
        }
      };

      // Log sync request for analytics
      console.log(`Sync request: ${deviceId || 'unknown'} - ${videos.length} updates`);

      res.json({
        success: true,
        data: syncData,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Get sync data error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get sync data',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  },

  // Record successful sync from client
  recordSync: async (req, res) => {
    try {
      const { 
        deviceId, 
        syncedVideos = [], 
        language,
        appVersion,
        syncDuration,
        errors = []
      } = req.body;

      // Validate required fields
      if (!deviceId) {
        return res.status(400).json({
          success: false,
          error: 'Device ID is required'
        });
      }

      // In a real implementation, you might want to save this to a SyncLog collection
      const syncRecord = {
        deviceId,
        syncedVideoCount: syncedVideos.length,
        syncedVideoIds: syncedVideos,
        language: language || 'en',
        appVersion: appVersion || 'unknown',
        syncDuration: syncDuration || 0,
        errors: errors,
        timestamp: new Date(),
        success: errors.length === 0
      };

      // Log sync for analytics and monitoring
      console.log('Sync completed:', {
        deviceId: syncRecord.deviceId,
        videoCount: syncRecord.syncedVideoCount,
        duration: syncRecord.syncDuration,
        hasErrors: syncRecord.errors.length > 0,
        language: syncRecord.language
      });

      // Generate unique sync ID for tracking
      const syncId = `sync_${Date.now()}_${deviceId.replace(/[^a-zA-Z0-9]/g, '').substring(0, 8)}`;

      res.json({
        success: true,
        message: 'Sync recorded successfully',
        data: {
          syncId,
          recordedAt: syncRecord.timestamp,
          videosSynced: syncRecord.syncedVideoCount,
          hasErrors: syncRecord.errors.length > 0
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Record sync error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to record sync',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  },

  // Get sync statistics (for admin/monitoring)
  getSyncStats: async (req, res) => {
    try {
      const { 
        days = 7,
        deviceId 
      } = req.query;

      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - parseInt(days));

      // In a real implementation, you'd query from a SyncLog collection
      // For now, we'll return basic video statistics
      const videoStats = await Video.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            totalDownloads: { $sum: '$downloadCount' },
            avgFileSize: { $avg: '$fileSize' }
          }
        }
      ]);

      const stats = {
        period: `Last ${days} days`,
        videoStatsByCategory: videoStats.map(stat => ({
          category: stat._id,
          videoCount: stat.count,
          totalDownloads: stat.totalDownloads,
          avgFileSize: Math.round(stat.avgFileSize * 100) / 100
        })),
        summary: {
          totalVideos: await Video.countDocuments({ isActive: true }),
          totalDownloads: videoStats.reduce((sum, stat) => sum + stat.totalDownloads, 0),
          lastUpdated: await Video.findOne({ isActive: true }, {}, { sort: { lastUpdated: -1 } })
            .then(video => video?.lastUpdated || null)
        }
      };

      res.json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Get sync stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get sync statistics',
        message: error.message
      });
    }
  },

  // Force sync trigger (admin endpoint)
  forceSyncUpdate: async (req, res) => {
    try {
      const { videoIds, reason } = req.body;

      let filter = { isActive: true };
      if (videoIds && videoIds.length > 0) {
        filter.id = { $in: videoIds };
      }

      // Update lastUpdated timestamp to trigger sync
      const result = await Video.updateMany(
        filter,
        { 
          lastUpdated: new Date(),
          $push: { 
            syncLog: {
              action: 'force_sync',
              reason: reason || 'Manual sync trigger',
              timestamp: new Date()
            }
          }
        }
      );

      res.json({
        success: true,
        message: 'Sync update triggered successfully',
        data: {
          updatedCount: result.modifiedCount,
          reason: reason || 'Manual sync trigger'
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Force sync update error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to trigger sync update',
        message: error.message
      });
    }
  }
};

module.exports = syncController;