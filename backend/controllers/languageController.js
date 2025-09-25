// controllers/languageController.js - Language management
const Language = require('../models/Language');
const Video = require('../models/Video');

const languageController = {
  // Get all active languages
  getAllLanguages: async (req, res) => {
    try {
      const languages = await Language.getActiveLanguages();
      
      res.json({
        success: true,
        data: languages,
        count: languages.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Get languages error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch languages',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  },

  // Get translations for a specific language
  getLanguageTranslations: async (req, res) => {
    try {
      const { langCode } = req.params;
      
      // Validate language code format
      if (!/^[a-z]{2}$/.test(langCode)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid language code format',
          message: 'Language code must be 2 lowercase letters'
        });
      }

      const language = await Language.findOne({ 
        code: langCode, 
        isActive: true 
      });
      
      if (!language) {
        return res.status(404).json({
          success: false,
          error: 'Language not found',
          message: `Language '${langCode}' not found or inactive`
        });
      }

      // Get video translations for this language
      const videos = await Video.find({ isActive: true })
        .select('id category priority translations duration fileSize tags ndmaGuidelines');

      const videoTranslations = {};
      videos.forEach(video => {
        const translation = video.getTranslation(langCode);
        if (translation) {
          videoTranslations[video.id] = {
            ...translation.toObject(),
            category: video.category,
            priority: video.priority,
            duration: video.duration,
            fileSize: video.fileSize,
            tags: video.tags,
            ndmaGuidelines: video.ndmaGuidelines
          };
        }
      });

      res.json({
        success: true,
        data: {
          language: {
            code: language.code,
            name: language.name,
            nativeName: language.nativeName,
            rtl: language.rtl
          },
          ui: language.getUITranslations(),
          videos: videoTranslations,
          videoCount: Object.keys(videoTranslations).length
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Get language translations error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch language data',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  },

  // Create or update language
  // upsertLanguage: async (req, res) => {
  //   try {
  //     const { langCode } = req.params;
  //     const updateData = req.body;

  //     // Validate language code
  //     if (!/^[a-z]{2}$/.test(langCode)) {
  //       return res.status(400).json({
  //         success: false,
  //         error: 'Invalid language code format'
  //       });
  //     }

  //     // Validate required fields
  //     const requiredFields = ['name', 'nativeName', 'translations'];
  //     const missingFields = requiredFields.filter(field => !updateData[field]);
      
  //     if (missingFields.length > 0) {
  //       return res.status(400).json({
  //         success: false,
  //         error: 'Missing required fields',
  //         missingFields
  //       });
  //     }

  //     const language = await Language.findOneAndUpdate(
  //       { code: langCode },
  //       { ...updateData, code: langCode },
  //       { 
  //         upsert: true, 
  //         new: true, 
  //         runValidators: true,
  //         setDefaultsOnInsert: true
  //       }
  //     );

  //     res.json({
  //       success: true,
  //       data: language,
  //       message: `Language '${langCode}' updated successfully`,
  //       timestamp: new Date().toISOString()
  //     });
  //   } catch (error) {
  //     console.error('Upsert language error:', error);
      
  //     if (error.name === 'ValidationError') {
  //       return res.status(400).json({
  //         success: false,
  //         error: 'Validation error',
  //         details: error.errors,
  //         message: error.message
  //       });
  //     }

  //     res.status(500).json({
  //       success: false,
  //       error: 'Failed to update language',
  //       message: error.message,
  //       timestamp: new Date().toISOString()
  //     });
  //   }
  // },

  // // Delete language (soft delete by setting isActive to false)
  // deleteLanguage: async (req, res) => {
  //   try {
  //     const { langCode } = req.params;

  //     // Don't allow deleting English
  //     if (langCode === 'en') {
  //       return res.status(400).json({
  //         success: false,
  //         error: 'Cannot delete English language',
  //         message: 'English is the default language and cannot be deleted'
  //       });
  //     }

  //     const language = await Language.findOneAndUpdate(
  //       { code: langCode },
  //       { isActive: false },
  //       { new: true }
  //     );

  //     if (!language) {
  //       return res.status(404).json({
  //         success: false,
  //         error: 'Language not found'
  //       });
  //     }

  //     res.json({
  //       success: true,
  //       message: `Language '${langCode}' deactivated successfully`,
  //       timestamp: new Date().toISOString()
  //     });
  //   } catch (error) {
  //     console.error('Delete language error:', error);
  //     res.status(500).json({
  //       success: false,
  //       error: 'Failed to delete language',
  //       message: error.message
  //     });
  //   }
  // }
};

module.exports = languageController;