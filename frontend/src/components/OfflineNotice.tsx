import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { Database, CheckCircle } from 'lucide-react';

export const OfflineNotice: React.FC = () => {
  const [showNotice, setShowNotice] = useState(false);

  useEffect(() => {
    // Show initial notice that the app is running in offline-first mode
    setShowNotice(true);
    
    // Hide notice after 3 seconds
    const timer = setTimeout(() => {
      setShowNotice(false);
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  if (!showNotice) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <Alert className="border-blue-500 bg-blue-50">
        <div className="flex items-center">
          <Database className="h-4 w-4 text-blue-600 mr-2" />
          <AlertDescription className="text-blue-800">
            <strong>Offline-First Mode:</strong> All data is stored locally. Ready for MongoDB integration.
          </AlertDescription>
        </div>
      </Alert>
    </div>
  );
};