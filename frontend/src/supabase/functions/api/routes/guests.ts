import { corsHeaders } from "../../_shared/cors.ts"
import { supabase, verifyToken, Guest } from "../../_shared/database.ts"

export async function handleGuests(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const path = url.pathname
  const searchParams = url.searchParams

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

    // Only government and rescue center users can access guest data
    if (auth.role !== 'government' && auth.role !== 'rescue-center') {
      return new Response(
        JSON.stringify({ error: 'Forbidden' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403,
        }
      )
    }

    // GET /guests - Get all guests or by center
    if (path === '/guests' && req.method === 'GET') {
      const centerId = searchParams.get('centerId')
      const search = searchParams.get('search')
      
      if (centerId) {
        return await handleGetGuestsByCenter(centerId)
      } else if (search) {
        return await handleSearchGuests(search)
      } else {
        return await handleGetAllGuests(auth.role)
      }
    }

    // GET /guests/:id - Get specific guest
    const guestIdMatch = path.match(/^\/guests\/(.+)$/)
    if (guestIdMatch && req.method === 'GET') {
      return await handleGetGuest(guestIdMatch[1])
    }

    // POST /guests - Create new guest
    if (path === '/guests' && req.method === 'POST') {
      return await handleCreateGuest(await req.json())
    }

    // PUT /guests/:id - Update guest
    if (guestIdMatch && req.method === 'PUT') {
      return await handleUpdateGuest(guestIdMatch[1], await req.json())
    }

    // DELETE /guests/:id - Delete guest
    if (guestIdMatch && req.method === 'DELETE') {
      return await handleDeleteGuest(guestIdMatch[1])
    }

    return new Response(
      JSON.stringify({ error: 'Guests route not found' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      }
    )
  } catch (error) {
    console.error('Guests error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
}

async function handleGetAllGuests(userRole: string): Promise<Response> {
  try {
    const { data: guests, error } = await supabase
      .from('guests')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify([]), // Return empty array as fallback
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Convert to frontend format
    const formattedGuests = (guests || []).map(convertGuestToFrontend)

    return new Response(
      JSON.stringify(formattedGuests),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Get all guests error:', error)
    return new Response(
      JSON.stringify([]),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  }
}

async function handleGetGuestsByCenter(centerId: string): Promise<Response> {
  try {
    const { data: guests, error } = await supabase
      .from('guests')
      .select('*')
      .eq('center_id', centerId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify([]),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    const formattedGuests = (guests || []).map(convertGuestToFrontend)

    return new Response(
      JSON.stringify(formattedGuests),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Get guests by center error:', error)
    return new Response(
      JSON.stringify([]),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  }
}

async function handleSearchGuests(searchTerm: string): Promise<Response> {
  try {
    const { data: guests, error } = await supabase
      .from('guests')
      .select('*')
      .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,mobile_phone.ilike.%${searchTerm}%,id.ilike.%${searchTerm}%`)

    if (error) {
      console.error('Search error:', error)
      return new Response(
        JSON.stringify([]),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    const formattedGuests = (guests || []).map(convertGuestToFrontend)

    return new Response(
      JSON.stringify(formattedGuests),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Search guests error:', error)
    return new Response(
      JSON.stringify([]),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  }
}

async function handleGetGuest(guestId: string): Promise<Response> {
  try {
    const { data: guest, error } = await supabase
      .from('guests')
      .select('*')
      .eq('id', guestId)
      .single()

    if (error || !guest) {
      return new Response(
        JSON.stringify({ error: 'Guest not found' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      )
    }

    return new Response(
      JSON.stringify(convertGuestToFrontend(guest)),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Get guest error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to get guest' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
}

async function handleCreateGuest(guestData: any): Promise<Response> {
  try {
    const newGuest: Guest = {
      id: generateGuestId(),
      center_id: guestData.centerId,
      first_name: guestData.firstName,
      middle_name: guestData.middleName,
      last_name: guestData.lastName,
      gender: guestData.gender,
      date_of_birth: guestData.dateOfBirth,
      age: guestData.age,
      mobile_phone: guestData.mobilePhone,
      alternate_mobile: guestData.alternateMobile,
      email: guestData.email,
      permanent_address: guestData.permanentAddress,
      family_members: guestData.familyMembers,
      emergency_contact_name: guestData.emergencyContactName,
      emergency_contact_phone: guestData.emergencyContactPhone,
      emergency_contact_relation: guestData.emergencyContactRelation,
      dependents: guestData.dependents,
      medical_conditions: guestData.medicalConditions,
      current_medications: guestData.currentMedications,
      allergies: guestData.allergies,
      disability_status: guestData.disabilityStatus,
      special_needs: guestData.specialNeeds,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: guest, error } = await supabase
      .from('guests')
      .insert([newGuest])
      .select()
      .single()

    if (error) {
      console.error('Create guest error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to create guest' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    // Update center occupancy
    await updateCenterOccupancy(guestData.centerId)

    return new Response(
      JSON.stringify(convertGuestToFrontend(guest)),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      }
    )
  } catch (error) {
    console.error('Create guest error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to create guest' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
}

async function handleUpdateGuest(guestId: string, updates: any): Promise<Response> {
  try {
    const updateData: Partial<Guest> = {
      updated_at: new Date().toISOString()
    }

    // Map frontend fields to database fields
    if (updates.firstName) updateData.first_name = updates.firstName
    if (updates.middleName) updateData.middle_name = updates.middleName
    if (updates.lastName) updateData.last_name = updates.lastName
    if (updates.gender) updateData.gender = updates.gender
    if (updates.dateOfBirth) updateData.date_of_birth = updates.dateOfBirth
    if (updates.age) updateData.age = updates.age
    if (updates.mobilePhone) updateData.mobile_phone = updates.mobilePhone
    if (updates.alternateMobile) updateData.alternate_mobile = updates.alternateMobile
    if (updates.email) updateData.email = updates.email
    if (updates.permanentAddress) updateData.permanent_address = updates.permanentAddress
    if (updates.familyMembers) updateData.family_members = updates.familyMembers
    if (updates.emergencyContactName) updateData.emergency_contact_name = updates.emergencyContactName
    if (updates.emergencyContactPhone) updateData.emergency_contact_phone = updates.emergencyContactPhone
    if (updates.emergencyContactRelation) updateData.emergency_contact_relation = updates.emergencyContactRelation
    if (updates.dependents) updateData.dependents = updates.dependents
    if (updates.medicalConditions) updateData.medical_conditions = updates.medicalConditions
    if (updates.currentMedications) updateData.current_medications = updates.currentMedications
    if (updates.allergies) updateData.allergies = updates.allergies
    if (updates.disabilityStatus) updateData.disability_status = updates.disabilityStatus
    if (updates.specialNeeds) updateData.special_needs = updates.specialNeeds

    const { data: guest, error } = await supabase
      .from('guests')
      .update(updateData)
      .eq('id', guestId)
      .select()
      .single()

    if (error) {
      console.error('Update guest error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to update guest' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    if (!guest) {
      return new Response(
        JSON.stringify({ error: 'Guest not found' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      )
    }

    return new Response(
      JSON.stringify(convertGuestToFrontend(guest)),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Update guest error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to update guest' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
}

async function handleDeleteGuest(guestId: string): Promise<Response> {
  try {
    // Get guest to know which center to update
    const { data: guest } = await supabase
      .from('guests')
      .select('center_id')
      .eq('id', guestId)
      .single()

    const { error } = await supabase
      .from('guests')
      .delete()
      .eq('id', guestId)

    if (error) {
      console.error('Delete guest error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to delete guest' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    // Update center occupancy if we know the center
    if (guest?.center_id) {
      await updateCenterOccupancy(guest.center_id)
    }

    return new Response(
      JSON.stringify({ message: 'Guest deleted successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Delete guest error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to delete guest' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
}

// Helper functions
function generateGuestId(): string {
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.random().toString(36).substr(2, 4).toUpperCase()
  return `GUEST${timestamp}${random}`
}

function convertGuestToFrontend(guest: Guest): any {
  return {
    id: guest.id,
    centerId: guest.center_id,
    firstName: guest.first_name,
    middleName: guest.middle_name,
    lastName: guest.last_name,
    gender: guest.gender,
    dateOfBirth: guest.date_of_birth,
    age: guest.age,
    mobilePhone: guest.mobile_phone,
    alternateMobile: guest.alternate_mobile,
    email: guest.email,
    permanentAddress: guest.permanent_address,
    familyMembers: guest.family_members,
    emergencyContactName: guest.emergency_contact_name,
    emergencyContactPhone: guest.emergency_contact_phone,
    emergencyContactRelation: guest.emergency_contact_relation,
    dependents: guest.dependents,
    medicalConditions: guest.medical_conditions,
    currentMedications: guest.current_medications,
    allergies: guest.allergies,
    disabilityStatus: guest.disability_status,
    specialNeeds: guest.special_needs,
    createdAt: guest.created_at,
    updatedAt: guest.updated_at
  }
}

async function updateCenterOccupancy(centerId: string): Promise<void> {
  try {
    // Count guests in this center
    const { count } = await supabase
      .from('guests')
      .select('*', { count: 'exact', head: true })
      .eq('center_id', centerId)

    // Update center occupancy
    await supabase
      .from('rescue_centers')
      .update({
        current_occupancy: count || 0,
        last_updated: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', centerId)
  } catch (error) {
    console.error('Update center occupancy error:', error)
  }
}