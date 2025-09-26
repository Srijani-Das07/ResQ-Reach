import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, Users, Locate, Shield, Phone, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { useLanguage } from './LanguageContext';
import { useUnifiedDatabase, RescueCenter } from './UnifiedDatabaseContext';
import { toast } from 'sonner@2.0.3';

interface ResQReachExternalMapProps {
  selectedShelter: RescueCenter | null;
  onShelterSelect: (shelter: RescueCenter) => void;
}

interface UserLocation {
  lat: number;
  lng: number;
  accuracy?: number;
}

export const ResQReachExternalMap: React.FC<ResQReachExternalMapProps> = ({ 
  selectedShelter, 
  onShelterSelect 
}) => {
  const { translate } = useLanguage();
  const { rescueCenters, loading } = useUnifiedDatabase();
  
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [nearestShelter, setNearestShelter] = useState<RescueCenter | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Calculate distance using Haversine formula
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

  // Initialize and update Leaflet map
  useEffect(() => {
    if (!userLocation || !mapContainerRef.current || rescueCenters.length === 0) return;

    // Clean up existing map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Create new map
    const map = L.map(mapContainerRef.current).setView([userLocation.lat, userLocation.lng], 12);
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Create custom icons
    const redIcon = new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    const greenIcon = new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    const blueIcon = new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    // Add user location marker
    L.marker([userLocation.lat, userLocation.lng], { icon: redIcon })
      .addTo(map)
      .bindPopup('📍 You are here')
      .openPopup();

    // Calculate distances and find nearest shelter
    const sheltersWithDistance = rescueCenters.map(shelter => ({
      ...shelter,
      distance: calculateDistance(userLocation.lat, userLocation.lng, shelter.lat, shelter.lng)
    }));

    // Find nearest available shelter
    let nearest = null;
    let minDistance = Infinity;
    
    sheltersWithDistance.forEach(shelter => {
      if (shelter.availableCapacity > 0 && shelter.distance < minDistance) {
        minDistance = shelter.distance;
        nearest = shelter;
      }
    });

    setNearestShelter(nearest);

    // Add shelter markers
    sheltersWithDistance.forEach(shelter => {
      const isNearest = nearest && shelter.id === nearest.id;
      const isSelected = selectedShelter && shelter.id === selectedShelter.id;
      const isFull = shelter.availableCapacity <= 0;
      
      let icon = blueIcon; // Default blue for regular shelters
      if (isNearest) icon = greenIcon; // Green for nearest available
      if (isFull) icon = redIcon; // Red for full shelters

      const capacity = `${shelter.currentGuests}/${shelter.totalCapacity}`;
      const status = shelter.availableCapacity > 0 ? 'Available' : 'Full';
      const resources = `Water: ${shelter.waterLevel}% | Food: ${shelter.foodLevel}%`;
      
      const popupContent = `
        <div class="shelter-popup">
          <h4 style="margin: 0 0 8px 0; font-weight: bold; color: ${isFull ? '#dc2626' : '#059669'}">
            ${shelter.name}
          </h4>
          <p style="margin: 2px 0; font-size: 12px;"><strong>Status:</strong> ${status}</p>
          <p style="margin: 2px 0; font-size: 12px;"><strong>Capacity:</strong> ${capacity}</p>
          <p style="margin: 2px 0; font-size: 12px;"><strong>Distance:</strong> ${shelter.distance.toFixed(2)} km</p>
          <p style="margin: 2px 0; font-size: 12px;">${resources}</p>
          <p style="margin: 4px 0 0 0; font-size: 10px; color: #666;">
            ${isNearest ? '⭐ Nearest Available Shelter' : ''}
            ${isSelected ? '📍 Currently Selected' : ''}
          </p>
        </div>
      `;

      const marker = L.marker([shelter.lat, shelter.lng], { icon })
        .addTo(map)
        .bindPopup(popupContent);

      // Handle marker click
      marker.on('click', () => {
        onShelterSelect(shelter);
        toast.success(`Selected: ${shelter.name}`);
      });
    });

    mapInstanceRef.current = map;

    // Auto-select nearest shelter if none selected
    if (!selectedShelter && nearest) {
      onShelterSelect(nearest);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [userLocation, rescueCenters]);

  // Handle user location on mount and save to localStorage
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newLocation: UserLocation = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          };
          setUserLocation(newLocation);
          localStorage.setItem('lastLocation', JSON.stringify(newLocation));
        },
        (err) => {
          console.warn('Location error:', err.message || err.code || 'Unknown location error');
          let errorMessage = 'Failed to get location';
          
          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case err.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case err.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
            default:
              errorMessage = err.message || 'Unknown location error';
          }
          
          setLocationError(errorMessage);
          
          const saved = localStorage.getItem('lastLocation');
          if (saved) {
            try {
              const savedLocation = JSON.parse(saved);
              setUserLocation(savedLocation);
              console.log('Using saved location:', savedLocation);
            } catch (e) {
              console.error('Error parsing saved location:', e);
            }
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000
        }
      );
    }
  }, []);

  // Get current location
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
        const newLocation: UserLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };
        
        setUserLocation(newLocation);
        setIsLocating(false);
        localStorage.setItem('lastLocation', JSON.stringify(newLocation));
        
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
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000
      }
    );
  };

  // Find nearest available shelter
  const findNearestShelter = () => {
    if (!userLocation) {
      toast.error('Location required to find nearest shelter');
      getCurrentLocation();
      return;
    }

    if (nearestShelter) {
      onShelterSelect(nearestShelter);
      const distance = calculateDistance(
        userLocation.lat, 
        userLocation.lng, 
        nearestShelter.lat, 
        nearestShelter.lng
      );
      toast.success(`Nearest available shelter: ${nearestShelter.name} (${distance.toFixed(1)} km away)`);
    } else {
      toast.error('No available shelters found in your area');
    }
  };

  // Start navigation
  const startNavigation = () => {
    if (!selectedShelter) {
      toast.error('Please select a shelter first');
      return;
    }

    if (!userLocation) {
      toast.error('Location required for navigation');
      getCurrentLocation();
      return;
    }

    // Open in external maps app
    const mapsUrl = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${selectedShelter.lat},${selectedShelter.lng}`;
    window.open(mapsUrl, '_blank');
    
    toast.success(`Navigation started to ${selectedShelter.name}`);
  };

  // Emergency contact
  const handleEmergencyCall = () => {
    if (selectedShelter?.phone) {
      window.open(`tel:${selectedShelter.phone}`, '_self');
    } else {
      // General emergency number
      window.open('tel:108', '_self'); // India emergency number
    }
  };

  // Guide to nearest shelter using Google Maps
  const guideToNearestShelter = () => {
    const targetShelter = selectedShelter || nearestShelter;
    
    if (!targetShelter) {
      toast.error('No shelter selected. Please select a shelter first.');
      return;
    }

    if (!userLocation) {
      toast.error('Location required for navigation');
      getCurrentLocation();
      return;
    }

    const origin = `${userLocation.lat},${userLocation.lng}`;
    const destination = `${targetShelter.lat},${targetShelter.lng}`;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
    window.open(url, '_blank');
    
    toast.success(`Navigation started to ${targetShelter.name}`);
  };

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
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-blue-600" />
          ResQ Reach - External Map Integration
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        {/* Location Error Alert */}
        {locationError && (
          <Alert className="m-4 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {locationError}
            </AlertDescription>
          </Alert>
        )}

        {/* Leaflet Map Container */}
        <div className="relative">
          <div 
            ref={mapContainerRef}
            id="resq-map"
            className="h-96 w-full rounded-lg border border-gray-200"
          />
          
          {/* Map Loading Overlay */}
          {!userLocation && (
            <div className="absolute inset-0 bg-gradient-to-br from-green-200 via-blue-200 to-indigo-200 flex items-center justify-center rounded-lg">
              <div className="text-center p-8">
                <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  ResQ-Reach Map Loading...
                </h3>
                <p className="text-gray-600 mb-4">
                  Getting your location to show nearby shelters
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <MapPin className="h-4 w-4" />
                  {rescueCenters.length} shelters ready to display
                </div>
              </div>
            </div>
          )}

          {/* Guide Me Button - Positioned over map */}
          {userLocation && (nearestShelter || selectedShelter) && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
              <Button
                onClick={guideToNearestShelter}
                className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
              >
                🚗 Guide Me to {selectedShelter ? 'Selected' : 'Nearest'} Shelter
              </Button>
            </div>
          )}
        </div>

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
              <MapPin className="h-4 w-4" />
              Find Nearest
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={guideToNearestShelter}
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={(!selectedShelter && !nearestShelter) || !userLocation}
            >
              <Navigation className="h-4 w-4 mr-2" />
              Guide Me
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

          {/* Nearest Shelter Info */}
          {nearestShelter && (
            <div className="pt-3 border-t">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Nearest Available Shelter:</span>
                <Badge variant="default" className="bg-green-600">
                  {nearestShelter.distance?.toFixed(1)} km away
                </Badge>
              </div>
              <p className="text-sm font-medium text-gray-900">{nearestShelter.name}</p>
              <p className="text-xs text-gray-500">{nearestShelter.address}</p>
            </div>
          )}

          {/* Selected shelter info */}
          {selectedShelter && (
            <div className="pt-3 border-t">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{selectedShelter.name}</h4>
                <Badge variant={selectedShelter.availableCapacity > 0 ? "default" : "destructive"}>
                  {selectedShelter.availableCapacity > 0 ? 'Available' : 'Full'}
                </Badge>
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
        </div>
      </CardContent>
    </Card>
  );
};