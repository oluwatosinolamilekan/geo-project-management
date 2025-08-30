# Railway Deployment Fix for Working Directory Issue

## Problem
The error "The provided cwd `/app/public` does not exist" occurs because Railway is trying to run the Laravel application from an incorrect working directory.

## Root Cause
Based on the [Railway pre-deploy command documentation](https://docs.railway.com/guides/pre-deploy-command), the issue was that we were trying to handle database setup and environment configuration in the start command, which runs in the application container. Instead, these tasks should be handled in the pre-deploy phase.

## Solution: Use Railway Pre-Deploy Commands

According to the Railway documentation, pre-deploy commands:
- Execute between building and deploying your application
- Handle tasks like database migrations or data seeding before your application runs
- Execute within your private network and have access to your application's environment variables
- Run in a separate container from your application

### Updated Configuration

The `railway.json` now uses the proper Railway approach:

```json
{
  "deploy": {
    "preDeployCommand": "php bootstrap-railway.php && php artisan db:setup && php artisan config:cache && php artisan route:cache",
    "startCommand": "php artisan serve --host=0.0.0.0 --port=$PORT --env=production"
  }
}
```

### What This Fixes

1. **Pre-deploy phase**: Database setup and environment configuration happen before the application starts
2. **Clean start command**: The application starts with a simple, reliable command
3. **Proper separation**: Pre-deploy tasks are separated from runtime tasks
4. **Working directory**: The pre-deploy command ensures proper working directory setup

## Updated Files

1. **railway.json** - Updated to use pre-deploy commands
2. **railway-simple.json** - Alternative configuration with pre-deploy
3. **railway-robust.json** - Robust configuration with comprehensive startup script
4. **bootstrap-railway.php** - Updated for pre-deploy execution
5. **start-railway-robust.sh** - Comprehensive startup script for 502 error prevention
6. **health-check.php** - Health check script for troubleshooting

## Deployment Steps

1. **Use the updated configuration:**
   ```bash
   # The railway.json now uses pre-deploy commands
   # No additional setup needed
   ```

2. **Deploy to Railway:**
   ```bash
   # If using Railway CLI
   railway up
   
   # Or push to your repository if using GitHub integration
   git add .
   git commit -m "Fix Railway deployment using pre-deploy commands"
   git push
   ```

3. **Monitor deployment:**
   - Check Railway logs for pre-deploy command execution
   - Verify the application starts successfully

## How It Works

1. **Build Phase**: Composer installs dependencies
2. **Pre-Deploy Phase**: 
   - `php bootstrap-railway.php` - Sets up environment variables
   - `php artisan db:setup` - Creates database tables and sample data
   - `php artisan config:cache` - Caches configuration
   - `php artisan route:cache` - Caches routes
3. **Deploy Phase**: `php artisan serve` - Starts the Laravel application

## Benefits of This Approach

- **Follows Railway best practices** as documented
- **Separates concerns** between setup and runtime
- **More reliable** deployment process
- **Better error handling** - pre-deploy failures prevent deployment
- **Cleaner logs** - setup and runtime logs are separated

## Troubleshooting 502 Errors

### Common Causes of 502 Errors:

1. **Application not starting**: Laravel fails to start due to configuration issues
2. **Database connection issues**: Application can't connect to the database
3. **Permission problems**: Storage directories not writable
4. **Port binding issues**: Application can't bind to the specified port
5. **Environment variable problems**: Missing or incorrect environment variables

### Debugging Steps:

1. **Run the health check script:**
   ```bash
   php health-check.php
   ```

2. **Check Railway logs** for specific error messages

3. **Use the robust startup script** if issues persist:
   ```bash
   # Rename railway-robust.json to railway.json
   cp railway-robust.json railway.json
   ```

4. **Verify environment variables** in Railway dashboard:
   - `APP_ENV=production`
   - `APP_DEBUG=false`
   - `DB_CONNECTION=pgsql` (or your database type)
   - `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`

### If pre-deploy fails:
- Check Railway logs for pre-deploy command output
- Verify environment variables are set correctly
- Ensure database connection is available

### If start command fails:
- Check if the application can bind to the port
- Verify Laravel configuration is correct
- Check application logs for runtime errors

## Alternative Solutions

### For Persistent 502 Errors:

1. **Use the robust configuration:**
   ```bash
   cp railway-robust.json railway.json
   ```

2. **Use the simple configuration:**
   ```bash
   cp railway-simple.json railway.json
   ```

3. **Manual debugging:**
   ```bash
   # Run health check
   php health-check.php
   
   # Run debug script
   php debug-railway.php
   ```

## Verification

After deployment, verify:
1. Pre-deploy commands executed successfully
2. Application starts without working directory errors
3. Database tables are created and populated
4. API endpoints are responding correctly
5. No 502 errors in Railway logs

This approach follows the official Railway documentation and should resolve both the working directory issue and common 502 error causes.
