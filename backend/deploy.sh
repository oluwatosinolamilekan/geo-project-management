#!/bin/bash

# Railway PostgreSQL Deployment Script
# Enhanced version with better migration handling

set -e  # Exit on any error

echo "🚀 Starting Railway deployment..."

# Set up environment
echo "🔧 Setting up environment..."
export DB_CONNECTION=pgsql
export CACHE_STORE=file

# Show essential info
echo "🔍 Environment:"
echo "  DB_HOST: $DB_HOST"
echo "  DB_PORT: $DB_PORT"
echo "  DB_DATABASE: $DB_DATABASE"
echo "  APP_ENV: $APP_ENV"

# Wait for database
echo "⏳ Waiting for database..."
for i in {1..10}; do
    if php artisan db:test --count=1 >/dev/null 2>&1; then
        echo "✅ Database ready"
        break
    fi
    if [ $i -eq 10 ]; then
        echo "❌ Database not ready after 10 attempts"
        exit 1
    fi
    echo "  Attempt $i/10 - waiting 3s..."
    sleep 3
done

# Check if we need to reset the database
echo "🔍 Checking database state..."
if php artisan migrate:status --no-interaction | grep -q "No migrations found"; then
    echo "📋 No migrations found, starting fresh..."
    RESET_NEEDED=true
else
    echo "📋 Migrations table exists, checking for conflicts..."
    # Check if there are any migration conflicts
    if php artisan migrate:status --no-interaction | grep -q "Pending"; then
        echo "⚠️ Pending migrations found, will handle carefully..."
        RESET_NEEDED=false
    else
        echo "✅ All migrations appear to be up to date"
        RESET_NEEDED=false
    fi
fi

# Run migrations with multiple fallback strategies
echo "📦 Running migrations..."

# Strategy 1: Try the enhanced Railway migration command
if [ "$RESET_NEEDED" = true ]; then
    echo "🔄 Using reset strategy..."
    if php artisan migrate:reset-railway --seed --no-interaction; then
        echo "✅ Reset and migration successful"
        MIGRATION_SUCCESS=true
    else
        echo "⚠️ Reset migration failed, trying alternative..."
        MIGRATION_SUCCESS=false
    fi
else
    echo "🔄 Using standard Railway migration..."
    if php artisan migrate:railway --seed --no-interaction; then
        echo "✅ Railway migration successful"
        MIGRATION_SUCCESS=true
    else
        echo "⚠️ Railway migration failed, trying alternative..."
        MIGRATION_SUCCESS=false
    fi
fi

# Strategy 2: If Railway migration failed, try standard Laravel migration
if [ "$MIGRATION_SUCCESS" = false ]; then
    echo "🔄 Trying standard Laravel migration..."
    if php artisan migrate --force --no-interaction; then
        echo "✅ Standard migration successful"
        
        # Run seeders separately
        echo "🌱 Running seeders..."
        if php artisan db:seed --force --no-interaction; then
            echo "✅ Seeding successful"
            MIGRATION_SUCCESS=true
        else
            echo "⚠️ Seeding failed, but migration succeeded"
            MIGRATION_SUCCESS=true
        fi
    else
        echo "⚠️ Standard migration failed, trying manual approach..."
        MIGRATION_SUCCESS=false
    fi
fi

# Strategy 3: Manual migration approach
if [ "$MIGRATION_SUCCESS" = false ]; then
    echo "🔄 Trying manual migration approach..."
    
    # Create migrations table if it doesn't exist
    echo "📋 Ensuring migrations table exists..."
    php artisan migrate:install --no-interaction 2>/dev/null || true
    
    # Run migrations one by one
    echo "📦 Running migrations individually..."
    php artisan migrate --force --no-interaction || {
        echo "❌ Manual migration approach failed"
        echo "🔍 Checking what tables exist..."
        php artisan tinker --execute="echo 'Tables: '; DB::select('SELECT tablename FROM pg_tables WHERE schemaname = \'public\'');" 2>/dev/null || true
        exit 1
    }
    
    echo "✅ Manual migration successful"
    MIGRATION_SUCCESS=true
fi

# Final verification
if [ "$MIGRATION_SUCCESS" = true ]; then
    echo "🔍 Verifying migration status..."
    php artisan migrate:status --no-interaction
    
    echo "✅ All migrations completed successfully"
else
    echo "❌ All migration strategies failed"
    exit 1
fi

# Optimize
echo "⚡ Optimizing..."
php artisan optimize

echo "🎉 Deployment completed!"
echo "🚀 Starting server..."

php artisan serve --host=0.0.0.0 --port=$PORT
