import { backendApiService } from './backendApiService';
import { mongoService } from './mongoService';

// Frontend interfaces for the unified database
export interface RescueCenter {
  id: string;
  name: string;
  lat: number;
  lng: number;
  totalCapacity: number;
  currentGuests: number;
  availableCapacity: number;
  waterLevel: number; // 0-100
  foodLevel: number; // 0-100
  phone: string;
  address: string;
  facilities: string[];
  status: 'active' | 'inactive' | 'full';
  lastUpdated: string;
  emergencyContacts: {
    primary: string;
    secondary?: string;
  };
  supplies: {
    medical: number; // 0-100
    bedding: number; // 0-100
    clothing: number; // 0-100
  };
  staffCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Guest {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  gender: string;
  dateOfBirth?: string;
  age?: string;
  mobilePhone: string;
  alternateMobile?: string;
  email?: string;
  permanentAddress?: string;
  familyMembers?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  dependents?: string;
  medicalConditions?: string;
  currentMedications?: string;
  allergies?: string;
  disabilityStatus?: string;
  specialNeeds?: string;
  centerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DisasterStats {
  totalCenters: number;
  totalCapacity: number;
  totalOccupancy: number;
  availableSpace: number;
  centersWithCriticalSupplies: number;
  recentlyUpdatedCenters: number;
  averageOccupancyRate: number;
}

// Map API response to local interface
const mapApiCenterToLocal = (apiCenter: any): RescueCenter => {
  return {
    id: apiCenter.id,
    name: apiCenter.name,
    lat: apiCenter.latitude,
    lng: apiCenter.longitude,
    totalCapacity: apiCenter.capacity,
    currentGuests: apiCenter.current_occupancy || 0,
    availableCapacity: apiCenter.capacity - (apiCenter.current_occupancy || 0),
    waterLevel: apiCenter.resources?.water || 0,
    foodLevel: apiCenter.resources?.food || 0,
    phone: apiCenter.contact_number,
    address: apiCenter.address,
    facilities: apiCenter.facilities || [],
    status: apiCenter.status,
    lastUpdated: apiCenter.last_updated,
    emergencyContacts: {
      primary: apiCenter.contact_number,
    },
    supplies: {
      medical: apiCenter.resources?.medicine || 0,
      bedding: apiCenter.resources?.blankets || 0,
      clothing: apiCenter.resources?.tents || 0, // Using tents as clothing proxy
    },
    staffCount: 20, // Default staff count
    createdAt: apiCenter.created_at || apiCenter.last_updated,
    updatedAt: apiCenter.updated_at || apiCenter.last_updated
  };
};

export class HttpDatabaseService {
  // Rescue Center operations
  async getAllCenters(): Promise<RescueCenter[]> {
    // Try MongoDB first if available
    if (mongoService.isMongoAvailable()) {
      try {
        const mongoCenters = await mongoService.getAllCenters();
        return mongoCenters.map(this.mapMongoToHttp);
      } catch (error) {
        console.log('MongoDB query failed, trying HTTP API');
      }
    }

    // Fallback to HTTP API
    try {
      const apiCenters = await backendApiService.get<any[]>('/centers');
      
      // Map API format to local format
      return apiCenters.map(mapApiCenterToLocal);
    } catch (error) {
      console.log('HTTP API unavailable, using mock data for centers');
      // Return mock data as fallback
      return this.getMockCenters();
    }
  }

  async getCenterById(id: string): Promise<RescueCenter | null> {
    try {
      const apiCenter = await backendApiService.get<any>(`/centers/${id}`);
      return mapApiCenterToLocal(apiCenter);
    } catch (error) {
      console.log('API unavailable, using mock data for center:', id);
      // Fallback to mock data
      const mockCenters = this.getMockCenters();
      return mockCenters.find(center => center.id === id) || null;
    }
  }

  async createCenter(centerData: Omit<RescueCenter, 'id' | 'createdAt' | 'updatedAt'>): Promise<RescueCenter> {
    try {
      // Map local format to API format
      const apiData = {
        name: centerData.name,
        latitude: centerData.lat,
        longitude: centerData.lng,
        capacity: centerData.totalCapacity,
        contactNumber: centerData.phone,
        address: centerData.address,
        facilities: centerData.facilities,
        resources: {
          water: centerData.waterLevel,
          food: centerData.foodLevel,
          medicine: centerData.supplies.medical,
          blankets: centerData.supplies.bedding,
          tents: centerData.supplies.clothing
        }
      };

      const apiCenter = await backendApiService.post<any>('/centers', apiData);
      return mapApiCenterToLocal(apiCenter);
    } catch (error) {
      console.log('API unavailable, center creation will be stored locally');
      throw new Error('API_UNAVAILABLE');
    }
  }

  async updateCenter(id: string, updates: Partial<RescueCenter>): Promise<RescueCenter> {
    try {
      // Map local format to API format for updates
      const apiUpdates: any = {};
      
      if (updates.name) apiUpdates.name = updates.name;
      if (updates.lat) apiUpdates.latitude = updates.lat;
      if (updates.lng) apiUpdates.longitude = updates.lng;
      if (updates.totalCapacity) apiUpdates.capacity = updates.totalCapacity;
      if (updates.phone) apiUpdates.contact_number = updates.phone;
      if (updates.address) apiUpdates.address = updates.address;
      if (updates.facilities) apiUpdates.facilities = updates.facilities;
      if (updates.status) apiUpdates.status = updates.status;
      
      if (updates.waterLevel || updates.foodLevel || updates.supplies) {
        apiUpdates.resources = {
          water: updates.waterLevel,
          food: updates.foodLevel,
          medicine: updates.supplies?.medical,
          blankets: updates.supplies?.bedding,
          tents: updates.supplies?.clothing
        };
      }

      const apiCenter = await backendApiService.put<any>(`/centers/${id}`, apiUpdates);
      return mapApiCenterToLocal(apiCenter);
    } catch (error) {
      console.log('API unavailable, center update will be stored locally');
      throw new Error('API_UNAVAILABLE');
    }
  }

  async deleteCenter(id: string): Promise<void> {
    try {
      await backendApiService.delete(`/centers/${id}`);
    } catch (error) {
      console.log('API unavailable, center deletion will be handled locally');
      throw new Error('API_UNAVAILABLE');
    }
  }

  // Guest operations
  async getAllGuests(): Promise<Guest[]> {
    try {
      return await backendApiService.get<Guest[]>('/guests');
    } catch (error) {
      console.log('API unavailable, using local guest data');
      return [];
    }
  }

  async getGuestsByCenter(centerId: string): Promise<Guest[]> {
    try {
      return await backendApiService.get<Guest[]>(`/guests?centerId=${centerId}`);
    } catch (error) {
      console.log('API unavailable, using local guest data for center:', centerId);
      return [];
    }
  }

  async getGuestById(id: string): Promise<Guest | null> {
    try {
      return await backendApiService.get<Guest>(`/guests/${id}`);
    } catch (error) {
      console.log('API unavailable, using local guest data for ID:', id);
      return null;
    }
  }

  async createGuest(guestData: Omit<Guest, 'id' | 'createdAt' | 'updatedAt'>): Promise<Guest> {
    try {
      return await backendApiService.post<Guest>('/guests', guestData);
    } catch (error) {
      console.log('API unavailable, guest creation will be stored locally');
      throw new Error('API_UNAVAILABLE');
    }
  }

  async updateGuest(id: string, updates: Partial<Guest>): Promise<Guest> {
    try {
      return await backendApiService.put<Guest>(`/guests/${id}`, updates);
    } catch (error) {
      console.log('API unavailable, guest update will be stored locally');
      throw new Error('API_UNAVAILABLE');
    }
  }

  async deleteGuest(id: string): Promise<void> {
    try {
      await backendApiService.delete(`/guests/${id}`);
    } catch (error) {
      console.log('API unavailable, guest deletion will be handled locally');
      throw new Error('API_UNAVAILABLE');
    }
  }

  async searchGuests(query: string): Promise<Guest[]> {
    try {
      return await backendApiService.get<Guest[]>(`/guests?search=${encodeURIComponent(query)}`);
    } catch (error) {
      console.log('API unavailable, using local guest search');
      return [];
    }
  }

  // Statistics
  async getDisasterStats(): Promise<DisasterStats> {
    try {
      return await backendApiService.get<DisasterStats>('/stats/disaster');
    } catch (error) {
      console.log('API unavailable, using mock disaster statistics');
      // Return mock stats as fallback
      return {
        totalCenters: 5,
        totalCapacity: 1800,
        totalOccupancy: 0,
        availableSpace: 1800,
        centersWithCriticalSupplies: 1,
        recentlyUpdatedCenters: 5,
        averageOccupancyRate: 0
      };
    }
  }

  // Mock data for fallback
  // Utility to convert MongoDB format to HTTP format
  private mapMongoToHttp(mongoCenter: any): RescueCenter {
    return {
      id: mongoCenter.id,
      name: mongoCenter.name,
      lat: mongoCenter.lat,
      lng: mongoCenter.lng,
      totalCapacity: mongoCenter.totalCapacity,
      currentGuests: mongoCenter.currentGuests,
      availableCapacity: mongoCenter.availableCapacity,
      waterLevel: mongoCenter.waterLevel,
      foodLevel: mongoCenter.foodLevel,
      phone: mongoCenter.phone,
      address: mongoCenter.address,
      facilities: mongoCenter.facilities,
      status: mongoCenter.status,
      lastUpdated: mongoCenter.lastUpdated,
      emergencyContacts: mongoCenter.emergencyContacts,
      supplies: mongoCenter.supplies,
      staffCount: mongoCenter.staffCount,
      createdAt: mongoCenter.createdAt,
      updatedAt: mongoCenter.updatedAt
    };
  }

  // Mock data for fallback
  private getMockCenters(): RescueCenter[] {
    return [
      {
        id: 'RC001',
        name: 'Central Emergency Shelter',
        lat: 12.9716,
        lng: 77.5946,
        totalCapacity: 500,
        currentGuests: 0,
        availableCapacity: 500,
        waterLevel: 85,
        foodLevel: 70,
        phone: '+91-80-2345-6789',
        address: 'MG Road, Bangalore, Karnataka 560001',
        facilities: ['Medical Aid', 'Sanitation', 'Power Backup', 'Communication', 'Kitchen'],
        status: 'active',
        lastUpdated: new Date().toISOString(),
        emergencyContacts: {
          primary: '+91-80-2345-6789',
          secondary: '+91-80-2345-6790'
        },
        supplies: {
          medical: 80,
          bedding: 75,
          clothing: 60
        },
        staffCount: 25,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: new Date().toISOString()
      },
      {
        id: 'RC002',
        name: 'North Zone Emergency Hub',
        lat: 12.9916,
        lng: 77.6146,
        totalCapacity: 300,
        currentGuests: 0,
        availableCapacity: 300,
        waterLevel: 95,
        foodLevel: 60,
        phone: '+91-80-2345-6791',
        address: 'Hebbal Main Road, Bangalore, Karnataka 560024',
        facilities: ['Medical Aid', 'Sanitation', 'Kitchen', 'Children Area'],
        status: 'active',
        lastUpdated: new Date().toISOString(),
        emergencyContacts: {
          primary: '+91-80-2345-6791'
        },
        supplies: {
          medical: 90,
          bedding: 85,
          clothing: 70
        },
        staffCount: 18,
        createdAt: '2024-01-20T09:00:00Z',
        updatedAt: new Date().toISOString()
      },
      {
        id: 'RC003',
        name: 'South District Relief Center',
        lat: 12.9516,
        lng: 77.5746,
        totalCapacity: 400,
        currentGuests: 0,
        availableCapacity: 400,
        waterLevel: 40,
        foodLevel: 30,
        phone: '+91-80-2345-6792',
        address: '4th Block, Jayanagar, Bangalore, Karnataka 560011',
        facilities: ['Medical Aid', 'Sanitation', 'Power Backup'],
        status: 'active',
        lastUpdated: new Date().toISOString(),
        emergencyContacts: {
          primary: '+91-80-2345-6792',
          secondary: '+91-80-2345-6793'
        },
        supplies: {
          medical: 45,
          bedding: 30,
          clothing: 25
        },
        staffCount: 20,
        createdAt: '2024-01-18T14:00:00Z',
        updatedAt: new Date().toISOString()
      },
      {
        id: 'RC004',
        name: 'East Emergency Hub',
        lat: 12.9816,
        lng: 77.6346,
        totalCapacity: 250,
        currentGuests: 0,
        availableCapacity: 250,
        waterLevel: 75,
        foodLevel: 80,
        phone: '+91-80-2345-6794',
        address: 'ITPL Main Road, Whitefield, Bangalore, Karnataka 560066',
        facilities: ['Medical Aid', 'Kitchen', 'Communication', 'WiFi'],
        status: 'active',
        lastUpdated: new Date().toISOString(),
        emergencyContacts: {
          primary: '+91-80-2345-6794'
        },
        supplies: {
          medical: 85,
          bedding: 90,
          clothing: 80
        },
        staffCount: 15,
        createdAt: '2024-01-22T11:00:00Z',
        updatedAt: new Date().toISOString()
      },
      {
        id: 'RC005',
        name: 'West Relief Station',
        lat: 12.9616,
        lng: 77.5546,
        totalCapacity: 350,
        currentGuests: 0,
        availableCapacity: 350,
        waterLevel: 65,
        foodLevel: 75,
        phone: '+91-80-2345-6795',
        address: 'Dr. Rajkumar Road, Rajajinagar, Bangalore, Karnataka 560010',
        facilities: ['Medical Aid', 'Sanitation', 'Power Backup', 'Kitchen', 'Pharmacy'],
        status: 'active',
        lastUpdated: new Date().toISOString(),
        emergencyContacts: {
          primary: '+91-80-2345-6795',
          secondary: '+91-80-2345-6796'
        },
        supplies: {
          medical: 70,
          bedding: 65,
          clothing: 55
        },
        staffCount: 22,
        createdAt: '2024-01-25T08:00:00Z',
        updatedAt: new Date().toISOString()
      }
    ];
  }
}

export const httpDatabaseService = new HttpDatabaseService();