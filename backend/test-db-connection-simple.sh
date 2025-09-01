#!/bin/bash

# Simple Database Connection Test
echo "🔌 Testing Database Connection"
echo "=============================="

# Check if we're in the right directory
if [ ! -f "artisan" ]; then
    echo "❌ Please run this script from the Laravel backend directory"
    exit 1
fi

echo "1. Testing database connection with current environment..."
echo "   Current DB_DATABASE: $DB_DATABASE"
echo "   Current DB_HOST: $DB_HOST"

# Test if we can connect to the database
echo ""
echo "2. Testing connection..."

# Try to test the database connection
if php artisan db:test --count=1 2>/dev/null; then
    echo "✅ Database connection successful!"
    echo ""
    echo "🚀 You can now run migrations:"
    echo "   php artisan migrate:fresh --force --seed"
else
    echo "❌ Database connection failed"
    echo ""
    echo "🔍 Current environment variables:"
    echo "   DB_CONNECTION: $DB_CONNECTION"
    echo "   DB_HOST: $DB_HOST"
    echo "   DB_PORT: $DB_PORT"
    echo "   DB_DATABASE: $DB_DATABASE"
    echo "   DB_USERNAME: $DB_USERNAME"
    echo "   DB_SSLMODE: $DB_SSLMODE"
    echo ""
    echo "💡 To fix this:"
    echo "   1. Run: ./create-env-file.sh"
    echo "   2. Or manually create .env file with correct credentials"
    echo "   3. Ensure database exists on Neon"
    echo "   4. Check if IP is whitelisted"
fi

echo ""
echo "3. Connection test completed!"
