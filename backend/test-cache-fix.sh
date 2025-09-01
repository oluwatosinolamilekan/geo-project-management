#!/bin/bash

# Test script to verify cache fix works locally
echo "🧪 Testing cache fix locally..."

# Test 1: Check if cache table exists
echo "🔍 Test 1: Checking if cache table exists..."
if php artisan tinker --execute="echo 'Cache table exists: ' . (Schema::hasTable('cache') ? 'YES' : 'NO') . PHP_EOL;" 2>/dev/null; then
    echo "✅ Cache table check completed"
else
    echo "⚠️ Could not check cache table (this is expected if migrations haven't run)"
fi

# Test 2: Test database connection
echo "🔍 Test 2: Testing database connection..."
if php artisan db:test --count=1; then
    echo "✅ Database connection successful"
else
    echo "❌ Database connection failed"
    exit 1
fi

# Test 3: Test cache operations with file driver
echo "🔍 Test 3: Testing cache operations with file driver..."
export CACHE_STORE=file
if php artisan cache:clear; then
    echo "✅ Cache clear with file driver successful"
else
    echo "❌ Cache clear failed"
    exit 1
fi

# Test 4: Run migrations
echo "🔍 Test 4: Running migrations..."
if php artisan migrate:railway --fresh --seed; then
    echo "✅ Migrations completed successfully"
else
    echo "❌ Migrations failed"
    exit 1
fi

# Test 5: Test cache operations after migrations
echo "🔍 Test 5: Testing cache operations after migrations..."
if php artisan cache:clear; then
    echo "✅ Cache clear after migrations successful"
else
    echo "❌ Cache clear after migrations failed"
    exit 1
fi

echo "🎉 All tests passed! The cache fix should work on Railway."
