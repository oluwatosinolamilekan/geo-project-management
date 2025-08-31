#!/bin/bash

# SQD Backend Test Runner
# This script runs all tests for the SQD Laravel backend project

echo "🧪 Running SQD Backend Tests"
echo "============================="

# Check if vendor directory exists
if [ ! -d "vendor" ]; then
    echo "❌ Vendor directory not found. Please run 'composer install' first."
    exit 1
fi

# Set environment variables for testing
export APP_ENV=testing

echo "🔧 Setting up test environment..."

# Clear and cache config for testing
php artisan config:clear
php artisan config:cache

echo "📊 Running Unit Tests..."
echo "------------------------"
./vendor/bin/phpunit tests/Unit --testdox --colors=always

echo ""
echo "🌐 Running Feature Tests..."
echo "---------------------------"
./vendor/bin/phpunit tests/Feature --testdox --colors=always

echo ""
echo "🎯 Running All Tests with Coverage..."
echo "------------------------------------"
./vendor/bin/phpunit --testdox --colors=always --coverage-text

echo ""
echo "✅ Test run complete!"
echo ""
echo "📋 Test Summary:"
echo "- Unit Tests: Model tests, Request validation tests, Trait tests, Resource tests"
echo "- Feature Tests: API endpoint tests, Integration tests, Health check tests"
echo ""
echo "🚀 To run specific test suites:"
echo "- Unit tests only: ./vendor/bin/phpunit tests/Unit"
echo "- Feature tests only: ./vendor/bin/phpunit tests/Feature"
echo "- Specific test class: ./vendor/bin/phpunit tests/Unit/Models/UserTest.php"
echo ""
