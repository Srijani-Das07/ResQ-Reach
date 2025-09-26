import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { Badge } from './ui/badge';
import { apiService } from '../services/api';

export const ConnectivityIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(!apiService.isOffline());

  useEffect(() => {
    const checkConnectivity = () => {
      setIsOnline(!apiService.isOffline());
    };

    // Check connectivity every 30 seconds
    const interval = setInterval(checkConnectivity, 30000);

    // Also check when component mounts
    checkConnectivity();

    return () => clearInterval(interval);
  }, []);

  if (isOnline) {
    return (
      <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
        <Wifi className="h-3 w-3 mr-1" />
        Online
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
      <WifiOff className="h-3 w-3 mr-1" />
      Offline Mode
    </Badge>
  );
};