import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Users, Locate, Zap, Shield, Phone, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { useLanguage } from './LanguageContext';
import { useUnifiedDatabase, RescueCenter } from './UnifiedDatabaseContext';
import { toast } from 'sonner@2.0.3';

interface InteractiveMapComponentProps {
  selectedShelter: RescueCenter | null;
  onShelterSelect: (shelter: RescueCenter) => void;
}

interface UserLocation {
  lat: number;
  lng: number;
  accuracy?: number;
}

interface MapInstance {
  map: any;
  markers: { [key: string]: any };
  userMarker?: any;
}

export const InteractiveMapComponent: React.FC<InteractiveMapComponentProps> = ({ 
  selectedShelter, 
  onShelterSelect 
}) => {
  const { translate, dataSaverMode } = useLanguage();
  const { rescueCenters, loading } = useUnifiedDatabase();
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [showDirections, setShowDirections] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<MapInstance | null>(null);

  // Initialize map with fallback for environments without Leaflet
  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    const initializeMap = async () => {
      try {
        // Try to load Leaflet dynamically
        const L = await loadLeaflet();
        if (!L) {
          console.log('Leaflet not available, using fallback map');
          setMapLoaded(true);
          return;
        }

        // Initialize Leaflet map
        const map = L.map(mapRef.current).setView([12.9716, 77.5946], 11); // Bangalore coordinates

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        const markers: { [key: string]: any } = {};
        
        mapInstanceRef.current = { map, markers };
        setMapLoaded(true);

        // Add rescue center markers
        rescueCenters.forEach(center => {
          const isFull = center.currentGuests >= center.totalCapacity;
          const icon = L.divIcon({
            html: `<div class="rescue-marker ${isFull ? 'full' : 'available'}">${center.currentGuests}/${center.totalCapacity}</div>`,
            className: 'custom-marker',
            iconSize: [40, 40],
            iconAnchor: [20, 40]
          });

          const marker = L.marker([center.lat, center.lng], { icon })
            .addTo(map)
            .bindPopup(`
              <div class="map-popup">
                <h3>${center.name}</h3>
                <p><strong>Capacity:</strong> ${center.currentGuests}/${center.totalCapacity}</p>
                <p><strong>Water:</strong> ${center.waterLevel}%</p>
                <p><strong>Food:</strong> ${center.foodLevel}%</p>
                <p><strong>Phone:</strong> ${center.phone}</p>
                <button onclick="window.selectShelter('${center.id}')" class="select-shelter-btn">Select Shelter</button>
              </div>
            `);

          markers[center.id] = marker;
        });

        // Global function for popup button
        (window as any).selectShelter = (id: string) => {
          const center = rescueCenters.find(c => c.id === id);
          if (center) onShelterSelect(center);
        };

      } catch (error) {
        console.log('Map initialization failed, using fallback:', error);
        setMapLoaded(true);
      }
    };

    initializeMap();

    return () => {
      if (mapInstanceRef.current?.map) {
        mapInstanceRef.current.map.remove();
      }
    };
  }, [rescueCenters.length]);

  // Load Leaflet dynamically
  const loadLeaflet = async () => {
    try {
      // In a real environment, this would load Leaflet
      // For demo purposes, we'll return null to use fallback
      return null;
    } catch {
      return null;
    }
  };

  // Get user location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      toast.error('Geolocation not supported');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        setUserLocation(location);
        setIsLocating(false);
        toast.success('Location found successfully');

        // Center map on user location if Leaflet is available
        if (mapInstanceRef.current?.map) {
          mapInstanceRef.current.map.setView([location.lat, location.lng], 13);
          
          // Add or update user marker
          if (mapInstanceRef.current.userMarker) {
            mapInstanceRef.current.userMarker.setLatLng([location.lat, location.lng]);
          } else {
            const L = (window as any).L;
            if (L) {
              const userIcon = L.divIcon({
                html: '<div class="user-marker">📍</div>',
                className: 'user-location-marker',
                iconSize: [30, 30],
                iconAnchor: [15, 30]
              });
              
              mapInstanceRef.current.userMarker = L.marker([location.lat, location.lng], { icon: userIcon })
                .addTo(mapInstanceRef.current.map)
                .bindPopup('Your current location');
            }
          }
        }
      },
      (error) => {
        setIsLocating(false);
        let errorMessage = 'Failed to get location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        setLocationError(errorMessage);
        toast.error(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  // Calculate distance between two points
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Handle navigation
  const handleGuideMe = () => {
    if (!selectedShelter) {
      toast.error('Please select a shelter first');
      return;
    }

    if (!userLocation) {
      toast.error('Please enable location access first');
      getCurrentLocation();
      return;
    }

    // Open navigation in default maps app
    const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${selectedShelter.lat},${selectedShelter.lng}`;
    window.open(url, '_blank');
    
    setShowDirections(true);
    toast.success(`Navigation started to ${selectedShelter.name}`);
  };

  // Emergency contact handler
  const handleEmergencyCall = () => {
    if (selectedShelter?.phone) {
      window.open(`tel:${selectedShelter.phone}`, '_self');
    }
  };

  // Find nearest shelter
  const findNearestShelter = () => {
    if (!userLocation || rescueCenters.length === 0) {
      toast.error('Location required to find nearest shelter');
      return;
    }

    let nearest = rescueCenters[0];
    let minDistance = calculateDistance(
      userLocation.lat, 
      userLocation.lng, 
      nearest.lat, 
      nearest.lng
    );

    rescueCenters.forEach(center => {
      if (center.availableCapacity > 0) { // Only consider available shelters
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
      }
    });

    onShelterSelect(nearest);
    toast.success(`Nearest available shelter: ${nearest.name} (${minDistance.toFixed(1)} km away)`);
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="bg-blue-600 text-white p-3 rounded">
              <h3 className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {translate('gps')}
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
      <CardContent className="p-0">
        {/* Map Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {translate('gps')} - ResQ Reach Map
            </h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={getCurrentLocation}
                disabled={isLocating}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Locate className={`h-4 w-4 ${isLocating ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={findNearestShelter}
                disabled={!userLocation}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Navigation className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="relative">
          {mapLoaded && !mapInstanceRef.current ? (
            // Fallback Interactive Map
            <div 
              className={`relative h-96 bg-gradient-to-br from-green-200 via-blue-200 to-purple-200 overflow-hidden ${
                dataSaverMode ? 'filter grayscale' : ''
              }`}
            >
              {/* User Location */}
              {userLocation && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                  <div className="relative">
                    <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs bg-blue-600 text-white px-2 py-1 rounded whitespace-nowrap">
                      You are here
                    </div>
                    {/* Accuracy circle */}
                    <div className="absolute top-1/2 left-1/2 w-20 h-20 border border-blue-400 rounded-full transform -translate-x-1/2 -translate-y-1/2 opacity-30"></div>
                  </div>
                </div>
              )}

              {/* Rescue Center Markers */}
              {rescueCenters.map((shelter, index) => {
                const positions = [
                  { top: '25%', left: '30%' },
                  { top: '20%', left: '60%' },
                  { top: '70%', left: '40%' },
                  { top: '35%', left: '75%' },
                  { top: '65%', left: '20%' }
                ];

                const isSelected = selectedShelter?.id === shelter.id;
                const isFull = shelter.currentGuests >= shelter.totalCapacity;
                const position = positions[index % positions.length];

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
                        w-10 h-12 flex items-center justify-center rounded-t-full rounded-b-sm border-2 border-white shadow-lg
                        ${isSelected ? 'bg-yellow-500 scale-125 z-30' : isFull ? 'bg-red-500' : 'bg-green-500'}
                        ${!isSelected && 'hover:scale-110'} transition-all duration-200
                      `}>
                        <div className="text-white text-xs font-bold">
                          {shelter.currentGuests}/{shelter.totalCapacity}
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
                      </div>

                      {/* Info popup on hover */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                        <div className="bg-gray-900 text-white text-xs rounded-lg p-2 whitespace-nowrap max-w-48">
                          <div className="font-medium">{shelter.name}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {shelter.currentGuests}/{shelter.totalCapacity}
                            </div>
                            <div className="flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              {shelter.waterLevel}%
                            </div>
                          </div>
                          <div className="text-xs text-gray-300 mt-1">Click to select</div>
                        </div>
                      </div>

                      {/* Direction line */}
                      {showDirections && isSelected && userLocation && (
                        <svg className="absolute inset-0 w-screen h-screen pointer-events-none">
                          <defs>
                            <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                              refX="0" refY="3.5" orient="auto">
                              <polygon points="0 0, 10 3.5, 0 7" fill="#3B82F6" />
                            </marker>
                          </defs>
                          <line
                            x1="50vw"
                            y1="50vh"
                            x2={`${parseInt(position.left)}vw`}
                            y2={`${parseInt(position.top)}vh`}
                            stroke="#3B82F6"
                            strokeWidth="3"
                            strokeDasharray="8,4"
                            markerEnd="url(#arrowhead)"
                            className="animate-pulse"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Map grid lines for realism */}
              <div className="absolute inset-0 opacity-10">
                <div className="grid grid-cols-8 grid-rows-6 h-full w-full">
                  {Array.from({ length: 48 }).map((_, i) => (
                    <div key={i} className="border border-gray-600"></div>
                  ))}
                </div>
              </div>

              {/* Distance indicator */}
              {userLocation && selectedShelter && (
                <div className="absolute top-4 right-4 bg-black/70 text-white p-2 rounded-lg text-sm">
                  Distance: {calculateDistance(
                    userLocation.lat, 
                    userLocation.lng, 
                    selectedShelter.lat, 
                    selectedShelter.lng
                  ).toFixed(1)} km
                </div>
              )}
            </div>
          ) : (
            // Real Leaflet Map Container
            <div ref={mapRef} className="h-96 w-full" />
          )}

          {/* Location Error */}
          {locationError && (
            <div className="absolute top-4 left-4 bg-red-500 text-white p-2 rounded-lg text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {locationError}
            </div>
          )}

          {/* Data Saver Mode Overlay */}
          {dataSaverMode && (
            <div className="absolute top-4 left-4 bg-yellow-500 text-black px-3 py-1 rounded-lg text-sm font-medium">
              Data Saver Mode
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-4 space-y-3 bg-gray-50">
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleGuideMe}
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={!selectedShelter}
            >
              <Navigation className="h-4 w-4 mr-2" />
              {translate('guideMe')}
            </Button>
            
            <Button
              onClick={handleEmergencyCall}
              variant="outline"
              className="border-red-500 text-red-600 hover:bg-red-50"
              disabled={!selectedShelter}
            >
              <Phone className="h-4 w-4 mr-2" />
              Emergency Call
            </Button>
          </div>

          {/* Status Info */}
          {selectedShelter && (
            <div className="flex flex-wrap gap-2 text-sm">
              <Badge variant={selectedShelter.availableCapacity > 0 ? "default" : "destructive"}>
                {selectedShelter.availableCapacity > 0 ? 'Available' : 'Full'}
              </Badge>
              <Badge variant="outline">
                Water: {selectedShelter.waterLevel}%
              </Badge>
              <Badge variant="outline">
                Food: {selectedShelter.foodLevel}%
              </Badge>
            </div>
          )}
        </div>

        {/* Custom CSS for map elements */}
        <style jsx>{`
          .rescue-marker {
            @apply bg-green-500 text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center border-2 border-white shadow-lg;
          }
          .rescue-marker.full {
            @apply bg-red-500;
          }
          .user-marker {
            font-size: 20px;
            animation: bounce 2s infinite;
          }
          .map-popup {
            @apply text-sm;
          }
          .select-shelter-btn {
            @apply bg-blue-600 text-white px-3 py-1 rounded text-xs mt-2 cursor-pointer hover:bg-blue-700;
          }
          @keyframes bounce {
            0%, 20%, 53%, 80%, 100% {
              transform: translate3d(0,0,0);
            }
            40%, 43% {
              transform: translate3d(0,-8px,0);
            }
            70% {
              transform: translate3d(0,-4px,0);
            }
            90% {
              transform: translate3d(0,-2px,0);
            }
          }
        `}</style>
      </CardContent>
    </Card>
  );
};