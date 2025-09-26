// Backend Integration Configuration
// This file manages the connection between frontend and multiple backend options

export interface BackendConfig {
  name: string;
  baseUrl: string;
  type: 'express' | 'fastapi' | 'nodejs' | 'mongodb';
  healthEndpoint: string;
  authEndpoint: string;
  apiKey?: string;
  timeout: number;
}

import { getEnvVar, isDevelopment, isEnvVarConfigured } from '../utils/envUtils';

// Create backend configurations - disabled for offline-first mode
const createBackendConfigs = (): Record<string, BackendConfig> => {
  const configs: Record<string, BackendConfig> = {};

  // All backend configurations are disabled for offline-first mode
  // The system will operate entirely with localStorage

  return configs;
};

export const backends: Record<string, BackendConfig> = createBackendConfigs();

export class BackendManager {
  private currentBackend: BackendConfig;
  private fallbackBackend: BackendConfig;
  private availableBackends: BackendConfig[] = [];
  private isOfflineMode: boolean = true;

  constructor() {
    // Initialize with offline-first configuration
    this.currentBackend = {
      name: 'Offline Mode',
      baseUrl: '',
      type: 'mongodb',
      healthEndpoint: '',
      authEndpoint: '',
      timeout: 0
    };
    this.fallbackBackend = this.currentBackend;
    
    console.log('🔧 Backend Manager initialized in offline-first mode');
  }

  private determineBackendType(): string {
    // Always return offline mode
    return 'offline';
  }

  getCurrentBackend(): BackendConfig {
    return this.currentBackend;
  }

  getFallbackBackend(): BackendConfig {
    return this.fallbackBackend;
  }

  async checkBackendHealth(backend: BackendConfig): Promise<boolean> {
    // Always return false in offline-first mode - no network calls
    console.log('📱 Offline-first mode: No backend health checks performed');
    return false;
  }

  async findAvailableBackends(): Promise<BackendConfig[]> {
    console.log('📱 Offline-first mode: No backend discovery performed');
    this.availableBackends = [];
    return this.availableBackends;
  }

  async switchToAvailableBackend(): Promise<BackendConfig> {
    console.log('📱 Offline-first mode: Using local storage only');
    return this.currentBackend;
  }

  // Helper method to format request headers for different backend types
  getRequestHeaders(token?: string): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // For all backend types, use standard JWT authentication
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  // Method to get the full API URL for an endpoint
  getApiUrl(endpoint: string): string {
    const baseUrl = this.currentBackend.baseUrl;
    
    // Handle different URL patterns
    if (endpoint.startsWith('/')) {
      // For Supabase functions, the baseUrl already includes /api
      // For other backends, append endpoint directly
      return `${baseUrl}${endpoint}`;
    }
    
    return `${baseUrl}/${endpoint}`;
  }
}

// Export singleton instance
export const backendManager = new BackendManager();

// Helper function to get current backend info
export const getCurrentBackendInfo = () => {
  const backend = backendManager.getCurrentBackend();
  return {
    name: backend.name,
    type: backend.type,
    isAvailable: true, // Will be updated by health checks
    baseUrl: backend.baseUrl,
  };
};