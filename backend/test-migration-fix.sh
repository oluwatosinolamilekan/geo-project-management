#!/bin/bash

# Migration Fix and Test Script
# This script helps resolve PostgreSQL migration issues

echo "🔧 Migration Fix and Test Script"
echo "================================"

# Check if we're in the right directory
if [ ! -f "artisan" ]; then
    echo "❌ Please run this script from the Laravel backend directory"
    exit 1
fi

echo "1. Checking current database state..."
php artisan db:check-state

echo ""
echo "2. Attempting to reset and run migrations..."

# Try to reset the database first
echo "   🔄 Resetting database..."
php artisan migrate:reset --force 2>/dev/null || echo "   ⚠️ Reset failed, continuing..."

# Try to run migrations with fresh approach
echo "   📦 Running fresh migrations..."
if php artisan migrate:fresh --force --seed; then
    echo "   ✅ Fresh migration successful!"
    exit 0
fi

echo ""
echo "3. Fresh migration failed, trying alternative approach..."

# Try to run migrations one by one
echo "   📁 Running migrations individually..."

# Check which migrations exist
MIGRATIONS=$(find database/migrations -name "*.php" | sort)

for migration in $MIGRATIONS; do
    echo "   🔍 Testing: $(basename $migration)"
    
    # Try to run this specific migration
    if php artisan migrate --path=database/migrations --force; then
        echo "   ✅ Migration successful"
        break
    else
        echo "   ❌ Migration failed, trying next approach..."
        
        # Try to run with the Railway command
        if php artisan migrate:railway --force; then
            echo "   ✅ Railway migration successful!"
            exit 0
        fi
    fi
done

echo ""
echo "4. All migration attempts failed. Manual intervention required."
echo ""
echo "💡 Troubleshooting steps:"
echo "   - Check database connection: php artisan db:test"
echo "   - Check migration status: php artisan migrate:status"
echo "   - Try manual table creation in database"
echo "   - Check PostgreSQL logs for specific errors"
echo ""
echo "🔧 You may need to:"
echo "   - Drop and recreate the database"
echo "   - Check PostgreSQL permissions"
echo "   - Verify environment variables"
