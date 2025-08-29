#!/bin/bash

# Exit on any error
set -e

echo "Starting Laravel application setup..."

# Generate application key if not set
if [ -z "$APP_KEY" ]; then
    echo "Generating application key..."
    php artisan key:generate --force
fi

# Run database migrations
echo "Running database migrations..."
php artisan migrate --force

# Clear and cache config
echo "Caching configuration..."
php artisan config:clear
php artisan config:cache

# Clear and cache routes
echo "Caching routes..."
php artisan route:clear
php artisan route:cache

# Start the application
echo "Starting Laravel server..."
php artisan serve --host=0.0.0.0 --port=$PORT
