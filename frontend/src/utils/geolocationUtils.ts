// Geolocation utilities for better error handling and user experience

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: string;
}

export interface LocationError {
  code: number;
  message: string;
  userFriendlyMessage: string;
}

export const getLocationErrorMessage = (error: GeolocationPositionError): LocationError => {
  const errorMessages = {
    1: {
      message: 'Location access denied by user',
      userFriendlyMessage: 'Location access was denied. Please enable location services to send your exact location with emergency alerts.'
    },
    2: {
      message: 'Location information unavailable',
      userFriendlyMessage: 'Location information is currently unavailable. Emergency alert will be sent without location data.'
    },
    3: {
      message: 'Location request timed out',
      userFriendlyMessage: 'Location request timed out. Emergency alert will be sent without location data.'
    }
  };

  const errorInfo = errorMessages[error.code as keyof typeof errorMessages] || {
    message: 'Unknown location error',
    userFriendlyMessage: 'Unable to get your location. Emergency alert will be sent without location data.'
  };

  return {
    code: error.code,
    message: errorInfo.message,
    userFriendlyMessage: errorInfo.userFriendlyMessage
  };
};

export const getCurrentLocation = (): Promise<LocationData> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000, // 10 seconds
      maximumAge: 60000 // 1 minute
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString()
        });
      },
      (error) => {
        const locationError = getLocationErrorMessage(error);
        console.log('Geolocation error:', locationError);
        reject(locationError);
      },
      options
    );
  });
};

export const isLocationSupported = (): boolean => {
  return 'geolocation' in navigator;
};