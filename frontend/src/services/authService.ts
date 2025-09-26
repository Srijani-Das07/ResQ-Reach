import { apiService } from './api';

export interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role: 'citizen' | 'government' | 'rescue-center';
  employeeId?: string;
  centerId?: string;
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

export class AuthService {
  // Mock user data for offline mode
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
      lastName: userData.lastName,
      role: 'citizen',
      profile: userData
    };
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>('/signup', userData);
      if (response.token) {
        apiService.setToken(response.token);
      }
      return response;
    } catch (error) {
      // Fallback to mock registration
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
      apiService.setToken(token);
      
      return { token, user: newUser };
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>('/api/auth/login', {
        email,
        password,
        loginType: 'citizen'
      });
      if (response.token) {
        apiService.setToken(response.token);
      }
      return response;
    } catch (error) {
      // Fallback to mock login
      console.log('Using offline mode for login');
      
      const users = this.getMockUsers();
      const user = users.find(u => u.email === email);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // In mock mode, any password works (or you could store password)
      const token = this.generateMockToken(user);
      apiService.setToken(token);
      
      return { token, user };
    }
  }

  async guestLogin(): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/api/auth/guest');
    if (response.token) {
      apiService.setToken(response.token);
    }
    return response;
  }

  async governmentLogin(employeeId: string, password: string): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>('/api/auth/login', {
        employeeId,
        password,
        loginType: 'government'
      });
      if (response.token) {
        apiService.setToken(response.token);
      }
      return response;
    } catch (error) {
      // Fallback to mock government login
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
        apiService.setToken(token);
        return { token, user };
      }
      
      throw new Error('Invalid government credentials');
    }
  }

  async rescueCenterLogin(centerId: string, password: string): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>('/api/auth/login', {
        centerId,
        password,
        loginType: 'rescue-center'
      });
      if (response.token) {
        apiService.setToken(response.token);
      }
      return response;
    } catch (error) {
      // Fallback to mock rescue center login
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
        apiService.setToken(token);
        return { token, user };
      }
      
      throw new Error('Invalid rescue center credentials');
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      return await apiService.get<User>('/api/auth/me');
    } catch (error) {
      // Fallback to mock user from token
      const token = apiService.getToken();
      if (!token || !token.startsWith('mock_token_')) {
        throw new Error('No valid session');
      }
      
      // Extract user ID from mock token
      const userId = token.split('_')[2];
      const users = this.getMockUsers();
      const user = users.find(u => u.id === userId);
      
      if (!user) {
        // Check for special accounts
        if (token.includes('gov_001')) {
          return {
            id: 'gov_001',
            email: 'government@disaster.gov.in',
            role: 'government',
            employeeId: 'GOV001'
          };
        } else if (token.includes('rc_001')) {
          return {
            id: 'rc_001',
            email: 'center@rescue.gov.in',
            role: 'rescue-center',
            centerId: 'RC001'
          };
        }
        throw new Error('User not found');
      }
      
      return user;
    }
  }

  async logout(): Promise<void> {
    apiService.setToken(null);
    // Clear any other stored user data
    localStorage.removeItem('user');
  }

  getStoredToken(): string | null {
    return apiService.getToken();
  }
}

export const authService = new AuthService();