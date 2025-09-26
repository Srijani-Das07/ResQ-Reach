import { apiService } from './api';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'emergency' | 'warning' | 'info' | 'update';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  timestamp: string;
  expiresAt?: string;
  targetAudience?: string[];
  location?: {
    latitude: number;
    longitude: number;
    radius: number; // in kilometers
  };
}

export interface CreateNotificationData {
  title: string;
  message: string;
  type: Notification['type'];
  priority: Notification['priority'];
  expiresAt?: string;
  targetAudience?: string[];
  location?: {
    latitude: number;
    longitude: number;
    radius: number;
  };
}

export class NotificationService {
  private getMockNotifications(): Notification[] {
    return [
      {
        id: 'notif_001',
        title: 'Weather Alert',
        message: 'Heavy rainfall expected in the next 24 hours. Please stay indoors and avoid travel.',
        type: 'warning',
        priority: 'high',
        isRead: false,
        timestamp: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'notif_002',
        title: 'Emergency Services Active',
        message: 'All emergency shelters are now operational and accepting evacuees.',
        type: 'info',
        priority: 'medium',
        isRead: false,
        timestamp: new Date().toISOString()
      }
    ];
  }

  async getAllNotifications(): Promise<Notification[]> {
    try {
      return await apiService.get<Notification[]>('/api/notifications');
    } catch (error) {
      console.log('Using offline mode for notifications');
      return this.getMockNotifications();
    }
  }

  async getUrgentNotifications(): Promise<Notification[]> {
    try {
      return await apiService.get<Notification[]>('/api/notifications/urgent');
    } catch (error) {
      console.log('Using offline mode for urgent notifications');
      const allNotifications = this.getMockNotifications();
      return allNotifications.filter(n => n.priority === 'urgent' || n.priority === 'high');
    }
  }

  async createNotification(notificationData: CreateNotificationData): Promise<Notification> {
    try {
      return await apiService.post<Notification>('/api/notifications', notificationData);
    } catch (error) {
      console.log('Using offline mode for creating notification');
      // Return a mock notification
      return {
        id: `notif_${Date.now()}`,
        ...notificationData,
        isRead: false,
        timestamp: new Date().toISOString()
      };
    }
  }

  async markAsRead(notificationId: string): Promise<Notification> {
    try {
      return await apiService.put<Notification>(`/api/notifications/${notificationId}/read`);
    } catch (error) {
      console.log('Using offline mode for marking notification as read');
      const notifications = this.getMockNotifications();
      const notification = notifications.find(n => n.id === notificationId);
      if (!notification) {
        throw new Error('Notification not found');
      }
      return { ...notification, isRead: true };
    }
  }

  // Helper methods for frontend
  async getUnreadNotifications(): Promise<Notification[]> {
    const notifications = await this.getAllNotifications();
    return notifications.filter(notification => !notification.isRead);
  }

  async getNotificationsByType(type: Notification['type']): Promise<Notification[]> {
    const notifications = await this.getAllNotifications();
    return notifications.filter(notification => notification.type === type);
  }

  async getActiveNotifications(): Promise<Notification[]> {
    const notifications = await this.getAllNotifications();
    const now = new Date();
    return notifications.filter(notification => {
      if (!notification.expiresAt) return true;
      return new Date(notification.expiresAt) > now;
    });
  }

  // Get notifications relevant to user's location
  async getLocationBasedNotifications(userLat: number, userLng: number): Promise<Notification[]> {
    const notifications = await this.getActiveNotifications();
    return notifications.filter(notification => {
      if (!notification.location) return true; // Global notifications
      
      const distance = this.calculateDistance(
        userLat, userLng, 
        notification.location.latitude, 
        notification.location.longitude
      );
      
      return distance <= notification.location.radius;
    });
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.degreesToRadians(lat2 - lat1);
    const dLon = this.degreesToRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.degreesToRadians(lat1)) * Math.cos(this.degreesToRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private degreesToRadians(degrees: number): number {
    return degrees * (Math.PI/180);
  }
}

export const notificationService = new NotificationService();