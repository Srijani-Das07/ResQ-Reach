import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

// Initialize Supabase client for database operations
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

export const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Helper function to verify JWT token
export async function verifyToken(authHeader: string | null): Promise<{ userId: string; role: string } | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  
  try {
    // For mock tokens (offline mode)
    if (token.startsWith('mock_token_')) {
      const parts = token.split('_')
      if (parts.length >= 3) {
        const userId = parts[2]
        
        // Determine role based on userId pattern
        if (userId.startsWith('gov')) {
          return { userId, role: 'government' }
        } else if (userId.startsWith('rc')) {
          return { userId, role: 'rescue-center' }
        } else {
          return { userId, role: 'citizen' }
        }
      }
      return null
    }

    // For real JWT tokens
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return null
    }

    return { userId: user.id, role: 'citizen' }
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}

// User profile interface
export interface UserProfile {
  id: string
  email?: string
  first_name?: string
  middle_name?: string
  last_name?: string
  date_of_birth?: string
  age_bracket?: string
  mobile?: string
  street?: string
  village?: string
  district?: string
  state?: string
  pincode?: string
  gps_consent?: boolean
  disabilities?: string[]
  pregnant_nursing?: boolean
  chronic_conditions?: string
  verification_level?: string
  created_at?: string
  updated_at?: string
}

// Government user interface
export interface GovernmentUser {
  id: string
  employee_id: string
  email?: string
  first_name?: string
  last_name?: string
  department?: string
  position?: string
  created_at?: string
}

// Rescue center user interface
export interface RescueCenterUser {
  id: string
  center_id: string
  email?: string
  first_name?: string
  last_name?: string
  position?: string
  created_at?: string
}

// Rescue center interface
export interface RescueCenter {
  id: string
  name: string
  latitude: number
  longitude: number
  capacity: number
  current_occupancy: number
  contact_number: string
  address: string
  facilities: string[]
  status: 'active' | 'inactive' | 'full'
  resources: {
    water: number
    food: number
    medicine: number
    blankets: number
    tents: number
  }
  last_updated: string
  created_at?: string
  updated_at?: string
}

// Guest interface
export interface Guest {
  id: string
  center_id: string
  first_name: string
  middle_name?: string
  last_name: string
  gender: string
  date_of_birth?: string
  age?: string
  mobile_phone: string
  alternate_mobile?: string
  email?: string
  permanent_address?: string
  family_members?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  emergency_contact_relation?: string
  dependents?: string
  medical_conditions?: string
  current_medications?: string
  allergies?: string
  disability_status?: string
  special_needs?: string
  created_at?: string
  updated_at?: string
}