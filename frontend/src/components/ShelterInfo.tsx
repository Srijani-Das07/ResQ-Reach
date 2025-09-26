import React from 'react';
import { Phone, Users, Droplets, Utensils, MapPin, Wifi } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { useLanguage } from './LanguageContext';
import { RescueCenter } from './UnifiedDatabaseContext';
import { toast } from 'sonner@2.0.3';

interface ShelterInfoProps {
  shelter: RescueCenter | null;
}

export const ShelterInfo: React.FC<ShelterInfoProps> = ({ shelter }) => {
  const { translate } = useLanguage();

  if (!shelter) {
    return (
      <div className="w-80 bg-gray-50 p-6 flex items-center justify-center text-gray-500 border-l">
        <div className="text-center">
          <MapPin className="h-12 w-12 mx-auto mb-2 text-gray-300" />
          <p>Select a shelter from the map to view details</p>
        </div>
      </div>
    );
  }

  const occupancyPercentage = (shelter.currentGuests / shelter.totalCapacity) * 100;
  const isFull = occupancyPercentage >= 100;

  const emergencyNumbers = ['8838724140', '6380152442', shelter.phone];

  const handleEmergencyCall = async () => {
    // Sequential calling logic
    for (let i = 0; i < emergencyNumbers.length; i++) {
      const number = emergencyNumbers[i];
      toast.info(`Attempting to call ${number}...`);
      
      // Simulate call attempt
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate busy status for first two numbers (for demo)
      const isBusy = i < 2 && Math.random() > 0.3;
      
      if (!isBusy) {
        toast.success(`Connected to ${number}`);
        return;
      } else {
        toast.warning(`${number} is busy, trying next number...`);
      }
    }
    
    toast.error('All emergency numbers are currently busy. Please try again later.');
  };

  return (
    <div className="w-80 bg-white border-l overflow-y-auto">
      <div className="p-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="text-lg">{shelter.name}</span>
              <Badge variant={isFull ? "destructive" : "secondary"}>
                {isFull ? translate('full') : translate('available')}
              </Badge>
            </CardTitle>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {shelter.address}
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* People Count */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 justify-between">
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  {translate('peopleCount')}
                </span>
                <span className="text-sm font-medium">
                  {shelter.currentGuests}/{shelter.totalCapacity}
                </span>
              </div>
              <Progress value={occupancyPercentage} className="h-2" />
              <p className="text-xs text-gray-500">
                {Math.round(occupancyPercentage)}% capacity used
              </p>
            </div>

            {/* Water Supply */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 justify-between">
                <span className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-blue-500" />
                  {translate('waterSupply')}
                </span>
                <span className="text-sm font-medium">{shelter.waterLevel}%</span>
              </div>
              <Progress 
                value={shelter.waterLevel} 
                className="h-2"
              />
              <p className="text-xs text-gray-500">
                {shelter.waterLevel > 70 ? 'Good supply' : shelter.waterLevel > 40 ? 'Moderate supply' : 'Low supply'}
              </p>
            </div>

            {/* Food Supply */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 justify-between">
                <span className="flex items-center gap-2">
                  <Utensils className="h-4 w-4 text-orange-500" />
                  {translate('foodSupply')}
                </span>
                <span className="text-sm font-medium">{shelter.foodLevel}%</span>
              </div>
              <Progress 
                value={shelter.foodLevel} 
                className="h-2"
              />
              <p className="text-xs text-gray-500">
                {shelter.foodLevel > 70 ? 'Well stocked' : shelter.foodLevel > 40 ? 'Adequate stock' : 'Low stock'}
              </p>
            </div>

            {/* Facilities */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Wifi className="h-4 w-4 text-purple-600" />
                Facilities
              </h4>
              <div className="flex flex-wrap gap-1">
                {shelter.facilities.map((facility, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {facility}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Emergency Contact */}
            <Button
              onClick={handleEmergencyCall}
              className="w-full bg-red-600 hover:bg-red-700 text-white mt-4"
            >
              <Phone className="h-4 w-4 mr-2" />
              {translate('emergencyContact')}
            </Button>

            <div className="text-xs text-center text-gray-500 mt-2 space-y-1">
              <p>Primary: 8838724140</p>
              <p>Secondary: 6380152442</p>
              <p>Shelter: {shelter.phone}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};