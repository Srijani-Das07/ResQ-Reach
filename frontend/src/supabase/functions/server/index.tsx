import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
);

// Health check endpoint
app.get("/make-server-ac827602/health", (c) => {
  return c.json({ status: "ok" });
});

// Government login endpoint
app.post("/make-server-ac827602/api/auth/login", async (c) => {
  try {
    const requestBody = await c.req.json();
    const { employeeId, centerId, password, loginType, email } = requestBody;
    
    if (loginType === 'government') {
      // Mock government authentication
      if (employeeId === 'GOV001' && password === 'password123') {
        const user = {
          id: 'gov_001',
          email: 'government@disaster.gov.in',
          role: 'government',
          employeeId: employeeId
        };
        const token = `mock_token_gov_001_${Date.now()}`;
        return c.json({ token, user });
      } else {
        return c.json({ error: 'Invalid government credentials' }, 401);
      }
    } else if (loginType === 'rescue-center') {
      // Mock rescue center authentication
      if (centerId === 'RC001' && password === 'rescue123') {
        const user = {
          id: 'rc_001',
          email: 'center@rescue.gov.in',
          role: 'rescue-center',
          centerId: centerId
        };
        const token = `mock_token_rc_001_${Date.now()}`;
        return c.json({ token, user });
      } else {
        return c.json({ error: 'Invalid rescue center credentials' }, 401);
      }
    } else if (loginType === 'citizen') {
      // For citizen login, delegate to Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        return c.json({ error: error.message }, 401);
      }

      if (data.user && data.session) {
        const user = {
          id: data.user.id,
          email: data.user.email,
          role: 'citizen'
        };
        return c.json({ token: data.session.access_token, user });
      } else {
        return c.json({ error: 'Login failed' }, 401);
      }
    } else {
      return c.json({ error: 'Invalid login type' }, 400);
    }
  } catch (error) {
    console.log(`Authentication error: ${error}`);
    return c.json({ error: "Internal server error during authentication" }, 500);
  }
});

// Get current user endpoint
app.get("/make-server-ac827602/api/auth/me", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No token provided' }, 401);
    }

    // Handle mock tokens
    if (accessToken.startsWith('mock_token_')) {
      if (accessToken.includes('gov_001')) {
        return c.json({
          id: 'gov_001',
          email: 'government@disaster.gov.in',
          role: 'government',
          employeeId: 'GOV001'
        });
      } else if (accessToken.includes('rc_001')) {
        return c.json({
          id: 'rc_001',
          email: 'center@rescue.gov.in',
          role: 'rescue-center',
          centerId: 'RC001'
        });
      }
    }

    // For Supabase tokens, verify with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    return c.json({
      id: user.id,
      email: user.email,
      role: 'citizen'
    });
  } catch (error) {
    console.log(`Get user error: ${error}`);
    return c.json({ error: "Internal server error while getting user" }, 500);
  }
});

// Relief center endpoints
app.get("/make-server-ac827602/api/relief", async (c) => {
  try {
    // Return mock relief centers data
    const mockCenters = [
      {
        id: 'RC001',
        name: 'Central Emergency Shelter',
        address: 'MG Road, Bangalore, Karnataka 560001',
        latitude: 12.9716,
        longitude: 77.5946,
        capacity: 500,
        currentOccupancy: 0,
        contactNumber: '+91-80-2345-6789',
        type: 'emergency_shelter',
        status: 'active',
        resources: {
          food: 70,
          water: 85,
          medicine: 80,
          blankets: 75,
          tents: 60
        },
        facilities: ['Medical Aid', 'Sanitation', 'Power Backup', 'Communication', 'Kitchen'],
        lastUpdated: new Date().toISOString(),
        managedBy: 'Government'
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
        type: 'emergency_shelter',
        status: 'active',
        resources: {
          food: 60,
          water: 95,
          medicine: 90,
          blankets: 85,
          tents: 70
        },
        facilities: ['Medical Aid', 'Sanitation', 'Kitchen', 'Children Area'],
        lastUpdated: new Date().toISOString(),
        managedBy: 'Government'
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
        type: 'emergency_shelter',
        status: 'active',
        resources: {
          food: 30,
          water: 40,
          medicine: 45,
          blankets: 30,
          tents: 25
        },
        facilities: ['Medical Aid', 'Sanitation', 'Power Backup'],
        lastUpdated: new Date().toISOString(),
        managedBy: 'Government'
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
        type: 'emergency_shelter',
        status: 'active',
        resources: {
          food: 80,
          water: 75,
          medicine: 85,
          blankets: 90,
          tents: 80
        },
        facilities: ['Medical Aid', 'Kitchen', 'Communication', 'WiFi'],
        lastUpdated: new Date().toISOString(),
        managedBy: 'Government'
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
        type: 'emergency_shelter',
        status: 'active',
        resources: {
          food: 75,
          water: 65,
          medicine: 70,
          blankets: 65,
          tents: 55
        },
        facilities: ['Medical Aid', 'Sanitation', 'Power Backup', 'Kitchen', 'Pharmacy'],
        lastUpdated: new Date().toISOString(),
        managedBy: 'Government'
      }
    ];

    return c.json(mockCenters);
  } catch (error) {
    console.log(`Relief centers error: ${error}`);
    return c.json({ error: "Internal server error while fetching relief centers" }, 500);
  }
});

