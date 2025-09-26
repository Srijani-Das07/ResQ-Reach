import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

// Import all route handlers
import { handleAuth } from "./routes/auth.ts"
import { handleUsers } from "./routes/users.ts"
import { handleCenters } from "./routes/centers.ts"
import { handleGuests } from "./routes/guests.ts"
import { handleStats } from "./routes/stats.ts"

console.log("Starting API server...")

serve(async (req) => {
  console.log(`${req.method} ${req.url}`)

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const path = url.pathname

    // Health check endpoint
    if (path === '/health') {
      return new Response(
        JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    // Route to appropriate handlers
    if (path.startsWith('/auth')) {
      return await handleAuth(req)
    }
    
    if (path.startsWith('/users')) {
      return await handleUsers(req)
    }
    
    if (path.startsWith('/centers')) {
      return await handleCenters(req)
    }
    
    if (path.startsWith('/guests')) {
      return await handleGuests(req)
    }
    
    if (path.startsWith('/stats')) {
      return await handleStats(req)
    }

    // 404 for unmatched routes
    return new Response(
      JSON.stringify({ error: 'Route not found' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      },
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})