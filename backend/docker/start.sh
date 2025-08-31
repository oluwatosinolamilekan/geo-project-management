#!/bin/sh
set -e

echo "Starting Laravel application..."

# Create required directories
mkdir -p /var/www/html/storage/logs
mkdir -p /var/www/html/bootstrap/cache
mkdir -p /var/log
mkdir -p /tmp/opcache

# Set proper permissions
chown -R nginx:nginx /var/www/html
chmod -R 775 /var/www/html/storage
chmod -R 775 /var/www/html/bootstrap/cache

# Wait for database (if DATABASE_URL is set)
if [ -n "$DATABASE_URL" ]; then
    echo "Waiting for database connection..."
    php artisan migrate --force --no-interaction || echo "Migration failed, continuing..."
fi

# Clear and cache Laravel configurations
echo "Optimizing Laravel..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Generate app key if not set
if [ -z "$APP_KEY" ]; then
    echo "Generating application key..."
    php artisan key:generate --force
fi

# Start supervisor (which manages nginx and php-fpm)
echo "Starting services..."
exec /usr/bin/supervisord -c /etc/supervisord.conf
