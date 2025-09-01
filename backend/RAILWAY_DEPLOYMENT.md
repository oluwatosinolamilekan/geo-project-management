# 🚀 Railway PostgreSQL Deployment Guide

## Overview
This guide ensures smooth deployment of your Laravel application on Railway with PostgreSQL, avoiding common migration errors.

## 🔧 What We Fixed

### 1. **Foreign Key Constraint Issues**
- Modified migrations to create foreign keys after table creation
- Prevents PostgreSQL transaction abort errors

### 2. **Migration Order**
- Ensured proper table creation order
- Fixed dependency issues between tables

### 3. **PostgreSQL-Specific Handling**
- Added custom migration command
- Implemented proper error handling
- Added connection optimization

## 📁 Files Modified

### Migration Files
- `2025_08_28_140523_create_regions_table.php` - Base table
- `2025_08_28_140613_create_projects_table.php` - Fixed FK constraints
- `2025_08_28_140618_create_pins_table.php` - Fixed FK constraints
- `0001_01_01_000001_create_cache_table.php` - Skipped (optional)
- `0001_01_01_000002_create_jobs_table.php` - Standard Laravel tables
- `0001_01_01_000003_create_sessions_table.php` - Standard Laravel tables

### Configuration Files
- `nixpacks.toml` - Updated deployment command
- `config/database.php` - Added PostgreSQL options
- `deploy.sh` - Custom deployment script
- `app/Console/Commands/MigratePostgres.php` - Custom migration command

## 🚀 Deployment Process

### 1. **Railway Configuration**
Your `nixpacks.toml` now uses the custom deployment script:
```toml
[start]
cmd = 'chmod +x deploy.sh && ./deploy.sh'
```

### 2. **Environment Variables**
Ensure these are set in Railway:
```env
DB_CONNECTION=pgsql
DB_HOST=your-railway-postgres-host
DB_PORT=5432
DB_DATABASE=railway
DB_USERNAME=postgres
DB_PASSWORD=your-password
APP_KEY=your-app-key
```

### 3. **Deployment Flow**
1. **Database Connection Test** - Verifies PostgreSQL connection
2. **Cache Clear** - Clears all Laravel caches
3. **PostgreSQL Migration** - Runs migrations with FK handling
4. **Seeding** - Populates database with initial data
5. **Optimization** - Caches config and routes
6. **Server Start** - Launches Laravel application

## 🛠️ Custom Commands

### PostgreSQL Migration Command
```bash
php artisan migrate:postgres --fresh --seed
```

**Features:**
- Temporarily disables foreign key checks
- Handles PostgreSQL-specific constraints
- Provides detailed error reporting
- Automatic rollback on failure

## 🔍 Troubleshooting

### Common Issues & Solutions

#### 1. **Transaction Abort Errors**
**Problem:** `SQLSTATE[25P02]: In failed sql transaction`
**Solution:** Use the custom migration command that handles FK constraints properly

#### 2. **Foreign Key Constraint Failures**
**Problem:** `alter table "projects" add constraint "projects_region_id_foreign"`
**Solution:** Migrations now create FKs after table creation

#### 3. **Connection Timeouts**
**Problem:** Database connection failures
**Solution:** Added connection options with timeouts and persistent connections

#### 4. **Migration Order Issues**
**Problem:** Tables created before dependencies exist
**Solution:** Proper migration file naming ensures correct order

## 📊 Migration Order
1. `0001_01_01_000000_create_users_table.php` (skipped)
2. `0001_01_01_000001_create_cache_table.php` (skipped)
3. `0001_01_01_000002_create_jobs_table.php`
4. `0001_01_01_000003_create_sessions_table.php`
5. `2025_08_28_140523_create_regions_table.php`
6. `2025_08_28_140613_create_projects_table.php`
7. `2025_08_28_140618_create_pins_table.php`

## 🎯 Best Practices

### 1. **Always Use Fresh Deployments**
```bash
php artisan migrate:postgres --fresh --seed
```

### 2. **Monitor Deployment Logs**
Check Railway logs for detailed error information

### 3. **Test Locally First**
```bash
# Test with local PostgreSQL
php artisan migrate:postgres --fresh --seed
```

### 4. **Backup Before Major Changes**
Always backup your Railway PostgreSQL database before major migrations

## 🔄 Rollback Strategy

If deployment fails:
1. Check Railway logs for specific errors
2. Use `php artisan migrate:rollback` if needed
3. Verify database connection settings
4. Re-deploy with fresh migrations

## 📈 Performance Optimizations

### Database Configuration
- Persistent connections enabled
- 60-second timeout
- Error mode set to exceptions
- Connection pooling (Railway handles this)

### Application Optimization
- Config caching enabled
- Route caching enabled
- View caching enabled
- Optimized autoloader

## 🎉 Success Indicators

Your deployment is successful when you see:
```
✅ Database connection established
✅ Migrations completed successfully
✅ Seeding completed
🎉 PostgreSQL migration completed successfully!
🎉 Deployment completed successfully!
🚀 Starting Laravel server...
```

## 📞 Support

If you encounter issues:
1. Check Railway deployment logs
2. Verify environment variables
3. Test database connection manually
4. Review migration file order
5. Ensure all dependencies are installed
