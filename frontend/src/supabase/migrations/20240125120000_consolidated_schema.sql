-- Consolidated migration for disaster management system
-- This replaces all previous migrations to avoid conflicts

-- Ensure proper permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Drop existing tables if they exist (for clean deployment)
DROP TABLE IF EXISTS public.guests CASCADE;
DROP TABLE IF EXISTS public.relief_centers CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;

-- Create user profiles table
CREATE TABLE public.user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT,
    first_name TEXT,
    middle_name TEXT,
    last_name TEXT,
    date_of_birth DATE,
    age_bracket TEXT,
    mobile TEXT,
    street TEXT,
    village TEXT,
    district TEXT,
    state TEXT,
    pincode TEXT,
    gps_consent BOOLEAN DEFAULT FALSE,
    disabilities TEXT[],
    pregnant_nursing BOOLEAN DEFAULT FALSE,
    chronic_conditions TEXT,
    verification_level TEXT DEFAULT 'basic',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create relief centers table
CREATE TABLE public.relief_centers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    capacity INTEGER NOT NULL,
    current_occupancy INTEGER DEFAULT 0,
    contact_number TEXT,
    type TEXT DEFAULT 'emergency',
    status TEXT DEFAULT 'active',
    food_level INTEGER DEFAULT 0,
    water_level INTEGER DEFAULT 0,
    medicine_level INTEGER DEFAULT 0,
    blankets_level INTEGER DEFAULT 0,
    tents_level INTEGER DEFAULT 0,
    facilities TEXT[],
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create guests table
CREATE TABLE public.guests (
    id TEXT PRIMARY KEY,
    first_name TEXT NOT NULL,
    middle_name TEXT,
    last_name TEXT NOT NULL,
    gender TEXT,
    date_of_birth DATE,
    age TEXT,
    mobile_phone TEXT,
    alternate_mobile TEXT,
    email TEXT,
    permanent_address TEXT,
    family_members TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    emergency_contact_relation TEXT,
    dependents TEXT,
    medical_conditions TEXT,
    current_medications TEXT,
    allergies TEXT,
    disability_status TEXT,
    special_needs TEXT,
    center_id TEXT REFERENCES public.relief_centers(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_relief_centers_location ON public.relief_centers(latitude, longitude);
CREATE INDEX idx_relief_centers_status ON public.relief_centers(status);
CREATE INDEX idx_guests_center_id ON public.guests(center_id);
CREATE INDEX idx_guests_mobile ON public.guests(mobile_phone);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relief_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policies for relief_centers (public read access)
CREATE POLICY "Anyone can view relief centers" ON public.relief_centers
    FOR SELECT USING (true);

-- Create policies for guests (restrict access)
CREATE POLICY "Service role can manage guests" ON public.guests
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'service_role' OR
        auth.jwt() ->> 'role' = 'authenticated'
    );

-- Create triggers to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_relief_centers_updated_at BEFORE UPDATE ON public.relief_centers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guests_updated_at BEFORE UPDATE ON public.guests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
  GRANT ALL ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
  GRANT ALL ON SEQUENCES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
  GRANT ALL ON FUNCTIONS TO anon, authenticated;