import React, { useState, useEffect } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Wifi, WifiOff, Server, Zap, Globe, Monitor } from 'lucide-react';
import { backendApiService } from '../services/backendApiService';

interface BackendInfo {
  name: string;
  type: string;
  baseUrl: string;
  isOffline: boolean;
}

export const BackendStatus: React.FC = () => {
  const [backendInfo, setBackendInfo] = useState<BackendInfo>({
    name: 'Initializing...',
    type: 'unknown',
    baseUrl: '',
    isOffline: true
  });
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Initial update with a small delay to allow backend initialization
    const timer = setTimeout(() => {
      updateBackendInfo();
    }, 1000);

    // Update status every 30 seconds
    const interval = setInterval(updateBackendInfo, 30000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const updateBackendInfo = () => {
    try {
      const info = backendApiService.getBackendInfo();
      setBackendInfo(info);
    } catch (error) {
      console.warn('Failed to get backend info:', error);
      setBackendInfo({
        name: 'Error',
        type: 'unknown',
        baseUrl: '',
        isOffline: true
      });
    }
  };

  const handleRetryConnection = async () => {
    setIsConnecting(true);
    try {
      const success = await backendApiService.retryConnection();
      if (success) {
        updateBackendInfo();
      }
    } catch (error) {
      console.error('Failed to retry connection:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const getBackendIcon = (type: string) => {
    switch (type) {
      case 'supabase-functions':
        return <Zap className="w-3 h-3" />;
      case 'nodejs':
      case 'express':
        return <Server className="w-3 h-3" />;
      case 'fastapi':
        return <Globe className="w-3 h-3" />;
      default:
        return <Monitor className="w-3 h-3" />;
    }
  };

  const getStatusColor = (isOffline: boolean) => {
    return isOffline ? 'destructive' : 'default';
  };

  const getStatusText = (isOffline: boolean) => {
    return isOffline ? 'Offline' : 'Online';
  };

  // Always render something, even during initialization
  const isInitializing = backendInfo.name === 'Initializing...';

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2"
          aria-label={`Backend status: ${getStatusText(backendInfo.isOffline)}. Click to view details.`}
        >
          <div className="flex items-center gap-1">
            {backendInfo.isOffline ? (
              <WifiOff className="w-3 h-3 text-destructive" />
            ) : (
              <Wifi className="w-3 h-3 text-green-500" />
            )}
            <Badge variant={getStatusColor(backendInfo.isOffline)} className="text-xs">
              {getStatusText(backendInfo.isOffline)}
            </Badge>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end" aria-describedby="backend-status-description">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Backend Status</h4>
            <Badge variant={getStatusColor(backendInfo.isOffline)}>
              {getStatusText(backendInfo.isOffline)}
            </Badge>
          </div>
          
          <div id="backend-status-description" className="sr-only">
            Backend connection status and information for the disaster management system.
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {getBackendIcon(backendInfo.type)}
              <span className="text-sm font-medium">{backendInfo.name}</span>
            </div>
            
            <div className="text-xs text-muted-foreground">
              <div>Type: {backendInfo.type}</div>
              <div>URL: {backendInfo.baseUrl}</div>
            </div>
          </div>

          {backendInfo.isOffline && (
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">
                Running in offline mode with local data and mock responses.
              </div>
              <Button 
                onClick={handleRetryConnection}
                disabled={isConnecting}
                size="sm"
                className="w-full"
              >
                {isConnecting ? 'Connecting...' : 'Retry Connection'}
              </Button>
            </div>
          )}

          {!backendInfo.isOffline && (
            <div className="text-xs text-green-600">
              ✅ Connected and ready for real-time operations
            </div>
          )}

          <div className="text-xs text-muted-foreground pt-2 border-t">
            The system automatically switches between available backends
            and falls back to offline mode when needed.
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};