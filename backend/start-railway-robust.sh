#!/bin/bash

# Robust Railway Startup Script for Laravel
# This script handles common 502 error causes

set -e

echo "=== Robust Railway Deployment Started ==="

# Step 0: Ensure we're in the correct directory
echo "Step 0: Setting up working directory..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "Script directory: $SCRIPT_DIR"

cd "$SCRIPT_DIR"
echo "Current working directory: $(pwd)"

# Verify Laravel files exist
if [ ! -f "artisan" ]; then
    echo "Error: artisan file not found. Current directory: $(pwd)"
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
php artisan view:clear
php artisan view:cache

# Step 4: Set proper permissions
echo "Step 4: Setting permissions..."
chmod -R 775 storage
chmod -R 775 bootstrap/cache

# Step 5: Verify environment
echo "Step 5: Verifying environment..."
echo "APP_ENV: $APP_ENV"
echo "APP_DEBUG: $APP_DEBUG"
echo "DB_CONNECTION: $DB_CONNECTION"
echo "PORT: $PORT"

# Step 6: Test database connection
echo "Step 6: Testing database connection..."
php artisan tinker --execute="echo 'Database connection: ' . (DB::connection()->getPdo() ? 'OK' : 'FAILED') . PHP_EOL;"

# Step 7: Start the server with proper error handling
echo "Step 7: Starting Laravel server..."
echo "Server will be available at: http://0.0.0.0:$PORT"
echo "Working directory: $(pwd)"

# Use exec to replace the shell process with the server
exec php artisan serve --host=0.0.0.0 --port=$PORT --env=production
