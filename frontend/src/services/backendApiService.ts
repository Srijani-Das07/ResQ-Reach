import { backendManager, BackendConfig } from '../config/backend-integration';

// Enhanced API service that works with multiple backend types
export class BackendApiService {
  private token: string | null = null;
  private isOfflineMode: boolean = false;
  private maxRetries: number = 1; // Reduced retries to prevent timeout
  private retryDelay: number = 500; // Reduced delay to 0.5 seconds

  constructor() {
    // Get token from localStorage on initialization
    this.token = localStorage.getItem('authToken');
    
    // Initialize backend availability check
    this.initializeBackend();
  }

  private async initializeBackend() {
    // Always start in offline mode - no backend connection attempts
    this.isOfflineMode = true;
    console.log('📱 Backend API Service initialized in offline-first mode');
    
    // Clear any pending timeouts to prevent issues
    try {
      await Promise.resolve();
    } catch (error) {
      console.log('Backend initialization completed');
    }
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

  public isOffline(): boolean {
    return this.isOfflineMode;
  }

  // Method to manually retry backend connection
  public async retryConnection(): Promise<boolean> {
    // Always stay offline in offline-first mode
    console.log('📱 Offline-first mode: Connection retry disabled');
    this.isOfflineMode = true;
    return false;
  }

  // Get current backend information
  public getBackendInfo() {
    return {
      name: 'Offline-First Mode',
      type: 'offline',
      baseUrl: 'localStorage',
      isOffline: true,
    };
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async requestWithRetry<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount: number = 0
  ): Promise<T> {
    // Add timeout to prevent long-running operations
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 5000); // 5 second timeout
    });

    try {
      return await Promise.race([
        this.request<T>(endpoint, options),
        timeoutPromise
      ]);
    } catch (error) {
      // If it's an offline error and we haven't exhausted retries, try switching backends
      if (error instanceof Error && error.message === 'OFFLINE_MODE' && retryCount < this.maxRetries) {
        console.log(`🔄 Attempt ${retryCount + 1}: Trying to switch backends...`);
        
        await this.sleep(this.retryDelay * (retryCount + 1)); // Exponential backoff
        
        const switched = await this.retryConnection();
        if (switched) {
          return await this.requestWithRetry<T>(endpoint, options, retryCount + 1);
        }
      }
      
      throw error;
    }
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    // Always throw OFFLINE_MODE error in offline-first mode - no network requests
    console.log(`📱 Offline-first mode: Blocking request to ${endpoint}`);
    throw new Error('OFFLINE_MODE');
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.requestWithRetry<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.requestWithRetry<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.requestWithRetry<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.requestWithRetry<T>(endpoint, { method: 'DELETE' });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.requestWithRetry<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // Method to manually switch backend (disabled in offline-first mode)
  async switchBackend(backendName: string): Promise<boolean> {
    console.log('📱 Offline-first mode: Backend switching disabled');
    return false;
  }
}

export const backendApiService = new BackendApiService();