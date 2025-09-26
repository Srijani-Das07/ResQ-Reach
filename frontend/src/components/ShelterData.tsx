export interface Shelter {
  id: string;
  name: string;
  lat: number;
  lng: number;
  maxCapacity: number;
  currentOccupancy: number;
  waterLevel: number; // 0-100
  foodLevel: number; // 0-100
  phone: string;
  address: string;
  facilities: string[];
}

export const shelterData: Shelter[] = [
  {
    id: '1',
    name: 'Central Relief Center',
    lat: 12.9716,
    lng: 77.5946,
    maxCapacity: 500,
    currentOccupancy: 320,
    waterLevel: 85,
    foodLevel: 70,
    phone: '+91-80-2345-6789',
    address: 'MG Road, Bangalore',
    facilities: ['Medical Aid', 'Sanitation', 'Power Backup', 'Communication']
  },
  {
    id: '2',
    name: 'North Zone Shelter',
    lat: 12.9916,
    lng: 77.6146,
    maxCapacity: 300,
    currentOccupancy: 180,
    waterLevel: 95,
    foodLevel: 60,
    phone: '+91-80-2345-6790',
    address: 'Hebbal, Bangalore',
    facilities: ['Medical Aid', 'Sanitation', 'Kitchen']
  },
  {
    id: '3',
    name: 'South District Center',
    lat: 12.9516,
    lng: 77.5746,
    maxCapacity: 400,
    currentOccupancy: 400,
    waterLevel: 40,
    foodLevel: 30,
    phone: '+91-80-2345-6791',
    address: 'Jayanagar, Bangalore',
    facilities: ['Medical Aid', 'Sanitation', 'Power Backup']
  },
  {
    id: '4',
    name: 'East Emergency Hub',
    lat: 12.9816,
    lng: 77.6346,
    maxCapacity: 250,
    currentOccupancy: 120,
    waterLevel: 75,
    foodLevel: 80,
    phone: '+91-80-2345-6792',
    address: 'Whitefield, Bangalore',
    facilities: ['Medical Aid', 'Kitchen', 'Communication']
  },
  {
    id: '5',
    name: 'West Relief Station',
    lat: 12.9616,
    lng: 77.5546,
    maxCapacity: 350,
    currentOccupancy: 200,
    waterLevel: 65,
    foodLevel: 75,
    phone: '+91-80-2345-6793',
    address: 'Rajajinagar, Bangalore',
    facilities: ['Medical Aid', 'Sanitation', 'Power Backup', 'Kitchen']
  }
];