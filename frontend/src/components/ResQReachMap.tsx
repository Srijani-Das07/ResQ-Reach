import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  MapPin, Navigation, Users, Locate, Zap, Shield, Phone, AlertTriangle, 
  Satellite, Wifi, WifiOff, Battery, Signal, Search, Target, Route
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Alert, AlertDescription } from './ui/alert';
import { useLanguage } from './LanguageContext';
import { useUnifiedDatabase, RescueCenter } from './UnifiedDatabaseContext';
import { toast } from 'sonner@2.0.3';

interface ResQReachMapProps {
  selectedShelter: RescueCenter | null;
  onShelterSelect: (shelter: RescueCenter) => void;
}

interface UserLocation {
  lat: number;
  lng: number;
  accuracy?: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  timestamp: number;
}

interface MapSettings {
  enableHighAccuracy: boolean;
  trackLocation: boolean;
  offlineMode: boolean;
  satelliteView: boolean;
  showTraffic: boolean;
}

interface RouteInfo {
  distance: number;
  duration: number;
  steps: string[];
}

export const ResQReachMap: React.FC<ResQReachMapProps> = ({ 
  selectedShelter, 
  onShelterSelect 
}) => {
  const { translate, dataSaverMode } = useLanguage();
  const { rescueCenters, loading } = useUnifiedDatabase();
  
  // Location state
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationHistory, setLocationHistory] = useState<UserLocation[]>([]);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  // Map state
  const [mapSettings, setMapSettings] = useState<MapSettings>({
    enableHighAccuracy: true,
    trackLocation: false,
    offlineMode: false,
    satelliteView: false,
    showTraffic: false
  });
  
  // Navigation state
  const [showDirections, setShowDirections] = useState(false);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'available' | 'nearby'>('all');
  
  // Connection state
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [signalStrength, setSignalStrength] = useState(100);
  
  // Refs
  const watchIdRef = useRef<number | null>(null);
  const locationUpdateRef = useRef<NodeJS.Timeout | null>(null);

  // Monitor connection status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Simulate signal strength (in a real app, this would use actual network APIs)
  useEffect(() => {
    const interval = setInterval(() => {
      setSignalStrength(Math.floor(Math.random() * 40) + 60); // 60-100%
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Get current location with high accuracy
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      toast.error('Geolocation not supported');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    const options: PositionOptions = {
      enableHighAccuracy: mapSettings.enableHighAccuracy,
      timeout: 15000,
      maximumAge: 60000 // 1 minute
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation: UserLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude || undefined,
          speed: position.coords.speed || undefined,
          heading: position.coords.heading || undefined,
          timestamp: Date.now()
        };
        
        setUserLocation(newLocation);
        setLocationHistory(prev => [...prev.slice(-99), newLocation]); // Keep last 100 positions
        setIsLocating(false);
        
        toast.success(`Location found (±${Math.round(newLocation.accuracy || 0)}m accuracy)`);
      },
      (error) => {
        setIsLocating(false);
        let errorMessage = 'Failed to get location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location services.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable. Check GPS signal.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Retrying...';
            break;
        }
        
        setLocationError(errorMessage);
        toast.error(errorMessage);
      },
      options
    );
  }, [mapSettings.enableHighAccuracy]);

  // Start continuous location tracking
  const startLocationTracking = useCallback(() => {
    if (!navigator.geolocation) return;

    const options: PositionOptions = {
      enableHighAccuracy: mapSettings.enableHighAccuracy,
      timeout: 10000,
      maximumAge: 5000
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation: UserLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude || undefined,
          speed: position.coords.speed || undefined,
          heading: position.coords.heading || undefined,
          timestamp: Date.now()
        };
        
        setUserLocation(newLocation);
        setLocationHistory(prev => [...prev.slice(-99), newLocation]);
      },
      (error) => {
        console.warn('Location tracking error:', error);
      },
      options
    );
  }, [mapSettings.enableHighAccuracy]);

  // Stop location tracking
  const stopLocationTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  // Toggle location tracking
  useEffect(() => {
    if (mapSettings.trackLocation) {
      startLocationTracking();
    } else {
      stopLocationTracking();
    }

    return () => stopLocationTracking();
  }, [mapSettings.trackLocation, startLocationTracking, stopLocationTracking]);

  // Calculate distance between two points
  const calculateDistance = useCallback((lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);

  // Get filtered shelters
  const getFilteredShelters = useCallback(() => {
    let filtered = rescueCenters;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(shelter =>
        shelter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shelter.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    switch (filterBy) {
      case 'available':
        filtered = filtered.filter(shelter => shelter.availableCapacity > 0);
        break;
      case 'nearby':
        if (userLocation) {
          filtered = filtered
            .map(shelter => ({
              ...shelter,
              distance: calculateDistance(userLocation.lat, userLocation.lng, shelter.lat, shelter.lng)
            }))
            .filter(shelter => shelter.distance <= 10) // Within 10km
            .sort((a, b) => a.distance - b.distance);
        }
        break;
    }

    return filtered;
  }, [rescueCenters, searchQuery, filterBy, userLocation, calculateDistance]);

  // Find nearest available shelter
  const findNearestShelter = useCallback(() => {
    if (!userLocation) {
      toast.error('Location required to find nearest shelter');
      getCurrentLocation();
      return;
    }

    const availableShelters = rescueCenters.filter(center => center.availableCapacity > 0);
    
    if (availableShelters.length === 0) {
      toast.error('No shelters with available capacity found');
      return;
    }

    let nearest = availableShelters[0];
    let minDistance = calculateDistance(
      userLocation.lat, 
      userLocation.lng, 
      nearest.lat, 
      nearest.lng
    );

    availableShelters.forEach(center => {
      const distance = calculateDistance(
        userLocation.lat, 
        userLocation.lng, 
        center.lat, 
        center.lng
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearest = center;
      }
    });

    onShelterSelect(nearest);
    toast.success(`Nearest available shelter: ${nearest.name} (${minDistance.toFixed(1)} km away)`);
  }, [userLocation, rescueCenters, calculateDistance, onShelterSelect, getCurrentLocation]);

  // Start navigation
  const startNavigation = useCallback(() => {
    if (!selectedShelter) {
      toast.error('Please select a shelter first');
      return;
    }

    if (!userLocation) {
      toast.error('Location required for navigation');
      getCurrentLocation();
      return;
    }

    // Calculate route info
    const distance = calculateDistance(
      userLocation.lat, 
      userLocation.lng, 
      selectedShelter.lat, 
      selectedShelter.lng
    );
    
    const estimatedDuration = distance * 4; // Rough estimate: 4 minutes per km in emergency conditions
    
    setRouteInfo({
      distance,
      duration: estimatedDuration,
      steps: [
        `Head towards ${selectedShelter.name}`,
        `Distance: ${distance.toFixed(1)} km`,
        `Estimated time: ${Math.round(estimatedDuration)} minutes`,
        `Address: ${selectedShelter.address}`
      ]
    });

    setIsNavigating(true);
    setShowDirections(true);

    // Start location tracking for navigation
    setMapSettings(prev => ({ ...prev, trackLocation: true }));

    // Open in external maps app
    const mapsUrl = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${selectedShelter.lat},${selectedShelter.lng}`;
    window.open(mapsUrl, '_blank');
    
    toast.success(`Navigation started to ${selectedShelter.name}`);
  }, [selectedShelter, userLocation, calculateDistance, getCurrentLocation]);

  // Emergency contact
  const handleEmergencyCall = useCallback(() => {
    if (selectedShelter?.phone) {
      window.open(`tel:${selectedShelter.phone}`, '_self');
    } else {
      // General emergency number
      window.open('tel:108', '_self'); // India emergency number
    }
  }, [selectedShelter]);

  const filteredShelters = getFilteredShelters();

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded">
              <h3 className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                ResQ Reach - Loading...
              </h3>
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            ResQ Reach GPS
          </CardTitle>
          <div className="flex items-center gap-2">
            {/* Connection Status */}
            <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
              isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {isOnline ? 'Online' : 'Offline'}
            </div>
            
            {/* Signal Strength */}
            <div className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-gray-100">
              <Signal className="w-3 h-3" />
              {signalStrength}%
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Search and Filters */}
        <div className="p-4 border-b bg-gray-50 space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search shelters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant={filterBy === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterBy('all')}
            >
              All
            </Button>
            <Button
              variant={filterBy === 'available' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterBy('available')}
            >
              Available
            </Button>
            <Button
              variant={filterBy === 'nearby' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterBy('nearby')}
              disabled={!userLocation}
            >
              Nearby
            </Button>
          </div>
          
          <div className="flex gap-2 text-xs">
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={mapSettings.enableHighAccuracy}
                onChange={(e) => setMapSettings(prev => ({ ...prev, enableHighAccuracy: e.target.checked }))}
                className="rounded"
              />
              High Accuracy GPS
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={mapSettings.trackLocation}
                onChange={(e) => setMapSettings(prev => ({ ...prev, trackLocation: e.target.checked }))}
                className="rounded"
              />
              Track Location
            </label>
          </div>
        </div>

        {/* Location Error Alert */}
        {locationError && (
          <Alert className="m-4 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {locationError}
            </AlertDescription>
          </Alert>
        )}

        {/* Interactive Map */}
        <div className={`relative h-96 bg-gradient-to-br from-green-200 via-blue-200 to-indigo-200 overflow-hidden ${
          dataSaverMode ? 'filter grayscale' : ''
        }`}>
          {/* User Location with tracking trail */}
          {userLocation && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
              {/* Location history trail */}
              {mapSettings.trackLocation && locationHistory.length > 1 && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <path
                    d={`M ${locationHistory.map((loc, i) => 
                      `${i === 0 ? 'M' : 'L'} ${(i + 1) * 2} ${(i + 1) * 2}`
                    ).join(' ')}`}
                    stroke="#3B82F6"
                    strokeWidth="2"
                    fill="none"
                    opacity="0.6"
                  />
                </svg>
              )}
              
              {/* Current location marker */}
              <div className="relative">
                <div className={`w-5 h-5 bg-blue-600 rounded-full border-3 border-white shadow-lg ${
                  mapSettings.trackLocation ? 'animate-pulse' : ''
                }`}></div>
                
                {/* Heading indicator */}
                {userLocation.heading !== undefined && (
                  <div 
                    className="absolute top-0 left-1/2 w-0.5 h-8 bg-blue-600 transform -translate-x-1/2 origin-bottom"
                    style={{ transform: `translateX(-50%) rotate(${userLocation.heading}deg)` }}
                  />
                )}
                
                {/* Accuracy circle */}
                <div 
                  className="absolute top-1/2 left-1/2 border-2 border-blue-400 rounded-full transform -translate-x-1/2 -translate-y-1/2 opacity-30"
                  style={{ 
                    width: `${Math.min((userLocation.accuracy || 20) / 5, 100)}px`,
                    height: `${Math.min((userLocation.accuracy || 20) / 5, 100)}px`
                  }}
                />
                
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 text-xs bg-blue-600 text-white px-2 py-1 rounded whitespace-nowrap">
                  You are here {userLocation.accuracy && `(±${Math.round(userLocation.accuracy)}m)`}
                </div>
              </div>
            </div>
          )}

          {/* Shelter Markers */}
          {filteredShelters.map((shelter, index) => {
            const positions = [
              { top: '25%', left: '30%' },
              { top: '20%', left: '60%' },
              { top: '70%', left: '40%' },
              { top: '35%', left: '75%' },
              { top: '65%', left: '20%' },
              { top: '45%', left: '85%' },
              { top: '80%', left: '60%' },
              { top: '15%', left: '40%' }
            ];

            const isSelected = selectedShelter?.id === shelter.id;
            const isFull = shelter.currentGuests >= shelter.totalCapacity;
            const position = positions[index % positions.length];
            const distance = userLocation ? calculateDistance(
              userLocation.lat, userLocation.lng, shelter.lat, shelter.lng
            ) : null;

            return (
              <div
                key={shelter.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
                style={position}
                onClick={() => onShelterSelect(shelter)}
              >
                <div className="relative group">
                  {/* Marker */}
                  <div className={`
                    relative w-12 h-14 flex flex-col items-center justify-center rounded-t-full border-2 border-white shadow-lg
                    ${isSelected ? 'bg-yellow-500 scale-125 z-30' : isFull ? 'bg-red-500' : 'bg-green-500'}
                    ${!isSelected && 'hover:scale-110'} transition-all duration-200
                  `}>
                    <div className="text-white text-xs font-bold leading-none">
                      {shelter.currentGuests}
                    </div>
                    <div className="text-white text-xs opacity-80 leading-none">
                      /{shelter.totalCapacity}
                    </div>
                  </div>
                  
                  {/* Status indicators */}
                  <div className="absolute -top-2 -right-2 flex flex-col gap-1">
                    {shelter.waterLevel < 30 && (
                      <div className="w-3 h-3 bg-orange-500 rounded-full border border-white" title="Low water"></div>
                    )}
                    {shelter.foodLevel < 30 && (
                      <div className="w-3 h-3 bg-red-500 rounded-full border border-white" title="Low food"></div>
                    )}
                    {shelter.facilities.includes('Medical Aid') && (
                      <div className="w-3 h-3 bg-blue-500 rounded-full border border-white" title="Medical aid available"></div>
                    )}
                  </div>

                  {/* Distance indicator */}
                  {distance && distance <= 5 && (
                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs bg-green-600 text-white px-1 py-0.5 rounded">
                      {distance.toFixed(1)}km
                    </div>
                  )}

                  {/* Enhanced info popup */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                    <div className="bg-gray-900 text-white text-xs rounded-lg p-3 whitespace-nowrap max-w-64">
                      <div className="font-medium text-sm">{shelter.name}</div>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {shelter.currentGuests}/{shelter.totalCapacity}
                        </div>
                        <div className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          W:{shelter.waterLevel}% F:{shelter.foodLevel}%
                        </div>
                      </div>
                      {distance && (
                        <div className="text-green-400 mt-1">
                          Distance: {distance.toFixed(1)} km
                        </div>
                      )}
                      <div className="text-xs text-gray-300 mt-1">Click to select</div>
                    </div>
                  </div>

                  {/* Navigation route */}
                  {showDirections && isSelected && userLocation && (
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="w-1 h-1 bg-blue-500 animate-ping"></div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Grid overlay for realism */}
          <div className="absolute inset-0 opacity-5">
            <div className="grid grid-cols-12 grid-rows-8 h-full w-full">
              {Array.from({ length: 96 }).map((_, i) => (
                <div key={i} className="border border-gray-600"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Route Information */}
        {routeInfo && isNavigating && (
          <div className="p-4 bg-blue-50 border-b">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-blue-900 flex items-center gap-2">
                <Route className="w-4 h-4" />
                Navigation Active
              </h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsNavigating(false);
                  setShowDirections(false);
                  setRouteInfo(null);
                }}
              >
                Stop
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Distance:</span> {routeInfo.distance.toFixed(1)} km
              </div>
              <div>
                <span className="text-gray-600">ETA:</span> {Math.round(routeInfo.duration)} min
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="p-4 space-y-3 bg-gray-50">
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={getCurrentLocation}
              variant="outline"
              disabled={isLocating}
              className="flex items-center gap-2"
            >
              <Locate className={`h-4 w-4 ${isLocating ? 'animate-spin' : ''}`} />
              {isLocating ? 'Locating...' : 'Get Location'}
            </Button>
            
            <Button
              onClick={findNearestShelter}
              variant="outline"
              disabled={!userLocation}
              className="flex items-center gap-2"
            >
              <Target className="h-4 w-4" />
              Find Nearest
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={startNavigation}
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={!selectedShelter || !userLocation}
            >
              <Navigation className="h-4 w-4 mr-2" />
              Start Navigation
            </Button>
            
            <Button
              onClick={handleEmergencyCall}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
            >
              <Phone className="h-4 w-4 mr-2" />
              Emergency Call
            </Button>
          </div>

          {/* Selected shelter info */}
          {selectedShelter && (
            <div className="pt-3 border-t">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{selectedShelter.name}</h4>
                <div className="flex gap-1">
                  <Badge variant={selectedShelter.availableCapacity > 0 ? "default" : "destructive"}>
                    {selectedShelter.availableCapacity > 0 ? 'Available' : 'Full'}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-white p-2 rounded">
                  <div className="text-gray-600">Capacity</div>
                  <div className="font-medium">{selectedShelter.currentGuests}/{selectedShelter.totalCapacity}</div>
                </div>
                <div className="bg-white p-2 rounded">
                  <div className="text-gray-600">Water</div>
                  <div className="font-medium">{selectedShelter.waterLevel}%</div>
                </div>
                <div className="bg-white p-2 rounded">
                  <div className="text-gray-600">Food</div>
                  <div className="font-medium">{selectedShelter.foodLevel}%</div>
                </div>
              </div>
              
              {userLocation && (
                <div className="mt-2 text-xs text-gray-600">
                  Distance: {calculateDistance(
                    userLocation.lat, 
                    userLocation.lng, 
                    selectedShelter.lat, 
                    selectedShelter.lng
                  ).toFixed(1)} km
                </div>
              )}
            </div>
          )}

          {/* Location info */}
          {userLocation && (
            <div className="pt-3 border-t text-xs text-gray-600">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span>Lat:</span> {userLocation.lat.toFixed(6)}
                </div>
                <div>
                  <span>Lng:</span> {userLocation.lng.toFixed(6)}
                </div>
                {userLocation.accuracy && (
                  <div>
                    <span>Accuracy:</span> ±{Math.round(userLocation.accuracy)}m
                  </div>
                )}
                {userLocation.altitude && (
                  <div>
                    <span>Altitude:</span> {Math.round(userLocation.altitude)}m
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};