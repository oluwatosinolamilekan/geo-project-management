#!/bin/bash

# Cache Migration Test Script
echo "🗄️ Testing Cache Table Migration"
echo "================================"

# Check if we're in the right directory
if [ ! -f "artisan" ]; then
    echo "❌ Please run this script from the Laravel backend directory"
    exit 1
fi

echo "1. Testing database connection..."
if php artisan db:test --count=1; then
    echo "✅ Database connection successful"
else
    echo "❌ Database connection failed"
    exit 1
fi

echo ""
echo "2. Testing cache table creation..."
echo "   This will test if the cache table can be created without conflicts"

# Try to create the cache table manually to test
php artisan tinker --execute="
try {
    // Test if we can create the cache table
    DB::statement('
        CREATE TABLE IF NOT EXISTS \"cache\" (
            \"key\" VARCHAR(255) PRIMARY KEY,
            \"value\" TEXT,
            \"expiration\" INTEGER
        )
    ');
    echo '✅ Cache table creation successful\n';
    
    // Test if we can insert a test record
    DB::table('cache')->insert([
        'key' => 'test_key',
        'value' => 'test_value',
        'expiration' => time() + 3600
    ]);
    echo '✅ Cache table insert successful\n';
    
    // Clean up test data
    DB::table('cache')->where('key', 'test_key')->delete();
    echo '✅ Cache table cleanup successful\n';
    
} catch (Exception \$e) {
    echo '❌ Cache table test failed: ' . \$e->getMessage() . '\n';
}
"

echo ""
echo "3. Testing full migration..."
if php artisan migrate:status | grep -q "No migrations found"; then
    echo "   📋 No migrations found, running fresh migration..."
    if php artisan migrate:fresh --force; then
        echo "   ✅ Fresh migration successful!"
    else
        echo "   ❌ Fresh migration failed"
    fi
else
    echo "   📋 Migrations found, running pending migrations..."
    if php artisan migrate --force; then
        echo "   ✅ Migration successful!"
    else
        echo "   ❌ Migration failed"
    fi
fi

echo ""
echo "4. Cache migration test completed!"
echo ""
echo "💡 If successful, you can now run:"
echo "   - php artisan migrate:railway --seed"
echo "   - php artisan migrate:fresh --seed"
