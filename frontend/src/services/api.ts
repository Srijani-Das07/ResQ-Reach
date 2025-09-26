import { config } from '../config/environment';

// Base API service with common functionality
export class ApiService {
  private baseURL: string;
  private token: string | null = null;
  private isOfflineMode: boolean = false;

  constructor(baseURL?: string) {
    this.baseURL = baseURL || 'offline';
    // Get token from localStorage on initialization
    this.token = localStorage.getItem('authToken');
    
    // Always stay in offline mode - no backend connection attempts
    this.isOfflineMode = true;
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

  private async checkBackendAvailability(): Promise<void> {
    // No backend availability checks in offline-first mode
    this.isOfflineMode = true;
    console.log('📱 Offline-first mode: No backend connectivity checks');
  }

  public isOffline(): boolean {
    return this.isOfflineMode;
  }

  // Method to manually retry backend connection
  public async retryConnection(): Promise<boolean> {
    try {
      await this.checkBackendAvailability();
      return !this.isOfflineMode;
    } catch (error) {
      return false;
    }
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    // Always throw OFFLINE_MODE error to trigger fallbacks - no network requests
    console.log(`📱 Offline-first mode: Blocking request to ${endpoint}`);
    throw new Error('OFFLINE_MODE');
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiService = new ApiService();