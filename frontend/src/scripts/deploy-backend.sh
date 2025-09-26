#!/bin/bash

# Backend Deployment Script for Disaster Management System
# This script helps deploy your GitHub backend to various platforms

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
GITHUB_REPO="https://github.com/Boseman09/Disaster-management-System.git"
BACKEND_DIR="disaster-backend"
LOG_FILE="deployment.log"

# Function to print colored output
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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to detect backend type
detect_backend_type() {
    if [ -f "$BACKEND_DIR/package.json" ]; then
        echo "nodejs"
    elif [ -f "$BACKEND_DIR/requirements.txt" ]; then
        echo "python"
    elif [ -f "$BACKEND_DIR/go.mod" ]; then
        echo "go"
    elif [ -f "$BACKEND_DIR/Cargo.toml" ]; then
        echo "rust"
    else
        echo "unknown"
    fi
}

# Function to setup environment variables
setup_env() {
    print_status "Setting up environment variables..."
    
    if [ ! -f ".env" ]; then
        print_status "Creating .env file..."
        cat > .env << EOF
# Backend Configuration
REACT_APP_BACKEND_TYPE=external
REACT_APP_EXTERNAL_API_URL=http://localhost:3001
REACT_APP_PROD_API_URL=

# Database Configuration (adjust based on your backend)
DATABASE_URL=
DB_HOST=localhost
DB_PORT=5432
DB_USER=
DB_PASSWORD=
DB_NAME=disaster_management

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRY=24h

# Other Configuration
PORT=3001
NODE_ENV=development
EOF
        print_success ".env file created. Please update it with your actual values."
    else
        print_warning ".env file already exists. Please check if it needs updates."
    fi
}

# Function to clone and setup backend
setup_backend() {
    print_status "Setting up backend repository..."
    
    if [ -d "$BACKEND_DIR" ]; then
        print_warning "Backend directory already exists. Pulling latest changes..."
        cd "$BACKEND_DIR"
        git pull origin main || git pull origin master
        cd ..
    else
        print_status "Cloning backend repository..."
        git clone "$GITHUB_REPO" "$BACKEND_DIR"
    fi
    
    cd "$BACKEND_DIR"
    
    # Detect backend type
    BACKEND_TYPE=$(detect_backend_type)
    print_status "Detected backend type: $BACKEND_TYPE"
    
    # Setup based on backend type
    case "$BACKEND_TYPE" in
        "nodejs")
            setup_nodejs_backend
            ;;
        "python")
            setup_python_backend
            ;;
        "go")
            setup_go_backend
            ;;
        "rust")
            setup_rust_backend
            ;;
        *)
            print_error "Unknown backend type. Please setup manually."
            exit 1
            ;;
    esac
    
    cd ..
}

# Function to setup Node.js backend
setup_nodejs_backend() {
    print_status "Setting up Node.js backend..."
    
    if ! command_exists npm; then
        print_error "npm is not installed. Please install Node.js and npm."
        exit 1
    fi
    
    print_status "Installing dependencies..."
    npm install
    
    # Copy environment variables if they exist
    if [ -f "../.env" ]; then
        cp "../.env" ".env"
        print_status "Environment variables copied."
    fi
    
    # Check for common scripts
    if [ -f "package.json" ]; then
        SCRIPTS=$(node -p "Object.keys(require('./package.json').scripts || {}).join(', ')")
        print_status "Available scripts: $SCRIPTS"
    fi
    
    print_success "Node.js backend setup complete!"
}

# Function to setup Python backend
setup_python_backend() {
    print_status "Setting up Python backend..."
    
    if ! command_exists python3; then
        print_error "Python 3 is not installed."
        exit 1
    fi
    
    # Create virtual environment
    if [ ! -d "venv" ]; then
        print_status "Creating virtual environment..."
        python3 -m venv venv
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Install dependencies
    if [ -f "requirements.txt" ]; then
        print_status "Installing Python dependencies..."
        pip install -r requirements.txt
    fi
    
    # Copy environment variables if they exist
    if [ -f "../.env" ]; then
        cp "../.env" ".env"
        print_status "Environment variables copied."
    fi
    
    print_success "Python backend setup complete!"
}

# Function to setup Go backend
setup_go_backend() {
    print_status "Setting up Go backend..."
    
    if ! command_exists go; then
        print_error "Go is not installed."
        exit 1
    fi
    
    print_status "Downloading Go dependencies..."
    go mod download
    
    # Copy environment variables if they exist
    if [ -f "../.env" ]; then
        cp "../.env" ".env"
        print_status "Environment variables copied."
    fi
    
    print_success "Go backend setup complete!"
}

# Function to setup Rust backend
setup_rust_backend() {
    print_status "Setting up Rust backend..."
    
    if ! command_exists cargo; then
        print_error "Rust/Cargo is not installed."
        exit 1
    fi
    
    print_status "Building Rust project..."
    cargo build
    
    # Copy environment variables if they exist
    if [ -f "../.env" ]; then
        cp "../.env" ".env"
        print_status "Environment variables copied."
    fi
    
    print_success "Rust backend setup complete!"
}

