-- Reset script to clean up conflicting migrations
-- Run this if you encounter deployment conflicts

-- Remove old migration tracking (if needed)
-- DELETE FROM supabase_migrations.schema_migrations 
-- WHERE version IN ('000_setup_database', '001_create_user_profiles', '20240125000001_initial_schema');

-- Clean up any existing objects that might conflict
DROP TABLE IF EXISTS public.guests CASCADE;
DROP TABLE IF EXISTS public.relief_centers CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;

-- Drop functions if they exist
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS update_user_profiles_updated_at() CASCADE;

-- Clean up any existing policies
-- DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
-- DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
-- DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
-- DROP POLICY IF EXISTS "Anyone can view relief centers" ON public.relief_centers;
-- DROP POLICY IF EXISTS "Service role can manage guests" ON public.guests;

SELECT 'Database reset completed' as status;