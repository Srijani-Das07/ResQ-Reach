import React, { createContext, useContext, useState, useEffect } from 'react';

// Guest interface matching our form structure
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

// Rescue center interface
export interface RescueCenter {
  id: string;
  name: string;
  totalCapacity: number;
  currentGuests: number;
  availableCapacity: number;
  location: string;
  createdAt: string;
  updatedAt: string;
}

interface DatabaseContextType {
  // Guest operations
  addGuest: (guestData: Omit<Guest, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Guest>;
  getGuests: (centerId: string) => Promise<Guest[]>;
  getGuestById: (id: string) => Promise<Guest | null>;
  updateGuest: (id: string, updates: Partial<Guest>) => Promise<Guest>;
  deleteGuest: (id: string) => Promise<void>;
  
  // Center operations
  getRescueCenter: (centerId: string) => Promise<RescueCenter | null>;
  updateRescueCenterCapacity: (centerId: string, guestCountChange: number) => Promise<void>;
  
  // Local state for real-time updates
  guests: Guest[];
  rescueCenter: RescueCenter | null;
  loading: boolean;
  refreshData: () => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};

// MongoDB-ready database provider with offline fallback

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [rescueCenter, setRescueCenter] = useState<RescueCenter | null>(null);
  const [loading, setLoading] = useState(false);

  // For demo purposes, we'll use local storage and mock data
  const DEMO_CENTER_ID = 'RC001';

  // Initialize demo data
  useEffect(() => {
    initializeDemoData();
  }, []);

  const initializeDemoData = async () => {
    // Initialize demo rescue center
    const demoCenter: RescueCenter = {
      id: DEMO_CENTER_ID,
      name: 'Central Emergency Shelter',
      totalCapacity: 500,
      currentGuests: 0,
      availableCapacity: 500,
      location: 'Central District',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Load from localStorage or use demo data
    const savedCenter = localStorage.getItem('rescueCenter');
    const savedGuests = localStorage.getItem('guests');

    if (savedCenter) {
      setRescueCenter(JSON.parse(savedCenter));
    } else {
      setRescueCenter(demoCenter);
      localStorage.setItem('rescueCenter', JSON.stringify(demoCenter));
    }

    if (savedGuests) {
      setGuests(JSON.parse(savedGuests));
    } else {
      // Initialize with some demo guests
      const demoGuests: Guest[] = [
        {
          id: 'GUEST123456ABCD',
          firstName: 'John',
          middleName: 'Michael',
          lastName: 'Doe',
          gender: 'male',
          age: '35',
          mobilePhone: '+91 9876543210',
          email: 'john.doe@email.com',
          emergencyContactName: 'Jane Doe',
          emergencyContactPhone: '+91 9876543211',
          medicalConditions: 'Diabetes',
          specialNeeds: 'None',
          centerId: DEMO_CENTER_ID,
          createdAt: '2024-12-20T10:00:00Z',
          updatedAt: '2024-12-20T10:00:00Z'
        },
        {
          id: 'GUEST789012EFGH',
          firstName: 'Sarah',
          lastName: 'Smith',
          gender: 'female',
          age: '28',
          mobilePhone: '+91 8765432109',
          email: 'sarah.smith@email.com',
          emergencyContactName: 'Robert Smith',
          emergencyContactPhone: '+91 8765432108',
          medicalConditions: 'Hypertension',
          specialNeeds: 'Wheelchair',
          centerId: DEMO_CENTER_ID,
          createdAt: '2024-12-20T09:00:00Z',
          updatedAt: '2024-12-20T09:00:00Z'
        },
        {
          id: 'GUEST345678IJKL',
          firstName: 'Ahmed',
          middleName: 'Hassan',
          lastName: 'Khan',
          gender: 'male',
          age: '42',
          mobilePhone: '+91 7654321098',
          emergencyContactName: 'Fatima Khan',
          emergencyContactPhone: '+91 7654321097',
          medicalConditions: 'None',
          specialNeeds: 'None',
          centerId: DEMO_CENTER_ID,
          createdAt: '2024-12-19T15:00:00Z',
          updatedAt: '2024-12-19T15:00:00Z'
        }
      ];
      
      setGuests(demoGuests);
      localStorage.setItem('guests', JSON.stringify(demoGuests));
      
      // Update center capacity
      const updatedCenter = {
        ...demoCenter,
        currentGuests: demoGuests.length,
        availableCapacity: demoCenter.totalCapacity - demoGuests.length
      };
      setRescueCenter(updatedCenter);
      localStorage.setItem('rescueCenter', JSON.stringify(updatedCenter));
    }
  };

  const generateGuestId = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `GUEST${timestamp}${random}`;
  };

