import { corsHeaders } from "../../_shared/cors.ts"
import { supabase, verifyToken, RescueCenter } from "../../_shared/database.ts"

// Mock data for fallback
const mockCenters: RescueCenter[] = [
  {
    id: 'RC001',
    name: 'Central Emergency Shelter',
    latitude: 12.9716,
    longitude: 77.5946,
    capacity: 500,
    current_occupancy: 0,
    contact_number: '+91-80-2345-6789',
    address: 'MG Road, Bangalore, Karnataka 560001',
    facilities: ['Medical Aid', 'Sanitation', 'Power Backup', 'Communication', 'Kitchen'],
    status: 'active',
    resources: {
      water: 85,
      food: 70,
      medicine: 80,
      blankets: 75,
      tents: 60
    },
    last_updated: new Date().toISOString(),
    created_at: '2024-01-15T10:00:00Z',
    updated_at: new Date().toISOString()
  },
  {
    id: 'RC002',
    name: 'North Zone Emergency Hub',
    latitude: 12.9916,
    longitude: 77.6146,
    capacity: 300,
    current_occupancy: 0,
    contact_number: '+91-80-2345-6791',
    address: 'Hebbal Main Road, Bangalore, Karnataka 560024',
    facilities: ['Medical Aid', 'Sanitation', 'Kitchen', 'Children Area'],
    status: 'active',
    resources: {
      water: 95,
      food: 60,
      medicine: 90,
      blankets: 85,
      tents: 70
    },
    last_updated: new Date().toISOString(),
    created_at: '2024-01-20T09:00:00Z',
    updated_at: new Date().toISOString()
  },
  {
    id: 'RC003',
    name: 'South District Relief Center',
    latitude: 12.9516,
    longitude: 77.5746,
    capacity: 400,
    current_occupancy: 0,
    contact_number: '+91-80-2345-6792',
    address: '4th Block, Jayanagar, Bangalore, Karnataka 560011',
    facilities: ['Medical Aid', 'Sanitation', 'Power Backup'],
    status: 'active',
    resources: {
      water: 40,
      food: 30,
      medicine: 45,
      blankets: 30,
      tents: 25
    },
    last_updated: new Date().toISOString(),
    created_at: '2024-01-18T14:00:00Z',
    updated_at: new Date().toISOString()
  },
  {
    id: 'RC004',
    name: 'East Emergency Hub',
    latitude: 12.9816,
    longitude: 77.6346,
    capacity: 250,
    current_occupancy: 0,
    contact_number: '+91-80-2345-6794',
    address: 'ITPL Main Road, Whitefield, Bangalore, Karnataka 560066',
    facilities: ['Medical Aid', 'Kitchen', 'Communication', 'WiFi'],
    status: 'active',
    resources: {
      water: 75,
      food: 80,
      medicine: 85,
      blankets: 90,
      tents: 80
    },
    last_updated: new Date().toISOString(),
    created_at: '2024-01-22T11:00:00Z',
    updated_at: new Date().toISOString()
  },
  {
    id: 'RC005',
    name: 'West Relief Station',
    latitude: 12.9616,
    longitude: 77.5546,
    capacity: 350,
    current_occupancy: 0,
    contact_number: '+91-80-2345-6795',
    address: 'Dr. Rajkumar Road, Rajajinagar, Bangalore, Karnataka 560010',
    facilities: ['Medical Aid', 'Sanitation', 'Power Backup', 'Kitchen', 'Pharmacy'],
    status: 'active',
    resources: {
      water: 65,
      food: 75,
      medicine: 70,
      blankets: 65,
      tents: 55
    },
    last_updated: new Date().toISOString(),
    created_at: '2024-01-25T08:00:00Z',
    updated_at: new Date().toISOString()
  }
]

