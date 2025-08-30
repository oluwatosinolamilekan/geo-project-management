#!/bin/bash

# SQD Fly.io Setup Script
# This script helps set up the necessary tools and configuration for Fly.io deployment

set -e  # Exit on any error

echo "🛠️ Setting up Fly.io deployment environment..."

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

# Check operating system
OS="$(uname -s)"
case "${OS}" in
    Linux*)     MACHINE=Linux;;
    Darwin*)    MACHINE=Mac;;
    CYGWIN*)    MACHINE=Cygwin;;
    MINGW*)     MACHINE=MinGw;;
    *)          MACHINE="UNKNOWN:${OS}"
esac

print_status "Detected OS: $MACHINE"

# Install Fly.io CLI if not present
if ! command -v flyctl &> /dev/null; then
    print_status "Installing Fly.io CLI..."
    
    if [[ "$MACHINE" == "Mac" ]]; then
        if command -v brew &> /dev/null; then
            brew install flyctl
        else
            curl -L https://fly.io/install.sh | sh
            echo 'export PATH="$HOME/.fly/bin:$PATH"' >> ~/.zshrc
            export PATH="$HOME/.fly/bin:$PATH"
        fi
    elif [[ "$MACHINE" == "Linux" ]]; then
        curl -L https://fly.io/install.sh | sh
        echo 'export PATH="$HOME/.fly/bin:$PATH"' >> ~/.bashrc
        export PATH="$HOME/.fly/bin:$PATH"
    else
        print_error "Unsupported operating system. Please install flyctl manually:"
        echo "  https://fly.io/docs/hands-on/install-flyctl/"
        exit 1
    fi
    
    print_success "Fly.io CLI installed!"
else
    print_success "Fly.io CLI already installed"
fi

# Check if user is logged in
if ! flyctl auth whoami &> /dev/null; then
    print_warning "Not logged in to Fly.io"
    print_status "Opening browser for authentication..."
    flyctl auth login
else
    print_success "Already logged in to Fly.io"
fi

# Verify Laravel dependencies
print_status "Checking Laravel backend dependencies..."
cd backend

if [ ! -f "composer.json" ]; then
    print_error "composer.json not found in backend directory"
    exit 1
fi

if [ ! -d "vendor" ]; then
    print_status "Installing Composer dependencies..."
    composer install
fi

# Generate Laravel key if not present
if [ ! -f ".env" ]; then
    print_status "Creating .env file from .env.example..."
    cp .env.example .env
    php artisan key:generate
fi

print_success "Laravel backend is ready"

# Verify Next.js dependencies
print_status "Checking Next.js frontend dependencies..."
cd ../frontend

if [ ! -f "package.json" ]; then
    print_error "package.json not found in frontend directory"
    exit 1
fi

if [ ! -d "node_modules" ]; then
    print_status "Installing npm dependencies..."
    npm install
fi

print_success "Next.js frontend is ready"

# Return to root directory
cd ..

print_success "🎉 Setup complete!"
echo ""
echo "You're now ready to deploy to Fly.io!"
echo ""
echo "Next steps:"
echo "  1. Review the configuration files:"
echo "     - backend/fly.toml"
echo "     - frontend/fly.toml"
echo "     - backend/Dockerfile"
echo "     - frontend/Dockerfile"
echo ""
echo "  2. Deploy your applications:"
echo "     ./deploy.sh"
echo ""
echo "  3. Or deploy manually:"
echo "     cd backend && flyctl deploy --app sqd-backend"
echo "     cd frontend && flyctl deploy --app sqd-frontend"
echo ""
echo "For more information, see DEPLOYMENT.md"
