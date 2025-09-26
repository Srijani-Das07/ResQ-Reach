import { apiService } from './api';

export interface ReliefCenter {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  capacity: number;
  currentOccupancy: number;
  contactNumber: string;
  type: string;
  status: 'active' | 'inactive' | 'full';
  resources: {
    food: number;
    water: number;
    medicine: number;
    blankets: number;
    tents: number;
  };
  facilities: string[];
  lastUpdated: string;
  managedBy?: string;
}

export interface CreateReliefCenterData {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  capacity: number;
  contactNumber: string;
  type: string;
  facilities: string[];
}

export interface UpdateResourcesData {
  resources: {
    food?: number;
    water?: number;
    medicine?: number;
    blankets?: number;
    tents?: number;
  };
}

export class ReliefCenterService {
  // Mock data for offline mode - return in local format directly
  private getMockCentersLocal(): any[] {
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

  async getAllCenters(): Promise<ReliefCenter[]> {
    try {
      const centers = await apiService.get<ReliefCenter[]>('/api/relief');
      return centers;
    } catch (error) {
      console.log('Using offline mode for relief centers');
      return this.getMockCentersLocal() as any;
    }
  }

  async getCachedCenters(): Promise<ReliefCenter[]> {
    try {
      return await apiService.get<ReliefCenter[]>('/api/relief/cache');
    } catch (error) {
      console.log('Using offline mode for cached centers');
      return this.getMockCentersLocal() as any;
    }
  }

  async getCenterById(id: string): Promise<ReliefCenter> {
    try {
      return await apiService.get<ReliefCenter>(`/api/relief/${id}`);
    } catch (error) {
      console.log('Using offline mode for center by ID');
      const centers = this.getMockCentersLocal();
      const center = centers.find(c => c.id === id);
      if (!center) {
        throw new Error('Center not found');
      }
      return center as any;
    }
  }

  async createCenter(centerData: CreateReliefCenterData): Promise<ReliefCenter> {
    return await apiService.post<ReliefCenter>('/api/relief', centerData);
  }

  async updateResources(id: string, resourceData: UpdateResourcesData): Promise<ReliefCenter> {
    return await apiService.put<ReliefCenter>(`/api/relief/${id}/resources`, resourceData);
  }

  async bulkSync(centers: ReliefCenter[]): Promise<{ success: boolean; message: string }> {
    return await apiService.post('/api/relief/sync', { centers });
  }

  // Helper methods for frontend
  async getCentersNearLocation(lat: number, lng: number, radiusKm: number = 50): Promise<ReliefCenter[]> {
    const centers = await this.getAllCenters();
    return centers.filter(center => {
      const distance = this.calculateDistance(lat, lng, center.latitude, center.longitude);
      return distance <= radiusKm;
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

export const reliefCenterService = new ReliefCenterService();