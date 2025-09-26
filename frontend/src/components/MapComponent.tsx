import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Users } from 'lucide-react';
import { Button } from './ui/button';
import { useLanguage } from './LanguageContext';
import { useUnifiedDatabase, RescueCenter } from './UnifiedDatabaseContext';
import { toast } from 'sonner@2.0.3';

interface MapComponentProps {
  selectedShelter: RescueCenter | null;
  onShelterSelect: (shelter: RescueCenter) => void;
}

export const MapComponent: React.FC<MapComponentProps> = ({ selectedShelter, onShelterSelect }) => {
  const { translate, dataSaverMode } = useLanguage();
  const { rescueCenters, loading } = useUnifiedDatabase();
  const [showDirections, setShowDirections] = useState(false);

  const handleGuideMe = () => {
    if (selectedShelter) {
      setShowDirections(true);
      toast.success(`Navigation started to ${selectedShelter.name}`);
    } else {
      toast.error('Please select a shelter first');
    }
  };

  if (loading) {
    return (
      <div className="relative bg-gray-100 rounded-lg overflow-hidden shadow-lg">
        <div className="bg-blue-600 text-white p-3">
          <h3 className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {translate('gps')}
          </h3>
        </div>
        <div className="h-96 flex items-center justify-center">
          <div className="text-gray-500">Loading rescue centers...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-gray-100 rounded-lg overflow-hidden shadow-lg">
      {/* Map Header */}
      <div className="bg-blue-600 text-white p-3">
        <h3 className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          {translate('gps')}
        </h3>
      </div>

      {/* Mock Map Area */}
      <div 
        className={`relative h-96 bg-gradient-to-br from-green-200 to-blue-200 ${
          dataSaverMode ? 'filter grayscale' : ''
        }`}
      >
        {/* Current Location (Center) */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg pulse"></div>
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs bg-blue-600 text-white px-2 py-1 rounded whitespace-nowrap">
            Your Location
          </div>
        </div>

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

          return (
            <div
              key={shelter.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer`}
              style={positions[index]}
              onClick={() => onShelterSelect(shelter)}
            >
              <div 
                className={`w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center ${
                  isSelected 
                    ? 'bg-yellow-500 scale-125' 
                    : isFull 
                    ? 'bg-red-500' 
                    : 'bg-green-500'
                } hover:scale-110 transition-transform`}
              >
                <Users className="h-3 w-3 text-white" />
              </div>
              
              {/* Shelter name on hover/selection */}
              <div className={`absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs bg-gray-800 text-white px-2 py-1 rounded whitespace-nowrap ${
                isSelected ? 'block' : 'hidden'
              }`}>
                {shelter.name}
              </div>

              {/* Direction line when showing directions */}
              {showDirections && isSelected && (
                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
                  <line
                    x1="50%"
                    y1="50%"
                    x2="50%"
                    y2="50%"
                    stroke="#3B82F6"
                    strokeWidth="3"
                    strokeDasharray="5,5"
                    className="animate-pulse"
                  />
                </svg>
              )}
            </div>
          );
        })}

        {/* Data Saver Overlay */}
        {dataSaverMode && (
          <div className="absolute top-2 left-2 bg-yellow-500 text-black px-2 py-1 rounded text-xs">
            Data Saver Mode
          </div>
        )}
      </div>

      {/* Guide Me Button */}
      <div className="p-4">
        <Button
          onClick={handleGuideMe}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
          disabled={!selectedShelter}
        >
          <Navigation className="h-5 w-5 mr-2" />
          {translate('guideMe')}
        </Button>
      </div>

      <style jsx="true">{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.7;
          }
        }
        .pulse {
          animation: pulse 2s infinite;
        }
      `}</style>
    </div>
  );
};