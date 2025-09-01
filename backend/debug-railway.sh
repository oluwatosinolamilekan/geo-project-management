#!/bin/bash

# Railway Database Debug Script
# Helps diagnose migration and database issues

echo "🔍 Railway Database Debug Script"
echo "=================================="

# Test database connection
echo "1. Testing database connection..."
if php artisan db:test --count=1 >/dev/null 2>&1; then
    echo "✅ Database connection successful"
else
    echo "❌ Database connection failed"
    exit 1
fi

# Check database info
echo ""
echo "2. Database information:"
echo "   Database: $(php artisan tinker --execute="echo DB::connection()->getDatabaseName();" 2>/dev/null || echo 'Unknown')"
echo "   Driver: $(php artisan tinker --execute="echo DB::connection()->getDriverName();" 2>/dev/null || echo 'Unknown')"

# Check existing tables
echo ""
echo "3. Existing tables:"
php artisan tinker --execute="
    \$tables = DB::select('SELECT tablename FROM pg_tables WHERE schemaname = \'public\' ORDER BY tablename');
    if (empty(\$tables)) {
        echo 'No tables found';
    } else {
        foreach (\$tables as \$table) {
            echo '  - ' . \$table->tablename . PHP_EOL;
        }
    }
" 2>/dev/null || echo "Could not retrieve tables"

# Check migrations table
echo ""
echo "4. Migrations table status:"
if php artisan tinker --execute="echo Schema::hasTable('migrations') ? 'Exists' : 'Does not exist';" 2>/dev/null; then
    echo "   Migrations table exists"
    
    # Show migration records
    echo "   Migration records:"
    php artisan tinker --execute="
        \$migrations = DB::table('migrations')->orderBy('batch')->orderBy('migration')->get();
        if (\$migrations->isEmpty()) {
            echo '    No migration records found';
        } else {
            foreach (\$migrations as \$migration) {
                echo '    - ' . \$migration->migration . ' (batch ' . \$migration->batch . ')' . PHP_EOL;
            }
        }
    " 2>/dev/null || echo "    Could not retrieve migration records"
else
    echo "   Migrations table does not exist"
fi

# Check migration status
echo ""
echo "5. Laravel migration status:"
php artisan migrate:status --no-interaction 2>/dev/null || echo "Could not get migration status"

# Check specific table structures
echo ""
echo "6. Checking key table structures:"
for table in users regions projects pins; do
    echo "   $table table:"
    if php artisan tinker --execute="echo Schema::hasTable('$table') ? 'Exists' : 'Does not exist';" 2>/dev/null; then
        if php artisan tinker --execute="echo Schema::hasTable('$table') ? 'Columns: ' . implode(', ', array_keys(Schema::getColumnListing('$table'))) : '';" 2>/dev/null; then
            echo "     ✅ Table exists with proper structure"
        else
            echo "     ⚠️ Table exists but structure unclear"
        fi
    else
        echo "     ❌ Table does not exist"
    fi
done

# Check for migration files
echo ""
echo "7. Available migration files:"
migration_files=$(find database/migrations -name "*.php" -type f | sort)
if [ -z "$migration_files" ]; then
    echo "   No migration files found"
else
    for file in $migration_files; do
        echo "   - $(basename "$file")"
    done
fi

echo ""
echo "🔍 Debug information complete"
echo ""
echo "💡 Suggested actions:"
echo "   - If tables exist but migrations table is empty: php artisan migrate:reset-railway --seed"
echo "   - If migrations table exists but tables are missing: php artisan migrate:railway --seed"
echo "   - If everything is broken: php artisan migrate:reset-railway --seed"
echo "   - To run standard Laravel migration: php artisan migrate --force"
