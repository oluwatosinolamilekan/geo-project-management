#!/bin/bash

# Railway Startup Script for Geo-Project Management
# This script handles the complete deployment process

set -e

echo "=== Railway Deployment Started ==="

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
php artisan serve --host=0.0.0.0 --port=$PORT
