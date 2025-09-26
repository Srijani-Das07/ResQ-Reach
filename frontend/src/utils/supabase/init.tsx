import { supabase } from './client';

/**
 * Initialize database tables and check if they exist
 */
export const initializeDatabase = async () => {
  try {
    // Check if user_profiles table exists
    const { data, error } = await supabase
      .from('public.user_profiles')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Database initialization check failed:', error);
      
      // If table doesn't exist, create it
      if (error.code === 'PGRST116' || error.code === 'PGRST205') {
        console.log('Creating user_profiles table...');
        await createUserProfilesTable();
      }
    } else {
      console.log('Database tables are initialized correctly');
    }
  } catch (error) {
    console.error('Error during database initialization:', error);
  }
};

const createUserProfilesTable = async () => {
  try {
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create user profiles table for disaster management system
        CREATE TABLE IF NOT EXISTS public.user_profiles (
            id UUID REFERENCES auth.users(id) PRIMARY KEY,
            email TEXT NOT NULL,
            first_name TEXT NOT NULL,
            middle_name TEXT,
            last_name TEXT NOT NULL,
            date_of_birth DATE,
            age_bracket TEXT,
            mobile TEXT NOT NULL,
            street TEXT NOT NULL,
            village TEXT,
            district TEXT NOT NULL,
            state TEXT NOT NULL,
            pincode TEXT NOT NULL,
            gps_consent BOOLEAN DEFAULT false,
            disabilities TEXT[],
            pregnant_nursing BOOLEAN DEFAULT false,
            chronic_conditions TEXT,
            verification_level TEXT DEFAULT 'basic',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Create RLS policies
        ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

        -- Policy: Users can only read/write their own profile
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
              AND tablename = 'user_profiles' 
              AND policyname = 'Users can manage their own profile'
          ) THEN
            CREATE POLICY "Users can manage their own profile" ON public.user_profiles
                FOR ALL USING (auth.uid() = id);
          END IF;
        END $$;

        -- Create update trigger function
        CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        -- Create trigger
        DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
        CREATE TRIGGER update_user_profiles_updated_at
            BEFORE UPDATE ON public.user_profiles
            FOR EACH ROW
            EXECUTE FUNCTION update_user_profiles_updated_at();
      `
    });

    if (error) {
      console.error('Error creating user_profiles table:', error);
    } else {
      console.log('user_profiles table created successfully');
    }
  } catch (error) {
    console.error('Error executing table creation SQL:', error);
  }
};

/**
 * Alternative approach using direct SQL execution (fallback)
 */
export const createTableDirectly = async () => {
  try {
    // First, try to create the table using a simple query
    const { error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'user_profiles');

    console.log('Table check result:', error);
  } catch (error) {
    console.error('Direct table creation error:', error);
  }
};