  const addGuest = async (guestData: Omit<Guest, 'id' | 'createdAt' | 'updatedAt'>): Promise<Guest> => {
    setLoading(true);
    try {
      const newGuest: Guest = {
        ...guestData,
        id: generateGuestId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const updatedGuests = [...guests, newGuest];
      setGuests(updatedGuests);
      localStorage.setItem('guests', JSON.stringify(updatedGuests));

      // Update rescue center capacity
      await updateRescueCenterCapacity(DEMO_CENTER_ID, 1);

      return newGuest;
    } finally {
      setLoading(false);
    }
  };

  const getGuests = async (centerId: string): Promise<Guest[]> => {
    return guests.filter(guest => guest.centerId === centerId);
  };

  const getGuestById = async (id: string): Promise<Guest | null> => {
    return guests.find(guest => guest.id === id) || null;
  };

  const updateGuest = async (id: string, updates: Partial<Guest>): Promise<Guest> => {
    setLoading(true);
    try {
      const updatedGuests = guests.map(guest => 
        guest.id === id 
          ? { ...guest, ...updates, updatedAt: new Date().toISOString() }
          : guest
      );
      
      setGuests(updatedGuests);
      localStorage.setItem('guests', JSON.stringify(updatedGuests));
      
      const updatedGuest = updatedGuests.find(guest => guest.id === id);
      if (!updatedGuest) {
        throw new Error('Guest not found');
      }
      
      return updatedGuest;
    } finally {
      setLoading(false);
    }
  };

  const deleteGuest = async (id: string): Promise<void> => {
    setLoading(true);
    try {
      const updatedGuests = guests.filter(guest => guest.id !== id);
      setGuests(updatedGuests);
      localStorage.setItem('guests', JSON.stringify(updatedGuests));

      // Update rescue center capacity
      await updateRescueCenterCapacity(DEMO_CENTER_ID, -1);
    } finally {
      setLoading(false);
    }
  };

  const getRescueCenter = async (centerId: string): Promise<RescueCenter | null> => {
    return rescueCenter && rescueCenter.id === centerId ? rescueCenter : null;
  };

  const updateRescueCenterCapacity = async (centerId: string, guestCountChange: number): Promise<void> => {
    if (!rescueCenter || rescueCenter.id !== centerId) return;

    const updatedCenter: RescueCenter = {
      ...rescueCenter,
      currentGuests: Math.max(0, rescueCenter.currentGuests + guestCountChange),
      availableCapacity: Math.max(0, rescueCenter.availableCapacity - guestCountChange),
      updatedAt: new Date().toISOString()
    };

    setRescueCenter(updatedCenter);
    localStorage.setItem('rescueCenter', JSON.stringify(updatedCenter));
  };

  const refreshData = async (): Promise<void> => {
    // In a real implementation, this would fetch fresh data from MongoDB
    // For demo, we just reload from localStorage
    await initializeDemoData();
  };

  return (
    <DatabaseContext.Provider
      value={{
        addGuest,
        getGuests,
        getGuestById,
        updateGuest,
        deleteGuest,
        getRescueCenter,
        updateRescueCenterCapacity,
        guests,
        rescueCenter,
        loading,
        refreshData
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};