// Get relief center by ID
app.get("/make-server-ac827602/api/relief/:id", async (c) => {
  try {
    const id = c.req.param('id');
    
    // Mock center data - in real implementation, this would come from database
    const mockCenters = [
      {
        id: 'RC001',
        name: 'Central Emergency Shelter',
        address: 'MG Road, Bangalore, Karnataka 560001',
        latitude: 12.9716,
        longitude: 77.5946,
        capacity: 500,
        currentOccupancy: 0,
        contactNumber: '+91-80-2345-6789',
        type: 'emergency_shelter',
        status: 'active',
        resources: {
          food: 70,
          water: 85,
          medicine: 80,
          blankets: 75,
          tents: 60
        },
        facilities: ['Medical Aid', 'Sanitation', 'Power Backup', 'Communication', 'Kitchen'],
        lastUpdated: new Date().toISOString(),
        managedBy: 'Government'
      }
    ];

    const center = mockCenters.find(c => c.id === id);
    if (!center) {
      return c.json({ error: 'Relief center not found' }, 404);
    }

    return c.json(center);
  } catch (error) {
    console.log(`Relief center by ID error: ${error}`);
    return c.json({ error: "Internal server error while fetching relief center" }, 500);
  }
});

// Cached relief centers endpoint
app.get("/make-server-ac827602/api/relief/cache", async (c) => {
  try {
    // Same as the main endpoint for now - in real implementation, this would be cached data
    return c.redirect('/make-server-ac827602/api/relief');
  } catch (error) {
    console.log(`Cached relief centers error: ${error}`);
    return c.json({ error: "Internal server error while fetching cached relief centers" }, 500);
  }
});

// Signup endpoint (for server-side signups)
app.post("/make-server-ac827602/signup", async (c) => {
  try {
    const { email, password, userData } = await c.req.json();
    
    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      user_metadata: userData,
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log(`Signup error: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    // Store additional user profile data in KV store
    if (data.user) {
      const userProfile = {
        ...userData,
        id: data.user.id,
        email: email,
        verificationLevel: 'basic',
        createdAt: new Date().toISOString()
      };
      
      await kv.set(`user_profile:${data.user.id}`, userProfile);
    }

    return c.json({ 
      success: true, 
      user: data.user,
      message: "User created successfully" 
    });
  } catch (error) {
    console.log(`Signup error: ${error}`);
    return c.json({ error: "Internal server error during signup" }, 500);
  }
});

// Get user profile endpoint
app.get("/make-server-ac827602/profile/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    // Verify user is authenticated
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user || user.id !== userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get user profile from KV store
    const userProfile = await kv.get(`user_profile:${userId}`);
    
    if (!userProfile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    return c.json({ profile: userProfile });
  } catch (error) {
    console.log(`Profile fetch error: ${error}`);
    return c.json({ error: "Internal server error while fetching profile" }, 500);
  }
});

// Update user profile endpoint
app.put("/make-server-ac827602/profile/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const updatedData = await c.req.json();
    
    // Verify user is authenticated
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user || user.id !== userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get current profile
    const currentProfile = await kv.get(`user_profile:${userId}`);
    if (!currentProfile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    // Update profile
    const updatedProfile = { ...currentProfile, ...updatedData };
    await kv.set(`user_profile:${userId}`, updatedProfile);

    return c.json({ 
      success: true, 
      profile: updatedProfile,
      message: "Profile updated successfully" 
    });
  } catch (error) {
    console.log(`Profile update error: ${error}`);
    return c.json({ error: "Internal server error while updating profile" }, 500);
  }
});

Deno.serve(app.fetch);