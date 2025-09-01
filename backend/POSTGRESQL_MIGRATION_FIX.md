# PostgreSQL Migration Fix Guide

## The Problem

The migration is failing because of a PostgreSQL-specific issue with the cache table. The error `SQLSTATE[25P02]: In failed sql transaction` occurs because:

1. **Reserved Word Conflict**: The `key` column name is a reserved word in PostgreSQL
2. **Transaction State**: Once a migration fails, the transaction remains in a failed state
3. **Cache Table Structure**: Laravel's default cache table structure conflicts with PostgreSQL

## Root Cause

```sql
-- This fails in PostgreSQL because 'key' is a reserved word
CREATE TABLE cache (
    key VARCHAR(255) PRIMARY KEY,  -- ❌ 'key' is reserved
    value TEXT,
    expiration INTEGER
);
```

## The Solution

### 1. Fixed Cache Table Migration

The migration file `0001_01_01_000001_create_cache_table.php` now uses:

```php
// Raw SQL with proper PostgreSQL quoting
DB::statement('
    CREATE TABLE IF NOT EXISTS "cache" (
        "key" VARCHAR(255) PRIMARY KEY,  -- ✅ Quoted identifier
        "value" TEXT,
        "expiration" INTEGER
    )
');
```

### 2. Environment Configuration

**IMPORTANT**: Set your Railway environment variables to:

```bash
# Cache Configuration - Use file driver to avoid database cache issues
CACHE_DRIVER=file
CACHE_STORE=file

# Database Configuration
DB_CONNECTION=pgsql
DB_HOST=ep-dry-unit-adybxn1c-pooler.c-2.us-east-1.aws.neon.tech
DB_PORT=5432
DB_DATABASE=neondb
DB_USERNAME=neondb_owner
DB_PASSWORD=npg_MKv73aGXftrA
DB_SSLMODE=require
```

### 3. Testing the Fix

Run the test script to verify the fix:

```bash
./test-cache-migration.sh
```

## Migration Commands

### Fresh Migration (Recommended for Railway)
```bash
php artisan migrate:fresh --force --seed
```

### Standard Migration
```bash
php artisan migrate --force
```

### Railway-Specific Migration
```bash
php artisan migrate:railway --force --seed
```

## Why This Happens

1. **PostgreSQL Reserved Words**: `key` is a reserved word in PostgreSQL
2. **Laravel Schema Builder**: Sometimes doesn't properly quote column names
3. **Transaction Management**: Failed migrations leave transactions in bad state
4. **Cache Driver**: Database cache driver expects specific table structure

## Prevention

1. **Always use file cache driver** in production PostgreSQL environments
2. **Quote reserved words** in raw SQL statements
3. **Test migrations locally** before deploying
4. **Use migration rollback** when issues occur

## Troubleshooting

### If Migration Still Fails

1. **Check database connection**:
   ```bash
   php artisan db:test --count=1
   ```

2. **Reset database state**:
   ```bash
   php artisan migrate:reset --force
   ```

3. **Check migration status**:
   ```bash
   php artisan migrate:status
   ```

4. **Manual table creation** (if needed):
   ```sql
   -- Connect to your PostgreSQL database and run:
   DROP TABLE IF EXISTS cache CASCADE;
   DROP TABLE IF EXISTS cache_locks CASCADE;
   ```

### Common PostgreSQL Issues

- **Permission denied**: Check user privileges
- **SSL connection required**: Ensure `DB_SSLMODE=require`
- **Connection timeout**: Check `DB_HOST` and network settings
- **Reserved word conflicts**: Always quote column names

## Success Indicators

✅ Migration runs without errors  
✅ Cache table created successfully  
✅ All other tables created  
✅ Seeders run successfully  
✅ No "transaction aborted" errors  

## Next Steps

After successful migration:

1. **Test your API endpoints**
2. **Verify data seeding**
3. **Check application logs**
4. **Monitor database performance**
5. **Deploy to production**

## Support

If issues persist:
1. Check Laravel logs: `storage/logs/laravel.log`
2. Check PostgreSQL logs on Railway
3. Verify environment variables
4. Test with a fresh database
