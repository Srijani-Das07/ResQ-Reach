const User = require('../models/User');
const ReliefCenter = require('../models/ReliefCenter');

// Get emergency contacts for user
const getEmergencyContacts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user.emergencyContacts) {
      return res.status(404).json({ error: 'No emergency contacts configured' });
    }

    // Get nearby relief centers as backup contacts
    const { lat, lng } = req.query;
    let reliefCenters = [];
    
    if (lat && lng) {
      reliefCenters = await ReliefCenter.find({
        status: { $in: ['Active', 'Emergency'] },
        'location.coordinates': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(lng), parseFloat(lat)]
            },
            $maxDistance: 25000 // 25km radius
          }
        }
      })
      .select('name contact location')
      .limit(5);
    }

    res.json({
      personalContacts: user.emergencyContacts,
      reliefCenters,
      callFlow: {
        primary: user.emergencyContacts.primary,
        secondary: user.emergencyContacts.secondary,
        reliefCenter: reliefCenters[0]?.contact?.phone || '108' // Default emergency number
      }
    });

  } catch (error) {
    console.error('Get emergency contacts error:', error);
    res.status(500).json({ error: 'Server error fetching emergency contacts' });
  }
};

// Update emergency contacts
const updateEmergencyContacts = async (req, res) => {
  try {
    const { primary, secondary, medical } = req.body;
    
    const user = await User.findById(req.user._id);
    
    user.emergencyContacts = {
      primary: {
        name: primary.name,
        phone: primary.phone,
        relationship: primary.relationship
      },
      secondary: {
        name: secondary.name,
        phone: secondary.phone,
        relationship: secondary.relationship
      },
      medical: medical ? {
        name: medical.name,
        phone: medical.phone,
        hospital: medical.hospital
      } : null
    };

    await user.save();

    res.json({
      message: 'Emergency contacts updated successfully',
      contacts: user.emergencyContacts
    });

  } catch (error) {
    console.error('Update emergency contacts error:', error);
    res.status(500).json({ error: 'Server error updating emergency contacts' });
  }
};

// Log emergency call attempt (for tracking)
const logEmergencyCall = async (req, res) => {
  try {
    const { contactType, phoneNumber, status, timestamp, location } = req.body;
    
    // In a real implementation, you'd store this in a separate EmergencyCall model
    // For now, we'll just log it
    console.log('Emergency call logged:', {
      userId: req.user._id,
      contactType,
      phoneNumber,
      status,
      timestamp,
      location
    });

    res.json({ message: 'Emergency call logged successfully' });

  } catch (error) {
    console.error('Log emergency call error:', error);
    res.status(500).json({ error: 'Server error logging emergency call' });
  }
};

// Get emergency services by location
const getEmergencyServices = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Location coordinates required' });
    }

    // Get nearby relief centers and emergency services
    const services = await ReliefCenter.find({
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: 50000 // 50km radius
        }
      }
    })
    .select('name contact location resources.medical')
    .limit(10);

    // Default emergency numbers (these would be configurable by region)
    const defaultNumbers = {
      police: '100',
      fire: '101',
      ambulance: '102',
      disaster: '108',
      women: '1091',
      child: '1098'
    };

    res.json({
      defaultNumbers,
      nearbyServices: services,
      cacheTimestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get emergency services error:', error);
    res.status(500).json({ error: 'Server error fetching emergency services' });
  }
};

module.exports = {
  getEmergencyContacts,
  updateEmergencyContacts,
  logEmergencyCall,
  getEmergencyServices
};