# Function to start backend locally
start_backend() {
    print_status "Starting backend locally..."
    
    cd "$BACKEND_DIR"
    
    BACKEND_TYPE=$(detect_backend_type)
    
    case "$BACKEND_TYPE" in
        "nodejs")
            if [ -f "package.json" ]; then
                # Check if there's a start script
                if npm run | grep -q "start"; then
                    print_status "Starting with npm start..."
                    npm start &
                elif [ -f "server.js" ]; then
                    print_status "Starting with node server.js..."
                    node server.js &
                elif [ -f "app.js" ]; then
                    print_status "Starting with node app.js..."
                    node app.js &
                elif [ -f "index.js" ]; then
                    print_status "Starting with node index.js..."
                    node index.js &
                else
                    print_error "No suitable entry point found for Node.js app."
                    exit 1
                fi
            fi
            ;;
        "python")
            source venv/bin/activate
            if [ -f "app.py" ]; then
                print_status "Starting with python app.py..."
                python app.py &
            elif [ -f "main.py" ]; then
                print_status "Starting with python main.py..."
                python main.py &
            elif [ -f "run.py" ]; then
                print_status "Starting with python run.py..."
                python run.py &
            else
                print_error "No suitable entry point found for Python app."
                exit 1
            fi
            ;;
        "go")
            print_status "Starting Go application..."
            go run . &
            ;;
        "rust")
            print_status "Starting Rust application..."
            cargo run &
            ;;
    esac
    
    BACKEND_PID=$!
    echo $BACKEND_PID > ../backend.pid
    
    cd ..
    
    # Wait a moment for the server to start
    sleep 3
    
    # Test if backend is running
    if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
        print_success "Backend is running on http://localhost:3001"
    else
        print_warning "Backend may not be running properly. Check the logs."
    fi
}

# Function to stop backend
stop_backend() {
    if [ -f "backend.pid" ]; then
        BACKEND_PID=$(cat backend.pid)
        print_status "Stopping backend (PID: $BACKEND_PID)..."
        kill $BACKEND_PID 2>/dev/null || true
        rm backend.pid
        print_success "Backend stopped."
    else
        print_warning "No backend PID file found."
    fi
}

# Function to deploy to Heroku
deploy_heroku() {
    print_status "Deploying to Heroku..."
    
    if ! command_exists heroku; then
        print_error "Heroku CLI is not installed. Please install it first."
        exit 1
    fi
    
    cd "$BACKEND_DIR"
    
    # Initialize git if not already
    if [ ! -d ".git" ]; then
        git init
        git add .
        git commit -m "Initial commit"
    fi
    
    # Create Heroku app
    read -p "Enter Heroku app name (or press Enter for auto-generated): " APP_NAME
    if [ -z "$APP_NAME" ]; then
        heroku create
    else
        heroku create "$APP_NAME"
    fi
    
    # Set environment variables
    heroku config:set NODE_ENV=production
    heroku config:set JWT_SECRET="$(openssl rand -base64 32)"
    
    # Deploy
    git push heroku main || git push heroku master
    
    cd ..
    
    print_success "Backend deployed to Heroku!"
}

# Function to deploy to Railway
deploy_railway() {
    print_status "Deploying to Railway..."
    
    if ! command_exists railway; then
        print_error "Railway CLI is not installed. Please install it first."
        print_status "Install with: npm install -g @railway/cli"
        exit 1
    fi
    
    cd "$BACKEND_DIR"
    
    # Initialize Railway project
    railway login
    railway init
    
    # Deploy
    railway up
    
    cd ..
    
    print_success "Backend deployed to Railway!"
}

# Function to create Docker setup
create_docker() {
    print_status "Creating Docker configuration..."
    
    cd "$BACKEND_DIR"
    
    BACKEND_TYPE=$(detect_backend_type)
    
    case "$BACKEND_TYPE" in
        "nodejs")
            cat > Dockerfile << EOF
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001

CMD ["npm", "start"]
EOF
            ;;
        "python")
            cat > Dockerfile << EOF
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 3001

CMD ["python", "app.py"]
EOF
            ;;
    esac
    
    # Create docker-compose.yml
    cat > docker-compose.yml << EOF
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=\${DATABASE_URL}
      - JWT_SECRET=\${JWT_SECRET}
    depends_on:
      - db

  db:
    image: postgres:13
    environment:
      - POSTGRES_DB=disaster_management
      - POSTGRES_USER=\${DB_USER}
      - POSTGRES_PASSWORD=\${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
EOF
    
    cd ..
    
    print_success "Docker configuration created!"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  setup     - Clone and setup the backend repository"
    echo "  start     - Start the backend locally"
    echo "  stop      - Stop the running backend"
    echo "  env       - Setup environment variables"
    echo "  docker    - Create Docker configuration"
    echo "  heroku    - Deploy to Heroku"
    echo "  railway   - Deploy to Railway"
    echo "  help      - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 setup    # Setup backend for the first time"
    echo "  $0 start    # Start backend locally"
    echo "  $0 heroku   # Deploy to Heroku"
}

# Main script logic
case "${1:-help}" in
    "setup")
        setup_env
        setup_backend
        print_success "Backend setup complete! Run '$0 start' to start the backend."
        ;;
    "start")
        start_backend
        ;;
    "stop")
        stop_backend
        ;;
    "env")
        setup_env
        ;;
    "docker")
        create_docker
        ;;
    "heroku")
        deploy_heroku
        ;;
    "railway")
        deploy_railway
        ;;
    "help"|*)
        show_usage
        ;;
esac