export async function handleCenters(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const path = url.pathname

  try {
    // Verify authentication for non-read operations
    const authHeader = req.headers.get('authorization')
    const auth = await verifyToken(authHeader)
    
    // GET /centers - Get all centers (public)
    if (path === '/centers' && req.method === 'GET') {
      return await handleGetAllCenters()
    }

    // GET /centers/:id - Get specific center (public)
    const centerIdMatch = path.match(/^\/centers\/(.+)$/)
    if (centerIdMatch && req.method === 'GET') {
      return await handleGetCenter(centerIdMatch[1])
    }

    // For write operations, require authentication
    if (!auth) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      )
    }

    // POST /centers - Create new center (government only)
    if (path === '/centers' && req.method === 'POST') {
      if (auth.role !== 'government') {
        return new Response(
          JSON.stringify({ error: 'Forbidden' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 403,
          }
        )
      }
      return await handleCreateCenter(await req.json())
    }

    // PUT /centers/:id - Update center
    if (centerIdMatch && req.method === 'PUT') {
      if (auth.role !== 'government' && auth.role !== 'rescue-center') {
        return new Response(
          JSON.stringify({ error: 'Forbidden' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 403,
          }
        )
      }
      return await handleUpdateCenter(centerIdMatch[1], await req.json())
    }

    // DELETE /centers/:id - Delete center (government only)
    if (centerIdMatch && req.method === 'DELETE') {
      if (auth.role !== 'government') {
        return new Response(
          JSON.stringify({ error: 'Forbidden' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 403,
          }
        )
      }
      return await handleDeleteCenter(centerIdMatch[1])
    }

    return new Response(
      JSON.stringify({ error: 'Centers route not found' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      }
    )
  } catch (error) {
    console.error('Centers error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
}

async function handleGetAllCenters(): Promise<Response> {
  try {
    const { data: centers, error } = await supabase
      .from('rescue_centers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error, using mock data:', error)
      return new Response(
        JSON.stringify(mockCenters),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    return new Response(
      JSON.stringify(centers || mockCenters),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Get centers error:', error)
    return new Response(
      JSON.stringify(mockCenters),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  }
}

async function handleGetCenter(centerId: string): Promise<Response> {
  try {
    const { data: center, error } = await supabase
      .from('rescue_centers')
      .select('*')
      .eq('id', centerId)
      .single()

    if (error) {
      console.error('Database error, using mock data:', error)
      const mockCenter = mockCenters.find(c => c.id === centerId)
      if (!mockCenter) {
        return new Response(
          JSON.stringify({ error: 'Center not found' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404,
          }
        )
      }
      return new Response(
        JSON.stringify(mockCenter),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    if (!center) {
      return new Response(
        JSON.stringify({ error: 'Center not found' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      )
    }

    return new Response(
      JSON.stringify(center),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Get center error:', error)
    const mockCenter = mockCenters.find(c => c.id === centerId)
    if (!mockCenter) {
      return new Response(
        JSON.stringify({ error: 'Center not found' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      )
    }
    return new Response(
      JSON.stringify(mockCenter),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  }
}

async function handleCreateCenter(centerData: any): Promise<Response> {
  try {
    const newCenter: RescueCenter = {
      id: `RC${String(Date.now()).slice(-3)}`,
      name: centerData.name,
      latitude: centerData.latitude,
      longitude: centerData.longitude,
      capacity: centerData.capacity,
      current_occupancy: 0,
      contact_number: centerData.contactNumber,
      address: centerData.address,
      facilities: centerData.facilities || [],
      status: 'active',
      resources: centerData.resources || {
        water: 100,
        food: 100,
        medicine: 100,
        blankets: 100,
        tents: 100
      },
      last_updated: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: center, error } = await supabase
      .from('rescue_centers')
      .insert([newCenter])
      .select()
      .single()

    if (error) {
      console.error('Create center error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to create center' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    return new Response(
      JSON.stringify(center),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      }
    )
  } catch (error) {
    console.error('Create center error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to create center' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
}

async function handleUpdateCenter(centerId: string, updates: any): Promise<Response> {
  try {
    const updateData: Partial<RescueCenter> = {
      ...updates,
      updated_at: new Date().toISOString(),
      last_updated: new Date().toISOString()
    }

    const { data: center, error } = await supabase
      .from('rescue_centers')
      .update(updateData)
      .eq('id', centerId)
      .select()
      .single()

    if (error) {
      console.error('Update center error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to update center' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    if (!center) {
      return new Response(
        JSON.stringify({ error: 'Center not found' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      )
    }

    return new Response(
      JSON.stringify(center),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Update center error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to update center' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
}

async function handleDeleteCenter(centerId: string): Promise<Response> {
  try {
    const { error } = await supabase
      .from('rescue_centers')
      .delete()
      .eq('id', centerId)

    if (error) {
      console.error('Delete center error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to delete center' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    return new Response(
      JSON.stringify({ message: 'Center deleted successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Delete center error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to delete center' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
}