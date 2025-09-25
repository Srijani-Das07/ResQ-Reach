// routes/videoRoutes.js - Video endpoints
const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');

// Middleware for request logging
router.use((req, res, next) => {
  console.log(`Video API: ${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
  next();
});

// Middleware for query parameter validation
const validateQueryParams = (req, res, next) => {
  const { category, priority, limit, offset } = req.query;
  
  // Validate category
  if (category && !['medical', 'emergency'].includes(category.toLowerCase())) {
    return res.status(400).json({
      success: false,
      error: 'Invalid category',
      message: 'Category must be either "medical" or "emergency"'
    });
  }
  
  // Validate priority
  if (priority && !['high', 'medium', 'low'].includes(priority.toLowerCase())) {
    return res.status(400).json({
      success: false,
      error: 'Invalid priority',
      message: 'Priority must be "high", "medium", or "low"'
    });
  }
  
  // Validate pagination parameters
  if (limit && (isNaN(limit) || parseInt(limit) < 1 || parseInt(limit) > 100)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid limit',
      message: 'Limit must be a number between 1 and 100'
    });
  }
  
  if (offset && (isNaN(offset) || parseInt(offset) < 0)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid offset',
      message: 'Offset must be a non-negative number'
    });
  }
  
  next();
};

// GET /api/videos - Get all videos with filtering
router.get('/', validateQueryParams, videoController.getAllVideos);

// GET /api/videos/stats - Get video statistics
router.get('/stats', videoController.getVideoStats);

// GET /api/videos/category/:category - Get videos by category
router.get('/category/:category', (req, res, next) => {
  const { category } = req.params;
  
  // Validate category parameter
  if (!['medical', 'emergency'].includes(category.toLowerCase())) {
    return res.status(400).json({
      success: false,
      error: 'Invalid category',
      message: 'Category must be either "medical" or "emergency"'
    });
  }
  
  // Validate priority query parameter if provided
  const { priority } = req.query;
  if (priority && !['high', 'medium', 'low'].includes(priority.toLowerCase())) {
    return res.status(400).json({
      success: false,
      error: 'Invalid priority',
      message: 'Priority must be "high", "medium", or "low"'
    });
  }
  
  next();
}, videoController.getVideosByCategory);

// GET /api/videos/:videoId - Get specific video
router.get('/:videoId', (req, res, next) => {
  const { videoId } = req.params;
  
  // Basic validation for video ID
  if (!videoId || videoId.length < 3) {
    return res.status(400).json({
      success: false,
      error: 'Invalid video ID',
      message: 'Video ID must be at least 3 characters long'
    });
  }
  
  // Validate incrementDownload parameter
  const { incrementDownload } = req.query;
  if (incrementDownload && !['true', 'false'].includes(incrementDownload.toLowerCase())) {
    return res.status(400).json({
      success: false,
      error: 'Invalid incrementDownload parameter',
      message: 'incrementDownload must be "true" or "false"'
    });
  }
  
  next();
}, videoController.getVideoById);

// PUT /api/videos - Create or update video
router.put('/', (req, res, next) => {
  // Validate request body
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Empty request body',
      message: 'Request body must contain video data'
    });
  }
  
  // Validate required fields
  const requiredFields = ['id', 'category', 'priority', 'urls', 'duration', 'fileSize', 'translations'];
  const missingFields = requiredFields.filter(field => !req.body[field]);
  
  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields',
      missingFields,
      message: `The following fields are required: ${missingFields.join(', ')}`
    });
  }
  
  // Validate field formats
  const { category, priority, duration, fileSize } = req.body;
  
  if (!['medical', 'emergency'].includes(category.toLowerCase())) {
    return res.status(400).json({
      success: false,
      error: 'Invalid category in request body'
    });
  }
  
  if (!['high', 'medium', 'low'].includes(priority.toLowerCase())) {
    return res.status(400).json({
      success: false,
      error: 'Invalid priority in request body'
    });
  }
  
  if (!/^\d{1,2}:\d{2}$/.test(duration)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid duration format',
      message: 'Duration must be in MM:SS or H:MM format (e.g., "5:32", "12:45")'
    });
  }
  
  if (isNaN(fileSize) || fileSize <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid file size',
      message: 'File size must be a positive number (in MB)'
    });
  }
  
  next();
}, videoController.upsertVideo);

// DELETE /api/videos/:videoId - Deactivate video
router.delete('/:videoId', (req, res, next) => {
  const { videoId } = req.params;
  
  if (!videoId || videoId.length < 3) {
    return res.status(400).json({
      success: false,
      error: 'Invalid video ID'
    });
  }
  
  next();
}, videoController.deleteVideo);

// Error handling for this router
router.use((error, req, res, next) => {
  console.error('Video routes error:', error);
  
  // Handle specific error types
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: error.errors,
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
  
  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'Invalid data format',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
  
  res.status(500).json({
    success: false,
    error: 'Video API error',
    message: error.message,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;