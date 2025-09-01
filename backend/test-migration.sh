#!/bin/bash

# Test Migration Commands Script
# This script tests the various migration commands to ensure they work

echo "🧪 Testing Migration Commands"
echo "============================="

# Test database connection first
echo "1. Testing database connection..."
if php artisan db:test --count=1 >/dev/null 2>&1; then
    echo "✅ Database connection successful"
else
    echo "❌ Database connection failed"
    exit 1
fi

# Test the check state command
echo ""
echo "2. Testing db:check-state command..."
if php artisan db:check-state >/dev/null 2>&1; then
    echo "✅ db:check-state command works"
else
    echo "❌ db:check-state command failed"
fi

# Test migration status
echo ""
echo "3. Testing migrate:status command..."
if php artisan migrate:status --no-interaction >/dev/null 2>&1; then
    echo "✅ migrate:status command works"
else
    echo "❌ migrate:status command failed"
fi

# Test the Railway migration command (without actually running it)
echo ""
echo "4. Testing migrate:railway command (dry run)..."
if php artisan list | grep -q "migrate:railway"; then
    echo "✅ migrate:railway command is registered"
else
    echo "❌ migrate:railway command not found"
fi

# Test the reset Railway migration command
echo ""
echo "5. Testing migrate:reset-railway command (dry run)..."
if php artisan list | grep -q "migrate:reset-railway"; then
    echo "✅ migrate:reset-railway command is registered"
else
    echo "❌ migrate:reset-railway command not found"
fi

echo ""
echo "🧪 Migration command tests completed"
echo ""
echo "💡 To actually run migrations:"
echo "   - php artisan migrate:reset-railway --seed"
echo "   - php artisan migrate:railway --seed"
echo "   - php artisan migrate --force"
