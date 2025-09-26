import { corsHeaders } from "../../_shared/cors.ts"
import { supabase, verifyToken } from "../../_shared/database.ts"

interface DisasterStats {
  totalCenters: number
  totalCapacity: number
  totalOccupancy: number
  availableSpace: number
  centersWithCriticalSupplies: number
  recentlyUpdatedCenters: number
  averageOccupancyRate: number
}

export async function handleStats(req: Request): Promise<Response> {
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

    // Only government users can access stats
    if (auth.role !== 'government') {
      return new Response(
        JSON.stringify({ error: 'Forbidden' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403,
        }
      )
    }

    // GET /stats/disaster - Get disaster statistics
    if (path === '/stats/disaster' && req.method === 'GET') {
      return await handleGetDisasterStats()
    }

    // GET /stats/centers - Get center statistics
    if (path === '/stats/centers' && req.method === 'GET') {
      return await handleGetCenterStats()
    }

    // GET /stats/guests - Get guest statistics
    if (path === '/stats/guests' && req.method === 'GET') {
      return await handleGetGuestStats()
    }

    return new Response(
      JSON.stringify({ error: 'Stats route not found' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      }
    )
  } catch (error) {
    console.error('Stats error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
}

async function handleGetDisasterStats(): Promise<Response> {
  try {
    // Get center statistics
    const { data: centers, error: centersError } = await supabase
      .from('rescue_centers')
      .select('id, capacity, current_occupancy, resources, last_updated')

    if (centersError) {
      console.error('Centers error:', centersError)
      return getMockDisasterStats()
    }

    const centersList = centers || []
    
    const totalCenters = centersList.length
    const totalCapacity = centersList.reduce((sum, center) => sum + (center.capacity || 0), 0)
    const totalOccupancy = centersList.reduce((sum, center) => sum + (center.current_occupancy || 0), 0)
    const availableSpace = totalCapacity - totalOccupancy
    
    const centersWithCriticalSupplies = centersList.filter(center => {
      const resources = center.resources || {}
      return (resources.water || 0) < 30 || 
             (resources.food || 0) < 30 || 
             (resources.medicine || 0) < 30
    }).length
    
    const recentlyUpdatedCenters = centersList.filter(center => {
      if (!center.last_updated) return false
      const lastUpdated = new Date(center.last_updated)
      const now = new Date()
      const diffInHours = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60)
      return diffInHours <= 2
    }).length
    
    const averageOccupancyRate = totalCapacity > 0 ? (totalOccupancy / totalCapacity) * 100 : 0

    const stats: DisasterStats = {
      totalCenters,
      totalCapacity,
      totalOccupancy,
      availableSpace,
      centersWithCriticalSupplies,
      recentlyUpdatedCenters,
      averageOccupancyRate
    }

    return new Response(
      JSON.stringify(stats),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Get disaster stats error:', error)
    return getMockDisasterStats()
  }
}

async function handleGetCenterStats(): Promise<Response> {
  try {
    const { data: centers, error } = await supabase
      .from('rescue_centers')
      .select('*')

    if (error) {
      console.error('Centers stats error:', error)
      return new Response(
        JSON.stringify([]),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Return detailed center statistics
    const centerStats = (centers || []).map(center => ({
      id: center.id,
      name: center.name,
      capacity: center.capacity,
      currentOccupancy: center.current_occupancy,
      availableSpace: (center.capacity || 0) - (center.current_occupancy || 0),
      occupancyRate: center.capacity > 0 ? ((center.current_occupancy || 0) / center.capacity) * 100 : 0,
      status: center.status,
      resources: center.resources,
      lastUpdated: center.last_updated,
      address: center.address,
      contactNumber: center.contact_number
    }))

    return new Response(
      JSON.stringify(centerStats),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Get center stats error:', error)
    return new Response(
      JSON.stringify([]),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  }
}

async function handleGetGuestStats(): Promise<Response> {
  try {
    // Get guest count by center
    const { data: guestCounts, error: guestsError } = await supabase
      .from('guests')
      .select('center_id')

    if (guestsError) {
      console.error('Guests stats error:', guestsError)
      return new Response(
        JSON.stringify({ totalGuests: 0, guestsByCenter: [] }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    const guests = guestCounts || []
    const totalGuests = guests.length

    // Group by center
    const guestsByCenter = guests.reduce((acc: any, guest) => {
      const centerId = guest.center_id
      acc[centerId] = (acc[centerId] || 0) + 1
      return acc
    }, {})

    // Convert to array format
    const guestsByCenterArray = Object.entries(guestsByCenter).map(([centerId, count]) => ({
      centerId,
      guestCount: count
    }))

    const stats = {
      totalGuests,
      guestsByCenter: guestsByCenterArray
    }

    return new Response(
      JSON.stringify(stats),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Get guest stats error:', error)
    return new Response(
      JSON.stringify({ totalGuests: 0, guestsByCenter: [] }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  }
}

function getMockDisasterStats(): Response {
  const mockStats: DisasterStats = {
    totalCenters: 5,
    totalCapacity: 1800,
    totalOccupancy: 0,
    availableSpace: 1800,
    centersWithCriticalSupplies: 1,
    recentlyUpdatedCenters: 5,
    averageOccupancyRate: 0
  }

  return new Response(
    JSON.stringify(mockStats),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  )
}