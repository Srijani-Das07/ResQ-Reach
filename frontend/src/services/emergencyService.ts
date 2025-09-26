import { apiService } from './api';

export interface EmergencyContact {
  id: string;
  name: string;
  number: string;
  type: 'police' | 'fire' | 'medical' | 'disaster' | 'general';
  description?: string;
  isActive: boolean;
}

export interface EmergencyService {
  id: string;
  name: string;
  number: string;
  description: string;
  category: string;
  isAvailable: boolean;
}

export interface CallLog {
  id: string;
  contactId: string;
  userId: string;
  timestamp: string;
  duration?: number;
  status: 'completed' | 'missed' | 'ongoing';
}

export class EmergencyService {
  async getEmergencyContacts(): Promise<EmergencyContact[]> {
    try {
      return await apiService.get<EmergencyContact[]>('/api/emergency/contacts');
    } catch (error) {
      console.log('Using offline mode for emergency contacts');
      return this.getDefaultEmergencyContacts();
    }
  }

  async updateEmergencyContacts(contacts: EmergencyContact[]): Promise<EmergencyContact[]> {
    try {
      return await apiService.put<EmergencyContact[]>('/api/emergency/contacts', { contacts });
    } catch (error) {
      console.log('Using offline mode for updating emergency contacts');
      return contacts; // Return the input as if it was saved
    }
  }

  async logEmergencyCall(contactId: string, duration?: number): Promise<CallLog> {
    try {
      return await apiService.post<CallLog>('/api/emergency/call/log', {
        contactId,
        duration,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.log('Using offline mode for logging emergency call');
      return {
        id: `call_${Date.now()}`,
        contactId,
        userId: 'offline_user',
        timestamp: new Date().toISOString(),
        duration,
        status: 'completed'
      };
    }
  }

  async getEmergencyServices(): Promise<EmergencyService[]> {
    try {
      return await apiService.get<EmergencyService[]>('/api/emergency/services');
    } catch (error) {
      console.log('Using offline mode for emergency services');
      return [
        {
          id: 'ambulance',
          name: 'Ambulance Service',
          number: '108',
          description: '24/7 medical emergency response',
          category: 'medical',
          isAvailable: true
        },
        {
          id: 'fire_rescue',
          name: 'Fire & Rescue',
          number: '101',
          description: 'Fire fighting and rescue operations',
          category: 'fire',
          isAvailable: true
        }
      ];
    }
  }

  // Helper method to get contacts by type
  async getContactsByType(type: EmergencyContact['type']): Promise<EmergencyContact[]> {
    const contacts = await this.getEmergencyContacts();
    return contacts.filter(contact => contact.type === type && contact.isActive);
  }

  // Default emergency contacts if backend doesn't have any
  getDefaultEmergencyContacts(): EmergencyContact[] {
    return [
      {
        id: 'police',
        name: 'Police',
        number: '100',
        type: 'police',
        description: 'Emergency police services',
        isActive: true
      },
      {
        id: 'fire',
        name: 'Fire Department',
        number: '101',
        type: 'fire',
        description: 'Fire emergency services',
        isActive: true
      },
      {
        id: 'medical',
        name: 'Medical Emergency',
        number: '108',
        type: 'medical',
        description: 'Medical emergency services',
        isActive: true
      },
      {
        id: 'disaster',
        name: 'Disaster Management',
        number: '8838724140',
        type: 'disaster',
        description: 'Disaster management helpline',
        isActive: true
      }
    ];
  }
}

export const emergencyService = new EmergencyService();