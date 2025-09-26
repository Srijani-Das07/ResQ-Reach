import { backendApiService } from './backendApiService';

export interface User {
  id: string;
  email?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  dob?: string;
  ageBracket?: string;
  mobile?: string;
  street?: string;
  village?: string;
  district?: string;
  state?: string;
  pincode?: string;
  gpsConsent?: boolean;
  disabilities?: string[];
  pregnantNursing?: boolean;
  chronicConditions?: string;
  role: 'citizen' | 'government' | 'rescue-center';
  employeeId?: string;
  centerId?: string;
  verificationLevel?: 'basic' | 'verified';
  createdAt?: string;
  profile?: any;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dob?: string;
  ageBracket?: string;
  mobile: string;
  street: string;
  village?: string;
  district: string;
  state: string;
  pincode: string;
  gpsConsent: boolean;
  disabilities?: string[];
  pregnantNursing?: boolean;
  chronicConditions?: string;
}

export class HttpAuthService {
  async register(userData: RegisterData): Promise<AuthResponse> {
    // Always use offline mode for registration
    console.log('Using offline mode for registration');
    
    const users = this.getMockUsers();
    
    // Check if user already exists
    if (users.find(u => u.email === userData.email)) {
      throw new Error('User already exists');
    }
    
    const newUser = this.createMockUser(userData);
    const token = this.generateMockToken(newUser);
    
    users.push(newUser);
    this.saveMockUsers(users);
    backendApiService.setToken(token);
    
    return { token, user: newUser };
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    // Always start with offline mode to prevent backend connection attempts
    console.log('Using offline mode for login');
    
    const users = this.getMockUsers();
    let user = users.find(u => u.email === email);
    
    // If user doesn't exist in mock data, create a new one
    if (!user) {
      user = {
        id: `user_${Date.now()}`,
        email: email,
        firstName: email.split('@')[0],
        lastName: 'User',
        role: 'citizen'
      };
      users.push(user);
      this.saveMockUsers(users);
    }
    
    // In offline mode, any password works
    const token = this.generateMockToken(user);
    backendApiService.setToken(token);
    
    return { token, user };
  }

  async governmentLogin(employeeId: string, password: string): Promise<AuthResponse> {
    // Always use offline mode for government login
    console.log('Using offline mode for government login');
    
    // Mock government user
    if (employeeId === 'GOV001' && password === 'password123') {
      const user: User = {
        id: 'gov_001',
        email: 'government@disaster.gov.in',
        role: 'government',
        employeeId: employeeId
      };
      const token = this.generateMockToken(user);
      backendApiService.setToken(token);
      return { token, user };
    }
    
    throw new Error('Invalid government credentials');
  }

  async rescueCenterLogin(centerId: string, password: string): Promise<AuthResponse> {
    // Always use offline mode for rescue center login
    console.log('Using offline mode for rescue center login');
    
    // Mock rescue center user
    if (centerId === 'RC001' && password === 'rescue123') {
      const user: User = {
        id: 'rc_001',
        email: 'center@rescue.gov.in',
        role: 'rescue-center',
        centerId: centerId
      };
      const token = this.generateMockToken(user);
      backendApiService.setToken(token);
      return { token, user };
    }
    
    throw new Error('Invalid rescue center credentials');
  }

  async getCurrentUser(): Promise<User> {
    // Always use offline mode to get current user
    const token = backendApiService.getToken();
    if (!token) {
      throw new Error('No valid session');
    }
    
    // Handle mock tokens
    if (token.startsWith('mock_token_')) {
      // Extract user ID from mock token
      const userId = token.split('_')[2];
      const users = this.getMockUsers();
      const user = users.find(u => u.id === userId);
      
      if (user) {
        return user;
      }
      
      // Check for special accounts
      if (token.includes('gov_001')) {
        return {
          id: 'gov_001',
          email: 'government@disaster.gov.in',
          role: 'government',
          employeeId: 'GOV001',
          firstName: 'Government',
          lastName: 'Official'
        };
      } else if (token.includes('rc_001')) {
        return {
          id: 'rc_001',
          email: 'center@rescue.gov.in',
          role: 'rescue-center',
          centerId: 'RC001',
          firstName: 'Rescue',
          lastName: 'Center'
        };
      }
      
      throw new Error('User not found');
    }
    
    // For any other token format, assume invalid
    throw new Error('Invalid session token');
  }

  async updateProfile(userId: string, updates: any): Promise<User> {
    try {
      return await backendApiService.put<User>('/users/profile', updates);
    } catch (error) {
      // Fallback to localStorage for offline mode
      console.log('Using offline mode for profile update');
      const users = this.getMockUsers();
      const userIndex = users.findIndex(u => u.id === userId);
      
      if (userIndex === -1) {
        throw new Error('User not found');
      }
      
      const updatedUser = { ...users[userIndex], ...updates };
      users[userIndex] = updatedUser;
      this.saveMockUsers(users);
      
      return updatedUser;
    }
  }

  async logout(): Promise<void> {
    // Always use offline mode for logout
    console.log('Logging out in offline mode');
    backendApiService.setToken(null);
    // Clear any other stored user data
    localStorage.removeItem('user');
  }

  getStoredToken(): string | null {
    return backendApiService.getToken();
  }

  // Mock data helpers (for offline mode)
  private getMockUsers(): any[] {
    const users = localStorage.getItem('mockUsers');
    return users ? JSON.parse(users) : [];
  }

  private saveMockUsers(users: any[]): void {
    localStorage.setItem('mockUsers', JSON.stringify(users));
  }

  private generateMockToken(user: User): string {
    return `mock_token_${user.id}_${Date.now()}`;
  }

  private createMockUser(userData: RegisterData): User {
    return {
      id: `user_${Date.now()}`,
      email: userData.email,
      firstName: userData.firstName,
      middleName: userData.middleName,
      lastName: userData.lastName,
      dob: userData.dob,
      ageBracket: userData.ageBracket,
      mobile: userData.mobile,
      street: userData.street,
      village: userData.village,
      district: userData.district,
      state: userData.state,
      pincode: userData.pincode,
      gpsConsent: userData.gpsConsent,
      disabilities: userData.disabilities,
      pregnantNursing: userData.pregnantNursing,
      chronicConditions: userData.chronicConditions,
      role: 'citizen',
      verificationLevel: 'basic',
      createdAt: new Date().toISOString(),
      profile: userData
    };
  }
}

export const httpAuthService = new HttpAuthService();