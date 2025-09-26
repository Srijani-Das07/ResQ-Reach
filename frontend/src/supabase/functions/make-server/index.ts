import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Mock relief centers data for development
const mockReliefCenters = [
  {
    id: 'RC001',
    name: 'Central Emergency Shelter',
    address: 'MG Road, Bangalore, Karnataka 560001',
    latitude: 12.9716,
    longitude: 77.5946,
    capacity: 500,
    currentOccupancy: 0,
    contactNumber: '+91-80-2345-6789',
    type: 'emergency',
    status: 'active',
    resources: {
      food: 85,
      water: 70,
      medicine: 80,
      blankets: 75,
      tents: 60
    },
    facilities: ['Medical Aid', 'Sanitation', 'Power Backup', 'Communication', 'Kitchen'],
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'RC002',
    name: 'North Zone Emergency Hub',
    address: 'Hebbal Main Road, Bangalore, Karnataka 560024',
    latitude: 12.9916,
    longitude: 77.6146,
    capacity: 300,
    currentOccupancy: 0,
    contactNumber: '+91-80-2345-6791',
    type: 'emergency',
    status: 'active',
    resources: {
      food: 95,
      water: 60,
      medicine: 90,
      blankets: 85,
      tents: 70
    },
    facilities: ['Medical Aid', 'Sanitation', 'Kitchen', 'Children Area'],
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'RC003',
    name: 'South District Relief Center',
    address: '4th Block, Jayanagar, Bangalore, Karnataka 560011',
    latitude: 12.9516,
    longitude: 77.5746,
    capacity: 400,
    currentOccupancy: 0,
    contactNumber: '+91-80-2345-6792',
    type: 'relief',
    status: 'active',
    resources: {
      food: 40,
      water: 30,
      medicine: 45,
      blankets: 30,
      tents: 25
    },
    facilities: ['Medical Aid', 'Sanitation', 'Power Backup'],
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'RC004',
    name: 'East Emergency Hub',
    address: 'ITPL Main Road, Whitefield, Bangalore, Karnataka 560066',
    latitude: 12.9816,
    longitude: 77.6346,
    capacity: 250,
    currentOccupancy: 0,
    contactNumber: '+91-80-2345-6794',
    type: 'emergency',
    status: 'active',
    resources: {
      food: 75,
      water: 80,
      medicine: 85,
      blankets: 90,
      tents: 80
    },
    facilities: ['Medical Aid', 'Kitchen', 'Communication', 'WiFi'],
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'RC005',
    name: 'West Relief Station',
    address: 'Dr. Rajkumar Road, Rajajinagar, Bangalore, Karnataka 560010',
    latitude: 12.9616,
    longitude: 77.5546,
    capacity: 350,
    currentOccupancy: 0,
    contactNumber: '+91-80-2345-6795',
    type: 'relief',
    status: 'active',
    resources: {
      food: 65,
      water: 75,
      medicine: 70,
      blankets: 65,
      tents: 55
    },
    facilities: ['Medical Aid', 'Sanitation', 'Power Backup', 'Kitchen', 'Pharmacy'],
    lastUpdated: new Date().toISOString()
  }
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const path = url.pathname
    const method = req.method

    // Health check endpoint
    if (path === '/health' && method === 'GET') {
      return new Response(
        JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Relief centers API
    if (path === '/api/relief' && method === 'GET') {
      return new Response(
        JSON.stringify(mockReliefCenters),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Get relief center by ID
    if (path.match(/^\/api\/relief\/[^\/]+$/) && method === 'GET') {
      const centerId = path.split('/').pop()
      const center = mockReliefCenters.find(c => c.id === centerId)
      
      if (!center) {
        return new Response(
          JSON.stringify({ error: 'Relief center not found' }),
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
    }

    // Auth endpoints
    if (path === '/api/auth/login' && method === 'POST') {
      const body = await req.json()
      const { email, password, loginType, employeeId, centerId } = body

      // Mock authentication logic
      if (loginType === 'citizen') {
        if (email && password) {
          return new Response(
            JSON.stringify({
              token: `mock_citizen_token_${Date.now()}`,
              user: {
                id: `citizen_${Date.now()}`,
                email: email,
                role: 'citizen',
                firstName: 'Mock',
                lastName: 'User'
              }
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            }
          )
        }
      } else if (loginType === 'government') {
        if (employeeId === 'GOV001' && password === 'password123') {
          return new Response(
            JSON.stringify({
              token: `mock_gov_token_${Date.now()}`,
              user: {
                id: 'gov_001',
                email: 'government@disaster.gov.in',
                role: 'government',
                employeeId: employeeId
              }
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            }
          )
        }
      } else if (loginType === 'rescue-center') {
        if (centerId === 'RC001' && password === 'rescue123') {
          return new Response(
            JSON.stringify({
              token: `mock_rc_token_${Date.now()}`,
              user: {
                id: 'rc_001',
                email: 'center@rescue.gov.in',
                role: 'rescue-center',
                centerId: centerId
              }
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            }
          )
        }
      }

      return new Response(
        JSON.stringify({ error: 'Invalid credentials' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      )
    }

    // User profile endpoint
    if (path === '/api/auth/me' && method === 'GET') {
      const authHeader = req.headers.get('authorization')
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 401,
          }
        )
      }

      const token = authHeader.substring(7)
      
      // Mock token validation
      if (token.includes('mock_')) {
        return new Response(
          JSON.stringify({
            id: 'mock_user',
            email: 'user@example.com',
            role: 'citizen'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      }

      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      )
    }

    // Default 404 response
    return new Response(
      JSON.stringify({ error: 'Not found' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})