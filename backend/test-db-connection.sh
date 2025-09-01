#!/bin/bash

# Database Connection Test Script
echo "🔌 Testing Database Connection"
echo "=============================="

# Check if we're in the right directory
if [ ! -f "artisan" ]; then
    echo "❌ Please run this script from the Laravel backend directory"
    exit 1
fi

echo "1. Testing basic database connection..."
if php artisan db:test --count=1; then
    echo "✅ Database connection successful"
else
    echo "❌ Database connection failed"
    exit 1
fi

echo ""
echo "2. Testing database state..."
php artisan db:check-state

echo ""
echo "3. Testing migration status..."
php artisan migrate:status

echo ""
echo "4. Testing if we can create a simple table..."
echo "   This will help verify PostgreSQL permissions and basic functionality"

# Try to create a simple test table
php artisan tinker --execute="
try {
    DB::statement('CREATE TABLE IF NOT EXISTS test_migration (id SERIAL PRIMARY KEY, name VARCHAR(255))');
    echo '✅ Test table creation successful\n';
    DB::statement('DROP TABLE IF EXISTS test_migration');
    echo '✅ Test table cleanup successful\n';
} catch (Exception \$e) {
    echo '❌ Test table creation failed: ' . \$e->getMessage() . '\n';
}
"

echo ""
echo "5. Database test completed!"
echo ""
echo "💡 If all tests pass, you can try running migrations:"
echo "   - php artisan migrate:fresh --force --seed"
echo "   - php artisan migrate:railway --force --seed"
