#!/bin/bash

# Setup script for backend integration
# This script will help you set up the environment for backend integration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_status "🚀 Setting up backend integration for Disaster Management System"
echo ""

# Step 1: Create environment file
print_status "Step 1: Creating environment configuration..."

if [ ! -f ".env" ]; then
    cat > .env << 'EOF'
# Backend Integration Configuration
# Choose which backend to use: 'supabase', 'external', 'production', or 'auto'
REACT_APP_BACKEND_TYPE=auto

# External Backend URLs
REACT_APP_EXTERNAL_API_URL=http://localhost:3001
REACT_APP_PROD_API_URL=

# Supabase Configuration (fallback)
REACT_APP_SUPABASE_URL=https://mppuexmnibtwvvyuzdxa.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wcHVleG1uaWJ0d3Z2eXV6ZHhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1NTgzMDQsImV4cCI6MjA3NDEzNDMwNH0.Dn0xP1uamYb1b6KIzPuByc52DWOehtlA74NXbNeoJ4Y

# Development settings
NODE_ENV=development
REACT_APP_API_BASE_URL=
EOF
    print_success "Created .env file with default configuration"
else
    print_warning ".env file already exists. Please check if it needs updates."
fi

# Step 2: Create startup scripts
print_status "Step 2: Creating startup scripts..."

# Create package.json scripts if package.json exists
if [ -f "package.json" ]; then
    print_status "Adding scripts to package.json..."
    
    # Backup original package.json
    cp package.json package.json.backup
    
    # Add scripts using node (works cross-platform)
    node -e "
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    if (!pkg.scripts) pkg.scripts = {};
    
    // Add integration scripts
    pkg.scripts['start:with-backend'] = 'REACT_APP_BACKEND_TYPE=external npm start';
    pkg.scripts['start:supabase'] = 'REACT_APP_BACKEND_TYPE=supabase npm start';
    pkg.scripts['start:production'] = 'REACT_APP_BACKEND_TYPE=production npm start';
    pkg.scripts['backend:setup'] = 'chmod +x scripts/deploy-backend.sh && scripts/deploy-backend.sh setup';
    pkg.scripts['backend:start'] = 'chmod +x scripts/deploy-backend.sh && scripts/deploy-backend.sh start';
    pkg.scripts['backend:stop'] = 'chmod +x scripts/deploy-backend.sh && scripts/deploy-backend.sh stop';
    pkg.scripts['integration:test'] = 'curl -f http://localhost:3001/api/health || echo \"Backend not available\"';
    
    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
    "
    
    print_success "Added integration scripts to package.json"
fi

# Step 3: Create quick start guide
print_status "Step 3: Creating quick start guide..."

cat > INTEGRATION_QUICKSTART.md << 'EOF'
# Backend Integration Quick Start

## Overview
Your disaster management system now supports multiple backend configurations:
- **Supabase Functions** (current/fallback)
- **External Backend** (your GitHub repository)
- **Production Backend** (deployed external backend)

## Quick Setup

### 1. Start with current backend (Supabase)
```bash
npm start
# or
npm run start:supabase
```

### 2. Setup and use external backend
```bash
# Setup your external backend
npm run backend:setup

# Start your external backend
npm run backend:start

# Start frontend with external backend
npm run start:with-backend
```

### 3. Test backend connectivity
```bash
npm run integration:test
```

## Backend Configuration

Edit `.env` to change backend type:

```bash
# Use auto-detection (recommended)
REACT_APP_BACKEND_TYPE=auto

# Force specific backend
REACT_APP_BACKEND_TYPE=external    # Use external backend
REACT_APP_BACKEND_TYPE=supabase    # Use Supabase functions
REACT_APP_BACKEND_TYPE=production  # Use production backend
```

## External Backend Setup

1. Clone your backend repository:
```bash
git clone https://github.com/Boseman09/Disaster-management-System.git backend
cd backend
```

2. Install dependencies and start:
```bash
# For Node.js backend
npm install
npm start

# For Python backend  
pip install -r requirements.txt
python app.py
```

3. Your backend should run on `http://localhost:3001`

## Required API Endpoints

Your backend must implement these endpoints:

- `GET /api/health` - Health check
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `GET /api/centers` - Get rescue centers
- `POST /api/centers` - Create rescue center
- `GET /api/guests` - Get guests
- `POST /api/guests` - Create guest

## Troubleshooting

### Backend not connecting
1. Check if backend is running: `curl http://localhost:3001/api/health`
2. Verify CORS is configured for `http://localhost:3000`
3. Check console for network errors

### Authentication issues
1. Verify JWT token format
2. Check Authorization header: `Bearer <token>`
3. Ensure backend returns proper user object

### Offline mode
The system automatically falls back to offline mode when backend is unavailable.
Data is stored in localStorage and mock responses are used.

## Deployment

### Development
```bash
# Backend on localhost:3001
npm run backend:start

# Frontend on localhost:3000  
npm run start:with-backend
```

### Production
1. Deploy your backend to cloud provider
2. Update `REACT_APP_PROD_API_URL` in .env
3. Set `REACT_APP_BACKEND_TYPE=production`
4. Deploy frontend

## Support

For detailed integration instructions, see:
- `scripts/backend-integration.md` - Complete integration guide
- `scripts/deploy-backend.sh` - Backend deployment script
EOF

print_success "Created INTEGRATION_QUICKSTART.md"

# Step 4: Make scripts executable
print_status "Step 4: Setting up script permissions..."

chmod +x scripts/deploy-backend.sh 2>/dev/null || true
chmod +x scripts/setup-integration.sh 2>/dev/null || true

print_success "Scripts are now executable"

# Step 5: Test current setup
print_status "Step 5: Testing current configuration..."

# Test if we can start the development server
if command -v npm >/dev/null 2>&1; then
    print_status "npm is available"
    
    # Check if node_modules exists
    if [ -d "node_modules" ]; then
        print_success "Dependencies are installed"
    else
        print_warning "Dependencies not installed. Run 'npm install' first."
    fi
else
    print_error "npm is not installed. Please install Node.js and npm first."
fi

# Final instructions
echo ""
print_success "✅ Backend integration setup complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Read INTEGRATION_QUICKSTART.md for quick start guide"
echo "2. Edit .env file to configure your backend URLs"
echo "3. Run 'npm run backend:setup' to clone and setup your external backend"
echo "4. Run 'npm run start:with-backend' to start with external backend"
echo ""
echo "🔗 Available Commands:"
echo "   npm start                    - Start with auto-detected backend"
echo "   npm run start:with-backend   - Start with external backend"
echo "   npm run start:supabase       - Start with Supabase backend"
echo "   npm run backend:setup        - Setup external backend"
echo "   npm run backend:start        - Start external backend"
echo "   npm run integration:test     - Test backend connectivity"
echo ""
echo "📚 Documentation:"
echo "   INTEGRATION_QUICKSTART.md    - Quick start guide"
echo "   scripts/backend-integration.md - Detailed integration guide"
echo ""
print_status "Happy coding! 🚀"