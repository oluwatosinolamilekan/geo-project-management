#!/bin/bash

# SQD Deployment Script for Fly.io
# This script deploys both backend and frontend to Fly.io

set -e  # Exit on any error

echo "🚀 Starting deployment to Fly.io..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if flyctl is installed
if ! command -v flyctl &> /dev/null; then
    print_error "flyctl is not installed. Please install it first:"
    echo "  curl -L https://fly.io/install.sh | sh"
    exit 1
fi

# Check if user is logged in to Fly.io
if ! flyctl auth whoami &> /dev/null; then
    print_error "Not logged in to Fly.io. Please run: flyctl auth login"
    exit 1
fi

print_success "Fly.io CLI is ready"

# Deploy Backend
print_status "Deploying Laravel backend..."
cd backend

# Check if app exists, create if it doesn't
if ! flyctl apps list | grep -q "sqd-backend"; then
    print_status "Creating backend app..."
    flyctl apps create sqd-backend --org personal
    
    print_status "Setting up PostgreSQL database..."
    flyctl postgres create --name sqd-backend-db --org personal
    flyctl postgres attach --app sqd-backend sqd-backend-db
    
    print_status "Setting environment variables..."
    # Generate a new Laravel key
    APP_KEY=$(php artisan key:generate --show)
    flyctl secrets set APP_NAME="Geo-Project Management" --app sqd-backend
    flyctl secrets set APP_ENV=production --app sqd-backend
    flyctl secrets set APP_DEBUG=false --app sqd-backend
    flyctl secrets set APP_KEY="$APP_KEY" --app sqd-backend
    flyctl secrets set APP_URL=https://sqd-backend.fly.dev --app sqd-backend
fi

print_status "Deploying backend..."
flyctl deploy --app sqd-backend

print_success "Backend deployed successfully!"

# Deploy Frontend
print_status "Deploying Next.js frontend..."
cd ../frontend

# Check if app exists, create if it doesn't
if ! flyctl apps list | grep -q "sqd-frontend"; then
    print_status "Creating frontend app..."
    flyctl apps create sqd-frontend --org personal
    
    print_status "Setting environment variables..."
    flyctl secrets set NEXT_PUBLIC_API_URL=https://sqd-backend.fly.dev --app sqd-frontend
fi

print_status "Deploying frontend..."
flyctl deploy --app sqd-frontend

print_success "Frontend deployed successfully!"

# Verify deployments
print_status "Verifying deployments..."

echo ""
print_status "Testing backend health check..."
if curl -f -s https://sqd-backend.fly.dev/api/health > /dev/null; then
    print_success "Backend is healthy! ✅"
else
    print_warning "Backend health check failed. Check logs with: flyctl logs --app sqd-backend"
fi

echo ""
print_status "Testing frontend..."
if curl -f -s https://sqd-frontend.fly.dev > /dev/null; then
    print_success "Frontend is accessible! ✅"
else
    print_warning "Frontend is not accessible. Check logs with: flyctl logs --app sqd-frontend"
fi

echo ""
print_success "🎉 Deployment complete!"
echo ""
echo "Your applications are available at:"
echo "  Backend:  https://sqd-backend.fly.dev"
echo "  Frontend: https://sqd-frontend.fly.dev"
echo ""
echo "Useful commands:"
echo "  flyctl status --app sqd-backend     # Check backend status"
echo "  flyctl status --app sqd-frontend    # Check frontend status"
echo "  flyctl logs --app sqd-backend       # View backend logs"
echo "  flyctl logs --app sqd-frontend      # View frontend logs"
echo ""
