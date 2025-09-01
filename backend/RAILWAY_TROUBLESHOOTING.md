# Railway Deployment Troubleshooting Guide

This guide helps resolve common migration and deployment issues on Railway.

## Quick Commands

### Check Database State
```bash
php artisan db:check-state
```

### Debug Database Issues
```bash
./debug-railway.sh
```

### Reset and Migrate (Recommended for broken states)
```bash
php artisan migrate:reset-railway --seed
```

### Standard Railway Migration
```bash
php artisan migrate:railway --seed
```

### Standard Laravel Migration
```bash
php artisan migrate --force
```

## Common Issues and Solutions

### Issue: "Duplicate table" error
**Symptoms**: `SQLSTATE[42P07]: Duplicate table: 7 ERROR: relation "users" already exists`

**Cause**: Tables exist but migrations table is out of sync

**Solution**: 
```bash
php artisan migrate:reset-railway --seed
```

### Issue: "Undefined table" error during seeding
**Symptoms**: `SQLSTATE[42P01]: Undefined table: 7 ERROR: relation "regions" does not exist`

**Cause**: Seeder runs before all migrations complete

**Solution**:
```bash
php artisan migrate:railway --seed
```

### Issue: Migration conflicts
**Symptoms**: Some tables exist, others don't, migrations table is inconsistent

**Solution**:
```bash
php artisan migrate:reset-railway --seed
```

## Migration Commands Explained

### `migrate:reset-railway`
- Drops all existing tables
- Clears migrations table
- Runs all migrations from scratch
- Runs seeders
- **Use when**: Database is in a broken state

### `migrate:railway`
- Checks existing migrations
- Skips already-run migrations
- Handles duplicate table errors gracefully
- Runs seeders
- **Use when**: Adding new migrations or fixing partial issues

### `migrate:status`
- Shows which migrations have run
- Shows which are pending
- **Use when**: Diagnosing migration state

## Deployment Script

The `deploy.sh` script automatically tries multiple strategies:

1. **Reset Strategy**: If no migrations table exists
2. **Railway Migration**: Enhanced migration with error handling
3. **Standard Migration**: Laravel's default migration
4. **Manual Migration**: Individual migration execution

## Environment Variables

Ensure these are set in Railway:

```bash
DB_CONNECTION=pgsql
DB_HOST=your-railway-host
DB_PORT=5432
DB_DATABASE=your-database-name
DB_USERNAME=your-username
DB_PASSWORD=your-password
```

## Debugging Steps

1. **Check database connection**:
   ```bash
   php artisan db:test --count=1
   ```

2. **Check existing tables**:
   ```bash
   php artisan db:check-state
   ```

3. **Check migration status**:
   ```bash
   php artisan migrate:status
   ```

4. **Run debug script**:
   ```bash
   ./debug-railway.sh
   ```

## When to Use Each Command

- **Fresh deployment**: `migrate:reset-railway --seed`
- **Adding new migrations**: `migrate:railway --seed`
- **Debugging issues**: `db:check-state` or `./debug-railway.sh`
- **Standard deployment**: Let `deploy.sh` handle it automatically

## Troubleshooting Checklist

- [ ] Database connection works
- [ ] All environment variables are set
- [ ] Migration files exist in `database/migrations/`
- [ ] Seeder files exist in `database/seeders/`
- [ ] No conflicting table structures
- [ ] Migrations table is in sync with actual tables

## Getting Help

If issues persist:

1. Run `./debug-railway.sh` and share the output
2. Check Railway logs for detailed error messages
3. Verify database credentials and connectivity
4. Ensure all migration files are properly formatted
