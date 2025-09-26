# Backend Integration Guide

This guide will help you integrate your GitHub backend repository with the frontend disaster management system.

## Overview

The integration system supports multiple backends:
- **Supabase Functions** (current) - Edge functions for serverless deployment
- **External Backend** - Your GitHub repository backend
- **Local Development** - Local backend for development
- **Production** - Production deployment of your backend

## Quick Setup

### 1. Environment Variables

Create a `.env` file in your project root with the following variables:

```bash
# Backend Configuration
REACT_APP_BACKEND_TYPE=external        # 'supabase', 'external', 'production', or 'auto'
REACT_APP_EXTERNAL_API_URL=http://localhost:3001  # Your local backend URL
REACT_APP_PROD_API_URL=https://your-production-url.com  # Your production backend URL

# Optional: Supabase Configuration (fallback)
REACT_APP_SUPABASE_URL=https://mppuexmnibtwvvyuzdxa.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wcHVleG1uaWJ0d3Z2eXV6ZHhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1NTgzMDQsImV4cCI6MjA3NDEzNDMwNH0.Dn0xP1uamYb1b6KIzPuByc52DWOehtlA74NXbNeoJ4Y
```

### 2. Backend Setup

Clone and set up your backend repository:

```bash
# Clone your backend repository
git clone https://github.com/Boseman09/Disaster-management-System.git backend

# Navigate to backend directory
cd backend

# Install dependencies (adjust based on your backend)
npm install
# or
pip install -r requirements.txt

# Start your backend server
npm start
# or
python app.py
```

### 3. Required API Endpoints

Your backend should implement these endpoints to work with the frontend:

#### Health Check
```
GET /api/health
Response: { "status": "healthy", "timestamp": "2024-01-01T00:00:00.000Z" }
```

#### Authentication Endpoints
```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
POST /api/auth/government-login
POST /api/auth/rescue-center-login
```

#### User Management
```
GET /api/users/profile
PUT /api/users/profile
GET /api/users/:id
```

#### Rescue Centers
```
GET /api/centers
GET /api/centers/:id
POST /api/centers
PUT /api/centers/:id
DELETE /api/centers/:id
```

#### Guests Management
```
GET /api/guests
POST /api/guests
PUT /api/guests/:id
DELETE /api/guests/:id
GET /api/centers/:centerId/guests
```

#### Statistics
```
GET /api/stats/overview
GET /api/stats/centers
GET /api/stats/guests
```

## Backend Types Configuration

### Node.js/Express Backend

If your backend is built with Node.js/Express, update the backend configuration:

```typescript
// In /config/backend-integration.ts
external: {
  name: 'External Backend',
  baseUrl: process.env.REACT_APP_EXTERNAL_API_URL || 'http://localhost:3001',
  type: 'express', // Change this to 'express'
  healthEndpoint: '/api/health',
  authEndpoint: '/api/auth',
  timeout: 10000,
},
```

### Python FastAPI Backend

For FastAPI backends:

```typescript
external: {
  name: 'External Backend',
  baseUrl: process.env.REACT_APP_EXTERNAL_API_URL || 'http://localhost:8000',
  type: 'fastapi', // Change this to 'fastapi'
  healthEndpoint: '/health', // FastAPI usually uses /health
  authEndpoint: '/auth',
  timeout: 10000,
},
```

### Django Backend

For Django backends:

```typescript
external: {
  name: 'External Backend',
  baseUrl: process.env.REACT_APP_EXTERNAL_API_URL || 'http://localhost:8000',
  type: 'nodejs', // Keep as 'nodejs' for Django
  healthEndpoint: '/api/health/',
  authEndpoint: '/api/auth/',
  timeout: 10000,
},
```

## Integration Steps

### Step 1: Update API Services

Replace the current API service with the new backend-aware service:

```typescript
// Update imports in your components
import { backendApiService } from '../services/backendApiService';

// Instead of:
// import { apiService } from '../services/api';

// Use:
const response = await backendApiService.get('/users/profile');
```

### Step 2: Authentication Integration

Your backend should support JWT tokens. The authentication flow:

1. User logs in → Backend returns JWT token
2. Frontend stores token in localStorage
3. All subsequent requests include token in Authorization header

Example backend response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "role": "citizen"
  }
}
```

### Step 3: Database Schema Alignment

Ensure your backend database schema matches the frontend expectations:

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL, -- 'citizen', 'government', 'rescue-center'
  profile JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Rescue Centers Table
```sql
CREATE TABLE rescue_centers (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  capacity INTEGER NOT NULL,
  current_occupancy INTEGER DEFAULT 0,
  contact_phone VARCHAR(20),
  facilities TEXT[],
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Guests Table
```sql
CREATE TABLE guests (
  id UUID PRIMARY KEY,
  center_id UUID REFERENCES rescue_centers(id),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  emergency_contact VARCHAR(20),
  medical_info TEXT,
  arrival_date TIMESTAMP DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Step 4: CORS Configuration

Configure CORS in your backend to allow requests from your frontend:

For Express.js:
```javascript
const cors = require('cors');
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-frontend-domain.com'],
  credentials: true,
}));
```

For FastAPI:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://your-frontend-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Deployment

### Development
1. Start your backend locally
2. Set `REACT_APP_BACKEND_TYPE=external` in your .env
3. Start the frontend with `npm start`

### Production
1. Deploy your backend to a cloud provider (Heroku, AWS, GCP, etc.)
2. Set `REACT_APP_PROD_API_URL` to your deployed backend URL
3. Set `REACT_APP_BACKEND_TYPE=production`
4. Deploy your frontend

## Testing

Test the integration:

```bash
# Check backend connectivity
curl http://localhost:3001/api/health

# Test authentication
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password"}'
```

## Troubleshooting

### Backend Not Connecting
1. Check if your backend is running on the correct port
2. Verify CORS configuration
3. Check network connectivity
4. Look at browser developer tools for CORS errors

### Authentication Issues
1. Verify JWT token format
2. Check token expiration
3. Ensure proper Authorization header format: `Bearer <token>`

### Database Connection Issues
1. Check database connection string
2. Verify database schema matches expectations
3. Check database user permissions

## Advanced Configuration

### Custom Backend Adapter

Create a custom adapter for your specific backend:

```typescript
// /services/customBackendAdapter.ts
export class CustomBackendAdapter {
  async transformRequest(endpoint: string, data: any) {
    // Transform request data to match your backend API
    return data;
  }

  async transformResponse(response: any) {
    // Transform response data to match frontend expectations
    return response;
  }
}
```

### Multiple Environment Support

Configure different backends for different environments:

```typescript
// /config/backend-integration.ts
const environments = {
  development: 'local',
  staging: 'external',
  production: 'production',
};

const currentEnv = process.env.NODE_ENV || 'development';
const defaultBackend = environments[currentEnv];
```

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify backend logs
3. Test API endpoints manually with curl or Postman
4. Ensure all required environment variables are set

The system will automatically fallback to Supabase functions if the external backend is unavailable.