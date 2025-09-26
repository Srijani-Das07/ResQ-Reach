// Database utilities for MongoDB integration
// These utilities provide database-agnostic functions for the disaster management system

export interface DatabaseConnection {
  isConnected: boolean;
  type: 'mongodb' | 'offline';
  lastConnected?: string;
}

export class DatabaseUtils {
  private static instance: DatabaseUtils;
  private connection: DatabaseConnection = { isConnected: false, type: 'offline' };

  private constructor() {
    this.checkConnection();
  }

  public static getInstance(): DatabaseUtils {
    if (!DatabaseUtils.instance) {
      DatabaseUtils.instance = new DatabaseUtils();
    }
    return DatabaseUtils.instance;
  }

  private async checkConnection(): Promise<void> {
    try {
      // In a real implementation, this would check MongoDB connection
      // For now, we simulate offline mode
      this.connection = {
        isConnected: false,
        type: 'offline',
        lastConnected: new Date().toISOString()
      };
    } catch (error) {
      console.log('Database connection check completed');
    }
  }

  public getConnection(): DatabaseConnection {
    return this.connection;
  }

  public async reconnect(): Promise<boolean> {
    try {
      await this.checkConnection();
      return this.connection.isConnected;
    } catch (error) {
      console.log('Database reconnection attempted');
      return false;
    }
  }

  // Helper method to generate MongoDB-compatible IDs
  public generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Helper method to format dates for MongoDB
  public formatDate(date: Date | string): string {
    if (typeof date === 'string') {
      return new Date(date).toISOString();
    }
    return date.toISOString();
  }

  // Helper method to sanitize data for MongoDB storage
  public sanitizeData<T extends Record<string, any>>(data: T): T {
    const sanitized = { ...data };
    
    // Remove undefined values
    Object.keys(sanitized).forEach(key => {
      if (sanitized[key] === undefined) {
        delete sanitized[key];
      }
    });

    return sanitized;
  }

  // Helper method for local storage operations (fallback)
  public getFromLocalStorage<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  public saveToLocalStorage<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  public removeFromLocalStorage(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }
}

export const dbUtils = DatabaseUtils.getInstance();