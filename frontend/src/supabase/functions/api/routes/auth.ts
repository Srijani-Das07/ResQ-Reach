import { corsHeaders } from "../../_shared/cors.ts"
import { supabase, verifyToken } from "../../_shared/database.ts"

interface LoginRequest {
  email?: string
  password: string
  employeeId?: string
  centerId?: string
  loginType: 'citizen' | 'government' | 'rescue-center'
}

interface SignupRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  middleName?: string
  dob?: string
  ageBracket?: string
  mobile: string
  street: string
  village?: string
  district: string
  state: string
  pincode: string
  gpsConsent: boolean
  disabilities?: string[]
  pregnantNursing?: boolean
  chronicConditions?: string
}

export async function handleAuth(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const path = url.pathname

  try {
    // POST /auth/login - Handle all login types
    if (path === '/auth/login' && req.method === 'POST') {
      const body: LoginRequest = await req.json()
      
      switch (body.loginType) {
        case 'citizen':
          return await handleCitizenLogin(body.email!, body.password)
        case 'government':
          return await handleGovernmentLogin(body.employeeId!, body.password)
        case 'rescue-center':
          return await handleRescueCenterLogin(body.centerId!, body.password)
        default:
          return new Response(
            JSON.stringify({ error: 'Invalid login type' }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400,
            }
          )
      }
    }

    // POST /auth/signup - Citizen registration
    if (path === '/auth/signup' && req.method === 'POST') {
      return await handleCitizenSignup(await req.json())
    }

    // GET /auth/me - Get current user info
    if (path === '/auth/me' && req.method === 'GET') {
      return await handleGetCurrentUser(req)
    }

    // POST /auth/logout - Logout user
    if (path === '/auth/logout' && req.method === 'POST') {
      return await handleLogout()
    }

    return new Response(
      JSON.stringify({ error: 'Auth route not found' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      }
    )
  } catch (error) {
    console.error('Auth error:', error)
    return new Response(
      JSON.stringify({ error: 'Authentication failed' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
}

async function handleCitizenLogin(email: string, password: string): Promise<Response> {
  try {
    // Use Supabase auth for citizens
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      )
    }

    if (!data.user || !data.session) {
      return new Response(
        JSON.stringify({ error: 'Login failed' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      )
    }

    // Get user profile
    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    const user = {
      id: data.user.id,
      email: data.user.email,
      firstName: profileData?.first_name,
      lastName: profileData?.last_name,
      role: 'citizen',
      profile: profileData
    }

    return new Response(
      JSON.stringify({
        token: data.session.access_token,
        user
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Citizen login error:', error)
    return new Response(
      JSON.stringify({ error: 'Login failed' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
}

async function handleGovernmentLogin(employeeId: string, password: string): Promise<Response> {
  try {
    // Check government users table
    const { data: govUser, error } = await supabase
      .from('government_users')
      .select('*')
      .eq('employee_id', employeeId)
      .single()

    // For demo purposes, use hardcoded credentials if DB user not found
    if (error || !govUser) {
      if (employeeId === 'GOV001' && password === 'password123') {
        const mockUser = {
          id: 'gov_001',
          email: 'government@disaster.gov.in',
          role: 'government',
          employeeId: employeeId,
          firstName: 'Government',
          lastName: 'Officer'
        }

        const mockToken = `mock_token_gov_001_${Date.now()}`
        
        return new Response(
          JSON.stringify({
            token: mockToken,
            user: mockUser
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      }

      return new Response(
        JSON.stringify({ error: 'Invalid government credentials' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      )
    }

    // Verify password (in real implementation, this would be hashed)
    if (password !== 'password123') {
      return new Response(
        JSON.stringify({ error: 'Invalid password' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      )
    }

    const user = {
      id: govUser.id,
      email: govUser.email,
      firstName: govUser.first_name,
      lastName: govUser.last_name,
      role: 'government',
      employeeId: govUser.employee_id
    }

    const token = `mock_token_${govUser.id}_${Date.now()}`

    return new Response(
      JSON.stringify({
        token,
        user
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Government login error:', error)
    return new Response(
      JSON.stringify({ error: 'Login failed' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
}

async function handleRescueCenterLogin(centerId: string, password: string): Promise<Response> {
  try {
    // Check rescue center users table
    const { data: centerUser, error } = await supabase
      .from('rescue_center_users')
      .select('*')
      .eq('center_id', centerId)
      .single()

    // For demo purposes, use hardcoded credentials if DB user not found
    if (error || !centerUser) {
      if (centerId === 'RC001' && password === 'rescue123') {
        const mockUser = {
          id: 'rc_001',
          email: 'center@rescue.gov.in',
          role: 'rescue-center',
          centerId: centerId,
          firstName: 'Rescue',
          lastName: 'Officer'
        }

        const mockToken = `mock_token_rc_001_${Date.now()}`
        
        return new Response(
          JSON.stringify({
            token: mockToken,
            user: mockUser
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      }

      return new Response(
        JSON.stringify({ error: 'Invalid rescue center credentials' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      )
    }

    // Verify password (in real implementation, this would be hashed)
    if (password !== 'rescue123') {
      return new Response(
        JSON.stringify({ error: 'Invalid password' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      )
    }

    const user = {
      id: centerUser.id,
      email: centerUser.email,
      firstName: centerUser.first_name,
      lastName: centerUser.last_name,
      role: 'rescue-center',
      centerId: centerUser.center_id
    }

    const token = `mock_token_${centerUser.id}_${Date.now()}`

    return new Response(
      JSON.stringify({
        token,
        user
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Rescue center login error:', error)
    return new Response(
      JSON.stringify({ error: 'Login failed' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
}

async function handleCitizenSignup(body: SignupRequest): Promise<Response> {
  try {
    // Create user with Supabase auth
    const { data, error } = await supabase.auth.signUp({
      email: body.email,
      password: body.password,
    })

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    if (!data.user) {
      return new Response(
        JSON.stringify({ error: 'Signup failed' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert([
        {
          id: data.user.id,
          email: body.email,
          first_name: body.firstName,
          middle_name: body.middleName,
          last_name: body.lastName,
          date_of_birth: body.dob,
          age_bracket: body.ageBracket,
          mobile: body.mobile,
          street: body.street,
          village: body.village,
          district: body.district,
          state: body.state,
          pincode: body.pincode,
          gps_consent: body.gpsConsent,
          disabilities: body.disabilities,
          pregnant_nursing: body.pregnantNursing,
          chronic_conditions: body.chronicConditions,
          verification_level: 'basic',
          created_at: new Date().toISOString()
        }
      ])

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Continue anyway, as the user account was created
    }

    const user = {
      id: data.user.id,
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      role: 'citizen'
    }

    // Get session for token
    const { data: session } = await supabase.auth.getSession()
    const token = session?.session?.access_token || `mock_token_${data.user.id}_${Date.now()}`

    return new Response(
      JSON.stringify({
        token,
        user
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return new Response(
      JSON.stringify({ error: 'Signup failed' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
}

async function handleGetCurrentUser(req: Request): Promise<Response> {
  try {
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

    // Handle different user types
    if (auth.role === 'citizen') {
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', auth.userId)
        .single()

      const user = {
        id: auth.userId,
        email: profileData?.email,
        firstName: profileData?.first_name,
        lastName: profileData?.last_name,
        role: 'citizen',
        profile: profileData
      }

      return new Response(
        JSON.stringify(user),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    } else if (auth.role === 'government') {
      // Mock government user data
      const user = {
        id: auth.userId,
        email: 'government@disaster.gov.in',
        role: 'government',
        employeeId: 'GOV001'
      }

      return new Response(
        JSON.stringify(user),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    } else if (auth.role === 'rescue-center') {
      // Mock rescue center user data
      const user = {
        id: auth.userId,
        email: 'center@rescue.gov.in',
        role: 'rescue-center',
        centerId: 'RC001'
      }

      return new Response(
        JSON.stringify(user),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'User not found' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      }
    )
  } catch (error) {
    console.error('Get current user error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to get user' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
}

async function handleLogout(): Promise<Response> {
  return new Response(
    JSON.stringify({ message: 'Logged out successfully' }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  )
}