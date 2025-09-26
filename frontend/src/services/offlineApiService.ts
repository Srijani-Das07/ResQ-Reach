// Offline-first API service for disaster management system
// This service prioritizes offline functionality and localStorage

export class OfflineApiService {
  private isOnline: boolean = false;
  private token: string | null = null;

  constructor() {
    // Get token from localStorage on initialization
    this.token = localStorage.getItem('authToken');
    
    // Start in offline mode - no backend connection attempts
    this.isOnline = false;
    console.log('🔧 API Service initialized in offline-first mode');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  getToken() {
    return this.token || localStorage.getItem('authToken');
  }

  isOffline(): boolean {
    return !this.isOnline;
  }

  // Method to enable online mode when backend becomes available
  public setOnlineMode(online: boolean) {
    this.isOnline = online;
    console.log(online ? '✅ API Service is now online' : '📱 API Service is now offline');
  }

  // All API methods immediately fallback to offline mode
  async get<T>(endpoint: string): Promise<T> {
    console.log(`📱 Offline mode: GET ${endpoint}`);
    throw new Error('OFFLINE_MODE');
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    console.log(`📱 Offline mode: POST ${endpoint}`);
    throw new Error('OFFLINE_MODE');
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    console.log(`📱 Offline mode: PUT ${endpoint}`);
    throw new Error('OFFLINE_MODE');
  }

  async delete<T>(endpoint: string): Promise<T> {
    console.log(`📱 Offline mode: DELETE ${endpoint}`);
    throw new Error('OFFLINE_MODE');
  }

  // Optional: Method to attempt backend connection
  async tryConnect(baseUrl: string): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(`${baseUrl}/api/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        this.setOnlineMode(true);
        return true;
      }
    } catch (error) {
      // Expected when backend is not available
    }
    
    this.setOnlineMode(false);
    return false;
  }

  // Method to manually retry connection
  async retryConnection(): Promise<boolean> {
    return false; // Always offline in this implementation
  }

  // Get API status for UI display
  getStatus() {
    return {
      isOnline: this.isOnline,
      mode: 'offline-first',
      backendUrl: 'none',
      hasToken: !!this.token
    };
  }
}

export const offlineApiService = new OfflineApiService();