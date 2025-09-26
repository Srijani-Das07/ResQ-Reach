import { corsHeaders } from "../../_shared/cors.ts"
import { supabase, verifyToken, UserProfile } from "../../_shared/database.ts"

export async function handleUsers(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const path = url.pathname

  try {
    // Verify authentication
    const authHeader = req.headers.get('authorization')
    const auth = await verifyToken(authHeader)
    
    if (!auth) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      )
    }

    // GET /users/profile - Get user profile
    if (path === '/users/profile' && req.method === 'GET') {
      return await handleGetProfile(auth.userId)
    }

    // PUT /users/profile - Update user profile
    if (path === '/users/profile' && req.method === 'PUT') {
      return await handleUpdateProfile(auth.userId, await req.json())
    }

    // GET /users/profile/:userId - Get specific user profile (admin only)
    const userIdMatch = path.match(/^\/users\/profile\/(.+)$/)
    if (userIdMatch && req.method === 'GET') {
      if (auth.role !== 'government') {
        return new Response(
          JSON.stringify({ error: 'Forbidden' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 403,
          }
        )
      }
      return await handleGetProfile(userIdMatch[1])
    }

    return new Response(
      JSON.stringify({ error: 'User route not found' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      }
    )
  } catch (error) {
    console.error('Users error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
}

async function handleGetProfile(userId: string): Promise<Response> {
  try {
    const { data: profileData, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error || !profileData) {
      return new Response(
        JSON.stringify({ error: 'Profile not found' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      )
    }

    // Convert to frontend format
    const profile = {
      id: profileData.id,
      email: profileData.email,
      firstName: profileData.first_name,
      middleName: profileData.middle_name,
      lastName: profileData.last_name,
      dob: profileData.date_of_birth,
      ageBracket: profileData.age_bracket,
      mobile: profileData.mobile,
      street: profileData.street,
      village: profileData.village,
      district: profileData.district,
      state: profileData.state,
      pincode: profileData.pincode,
      gpsConsent: profileData.gps_consent,
      disabilities: profileData.disabilities,
      pregnantNursing: profileData.pregnant_nursing,
      chronicConditions: profileData.chronic_conditions,
      verificationLevel: profileData.verification_level,
      createdAt: profileData.created_at,
      updatedAt: profileData.updated_at
    }

    return new Response(
      JSON.stringify(profile),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Get profile error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to get profile' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
}

async function handleUpdateProfile(userId: string, updates: any): Promise<Response> {
  try {
    // Convert from frontend format to database format
    const dbUpdates: Partial<UserProfile> = {}
    
    if (updates.street !== undefined) dbUpdates.street = updates.street
    if (updates.village !== undefined) dbUpdates.village = updates.village
    if (updates.district !== undefined) dbUpdates.district = updates.district
    if (updates.state !== undefined) dbUpdates.state = updates.state
    if (updates.pincode !== undefined) dbUpdates.pincode = updates.pincode
    if (updates.disabilities !== undefined) dbUpdates.disabilities = updates.disabilities
    if (updates.chronicConditions !== undefined) dbUpdates.chronic_conditions = updates.chronicConditions
    if (updates.pregnantNursing !== undefined) dbUpdates.pregnant_nursing = updates.pregnantNursing
    
    dbUpdates.updated_at = new Date().toISOString()

    const { data: updatedData, error } = await supabase
      .from('user_profiles')
      .update(dbUpdates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Update profile error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to update profile' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    // Convert back to frontend format
    const profile = {
      id: updatedData.id,
      email: updatedData.email,
      firstName: updatedData.first_name,
      middleName: updatedData.middle_name,
      lastName: updatedData.last_name,
      dob: updatedData.date_of_birth,
      ageBracket: updatedData.age_bracket,
      mobile: updatedData.mobile,
      street: updatedData.street,
      village: updatedData.village,
      district: updatedData.district,
      state: updatedData.state,
      pincode: updatedData.pincode,
      gpsConsent: updatedData.gps_consent,
      disabilities: updatedData.disabilities,
      pregnantNursing: updatedData.pregnant_nursing,
      chronicConditions: updatedData.chronic_conditions,
      verificationLevel: updatedData.verification_level,
      createdAt: updatedData.created_at,
      updatedAt: updatedData.updated_at
    }

    return new Response(
      JSON.stringify(profile),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Update profile error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to update profile' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
}