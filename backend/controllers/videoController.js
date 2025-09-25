// controllers/videoController.js - Video CRUD operations
const Video = require('../models/Video');

const videoController = {
  // Get all videos with optional filtering
  getAllVideos: async (req, res) => {
    try {
      const { 
        category, 
        priority, 
        language = 'en',
        limit = 50,
        offset = 0,
        search,
        tags
      } = req.query;

      // Build filter object
      const filter = { isActive: true };
      if (category) filter.category = category.toLowerCase();
      if (priority) filter.priority = priority.toLowerCase();
      if (tags) filter.tags = { $in: tags.split(',') };

      // Add search functionality
      let query = Video.find(filter);
      
      if (search) {
        query = query.find({
          $or: [
            { [`translations.${language}.title`]: { $regex: search, $options: 'i' } },
            { [`translations.${language}.description`]: { $regex: search, $options: 'i' } },
            { tags: { $in: [new RegExp(search, 'i')] } }
          ]
        });
      }

      const videos = await query
        .sort({ priority: 1, category: 1, createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(offset));

      const formattedVideos = videos.map(video => {
        const translation = video.getTranslation(language);
        return {
          id: video.id,
          category: video.category,
          priority: video.priority,
          title: translation?.title || `Video ${video.id}`,
          description: translation?.description || 'No description available',
          keywords: translation?.keywords || [],
          url: video.urls.get('youtube') || video.urls.get('default') || [...video.urls.values()][0],
          duration: video.duration,
          fileSize: video.fileSize,
          thumbnailUrl: video.thumbnailUrl,
          tags: video.tags,
          ndmaGuidelines: video.ndmaGuidelines,
          downloadCount: video.downloadCount,
          lastUpdated: video.lastUpdated
        };
      });

      const totalCount = await Video.countDocuments(filter);

      res.json({
        success: true,
        data: formattedVideos,
        metadata: {
          total: totalCount,
          limit: parseInt(limit),
          offset: parseInt(offset),
          language,
          hasMore: (parseInt(offset) + parseInt(limit)) < totalCount
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Get all videos error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch videos',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  },

  // Get single video by ID
  getVideoById: async (req, res) => {
    try {
      const { videoId } = req.params;
      const { language = 'en', incrementDownload = false } = req.query;

      const video = await Video.findOne({ 
        id: videoId, 
        isActive: true 
      });

      if (!video) {
        return res.status(404).json({
          success: false,
          error: 'Video not found',
          message: `Video with ID '${videoId}' not found`
        });
      }

      // Increment download count if requested
      if (incrementDownload === 'true') {
        video.downloadCount += 1;
        await video.save();
      }

      const translation = video.getTranslation(language);

      res.json({
        success: true,
        data: {
          id: video.id,
          category: video.category,
          priority: video.priority,
          title: translation?.title || video.id,
          description: translation?.description || 'No description available',
          keywords: translation?.keywords || [],
          urls: Object.fromEntries(video.urls),
          duration: video.duration,
          fileSize: video.fileSize,
          thumbnailUrl: video.thumbnailUrl,
          tags: video.tags,
          ndmaGuidelines: video.ndmaGuidelines,
          downloadCount: video.downloadCount,
          lastUpdated: video.lastUpdated,
          createdAt: video.createdAt
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Get video by ID error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch video',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  },

  // Get videos by category
  getVideosByCategory: async (req, res) => {
    try {
      const { category } = req.params;
      const { language = 'en', priority } = req.query;

      // Validate category
      const validCategories = ['medical', 'emergency'];
      if (!validCategories.includes(category.toLowerCase())) {
        return res.status(400).json({
          success: false,
          error: 'Invalid category',
          message: `Category must be one of: ${validCategories.join(', ')}`
        });
      }

      const filter = { category: category.toLowerCase(), isActive: true };
      if (priority) filter.priority = priority.toLowerCase();

      const videos = await Video.find(filter)
        .sort({ priority: 1, createdAt: -1 });

      const categoryInfo = {
        medical: {
          title: 'Medical / First Aid',
          description: 'Essential first aid techniques and medical emergency procedures',
          icon: '🩺'
        },
        emergency: {
          title: 'Emergency Action Guides', 
          description: 'Emergency preparedness and response procedures',
          icon: '⚡'
        }
      };

      const categoryVideos = {
        category: category.toLowerCase(),
        ...categoryInfo[category.toLowerCase()],
        videoCount: videos.length,
        videos: videos.map(video => {
          const translation = video.getTranslation(language);
          return {
            id: video.id,
            priority: video.priority,
            title: translation?.title || video.id,
            description: translation?.description || 'No description available',
            url: video.urls.get('youtube') || video.urls.get('default') || [...video.urls.values()][0],
            duration: video.duration,
            fileSize: video.fileSize,
            thumbnailUrl: video.thumbnailUrl,
            tags: video.tags,
            downloadCount: video.downloadCount
          };
        })
      };

      res.json({
        success: true,
        data: categoryVideos,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Get videos by category error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch category videos',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  },

  // Create or update video
  upsertVideo: async (req, res) => {
    try {
      const videoData = req.body;
      
      // Validate required fields
      const requiredFields = ['id', 'category', 'priority', 'urls', 'duration', 'fileSize', 'translations'];
      const missingFields = requiredFields.filter(field => !videoData[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
          missingFields
        });
      }

      // Convert URLs object to Map if needed
      if (videoData.urls && typeof videoData.urls === 'object' && !(videoData.urls instanceof Map)) {
        videoData.urls = new Map(Object.entries(videoData.urls));
      }

      // Convert translations object to Map if needed
      if (videoData.translations && typeof videoData.translations === 'object' && !(videoData.translations instanceof Map)) {
        videoData.translations = new Map(Object.entries(videoData.translations));
      }

      const video = await Video.findOneAndUpdate(
        { id: videoData.id },
        videoData,
        { 
          upsert: true, 
          new: true, 
          runValidators: true,
          setDefaultsOnInsert: true
        }
      );

      res.json({
        success: true,
        data: video,
        message: `Video '${videoData.id}' updated successfully`,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Upsert video error:', error);
      
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to update video',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  },

  // Delete video (soft delete)
  deleteVideo: async (req, res) => {
    try {
      const { videoId } = req.params;

      const video = await Video.findOneAndUpdate(
        { id: videoId },
        { isActive: false },
        { new: true }
      );

      if (!video) {
        return res.status(404).json({
          success: false,
          error: 'Video not found'
        });
      }

      res.json({
        success: true,
        message: `Video '${videoId}' deactivated successfully`,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Delete video error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete video',
        message: error.message
      });
    }
  },

  // Get video statistics
  getVideoStats: async (req, res) => {
    try {
      const stats = await Video.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: null,
            totalVideos: { $sum: 1 },
            totalDownloads: { $sum: '$downloadCount' },
            avgFileSize: { $avg: '$fileSize' },
            categoriesCount: {
              $push: '$category'
            },
            prioritiesCount: {
              $push: '$priority'
            }
          }
        },
        {
          $project: {
            _id: 0,
            totalVideos: 1,
            totalDownloads: 1,
            avgFileSize: { $round: ['$avgFileSize', 2] },
            categoryBreakdown: {
              $reduce: {
                input: '$categoriesCount',
                initialValue: {},
                in: {
                  $mergeObjects: [
                    '$$value',
                    {
                      $arrayToObject: [
                        [{ k: '$$this', v: { $add: [{ $ifNull: [{ $getField: { field: '$$this', input: '$$value' } }, 0] }, 1] } }]
                      ]
                    }
                  ]
                }
              }
            },
            }
        }
          ]);
    
          res.json({
            success: true,
            data: stats[0] || {},
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error('Get video stats error:', error);
          res.status(500).json({
            success: false,
            error: 'Failed to fetch video statistics',
            message: error.message,
            timestamp: new Date().toISOString()
          });
        }
      }
    };
    
    module.exports = videoController;