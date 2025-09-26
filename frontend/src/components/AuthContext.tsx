import React, { createContext, useContext, useState, useEffect } from 'react';
import { httpAuthService, User as ApiUser, RegisterData } from '../services/httpAuthService';
import { offlineApiService } from '../services/offlineApiService';

interface User {
  id: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  dob?: string;
  ageBracket?: string;
  mobile?: string;
  email?: string;
  street?: string;
  village?: string;
  district?: string;
  state?: string;
  pincode?: string;
  gpsConsent?: boolean;
  disabilities?: string[];
  pregnantNursing?: boolean;
  chronicConditions?: string;
  verificationLevel?: 'basic' | 'verified';
  createdAt?: string;
  role: 'citizen' | 'government' | 'rescue-center';
  employeeId?: string;
  centerId?: string;
  profile?: any;
}

type UserRole = 'citizen' | 'government' | 'rescue-center';

interface AuthContextType {
  user: User | null;
  userRole: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  governmentLogin: (employeeId: string, password: string) => Promise<boolean>;
  rescueCenterLogin: (centerId: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, userData: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        await checkSession();
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();
    
    return () => {
      mounted = false;
    };
  }, []);

  const checkSession = async () => {
    try {
      // Check if we have a stored token
      const token = httpAuthService.getStoredToken();
      
      if (token) {
        try {
          // Try to get current user from API (this will fallback to offline mode)
          const currentUser = await httpAuthService.getCurrentUser();
          setUser(currentUser);
          setUserRole(currentUser.role);
          setIsAuthenticated(true);
        } catch (error) {
          console.log('Using offline authentication mode');
          // In offline mode, validate token format instead of clearing it
          if (token.startsWith('mock_token_') || token.includes('gov_') || token.includes('rc_')) {
            // Token is valid for offline mode, try to reconstruct user
            try {
              const currentUser = await httpAuthService.getCurrentUser();
              setUser(currentUser);
              setUserRole(currentUser.role);
              setIsAuthenticated(true);
            } catch (offlineError) {
              // Clear invalid token only if reconstruction fails
              httpAuthService.logout();
            }
          } else {
            httpAuthService.logout();
          }
        }
      }
    } catch (error) {
      console.log('Session check completed in offline mode');
    }
  };

  // Removed loadUserProfile - handled by checkSession now

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const response = await httpAuthService.login(email, password);
      
      setUser(response.user);
      setUserRole(response.user.role);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, userData: RegisterData): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const signupData = {
        email,
        password,
        ...userData
      };
      
      const response = await httpAuthService.register(signupData);
      
      setUser(response.user);
      setUserRole(response.user.role);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const governmentLogin = async (employeeId: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await httpAuthService.governmentLogin(employeeId, password);
      
      setUser(response.user);
      setUserRole(response.user.role);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Government login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const rescueCenterLogin = async (centerId: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await httpAuthService.rescueCenterLogin(centerId, password);
      
      setUser(response.user);
      setUserRole(response.user.role);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Rescue center login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await httpAuthService.logout();
      setUser(null);
      setUserRole(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfile = async (updatedData: Partial<User>): Promise<boolean> => {
    if (!user) return false;

    try {
      // Update local state immediately for better UX
      const updatedUser = { ...user, ...updatedData };
      setUser(updatedUser);

      // Try to update via API
      try {
        await httpAuthService.updateProfile(user.id, updatedData);
      } catch (error) {
        console.warn('API update failed, using localStorage fallback:', error);
        // Store in localStorage as fallback
        localStorage.setItem(`profile_${user.id}`, JSON.stringify(updatedUser));
      }

      return true;
    } catch (error) {
      console.error('Profile update error:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,
        isAuthenticated,
        isLoading,
        login,
        governmentLogin,
        rescueCenterLogin,
        signup,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};