-- Seed data for disaster management system

-- Insert sample relief centers
INSERT INTO public.relief_centers (
    id, name, address, latitude, longitude, capacity, contact_number, type, status,
    food_level, water_level, medicine_level, blankets_level, tents_level, facilities
) VALUES 
(
    'RC001', 
    'Central Emergency Shelter',
    'MG Road, Bangalore, Karnataka 560001',
    12.9716, 77.5946, 500,
    '+91-80-2345-6789',
    'emergency', 'active',
    85, 70, 80, 75, 60,
    ARRAY['Medical Aid', 'Sanitation', 'Power Backup', 'Communication', 'Kitchen']
),
(
    'RC002',
    'North Zone Emergency Hub', 
    'Hebbal Main Road, Bangalore, Karnataka 560024',
    12.9916, 77.6146, 300,
    '+91-80-2345-6791',
    'emergency', 'active',
    95, 60, 90, 85, 70,
    ARRAY['Medical Aid', 'Sanitation', 'Kitchen', 'Children Area']
),
(
    'RC003',
    'South District Relief Center',
    '4th Block, Jayanagar, Bangalore, Karnataka 560011',
    12.9516, 77.5746, 400,
    '+91-80-2345-6792',
    'relief', 'active',
    40, 30, 45, 30, 25,
    ARRAY['Medical Aid', 'Sanitation', 'Power Backup']
),
(
    'RC004',
    'East Emergency Hub',
    'ITPL Main Road, Whitefield, Bangalore, Karnataka 560066',
    12.9816, 77.6346, 250,
    '+91-80-2345-6794',
    'emergency', 'active',
    75, 80, 85, 90, 80,
    ARRAY['Medical Aid', 'Kitchen', 'Communication', 'WiFi']
),
(
    'RC005',
    'West Relief Station',
    'Dr. Rajkumar Road, Rajajinagar, Bangalore, Karnataka 560010',
    12.9616, 77.5546, 350,
    '+91-80-2345-6795',
    'relief', 'active',
    65, 75, 70, 65, 55,
    ARRAY['Medical Aid', 'Sanitation', 'Power Backup', 'Kitchen', 'Pharmacy']
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    address = EXCLUDED.address,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    capacity = EXCLUDED.capacity,
    contact_number = EXCLUDED.contact_number,
    type = EXCLUDED.type,
    status = EXCLUDED.status,
    food_level = EXCLUDED.food_level,
    water_level = EXCLUDED.water_level,
    medicine_level = EXCLUDED.medicine_level,
    blankets_level = EXCLUDED.blankets_level,
    tents_level = EXCLUDED.tents_level,
    facilities = EXCLUDED.facilities,
    updated_at = NOW();