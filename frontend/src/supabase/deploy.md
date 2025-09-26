# Supabase Deployment Instructions

## Issue Resolution: 403 Deployment Error

The 403 error was caused by conflicting edge functions. Here's the corrected setup:

### 1. Remove Conflicting Edge Function
```bash
# Delete the conflicting make-server directory
rm -rf /supabase/functions/make-server/
```

### 2. Use Existing Edge Function
The application should use the existing edge function at:
- **Function Path**: `/supabase/functions/server/`
- **Endpoint Base**: `https://mppuexmnibtwvvyuzdxa.supabase.co/functions/v1/server`

### 3. Deploy the Correct Edge Function
```bash
# Deploy the server function (not make-server)
npx supabase functions deploy server
```

### 4. Database Setup
```bash
# Run migrations
npx supabase db push

# Apply seed data
npx supabase db seed
```

### 5. Verify Endpoints
After deployment, these endpoints should be available:

- **Health Check**: `https://mppuexmnibtwvvyuzdxa.supabase.co/functions/v1/server/make-server-ac827602/health`
- **Authentication**: `https://mppuexmnibtwvvyuzdxa.supabase.co/functions/v1/server/make-server-ac827602/api/auth/login`
- **Relief Centers**: `https://mppuexmnibtwvvyuzdxa.supabase.co/functions/v1/server/make-server-ac827602/api/relief`

### 6. Configuration Verification
The following files have been updated with correct configurations:
- `/config/environment.ts` - API base URL updated
- `/services/api.ts` - Endpoint routing fixed
- `/services/authService.ts` - Authentication endpoints corrected
- `/supabase/.env` - Environment variables configured

### 7. Test the Deployment
```bash
# Test health endpoint
curl https://mppuexmnibtwvvyuzdxa.supabase.co/functions/v1/server/make-server-ac827602/health

# Test relief centers endpoint
curl https://mppuexmnibtwvvyuzdxa.supabase.co/functions/v1/server/make-server-ac827602/api/relief
```

## Troubleshooting

If you still get 403 errors:
1. Ensure you're authenticated with Supabase CLI: `npx supabase login`
2. Link to the correct project: `npx supabase link --project-ref mppuexmnibtwvvyuzdxa`
3. Check your project permissions in the Supabase dashboard

The application is configured to gracefully fall back to offline mode if the backend is unavailable.