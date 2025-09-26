// MongoDB Service - Ready for MongoDB integration
// This service provides a clean interface for MongoDB operations
// and falls back to localStorage when MongoDB is not available

import { mongoConfig } from '../config/mongodb';

export interface MongoUser {
  _id?: string;
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role: 'citizen' | 'government' | 'rescue-center';
  employeeId?: string;
  centerId?: string;
  profile?: any;
  createdAt: string;
  updatedAt: string;
}

export interface MongoRescueCenter {
  _id?: string;
  id: string;
  name: string;
  lat: number;
  lng: number;
  totalCapacity: number;
  currentGuests: number;
  availableCapacity: number;
  waterLevel: number;
  foodLevel: number;
  phone: string;
  address: string;
  facilities: string[];
  status: 'active' | 'inactive' | 'full' | 'maintenance';
  lastUpdated: string;
  emergencyContacts: {
    primary: string;
    secondary?: string;
  };
  supplies: {
    medical: number;
    bedding: number;
    clothing: number;
  };
  staffCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MongoGuest {
  _id?: string;
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

export interface MongoAuthResponse {
  token: string;
  user: MongoUser;
}

export interface MongoStats {
  totalCenters: number;
  totalCapacity: number;
  totalOccupancy: number;
  availableSpace: number;
  centersWithCriticalSupplies: number;
  recentlyUpdatedCenters: number;
  averageOccupancyRate: number;
}

class MongoService {
  private isConnected: boolean = false;
  private connectionAttempts: number = 0;
  private maxRetries: number = 3;

  constructor() {
    this.initializeConnection();
  }

  // Initialize MongoDB connection (placeholder for actual MongoDB client)
  private async initializeConnection(): Promise<void> {
    try {
      // In a real implementation, this would initialize MongoDB client
      // const client = new MongoClient(mongoConfig.connection.uri, mongoConfig.connection.options);
      // await client.connect();
      // this.isConnected = true;
      
      // For now, we'll simulate connection check
      console.log('MongoDB service initialized (ready for MongoDB integration)');
      this.isConnected = false; // Set to false until actual MongoDB is integrated
    } catch (error) {
      console.log('MongoDB not available, using offline mode');
      this.isConnected = false;
    }
  }

  // Check if MongoDB is available
  public isMongoAvailable(): boolean {
    return this.isConnected;
  }

  // Utility method to convert MongoDB document to application format
  private mongoToApp<T extends { _id?: string; id?: string }>(doc: T): T {
    if (doc._id && !doc.id) {
      doc.id = doc._id.toString();
    }
    return doc;
  }

  // Utility method to convert application format to MongoDB
  private appToMongo<T extends { _id?: string; id?: string }>(doc: T): T {
    if (doc.id && !doc._id) {
      doc._id = doc.id;
    }
    return doc;
  }

  // Authentication methods
  async authenticateUser(email: string, password: string): Promise<MongoAuthResponse> {
    if (this.isConnected) {
      // TODO: Implement actual MongoDB authentication
      // const users = db.collection(mongoConfig.collections.users);
      // const user = await users.findOne({ email, password: hashedPassword });
      throw new Error('MongoDB authentication not yet implemented');
    }

    // Fallback to localStorage
    return this.authenticateUserLocal(email, password);
  }

  async authenticateGovernment(employeeId: string, password: string): Promise<MongoAuthResponse> {
    if (this.isConnected) {
      // TODO: Implement actual MongoDB authentication
      // const govUsers = db.collection(mongoConfig.collections.governmentUsers);
      // const user = await govUsers.findOne({ employeeId, password: hashedPassword });
      throw new Error('MongoDB government authentication not yet implemented');
    }

    // Fallback to mock data
    if (employeeId === 'GOV001' && password === 'password123') {
      const user: MongoUser = {
        id: 'gov_001',
        email: 'government@disaster.gov.in',
        role: 'government',
        employeeId: employeeId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      return { token: this.generateToken(user), user };
    }
    throw new Error('Invalid government credentials');
  }

  async authenticateRescueCenter(centerId: string, password: string): Promise<MongoAuthResponse> {
    if (this.isConnected) {
      // TODO: Implement actual MongoDB authentication
      // const rcUsers = db.collection(mongoConfig.collections.rescueCenterUsers);
      // const user = await rcUsers.findOne({ centerId, password: hashedPassword });
      throw new Error('MongoDB rescue center authentication not yet implemented');
    }

    // Fallback to mock data
    if (centerId === 'RC001' && password === 'rescue123') {
      const user: MongoUser = {
        id: 'rc_001',
        email: 'center@rescue.gov.in',
        role: 'rescue-center',
        centerId: centerId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      return { token: this.generateToken(user), user };
    }
    throw new Error('Invalid rescue center credentials');
  }

  // User management
  async createUser(userData: Omit<MongoUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<MongoUser> {
    if (this.isConnected) {
      // TODO: Implement actual MongoDB user creation
      // const users = db.collection(mongoConfig.collections.users);
      // const result = await users.insertOne({
      //   ...userData,
      //   createdAt: new Date(),
      //   updatedAt: new Date()
      // });
      // return await users.findOne({ _id: result.insertedId });
      throw new Error('MongoDB user creation not yet implemented');
    }

    // Fallback to localStorage
    return this.createUserLocal(userData);
  }

  async getUserById(id: string): Promise<MongoUser | null> {
    if (this.isConnected) {
      // TODO: Implement actual MongoDB user retrieval
      // const users = db.collection(mongoConfig.collections.users);
      // const user = await users.findOne({ _id: new ObjectId(id) });
      // return user ? this.mongoToApp(user) : null;
      throw new Error('MongoDB user retrieval not yet implemented');
    }

    // Fallback to localStorage
    return this.getUserByIdLocal(id);
  }

  // Rescue Center management
  async getAllCenters(): Promise<MongoRescueCenter[]> {
    if (this.isConnected) {
      // TODO: Implement actual MongoDB center retrieval
      // const centers = db.collection(mongoConfig.collections.rescueCenters);
      // const result = await centers.find({ status: { $ne: 'inactive' } }).toArray();
      // return result.map(center => this.mongoToApp(center));
      throw new Error('MongoDB center retrieval not yet implemented');
    }

    // Fallback to localStorage
    return this.getAllCentersLocal();
  }

  async getCenterById(id: string): Promise<MongoRescueCenter | null> {
    if (this.isConnected) {
      // TODO: Implement actual MongoDB center retrieval
      throw new Error('MongoDB center retrieval not yet implemented');
    }

    // Fallback to localStorage
    return this.getCenterByIdLocal(id);
  }

  async createCenter(centerData: Omit<MongoRescueCenter, 'id' | 'createdAt' | 'updatedAt'>): Promise<MongoRescueCenter> {
    if (this.isConnected) {
      // TODO: Implement actual MongoDB center creation
      throw new Error('MongoDB center creation not yet implemented');
    }

    // Fallback to localStorage
    return this.createCenterLocal(centerData);
  }

  async updateCenter(id: string, updates: Partial<MongoRescueCenter>): Promise<MongoRescueCenter> {
    if (this.isConnected) {
      // TODO: Implement actual MongoDB center update
      throw new Error('MongoDB center update not yet implemented');
    }

    // Fallback to localStorage
    return this.updateCenterLocal(id, updates);
  }

  // Guest management
  async getAllGuests(): Promise<MongoGuest[]> {
    if (this.isConnected) {
      // TODO: Implement actual MongoDB guest retrieval
      throw new Error('MongoDB guest retrieval not yet implemented');
    }

    // Fallback to localStorage
    return this.getAllGuestsLocal();
  }

  async getGuestsByCenter(centerId: string): Promise<MongoGuest[]> {
    if (this.isConnected) {
      // TODO: Implement actual MongoDB guest retrieval by center
      throw new Error('MongoDB guest retrieval not yet implemented');
    }

    // Fallback to localStorage
    return this.getGuestsByCenterLocal(centerId);
  }

  async createGuest(guestData: Omit<MongoGuest, 'id' | 'createdAt' | 'updatedAt'>): Promise<MongoGuest> {
    if (this.isConnected) {
      // TODO: Implement actual MongoDB guest creation
      throw new Error('MongoDB guest creation not yet implemented');
    }

    // Fallback to localStorage
    return this.createGuestLocal(guestData);
  }

  // Statistics
  async getStats(): Promise<MongoStats> {
    if (this.isConnected) {
      // TODO: Implement actual MongoDB aggregation for stats
      throw new Error('MongoDB stats not yet implemented');
    }

    // Fallback to local calculation
    return this.getStatsLocal();
  }

  // Private helper methods for localStorage fallback
  private generateToken(user: MongoUser): string {
    return `mongo_token_${user.id}_${Date.now()}`;
  }

  private authenticateUserLocal(email: string, password: string): MongoAuthResponse {
    const users = this.getStoredUsers();
    const user = users.find(u => u.email === email);
    if (!user) throw new Error('User not found');
    return { token: this.generateToken(user), user };
  }

  private createUserLocal(userData: Omit<MongoUser, 'id' | 'createdAt' | 'updatedAt'>): MongoUser {
    const users = this.getStoredUsers();
    const newUser: MongoUser = {
      ...userData,
      id: `user_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    users.push(newUser);
    localStorage.setItem('mongo_users', JSON.stringify(users));
    return newUser;
  }

  private getUserByIdLocal(id: string): MongoUser | null {
    const users = this.getStoredUsers();
    return users.find(u => u.id === id) || null;
  }

  private getAllCentersLocal(): MongoRescueCenter[] {
    const centers = localStorage.getItem('mongo_centers');
    return centers ? JSON.parse(centers) : [];
  }

  private getCenterByIdLocal(id: string): MongoRescueCenter | null {
    const centers = this.getAllCentersLocal();
    return centers.find(c => c.id === id) || null;
  }

  private createCenterLocal(centerData: Omit<MongoRescueCenter, 'id' | 'createdAt' | 'updatedAt'>): MongoRescueCenter {
    const centers = this.getAllCentersLocal();
    const newCenter: MongoRescueCenter = {
      ...centerData,
      id: `RC${String(centers.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    centers.push(newCenter);
    localStorage.setItem('mongo_centers', JSON.stringify(centers));
    return newCenter;
  }

  private updateCenterLocal(id: string, updates: Partial<MongoRescueCenter>): MongoRescueCenter {
    const centers = this.getAllCentersLocal();
    const index = centers.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Center not found');
    
    centers[index] = { ...centers[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem('mongo_centers', JSON.stringify(centers));
    return centers[index];
  }

  private getAllGuestsLocal(): MongoGuest[] {
    const guests = localStorage.getItem('mongo_guests');
    return guests ? JSON.parse(guests) : [];
  }

  private getGuestsByCenterLocal(centerId: string): MongoGuest[] {
    const guests = this.getAllGuestsLocal();
    return guests.filter(g => g.centerId === centerId);
  }

  private createGuestLocal(guestData: Omit<MongoGuest, 'id' | 'createdAt' | 'updatedAt'>): MongoGuest {
    const guests = this.getAllGuestsLocal();
    const newGuest: MongoGuest = {
      ...guestData,
      id: `GUEST${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    guests.push(newGuest);
    localStorage.setItem('mongo_guests', JSON.stringify(guests));
    return newGuest;
  }

  private getStatsLocal(): MongoStats {
    const centers = this.getAllCentersLocal();
    const totalCenters = centers.length;
    const totalCapacity = centers.reduce((sum, center) => sum + center.totalCapacity, 0);
    const totalOccupancy = centers.reduce((sum, center) => sum + center.currentGuests, 0);
    const availableSpace = totalCapacity - totalOccupancy;
    
    return {
      totalCenters,
      totalCapacity,
      totalOccupancy,
      availableSpace,
      centersWithCriticalSupplies: centers.filter(c => 
        c.waterLevel < 30 || c.foodLevel < 30 || c.supplies.medical < 30
      ).length,
      recentlyUpdatedCenters: centers.filter(c => {
        const lastUpdated = new Date(c.lastUpdated);
        const now = new Date();
        const diffInHours = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);
        return diffInHours <= 2;
      }).length,
      averageOccupancyRate: totalCapacity > 0 ? (totalOccupancy / totalCapacity) * 100 : 0
    };
  }

  private getStoredUsers(): MongoUser[] {
    const users = localStorage.getItem('mongo_users');
    return users ? JSON.parse(users) : [];
  }
}

export const mongoService = new MongoService();