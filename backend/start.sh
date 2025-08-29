#!/bin/bash

# Exit on any error
set -e

echo "Starting Laravel application setup..."

# Create .env file from environment variables if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file from environment variables..."
    cat > .env << EOF
APP_NAME="${APP_NAME:-Laravel}"
APP_ENV="${APP_ENV:-production}"
APP_KEY="${APP_KEY:-}"
APP_DEBUG="${APP_DEBUG:-false}"
APP_URL="${APP_URL:-http://localhost}"

LOG_CHANNEL="${LOG_CHANNEL:-stack}"
LOG_DEPRECATIONS_CHANNEL="${LOG_DEPRECATIONS_CHANNEL:-null}"
LOG_LEVEL="${LOG_LEVEL:-debug}"

DB_CONNECTION="${DB_CONNECTION:-mysql}"
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-3306}"
DB_DATABASE="${DB_DATABASE:-laravel}"
DB_USERNAME="${DB_USERNAME:-root}"
DB_PASSWORD="${DB_PASSWORD:-}"

BROADCAST_DRIVER="${BROADCAST_DRIVER:-log}"
CACHE_DRIVER="${CACHE_DRIVER:-file}"
FILESYSTEM_DISK="${FILESYSTEM_DISK:-local}"
QUEUE_CONNECTION="${QUEUE_CONNECTION:-sync}"
SESSION_DRIVER="${SESSION_DRIVER:-file}"
SESSION_LIFETIME="${SESSION_LIFETIME:-120}"

MEMCACHED_HOST="${MEMCACHED_HOST:-127.0.0.1}"

REDIS_HOST="${REDIS_HOST:-127.0.0.1}"
REDIS_PASSWORD="${REDIS_PASSWORD:-null}"
REDIS_PORT="${REDIS_PORT:-6379}"

MAIL_MAILER="${MAIL_MAILER:-smtp}"
MAIL_HOST="${MAIL_HOST:-mailpit}"
MAIL_PORT="${MAIL_PORT:-1025}"
MAIL_USERNAME="${MAIL_USERNAME:-null}"
MAIL_PASSWORD="${MAIL_PASSWORD:-null}"
MAIL_ENCRYPTION="${MAIL_ENCRYPTION:-null}"
MAIL_FROM_ADDRESS="${MAIL_FROM_ADDRESS:-hello@example.com}"
MAIL_FROM_NAME="${MAIL_FROM_NAME:-Laravel}"

CORS_ALLOWED_ORIGINS="${CORS_ALLOWED_ORIGINS:-*}"
EOF
fi

# Generate application key if not set
if [ -z "$APP_KEY" ] || [ "$APP_KEY" = "" ]; then
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
