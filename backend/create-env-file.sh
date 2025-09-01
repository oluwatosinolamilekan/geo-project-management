#!/bin/bash

# Create .env File Script
echo "🔧 Creating .env File for Railway"
echo "================================="

# Check if we're in the right directory
if [ ! -f "artisan" ]; then
    echo "❌ Please run this script from the Laravel backend directory"
    exit 1
fi

# Check if .env already exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists"
    echo "   Backing up to .env.backup"
    cp .env .env.backup
fi

echo ""
echo "📝 Creating .env file with Railway database credentials..."

# Create the .env file
cat > .env << 'EOF'
APP_NAME="geo-project-management-backend"
APP_ENV=production
APP_KEY="base64:iQaBbH+O+1dXuB3JrUJqRHWtWOkIoQp2CpN6tM5hQ9s="
APP_DEBUG=true
APP_URL="https://geo-project-management-production.up.railway.app"
APP_LOCALE=en
APP_FALLBACK_LOCALE=en
APP_FAKER_LOCALE=en_US
APP_MAINTENANCE_DRIVER=file
PHP_CLI_SERVER_WORKERS=4
BCRYPT_ROUNDS=12

LOG_CHANNEL=stack
LOG_STACK=single
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

# Database Configuration - Neon PostgreSQL
DB_CONNECTION=pgsql
DB_HOST=ep-dry-unit-adybxn1c-pooler.c-2.us-east-1.aws.neon.tech
DB_PORT=5432
DB_DATABASE=neondb
DB_USERNAME=neondb_owner
DB_PASSWORD=npg_MKv73aGXftrA
DB_SSLMODE=require
DB_URL=null
MYSQL_ATTR_SSL_CA=null
DB_CACHE_CONNECTION=null
DB_CACHE_LOCK_CONNECTION=null
DB_CACHE_LOCK_TABLE=null

# Cache Configuration - Use file driver to avoid database cache issues
CACHE_DRIVER=file
CACHE_STORE=file

# Session Configuration
SESSION_DRIVER=file
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=null
SESSION_STORE=null
SESSION_SECURE_COOKIE=null

# Queue Configuration
QUEUE_CONNECTION=database
DB_QUEUE_CONNECTION=null
SESSION_CONNECTION=null

# Broadcasting
BROADCAST_CONNECTION=log

# File System
FILESYSTEM_DISK=local

# Memcached
MEMCACHED_HOST=127.0.0.1
MEMCACHED_PERSISTENT_ID=null
MEMCACHED_USERNAME=null
MEMCACHED_PASSWORD=null

# Redis
REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
REDIS_URL=null
REDIS_USERNAME=null

# Mail Configuration
MAIL_MAILER=log
MAIL_SCHEME=null
MAIL_HOST=127.0.0.1
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_FROM_ADDRESS=hello@example.com
MAIL_FROM_NAME="${APP_NAME}"
MAIL_URL=null
POSTMARK_MESSAGE_STREAM_ID=null
MAIL_LOG_CHANNEL=null
POSTMARK_TOKEN=null
RESEND_KEY=null

# AWS Configuration
AWS_ACCESS_KEY_ID=null
AWS_SECRET_ACCESS_KEY=null
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=null
AWS_USE_PATH_STYLE_ENDPOINT=false
AWS_URL=null
AWS_ENDPOINT=null

# DynamoDB
DYNAMODB_ENDPOINT=null

# SQS
SQS_SUFFIX=null

# Slack
SLACK_BOT_USER_OAUTH_TOKEN=null
SLACK_BOT_USER_DEFAULT_CHANNEL=null
LOG_SLACK_WEBHOOK_URL=null

# Papertrail
PAPERTRAIL_URL=null
PAPERTRAIL_PORT=null
LOG_STDERR_FORMATTER=null

# Vite
VITE_APP_NAME="${APP_NAME}"
EOF

echo "✅ .env file created successfully!"
echo ""
echo "🔍 Verifying database connection..."

# Test the database connection
if php artisan db:test --count=1; then
    echo "✅ Database connection successful!"
    echo ""
    echo "🚀 You can now run migrations:"
    echo "   php artisan migrate:fresh --force --seed"
else
    echo "❌ Database connection failed"
    echo ""
    echo "💡 Troubleshooting steps:"
    echo "   1. Check if the database is accessible"
    echo "   2. Verify the credentials in .env"
    echo "   3. Ensure the database exists on Neon"
    echo "   4. Check if the IP is whitelisted"
fi

echo ""
echo "📚 For more help, see: POSTGRESQL_MIGRATION_FIX.md"
