#!/bin/bash

echo "🔧 PostgreSQL Transaction Abort Fix Script"
echo "=========================================="

# Check if we're in the right directory
if [ ! -f "artisan" ]; then
    echo "❌ Please run this script from the Laravel project root directory"
    exit 1
fi

echo "📋 Step 1: Testing current database connection..."
if php artisan db:test --count=3; then
    echo "✅ Database connection is working"
else
    echo "❌ Database connection has issues"
    echo ""
    echo "🔄 Attempting to reset database connection..."
    if php artisan db:reset-connection; then
        echo "✅ Connection reset successful"
    else
        echo "❌ Connection reset failed"
        echo ""
        echo "💡 Manual steps to try:"
        echo "1. Check your database server is running"
        echo "2. Verify your .env file has correct database credentials"
        echo "3. Try restarting your application"
        exit 1
    fi
fi

echo ""
echo "📋 Step 2: Testing regions table operations..."
echo "🔄 Testing region creation..."

# Create a test region
TEST_NAME="test_region_$(date +%s)"
echo "Creating test region: $TEST_NAME"

# Use artisan tinker to create a test region
php artisan tinker --execute="
try {
    \$region = new App\Models\Region();
    \$region->name = '$TEST_NAME';
    \$region->save();
    echo '✅ Test region created successfully\\n';
} catch (Exception \$e) {
    echo '❌ Failed to create test region: ' . \$e->getMessage() . '\\n';
}
"

echo ""
echo "🔄 Testing duplicate name check..."
php artisan tinker --execute="
try {
    \$exists = App\Models\Region::where('name', '$TEST_NAME')->exists();
    echo '✅ Duplicate check query executed successfully (exists: ' . (\$exists ? 'true' : 'false') . ')\\n';
} catch (Exception \$e) {
    echo '❌ Duplicate check failed: ' . \$e->getMessage() . '\\n';
}
"

echo ""
echo "🔄 Testing region update..."
php artisan tinker --execute="
try {
    \$region = App\Models\Region::where('name', '$TEST_NAME')->first();
    if (\$region) {
        \$region->name = 'updated_$TEST_NAME';
        \$region->save();
        echo '✅ Test region updated successfully\\n';
    } else {
        echo '⚠️ Test region not found for update\\n';
    }
} catch (Exception \$e) {
    echo '❌ Failed to update test region: ' . \$e->getMessage() . '\\n';
}
"

echo ""
echo "🔄 Testing region deletion..."
php artisan tinker --execute="
try {
    \$region = App\Models\Region::where('name', 'updated_$TEST_NAME')->first();
    if (\$region) {
        \$region->delete();
        echo '✅ Test region deleted successfully\\n';
    } else {
        echo '⚠️ Test region not found for deletion\\n';
    }
} catch (Exception \$e) {
    echo '❌ Failed to delete test region: ' . \$e->getMessage() . '\\n';
}
"

echo ""
echo "📋 Step 3: Final connection test..."
if php artisan db:test; then
    echo "✅ All tests passed! The transaction issue should be resolved."
else
    echo "❌ Some tests failed. Please check the error messages above."
fi

echo ""
echo "🎉 Fix script completed!"
echo ""
echo "💡 If you're still experiencing issues:"
echo "1. Restart your application server"
echo "2. Clear Laravel cache: php artisan cache:clear"
echo "3. Clear config cache: php artisan config:clear"
echo "4. Check your database logs for more details"
