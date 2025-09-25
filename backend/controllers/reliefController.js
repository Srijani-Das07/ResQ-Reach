const ReliefCenter = require('../models/ReliefCenter');
const SyncLog = require('../models/SyncLog');

// Get all relief centers
const getReliefCenters = async (req, res) => {
  try {
    const { lastSync, limit = 50 } = req.query;
    
    let query = {};
    if (lastSync) {
      query.updatedAt = { $gt: new Date(lastSync) };
    }

    const centers = await ReliefCenter.find(query)
      .populate('resources.food.updatedBy', 'name role')
      .populate('resources.water.updatedBy', 'name role')
      .populate('resources.medical.updatedBy', 'name role')
      .populate('resources.shelter.updatedBy', 'name role')
      .limit(parseInt(limit))
      .sort({ updatedAt: -1 });

    res.json({
      centers,
      syncTimestamp: new Date().toISOString(),
      hasMore: centers.length === parseInt(limit)
    });

  } catch (error) {
    console.error('Get centers error:', error);
    res.status(500).json({ error: 'Server error fetching relief centers' });
  }
};

// Get single relief center
const getReliefCenter = async (req, res) => {
  try {
    const center = await ReliefCenter.findById(req.params.id)
      .populate('resources.food.updatedBy', 'name role')
      .populate('resources.water.updatedBy', 'name role')
      .populate('resources.medical.updatedBy', 'name role')
      .populate('resources.shelter.updatedBy', 'name role');

    if (!center) {
      return res.status(404).json({ error: 'Relief center not found' });
    }

    res.json(center);
  } catch (error) {
    console.error('Get center error:', error);
    res.status(500).json({ error: 'Server error fetching relief center' });
  }
};

// Create new relief center
const createReliefCenter = async (req, res) => {
  try {
    const centerData = {
      ...req.body,
      'resources.food.updatedBy': req.user._id,
      'resources.water.updatedBy': req.user._id,
      'resources.medical.updatedBy': req.user._id,
      'resources.shelter.updatedBy': req.user._id
    };

    const center = new ReliefCenter(centerData);
    await center.save();

    // Log the creation
    await new SyncLog({
      userId: req.user._id,
      entityType: 'reliefCenter',
      entityId: center._id,
      action: 'create',
      changes: centerData
    }).save();

    res.status(201).json(center);
  } catch (error) {
    console.error('Create center error:', error);
    res.status(500).json({ error: 'Server error creating relief center' });
  }
};

// Update relief center resources
const updateReliefCenterResources = async (req, res) => {
  try {
    const { resourceType, updates, offlineTimestamp } = req.body;
    
    const center = await ReliefCenter.findById(req.params.id);
    if (!center) {
      return res.status(404).json({ error: 'Relief center not found' });
    }

    // Handle conflict resolution for offline updates
    if (offlineTimestamp) {
      const serverTimestamp = new Date(center.resources[resourceType]?.lastUpdated || center.updatedAt);
      const clientTimestamp = new Date(offlineTimestamp);
      
      if (serverTimestamp > clientTimestamp) {
        return res.status(409).json({
          error: 'Conflict detected',
          serverData: center.resources[resourceType],
          clientData: updates,
          resolution: 'latest_wins',
          conflictTimestamp: serverTimestamp.toISOString()
        });
      }
    }

    const oldValue = { ...center.resources[resourceType] };
    
    center.resources[resourceType] = {
      ...center.resources[resourceType],
      ...updates,
      lastUpdated: new Date(),
      updatedBy: req.user._id
    };

    // Update capacity if occupied count changed
    if (resourceType === 'capacity' && updates.occupied !== undefined) {
      center.capacity.available = center.capacity.total - updates.occupied;
      
      if (updates.occupied >= center.capacity.total) {
        center.status = 'Full';
      } else if (center.status === 'Full' && updates.occupied < center.capacity.total) {
        center.status = 'Active';
      }
    }

    center.lastSyncTimestamp = new Date();
    center.syncVersion += 1;
    
    await center.save();

    // Log the update
    await new SyncLog({
      userId: req.user._id,
      entityType: 'reliefCenter',
      entityId: center._id,
      action: 'update',
      changes: {
        resourceType,
        oldValue,
        newValue: updates
      }
    }).save();

    const updatedCenter = await ReliefCenter.findById(req.params.id)
      .populate('resources.food.updatedBy', 'name role')
      .populate('resources.water.updatedBy', 'name role')
      .populate('resources.medical.updatedBy', 'name role')
      .populate('resources.shelter.updatedBy', 'name role');

    res.json({
      center: updatedCenter,
      syncTimestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Update center resources error:', error);
    res.status(500).json({ error: 'Server error updating relief center resources' });
  }
};

// Get centers for offline caching
const getCentersForCache = async (req, res) => {
  try {
    const { lat, lng, radius = 50 } = req.query;
    
    let query = { status: { $in: ['Active', 'Full', 'Emergency'] } };
    
    if (lat && lng) {
      query['location.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: radius * 1000
        }
      };
    }

    const centers = await ReliefCenter.find(query)
      .select('-pendingUpdates')
      .limit(50)
      .sort({ updatedAt: -1 });

    res.json({
      centers,
      cacheTimestamp: new Date().toISOString(),
      userPermissions: req.user.permissions
    });

  } catch (error) {
    console.error('Cache centers error:', error);
    res.status(500).json({ error: 'Server error caching relief centers' });
  }
};

module.exports = {
  getReliefCenters,
  getReliefCenter,
  createReliefCenter,
  updateReliefCenterResources,
  getCentersForCache
};