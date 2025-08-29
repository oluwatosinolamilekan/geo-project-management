#!/bin/bash

# Alternative Railway Startup Script for Geo-Project Management
# This script uses absolute paths and explicit working directory management

set -e

echo "=== Alternative Railway Deployment Started ==="

# Step 0: Set up working directory explicitly
echo "Step 0: Setting up working directory..."
WORKING_DIR="/app"
echo "Target working directory: $WORKING_DIR"

# Check if we're already in the correct directory
if [ "$(pwd)" != "$WORKING_DIR" ]; then
    echo "Changing to working directory: $WORKING_DIR"
    cd "$WORKING_DIR"
fi

echo "Current working directory: $(pwd)"

# Verify Laravel files exist
if [ ! -f "artisan" ]; then
    echo "Error: artisan file not found in $WORKING_DIR"
    echo "Available files:"
    ls -la
    exit 1
fi

echo "Laravel application found at: $(pwd)"

# Step 1: Bootstrap Laravel environment
echo "Step 1: Setting up Laravel environment..."
php bootstrap-railway.php

# Step 2: Set up database using Laravel command
echo "Step 2: Setting up database..."
php artisan db:setup

# Step 3: Clear and cache Laravel config
echo "Step 3: Caching Laravel configuration..."
php artisan config:clear
php artisan config:cache
php artisan route:clear
php artisan route:cache

# Step 4: Start the server
echo "Step 4: Starting Laravel server..."
echo "Server will be available at: http://0.0.0.0:$PORT"
echo "Working directory: $(pwd)"
php artisan serve --host=0.0.0.0 --port=$PORT
