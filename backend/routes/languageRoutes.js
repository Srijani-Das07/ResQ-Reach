// routes/languageRoutes.js - Language endpoints
const express = require('express');
const router = express.Router();
const languageController = require('../controllers/languageController');

// Middleware for request logging
router.use((req, res, next) => {
  console.log(`Language API: ${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
  next();
});

// GET /api/languages - Get all active languages
router.get('/', languageController.getAllLanguages);

// GET /api/languages/:langCode - Get specific language translations
router.get('/:langCode', (req, res, next) => {
  // Validate language code format before processing
  const { langCode } = req.params;
  if (!/^[a-z]{2}$/.test(langCode)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid language code format',
      message: 'Language code must be 2 lowercase letters (e.g., en, hi, ta)'
    });
  }
  next();
}, languageController.getLanguageTranslations);

// PUT /api/languages/:langCode - Create or update language
// router.put('/:langCode', (req, res, next) => {
//   // Validate language code format
//   const { langCode } = req.params;
//   if (!/^[a-z]{2}$/.test(langCode)) {
//     return res.status(400).json({
//       success: false,
//       error: 'Invalid language code format',
//       message: 'Language code must be 2 lowercase letters (e.g., en, hi, ta)'
//     });
//   }

//   // Validate request body
//   if (!req.body || Object.keys(req.body).length === 0) {
//     return res.status(400).json({
//       success: false,
//       error: 'Empty request body',
//       message: 'Request body must contain language data'
//     });
//   }

//   next();
// }, languageController.upsertLanguage);

// // DELETE /api/languages/:langCode - Deactivate language
// router.delete('/:langCode', (req, res, next) => {
//   const { langCode } = req.params;
//   if (!/^[a-z]{2}$/.test(langCode)) {
//     return res.status(400).json({
//       success: false,
//       error: 'Invalid language code format'
//     });
//   }
//   next();
// }, languageController.deleteLanguage);

// Error handling for this router
router.use((error, req, res, next) => {
  console.error('Language routes error:', error);
  res.status(500).json({
    success: false,
    error: 'Language API error',
    message: error.message,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;